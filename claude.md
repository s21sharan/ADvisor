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
- Upload keyword_scrape_input.csv to Bright Data for keyword-based scraping
- Upload url_scrape_input.csv to Bright Data for URL-based comment scraping
- Process and store scraped Reddit data in Feature Store
- Begin Feature Extraction Engine implementation

### #BugsAndTheories
- Some keywords have broken words (e.g. "p rotein powder", "van conv ersions") ⇒ source CSV has formatting issues with quoted strings
- 42 duplicate URLs in 100_subreddits.json ⇒ multiple scraping runs or overlapping subreddit queries

### #Background
- Pivoted from browser automation to Bright Data Dataset API for reliability
- Using two scraping approaches: keyword-based (101 keywords) and URL-based (1,508 posts)
- Bright Data API uses synchronous /scrape endpoint with parameters: url, sort_by, sort_by_time, num_of_posts, keyword
- Created batch processing scripts for CSV → API input format conversion
