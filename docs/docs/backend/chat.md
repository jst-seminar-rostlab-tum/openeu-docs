# Chat

**Author:** `Magnus Singer`, `Leon Schmid`

The chat uses modern AI tools to provide the user the possibility to gather information about meetings and legislations
using natural language. It's served via a convenient interface similar to other established chat tools and handles
queries fast and reliable.

## 📦 Technologies

- [**GPT-4**](https://openai.com/api): OpenAI's GPT-4.1-mini is the backbone of the chat tool. It serves as foundation
  for the chat assistant and handles the requests
- [**Supabase Vector Database**](https://supabase.com/features/vector-database): With Supabase being the general
  database provider for the whole project, the Vector Database feature provides a great addition in order to store
  embeddings directly to the main database and retrieve data without a major overhead

## ⛓️ Workflow

The workflow consists of a chain of requests that have to be sent to the backend in order to create a new chat session
and send questions to the AI assistant. This chain consists of these steps:

- In the first step, a request has to be sent to the `/chat/start` endpoint in order to create a new chat session.
  The request structure looks like this:
  - Method: `POST`
  - Request body: `{"title": TITLE_OF_CHAT_SESSION, "user_id": REQUEST_USER_ID}`
  - Response: `{"session_id": NEW_CHAT_SESSION_ID}`
- In order to ask a new question, a request has to be sent to the `/chat` endpoint with the following strucutre:
  - Method: `POST`
  - Request body: `{"session_id": ID_OF_CHAT_SESSION, "message": NEW_QUESTION, "legislation_id": OPTIONAL_LEGISLATION_ID}}`
  - Response: a text stream of the response implemented with server-sent events,
    see [here](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
- To retrieve all chat sessions from a user, send a request to the `/chat/sessions` endpoint with this structure:
  - Method: `GET`
  - Request parameters: `user_id` being the ID of the user to get sessions for
  - Response `[{"id": SESSION_ID, "user_id": REQUEST_USER_ID, "title": SESSION_TITLE}, ...]`
- In order to get all messages within a chat session, call the `/chat/sessions/{session_id}` endpoint, with
  `session_id` being the ID of the session to get the messages for:
  - Method: `GET`
  - Response:
    `[{"id": MESSAGE_ID, "chat_session": CHAT_SESSION_ID, "content": MESSAGE_CONTENT, "author": (either "user" or "assistant" depending on who wrote the message), "date": TIMESTAMP_OF_MESSAGE}, ...]`

## 📄 System Prompt

The system prompt is the initial instruction the AI model gets in order to answer the user and fulfil its tasks. The
`timestamp` placeholder is just the current time, the `messages_text` placeholder gets replaced with the previous
conversation (the messages already existing in the session, limited to a maximum of 10) and the `context_text`
placeholder gets replaced with the context which is fetched using the Top-K-Neighbours method from the database (see
more [here](#-context-fetching)).

```
You are a helpful assistant working for Project Europe. Current time: {timestamp}.
Your task is to answer questions on OpenEU, a platform for screening EU legal processes.
You will get a question and a prior conversation if there is any and your task
is to use your knowledge and the knowledge of OpenEU to answer the question. Do not answer any questions outside
the scope of OpenEU.\n\n
*** BEGIN PREVIOUS CONVERSATION ***
{messages_text}
*** END PREVIOUS CONVERSATION ***\n\n
You will not apologize for previous responses, but instead will indicated new information was gained.
You will take into account any CONTEXT BLOCK that is provided in a conversation.
You will say that you can't help on this topic if the CONTEXT BLOCK is empty.
You will not invent anything that is not drawn directly from the context.
You will not answer questions that are not related to the context.
More information on how OpenEU works is between ***START CONTEXT BLOCK*** and ***END CONTEXT BLOCK***
***START CONTEXT BLOCK***
{context_text}
***END CONTEXT BLOCK***
```

## 🤖 AI Call

We use the standard Chat Completion endpoint from OpenAI with the streaming functionality to get an answer from the AI.
The code looks like this:

```python
response = client.chat.completions.create(
  model="gpt-4.1-mini",
  messages=[
    ChatCompletionAssistantMessageParam(
      content=build_system_prompt(messages, prompt, context_text), role="assistant"
    ),
    ChatCompletionUserMessageParam(
      content=f"Please answer the following question regarding OpenEU: {prompt}", role="user"
    ),
  ],
  temperature=0.3,
  stream=True,
)
```

### Streaming the response

We use the standard SSE implementation to stream the chunks to the frontend, and update the database entry on the fly by using the message and session id

```python
full_response = "" # used to update the db entry
for chunk in response:
  current_content = chunk.choices[0].delta.content
  if current_content is not None and len(current_content) > 0:
    full_response += current_content
    supabase.table("chat_messages").update(
      {
        "content": full_response,
        "date": datetime.now(timezone.utc).isoformat(),
      }
    ).eq("id", message_response.data[0].get("id")).eq("chat_session", session_id).execute()

  yield f"id: {session_id}\ndata: {current_content}\n\n" # SSR message to send to the frontend
```

## 🏛️ Legislative Procedure Support

The chat endpoint also supports an optional `legislation_id` field in the request. When provided, the backend will:

- **If the legislative proposal has already been processed:**  
  Instantly uses the pre-processed and embedded content for semantic search, providing rich and relevant context to the AI assistant.
- **If it's the first time the proposal is requested:**  
  Attempts to download, extract, and embed the proposal document. If successful, this new context is used for the answer. If the document is not available, the assistant falls back to any other available database information about the procedure, or informs the user if nothing is available.

This logic is handled in the backend (`chat.py` and `legislation_utils.py`) and ensures that chat responses about specific legislative procedures are as accurate and context-rich as possible.

## 💡 Context-fetching

The context fetching happens with the [Top-K-Neighbours](https://en.wikipedia.org/wiki/K-nearest_neighbors_algorithm)
algorithm, using the embeddings stored in the database for each individual meeting and legislation. We use a K of 20 and
pass the previous conversation and the new prompt as input to the algorithm. More details on the implementation can be
found [here](/docs/backend/search).
