# Search

## Overview

Our search functionality uses vector search to find semantically relevant documents and meetings. The process has two stages: data preparation and search execution with query refinement and reranking.

## 1. Data Preparation

- **Ingestion**: Scrapers in `app/data_sources/scrapers/` collect data from parliamentary sources
- **Processing**: Text is cleaned and translated via `app/data_sources/translator/translator.py`
- **Embedding**: `scripts/embedding_generator.py` generates vector embeddings using OpenAI Ada-002 model via LLM client (`app/core/openai_client.py`)
- **Storage**: Data and embeddings stored in Supabase tables (`meeting_embeddings`, `document_embeddings`)

### Database Schema

Vector embeddings are stored in two main tables:

- **`meeting_embeddings`**: Stores 1536-dimensional vectors for meeting content with IVFFlat index for efficient similarity search
- **`documents_embeddings`**: Stores document embeddings with similar structure

Both tables use pgvector extension with cosine similarity (`<#>` operator) for nearest neighbor search.

### Embedding Generation

The `EmbeddingGenerator` class handles text chunking and embedding generation:

```python
class EmbeddingGenerator:
    def __init__(self, max_tokens: int = MAX_TOKENS, overlap: int = 100):
        # Initializes text splitter with RecursiveCharacterTextSplitter
        # Retrieves known meeting sources from database
        
    def embed_row(self, source_table: str, row_id: str, content_column: str, 
                  content_text: str, destination_table: Optional[str] = None):
        # Splits content using LangChain text splitter
        # Handles metadata extraction (META_DELIM separator)
        # Determines destination table (meeting_embeddings vs documents_embeddings)
        # Processes in batches using OpenAI Ada-002 model
        # Upserts to Supabase with conflict resolution
```

**Process:**
1. Text is split into chunks using `RecursiveCharacterTextSplitter` (overlap: 100 tokens)
2. Metadata extracted if `::META::` delimiter present
3. Chunks processed in batches via OpenAI Ada-002 embedding model
4. Results upserted to appropriate Supabase table with conflict handling

## 2. Search Execution

### Vector Search Function

The core `get_top_k_neighbors()` function in `app/core/vector_search.py` handles similarity search:

```python
def get_top_k_neighbors(
    query: Optional[str] = None,
    embedding: Optional[list[float]] = None,
    allowed_sources: Optional[dict[str, str]] = None,
    allowed_topics: Optional[list[str]] = None,
    allowed_topic_ids: Optional[list[str]] = None,
    allowed_countries: Optional[list[str]] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    k: int = 5,
    sources: Optional[list[str]] = None,
    source_id: Optional[str] = None,
) -> list[dict]:
```

**Function Logic:**
- Accepts either query text or pre-computed embedding vector
- Generates embedding using OpenAI Ada-002 model if query provided
- Routes to appropriate Supabase RPC function based on source type:
  - `match_filtered`: for document embeddings
  - `match_filtered_meetings`: for meeting embeddings with topic/country/date filters
  - `match_combined_filtered_embeddings`: for combined search across both tables
- Applies filters for sources, topics, countries, dates, and source IDs

### Database RPC Functions

**`match_filtered_meetings`**: Searches meeting embeddings with advanced filtering:
- Topic filtering via `meeting_topic_assignments` table joins
- Country filtering via `v_meetings` view location lookup
- Date range filtering using meeting start/end datetime
- Returns similarity score calculated as `(1 - cosine_distance) / 2`

**`match_combined_filtered_embeddings`**: Performs unified search across both meeting and document embeddings using UNION ALL for comprehensive results.

### API Flow

Search requests flow through API endpoints (`app/api/meetings.py`, `app/api/legislative_files.py`) to `app/core/vector_search.py`.

**Process:**
1. **Query Refinement**: User query is refined with ChatGPT for better similarity matching
2. **Initial Search**: Refined query converted to embedding using OpenAI Ada-002 model
3. **Vector Search**: Database executes vector similarity search using pgvector extension with cosine similarity (`<#>` operator)
4. **Initial Results**: Fetch top 1000 results via `get_top_k_neighbors`
5. **Reranking**: Results are reranked using Cohere AI Reranker 3.5 (attention-based) for improved relevance
6. **Response**: API formats final ranked results and returns