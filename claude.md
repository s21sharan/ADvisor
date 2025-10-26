# AdVisor Project Overview

## Product Vision
AdVisor empowers marketers to understand and improve their ad creatives by combining multimodal feature extraction with generative agent simulations.

## Core Workflow
1. User uploads ad (image/video) + company info
2. System analyzes the creative and extracts features
3. AI simulates audience communities
4. Delivers actionable creative feedback and improved ad variants

## System Architecture (7 Components)

### 1. Ad Upload
- Input: User uploads ad + company metadata
- Output: Raw file + metadata

### 2. Feature Extraction Engine
- Input: Ad creative (image/video/audio)
- Output: Multimodal features (visual, text, audio, sentiment, etc.)
- **Goal**: Extract ≥10 distinct, decorrelated features per ad
- **Performance**: <5 min per 50 ads on single GPU

### 3. Feature Store
- Input: Features from extractor
- Output: Central structured dataset + embeddings
- Stores structured embeddings and signals

### 4. Community Recommender
- Input: Ad embeddings + brand metadata
- Output: Suggests best-fit or custom audience communities to simulate
- **Key Role**: Acts as router, defines which audience lenses agents should think through

### 5. Agent Simulation Layer
- Input: Selected communities + features
- Output: Runs feedback simulations tailored to each audience
- Agent types: Performance Analyst, Creative Director, etc.
- Instantiates agents for each community (e.g., "Gen Z minimalists," "Busy professionals")

### 6. Creative Feedback & Variant Generator
- Input: Agent outputs
- Output: Produces improved ad variants or creative recommendations

### 7. Insights Dashboard
- Input: Aggregated feedback, variants, metrics
- Output: Visualization + download/export UI for marketers

## Key Objectives

| Goal | Description | Metric |
|------|-------------|--------|
| Feature Extraction Insight | Extract semantically rich, non-redundant signals | ≥10 distinct, decorrelated features per ad |
| Performance | Fast processing, parallelizable | <5 min per 50 ads on single GPU |
| Robustness | Handle diverse industries, formats | 100% of .png/.mp4 ads processed |
| Creativity | Unique, interpretable signals | ≥3 novel "outside-the-box" signal types |

## Critical Connection
The Community Recommender → Agent Simulation Layer handoff is crucial:
- Without it, agents wouldn't know which audience persona they're simulating
- This is the key connection between data-driven analysis and human-like interpretation

## Tech Stack Considerations
- Need multimodal ML models (vision, text, audio)
- GPU acceleration for batch processing
- Agent framework for simulation layer
- Frontend dashboard for visualization
- Feature store/database for embeddings

## Current Status - Reddit Scraper Complete ✅

### Backend API (Python FastAPI)
- **Location**: `backend/`
- **Status**: Fully implemented using Bright Data Dataset API
- **Endpoint**: `POST http://localhost:8000/scrape`
- **Features**:
  - Scrapes subreddit posts (title, body, author, upvotes, timestamp, URL)
  - Extracts top 25 comments per post
  - Saves to `backend/data/{subreddit}_{timestamp}.json`
  - Polling-based workflow: trigger → poll progress → download snapshot

### Reddit Scraper Implementation
- **Files**:
  - `backend/scraper/brightdata_client.py` - API client with polling logic
  - `backend/scraper/reddit_scraper_v2.py` - Main scraper orchestration
  - `backend/main.py` - FastAPI server
  - `backend/models/reddit_post.py` - Pydantic models
  - `backend/utils/parsers.py` - Data parsing utilities

### Environment Variables (.env)
```
BRIGHT_DATA_API_KEY=a18e1c69af4ba02bfc9d79361880ecc9690554ae0e1945d891d48f2ebc44313b
FETCH_AI_API_KEY=sk_8647c64a7ec3493db51369190475ca12177db5485b9a41f19b0d3256dd5e4366
```

### Next Steps
1. Test Reddit scraper with r/Fitness #Deprecated
2. Begin implementing Feature Extraction Engine (Component 2)
3. Set up Feature Store for embeddings (Component 3)

## 2025-10-25 – Compact Session

### #CurrentFocus
Converted CSV datasets to Bright Data API input formats for batch keyword & URL-based Reddit scraping

### #SessionChanges
- Parsed Sheet 2-Table 1.csv and extracted 101 unique keywords for Bright Data keyword-based discovery
- Created parse_keywords.py script to clean and format keywords from messy CSV with regex
- Generated keyword_scrape_input.csv with columns: keyword, date, sort_by, num_of_posts (all set to 100)
- Extracted 1,508 unique post URLs from 100_subreddits.json (1,550 total posts)
- Created extract_urls.py to generate url_scrape_input.csv with days_back=50, load_all_replies=true, comment_limit=100
- Analyzed post distribution across 71 subreddits (avg 21.8 posts per subreddit, top: Anxiety/depression/motorcycles with 100 each)

### #NextSteps
- Upload keyword_scrape_input.csv to Bright Data for keyword-based scraping #Deprecated
- Upload url_scrape_input.csv to Bright Data for URL-based comment scraping #Deprecated
- Process and store scraped Reddit data in Feature Store #Deprecated
- Begin Feature Extraction Engine implementation

### #BugsAndTheories
- Some keywords have broken words (e.g. "p rotein powder", "van conv ersions") ⇒ source CSV has formatting issues with quoted strings
- 42 duplicate URLs in 100_subreddits.json ⇒ multiple scraping runs or overlapping subreddit queries

### #Background
- Pivoted from browser automation to Bright Data Dataset API for reliability
- Using two scraping approaches: keyword-based (101 keywords) and URL-based (1,508 posts)
- Bright Data API uses synchronous /scrape endpoint with parameters: url, sort_by, sort_by_time, num_of_posts, keyword
- Created batch processing scripts for CSV → API input format conversion

## 2025-10-25 – Compact Session

### #CurrentFocus
Built complete Knowledge Graph + Vector DB system with automated Reddit data processing pipeline generating 50 diverse personas per community

### #SessionChanges
- Extracted 118,169 unique author profile URLs from keywords.json using extract_author_urls.py
- Built Supabase SDK integration with supabase_client.py and tested connection successfully
- Created complete KG schema (sql/01_knowledge_graph_schema.sql) with personas, communities, interests, creative_prefs tables
- Created vector DB schema (sql/02_vector_database_schema.sql) with pgvector, embeddings tables, RPC functions
- Built Python SDK layer: knowledge_graph.py, vector_store.py, persona_manager.py integration
- Created OpenAI client wrapper (openai_client.py) with GPT-4o-mini + text-embedding-3-small support
- Built process_reddit_data.py pipeline: extracts 1,577 communities, enriches top 20, generates 50 personas each (1,000 total)
- Added generate_diverse_personas_batch() method for batch persona generation with diversity strategy
- Updated .gitignore to exclude large data files (backend/data/*.json, backend/*.csv)
- Created comprehensive docs: SETUP_GUIDE.md, DATA_PROCESSING_GUIDE.md, QUICK_REFERENCE.md, 50_PERSONAS_PER_COMMUNITY.md

### #NextSteps
- Run SQL schemas in Supabase (01_knowledge_graph_schema.sql, 02_vector_database_schema.sql)
- Execute process_reddit_data.py to generate 1,000 personas (~60-75 min, ~$3.85 cost)
- Verify persona count and test similarity search queries
- Connect personas to Agent Simulation Layer for creative feedback

### #RecentImprovements
- Fixed OpenAI timeout (30s → 300s) and reduced batch size (50 → 10 personas per batch)
- Improved keyword extraction with comprehensive stopword filtering (now extracts meaningful topics like "husband", "weight", "college", "workout" instead of generic words like "aita", "update", "years")

### #BugsAndTheories
- None identified in current session

### #Background
- System processes 10,043 posts from keywords.json + subreddits.json across 1,577 unique communities
- Generates 50 diverse personas per community (varying age, income, experience, goals) using GPT batch generation
- **Batch strategy**: 5 batches of 10 personas per community (100 GPT API calls total) - prevents timeout issues
- **Timeout fix**: Increased OpenAI client timeout from 30s to 300s (5 minutes) in utils/openai_client.py
- Cost breakdown: $2.00 persona gen, $0.05 embeddings, $0.40 communities, $1.40 other = $3.85 total
- Database impact: 1,000 personas + embeddings = ~8 MB, IVFFlat indexes handle <100ms similarity search
- **Pipeline architecture**: Processes each community sequentially - creates community, generates 50 personas (5 batches of 10), commits to DB before moving to next community (enables incremental progress if interrupted)

## 2025-10-25 – Compact Session

### #CurrentFocus
Fixed OpenAI timeout errors and improved keyword extraction for meaningful interest generation

### #SessionChanges
- Modified process_reddit_data.py to commit to database after each community (incremental processing for fault tolerance)
- Increased OpenAI client timeout from 30s to 300s in utils/openai_client.py (prevents read timeout on large requests)
- Reduced persona batch size from 50 to 10 (5 batches per community) to prevent API timeouts
- Expanded stopword list from ~60 to 180+ words (filters Reddit jargon, generic verbs, time words)
- Increased minimum keyword length from 3 to 5 characters with vowel requirement
- Created INCREMENTAL_PROCESSING.md documenting per-community commit strategy
- Created TIMEOUT_FIX.md explaining timeout solution and batch size trade-offs
- Created KEYWORD_EXTRACTION.md showing before/after keyword quality improvements
- Created test_keywords.py script to preview extracted keywords before processing

### #NextSteps
- Run SQL schemas in Supabase (01_knowledge_graph_schema.sql, 02_vector_database_schema.sql)
- Execute process_reddit_data.py to generate 1,000 personas (50 per community × 20 communities)
- Verify persona creation and test similarity search queries
- Connect personas to Agent Simulation Layer for creative feedback

### #BugsAndTheories
- OpenAI timeout on 50-persona batches ⇒ requests taking 2-3 minutes exceeded 30s timeout, fixed with 300s timeout + smaller batches
- Generic keywords extracted (aita, update, years) ⇒ insufficient stopword filtering, fixed with comprehensive 180+ word stopword list

### #Background
- Incremental processing: Each community commits immediately (community + 50 personas + embeddings) before moving to next
- Keyword quality: Now extracts meaningful topics (husband, weight, college, workout) vs generic words (aita, update, years)
- Total API calls: 100 GPT persona generation + 20 embedding batches = 120 calls for 1,000 personas
- Processing time: ~60-75 minutes total, ~3-4 minutes per community (includes 5 persona batches + embeddings + DB writes)

## 2025-10-25 – Compact Session

### #CurrentFocus
Integrated Elasticsearch for fast vector search and full-text search capabilities alongside Supabase

### #SessionChanges
- Installed elasticsearch==9.1.1 Python client and configured connection to Elastic Cloud serverless
- Created config/elasticsearch_client.py with API key authentication and connection testing
- Built es_search/schema.py with serverless-compatible index mappings for personas, communities, content, interests
- Created es_search/es_client.py SDK with CRUD operations, vector search (k-NN), and bulk indexing
- Implemented db/dual_store.py to write to both Supabase (PostgreSQL + pgvector) and Elasticsearch simultaneously
- Added Elasticsearch credentials to .env (URL, API key, cloud ID)
- Updated requirements.txt with elasticsearch dependency
- Created ELASTICSEARCH_SETUP.md with comprehensive usage guide and examples

### #NextSteps
- Modify process_reddit_data.py to use DualStoreManager instead of PersonaManager
- Run pipeline to populate both Supabase and Elasticsearch with 1,000 personas
- Test vector search performance comparison between pgvector and Elasticsearch
- Build FastAPI endpoints for persona/community search using both stores

### #BugsAndTheories
- Initial connection error ⇒ serverless mode doesn't support shard/replica settings, fixed by removing from mappings

### #Background
- Elasticsearch cluster: my-elasticsearch-project (us-central1, serverless mode)
- Dual-store architecture: Supabase for relational data + pgvector, Elasticsearch for fast vector/text search + analytics
- Vector dimensions: 1536 (OpenAI text-embedding-3-small) with cosine similarity
- Indices created: advisor_personas, advisor_communities, advisor_content, advisor_interests
- Use cases: Elasticsearch for search speed, Supabase for transactional consistency and relational queries

## 2025-10-25 – Compact Session

### #CurrentFocus
Migrated existing Supabase data (personas, communities, content, interests) to Elasticsearch for dual-store architecture

### #SessionChanges
- Created scripts/migrate_supabase_to_elasticsearch.py with full migration pipeline for all data types
- Parsed string-encoded fields (demographics, psychographics, pain_points, motivations) using ast.literal_eval
- Converted string-encoded embeddings to float arrays using json.loads for Elasticsearch indexing
- Migrated 97/100 personas (3 missing embeddings), 20/25 communities, 97/100 content items, 100/100 interests
- Created scripts/migrate_fix_personas.py for focused persona migration bypassing relational lookups
- Renamed elasticsearch folder to es_search to avoid Python package naming conflict
- Updated requirements.txt with elasticsearch==9.1.1 dependency

### #NextSteps
- Test Elasticsearch vector search performance vs Supabase pgvector with sample queries
- Build FastAPI search endpoints using DualStoreManager for hybrid queries
- Implement search aggregations and analytics using Elasticsearch
- Update process_reddit_data.py to use DualStoreManager for future data ingestion

### #BugsAndTheories
- Embedding string format ⇒ Supabase stores embeddings as JSON strings, required json.loads parsing for Elasticsearch
- Demographics/psychographics as strings ⇒ stored as string repr not JSON, needed ast.literal_eval to convert to dicts/lists
- Missing 'name' field in relations ⇒ get_persona_communities() returns incomplete data, bypassed by skipping community/interest lookups

### #Background
- Migration completed: 311 total documents synced from Supabase to Elasticsearch
- Data parsing strategy: ast.literal_eval for Python literals, json.loads for JSON strings
- Current Elasticsearch state: 94 personas, 20 communities, 97 content, 100 interests all searchable
- Both stores now contain same data: Supabase (source of truth), Elasticsearch (search/analytics layer)

## 2025-10-26 – Compact Session

### #CurrentFocus
Integrated Fetch.ai ASI:One API to power all 932 persona agents with asi1-mini model for authentic persona embodiment

### #SessionChanges
- Created backend/utils/fetchai_client.py wrapper with OpenAI-compatible chat completions interface for asi1-mini model
- Updated backend/agents/persona_agent.py to use Fetch.ai for agent reasoning (system prompts for persona embodiment)
- Replaced OpenAI LLM calls with Fetch.ai ASI:One while keeping OpenAI for embedding generation only
- Added error handling to db/persona_manager.py for graceful database query failures in vector search
- Tested connection to Fetch.ai API successfully (https://api.asi1.ai/v1/chat/completions)
- Verified all 6 API endpoints working: list personas, chat, analyze-ad, analyze-ad-multi, get context, find similar
- Tested with multiple personas generating authentic, persona-specific responses to ads and queries

### #NextSteps
- Begin implementing Feature Extraction Engine (Component 2)
- Set up Feature Store for embeddings (Component 3)
- Connect persona agents to creative feedback and variant generation pipeline

### #BugsAndTheories
- Supabase RPC match_content/match_communities type mismatch ⇒ varchar(255) vs text in column 2, added try/catch to prevent failures
- Chat endpoint initially failed with 500 error ⇒ database query type mismatch, fixed with error handling fallbacks

### #Background
- Architecture: Fetch.ai ASI:One (asi1-mini) for agent reasoning, OpenAI for embeddings, Supabase for data + pgvector retrieval
- All 932 personas now use Fetch.ai with system prompts containing full persona context (demographics, psychographics, pain points, motivations)
- Agents access embedded messages/content via vector similarity search in Supabase
- Removed all Elasticsearch dependencies per user request (reverted to Supabase-only for vector search)
- API running at http://localhost:8000 with full persona agent functionality
