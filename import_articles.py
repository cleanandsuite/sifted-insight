#!/usr/bin/env python3
"""
Insert scraped articles into Supabase
"""

import json
import requests

SUPABASE_URL = "https://jmhtzyctxntaojuovrtf.supabase.co"
SERVICE_KEY = "nNa-u$-JLY*mgV7"

headers = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json"
}

# Load articles
with open("scraped_articles.json", "r") as f:
    articles = json.load(f)

# First, create the articles table if it doesn't exist
create_table_sql = """
CREATE TABLE IF NOT EXISTS articles (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(500),
    url TEXT UNIQUE,
    summary TEXT,
    content TEXT,
    source_name VARCHAR(100),
    published_at TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'published',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
"""

# Create table
resp = requests.post(
    f"{SUPABASE_URL}/rest/v1/rpc/exec_sql",
    headers=headers,
    json={"query": create_table_sql},
    timeout=30
)
print(f"Table creation: {resp.status_code}")

# Insert articles in batches
inserted = 0
for article in articles[:20]:  # First 20 for testing
    payload = {
        "title": article.get("title", "")[:500],
        "url": article.get("url", ""),
        "summary": article.get("summary", "")[:2000],
        "content": article.get("content", "")[:5000],
        "source_name": article.get("source_name", ""),
        "published_at": article.get("published_at"),
        "status": article.get("status", "published")
    }
    
    resp = requests.post(
        f"{SUPABASE_URL}/rest/v1/articles",
        headers=headers,
        json=payload,
        timeout=30
    )
    
    if resp.status_code in [200, 201]:
        inserted += 1
    elif resp.status_code == 409:
        print(f"  Duplicate: {article.get('title', '?')[:50]}")
    else:
        print(f"  Error {resp.status_code}: {resp.text[:100]}")

print(f"\nInserted {inserted} articles!")
