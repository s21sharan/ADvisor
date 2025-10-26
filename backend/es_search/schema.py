"""
Elasticsearch Index Schemas for AdVisor (Serverless Mode)
Defines mappings for personas, communities, and content
"""

# Persona Index Schema
PERSONA_INDEX = "advisor_personas"
PERSONA_MAPPING = {
    "mappings": {
        "properties": {
            "persona_id": {"type": "keyword"},
            "name": {"type": "text", "fields": {"keyword": {"type": "keyword"}}},
            "summary": {"type": "text"},
            "demographics": {
                "properties": {
                    "age_range": {"type": "keyword"},
                    "gender": {"type": "keyword"},
                    "location": {"type": "keyword"},
                    "income_level": {"type": "keyword"},
                    "education": {"type": "keyword"},
                    "occupation": {"type": "keyword"},
                }
            },
            "psychographics": {
                "properties": {
                    "values": {"type": "keyword"},
                    "lifestyle": {"type": "keyword"},
                    "personality_traits": {"type": "keyword"},
                }
            },
            "interests": {"type": "keyword"},
            "pain_points": {"type": "text"},
            "motivations": {"type": "text"},
            "communities": {"type": "keyword"},
            "embedding": {
                "type": "dense_vector",
                "dims": 1536,
                "index": True,
                "similarity": "cosine",
            },
            "created_at": {"type": "date"},
            "updated_at": {"type": "date"},
        }
    }
}

# Community Index Schema
COMMUNITY_INDEX = "advisor_communities"
COMMUNITY_MAPPING = {
    "mappings": {
        "properties": {
            "community_id": {"type": "keyword"},
            "name": {"type": "text", "fields": {"keyword": {"type": "keyword"}}},
            "platform": {"type": "keyword"},
            "description": {"type": "text"},
            "audience_type": {"type": "keyword"},
            "tone": {"type": "keyword"},
            "activity_level": {"type": "keyword"},
            "topic_categories": {"type": "keyword"},
            "member_count": {"type": "integer"},
            "embedding": {
                "type": "dense_vector",
                "dims": 1536,
                "index": True,
                "similarity": "cosine",
            },
            "created_at": {"type": "date"},
            "updated_at": {"type": "date"},
        }
    }
}

# Content Index Schema (for Reddit posts)
CONTENT_INDEX = "advisor_content"
CONTENT_MAPPING = {
    "mappings": {
        "properties": {
            "content_id": {"type": "keyword"},
            "content_type": {"type": "keyword"},
            "title": {"type": "text"},
            "body": {"type": "text"},
            "community_name": {"type": "keyword"},
            "author": {"type": "keyword"},
            "upvotes": {"type": "integer"},
            "num_comments": {"type": "integer"},
            "url": {"type": "keyword"},
            "date_posted": {"type": "date"},
            "embedding": {
                "type": "dense_vector",
                "dims": 1536,
                "index": True,
                "similarity": "cosine",
            },
            "created_at": {"type": "date"},
        }
    }
}

# Interest Index Schema
INTEREST_INDEX = "advisor_interests"
INTEREST_MAPPING = {
    "mappings": {
        "properties": {
            "interest_id": {"type": "keyword"},
            "label": {"type": "text", "fields": {"keyword": {"type": "keyword"}}},
            "category": {"type": "keyword"},
            "description": {"type": "text"},
            "keywords": {"type": "keyword"},
            "created_at": {"type": "date"},
        }
    }
}


def get_all_schemas():
    """Get all index schemas"""
    return {
        PERSONA_INDEX: PERSONA_MAPPING,
        COMMUNITY_INDEX: COMMUNITY_MAPPING,
        CONTENT_INDEX: CONTENT_MAPPING,
        INTEREST_INDEX: INTEREST_MAPPING,
    }
