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

## Current Status
- Project initialized
- PRD defined
- Ready to begin implementation
