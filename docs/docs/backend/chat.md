# Chat

**Author:** `Magnus Singer`

The chat uses modern AI tools to provide the user the possibility to gather information about meetings and legislations using natural language. It's served via a convenient interface similar to other established chat tools and handles queries fast and reliable.

## 📦 Technologies

- [**GPT-4**](https://openai.com/api): OpenAI's GPT-4.1 is the backbone of the chat tool. It serves as foundation for the chat assistant and handles the requests
- [**Supabase Vector Database**](https://supabase.com/features/vector-database): With Supabase being the general database provider for the whole project, the Vector Database feature provides a great addition in order to store embeddings directly to the main database and retrieve data without a major overhead

## ⛓️ Workflow

The workflow consists of a chain of requests that have to be sent to the backend in order to create a new chat session and send questions to the AI assistant. This chain consists of these steps:
- In the first step, a request has to be sent to the ```/chat/start``` endpoint in order to create a new chat session. The request structure looks like this:
  - Method: ```POST```
  - Request body: ```{"title": TITLE_OF_CHAT_SESSION, "user_id": REQUEST_USER_ID}```
  - Response: ``{"session_id": NEW_CHAT_SESSION_ID}``
- In order to ask a new question, a request has to be sent to the ``/chat`` endpoint with the following strucutre:
  - Method: ``POST``
  - Request body: ``{"session_id": ID_OF_CHAT_SESSION, "message": NEW_QUESTION}``
  - Response: a text stream of the response implemented with server-sent events, see [here](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
- To retrieve all chat sessions from a user, send a request to the ``/chat/sessions`` endpoint with this structure:
  - Method: ``GET``
  - Request parameters: ``user_id`` being the ID of the user to get sessions for
  - Response ``[{"id": SESSION_ID, "user_id": REQUEST_USER_ID, "title": SESSION_TITLE}, ...]``
- In order to get all messages within a chat session, call the ``/chat/sessions/{session_id}`` endpoint, with ``session_id`` being the ID of the session to get the messages for:
  - Method: ``GET``
  - Response: ``[{"id": MESSAGE_ID, "chat_session": CHAT_SESSION_ID, "content": MESSAGE_CONTENT, "author": (either "user" or "assistant" depending on who wrote the message), "date": TIMESTAMP_OF_MESSAGE}, ...]``

## 📄 System Prompt

The system prompt is the initial instruction the AI model gets in order to answer the user and fulfil its tasks. The ``timestamp`` placeholder is just the current time, the ``messages_text`` placeholder gets replaced with the previous conversation (the messages already existing in the session, limited to a maximum of 10) and the ``context_text`` placeholder gets replaced with the context which is fetched using the Top-K-Neighbours method from the database (see more [here](#-context-fetching)).

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

## 💡 Context-fetching

The context fetching happens with the [Top-K-Neighbours](https://en.wikipedia.org/wiki/K-nearest_neighbors_algorithm) algorithm, using the embeddings stored in the database for each individual meeting and legislation. We use a K of 20 and pass the previous conversation and the new prompt as input to the algorithm.
