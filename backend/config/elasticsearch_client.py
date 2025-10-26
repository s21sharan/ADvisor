"""
Elasticsearch Client Configuration for AdVisor
Handles connection to Elasticsearch Cloud for vector search and full-text search
"""
import os
from elasticsearch import Elasticsearch
from dotenv import load_dotenv

load_dotenv()

ELASTICSEARCH_URL = os.getenv("ELASTICSEARCH_URL")
ELASTICSEARCH_API_KEY = os.getenv("ELASTICSEARCH_API_KEY")
ELASTICSEARCH_CLOUD_ID = os.getenv("ELASTICSEARCH_CLOUD_ID")


def get_elasticsearch_client() -> Elasticsearch:
    """
    Get Elasticsearch client instance

    Returns:
        Elasticsearch: Connected Elasticsearch client

    Raises:
        ValueError: If credentials are missing
    """
    if not ELASTICSEARCH_API_KEY:
        raise ValueError("ELASTICSEARCH_API_KEY not found in environment variables")

    if not ELASTICSEARCH_URL:
        raise ValueError("ELASTICSEARCH_URL not found in environment variables")

    # Connect using URL and API key
    es = Elasticsearch(
        ELASTICSEARCH_URL,
        api_key=ELASTICSEARCH_API_KEY,
        request_timeout=30,
        verify_certs=True,
    )

    return es


def test_connection():
    """Test Elasticsearch connection"""
    try:
        es = get_elasticsearch_client()

        # Test basic operations
        print("Testing Elasticsearch connection...")

        # Try a simple cat API call
        try:
            indices = es.cat.indices(format="json")
            print(f"✓ Successfully connected to Elasticsearch!")
            print(f"  Found {len(indices)} existing indices")

            if indices:
                for idx in indices[:3]:
                    print(f"  - {idx['index']}: {idx['docs.count']} docs, {idx['store.size']}")
        except Exception as e:
            # If no indices exist yet, that's okay
            print(f"✓ Successfully connected to Elasticsearch!")
            print(f"  No indices found (fresh cluster)")

        return True

    except Exception as e:
        print(f"✗ Error connecting to Elasticsearch: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    test_connection()
