# Elasticsearch Setup Guide for AdVisor

## Overview
Elasticsearch provides vector search and full-text search capabilities for personas, communities, and content in the AdVisor system.

## Connection Details

**Cluster**: my-elasticsearch-project
**URL**: `https://my-elasticsearch-project-c95d5c.es.us-central1.gcp.elastic.cloud:443`
**Mode**: Serverless (Elastic Cloud)

## Configuration

### Environment Variables (.env)
```env
ELASTICSEARCH_URL=https://my-elasticsearch-project-c95d5c.es.us-central1.gcp.elastic.cloud:443
ELASTICSEARCH_API_KEY=OUpVSEg1b0J3akdqZFBKZXgtWFQ6NjRiWkZIR0xycFkxRVJnMVUxMldmZw==
ELASTICSEARCH_CLOUD_ID=my-elasticsearch-project:dXMtY2VudHJhbDEuZ2NwLmNsb3VkLmVzLmlvOjQ0MyQzYzk1ZDVjMGZjYmU0YTY2YjE5NzkyNDczYmE2NzNlZCQ0ZjY5NzY5ZTk2YWY0NTI4OTQ5YjY4YjNmZDEzNzk3Nw==
```

## Indices

### 1. advisor_personas
Stores persona profiles with demographics, psychographics, and vector embeddings.

**Fields**:
- `persona_id` (keyword): Unique persona identifier
- `name` (text): Persona name
- `summary` (text): Persona summary/description
- `demographics` (object): Age, gender, location, income, education, occupation
- `psychographics` (object): Values, lifestyle, personality traits
- `interests` (keyword array): List of interests
- `pain_points` (text array): User pain points
- `motivations` (text array): User motivations
- `communities` (keyword array): Associated communities
- `embedding` (dense_vector): 1536-dim vector from OpenAI
- `created_at`, `updated_at` (date)

**Capabilities**:
- Vector similarity search (k-NN)
- Full-text search on name, summary, pain_points, motivations
- Filter by demographics (age_range, income_level, etc.)

### 2. advisor_communities
Stores community profiles with descriptions and embeddings.

**Fields**:
- `community_id` (keyword)
- `name` (text): Community name (e.g., "r/Fitness")
- `platform` (keyword): "reddit", "twitter", etc.
- `description` (text): Community description
- `audience_type`, `tone`, `activity_level` (keyword)
- `topic_categories` (keyword array)
- `embedding` (dense_vector): 1536-dim
- `created_at`, `updated_at` (date)

**Capabilities**:
- Vector similarity search
- Full-text search on name and description
- Filter by platform, activity level, topic

### 3. advisor_content
Stores Reddit posts, comments, and other content with embeddings.

**Fields**:
- `content_id` (keyword)
- `content_type` (keyword): "post", "comment"
- `title`, `body` (text)
- `community_name`, `author` (keyword)
- `upvotes`, `num_comments` (integer)
- `url` (keyword)
- `date_posted`, `created_at` (date)
- `embedding` (dense_vector): 1536-dim

**Capabilities**:
- Vector similarity search
- Full-text search on title and body
- Filter by community, author, date range
- Sort by upvotes or comments

### 4. advisor_interests
Stores interest categories and keywords.

**Fields**:
- `interest_id` (keyword)
- `label` (text): Interest name
- `category` (keyword): Interest category
- `description` (text)
- `keywords` (keyword array)
- `created_at` (date)

## Python SDK Usage

### Initialize Client

```python
from es_search.es_client import ElasticsearchClient

es = ElasticsearchClient()
```

### Create Indices

```python
# Create all indices (idempotent)
es.create_all_indices()

# Force recreate (deletes existing)
es.create_all_indices(force_recreate=True)
```

### Index a Persona

```python
es.index_persona(
    persona_id="persona_123",
    name="Tech-Savvy Millennial",
    summary="Early-career software engineer interested in fitness and productivity",
    embedding=[0.1, 0.2, ...],  # 1536-dim vector
    demographics={
        "age_range": "25-34",
        "income_level": "middle",
        "occupation": "software_engineer"
    },
    psychographics={
        "values": ["innovation", "health"],
        "lifestyle": "urban_professional"
    },
    interests=["fitness", "technology", "productivity"],
    pain_points=["time management", "work-life balance"],
    motivations=["career growth", "health improvement"],
    communities=["r/fitness", "r/cscareerquestions"]
)
```

### Vector Search for Personas

```python
# Generate query embedding from text
from utils.openai_client import OpenAIClient

openai = OpenAIClient()
query_embedding = openai.generate_embedding("fitness enthusiast who works in tech")

# Search for similar personas
results = es.search_personas_by_vector(
    query_embedding=query_embedding,
    k=10,  # Top 10 results
    filters={"demographics.age_range": "25-34"}  # Optional filter
)

for result in results:
    print(f"{result['source']['name']}: {result['score']}")
```

### Full-Text Search for Personas

```python
results = es.search_personas_by_text(
    query="fitness and health",
    k=10
)
```

### Index a Community

```python
es.index_community(
    community_id="comm_456",
    name="r/Fitness",
    description="Community for fitness enthusiasts",
    embedding=[0.3, 0.4, ...],
    platform="reddit",
    audience_type="health_conscious",
    tone="motivational",
    activity_level="high",
    topic_categories=["health", "fitness", "nutrition"]
)
```

### Search Communities by Vector

```python
query_embedding = openai.generate_embedding("health and wellness community")

results = es.search_communities_by_vector(
    query_embedding=query_embedding,
    k=5
)
```

### Bulk Index Content

```python
posts = [
    {
        "content_id": "post_1",
        "content_type": "post",
        "title": "My fitness journey",
        "body": "Started working out 6 months ago...",
        "community_name": "r/Fitness",
        "author": "user123",
        "upvotes": 150,
        "num_comments": 42,
        "url": "https://reddit.com/r/fitness/post1",
        "date_posted": "2025-01-15T10:00:00Z",
        "embedding": [0.5, 0.6, ...]
    },
    # ... more posts
]

result = es.bulk_index_content(posts)
print(f"Indexed {result['success']} documents, {result['failed']} failed")
```

### Get Document Counts

```python
counts = es.get_all_counts()
print(f"Personas: {counts['personas']}")
print(f"Communities: {counts['communities']}")
print(f"Content: {counts['content']}")
print(f"Interests: {counts['interests']}")
```

## Testing

Test the Elasticsearch connection:

```bash
cd backend
python config/elasticsearch_client.py
```

Test the full client and create indices:

```bash
python es_search/es_client.py
```

## Architecture Notes

### Vector Search
- Uses OpenAI `text-embedding-3-small` (1536 dimensions)
- Cosine similarity metric
- k-NN search with candidate oversampling (num_candidates = k * 2)

### Serverless Mode
- Running on Elastic Cloud Serverless
- No shard/replica configuration (managed automatically)
- Auto-scaling enabled

### Hybrid Search
Can combine vector + text + filters:

```python
# Example: Find tech-savvy fitness personas in specific age range
query_embedding = openai.generate_embedding("tech-savvy fitness enthusiast")

results = es.search_personas_by_vector(
    query_embedding=query_embedding,
    k=20,
    filters={
        "demographics.age_range": "25-34",
        "interests": "technology"
    }
)
```

## Integration with Existing Pipeline

The Elasticsearch setup complements the existing Supabase + pgvector setup:

- **Supabase/PostgreSQL**: Relational data, personas, communities, relationships
- **Elasticsearch**: Fast vector search, full-text search, analytics

Use Elasticsearch for:
1. Fast similarity search across large datasets
2. Full-text search on persona descriptions, content
3. Complex filtering + vector search combinations
4. Analytics and aggregations

Use Supabase for:
1. Transactional data
2. Relational queries (persona → communities → interests)
3. RPC functions for hybrid queries

## Next Steps

1. Integrate Elasticsearch into `process_reddit_data.py` pipeline
2. Dual-write to both Supabase and Elasticsearch
3. Create search API endpoints in FastAPI
4. Build dashboard for exploring personas and communities
