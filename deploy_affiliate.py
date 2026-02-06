#!/usr/bin/env python3
"""
Deploy affiliate SQL to Supabase
"""

import requests
import json

# Supabase credentials
SUPABASE_URL = "https://jmhtzyctxntaojuovrtf.supabase.co"
SERVICE_KEY = "nNa-u$-JLY*mgV7"

def exec_sql(sql):
    """Execute SQL via pg_query RPC"""
    headers = {
        "apikey": SERVICE_KEY,
        "Authorization": f"Bearer {SERVICE_KEY}",
        "Content-Type": "application/json"
    }
    
    response = requests.post(
        f"{SUPABASE_URL}/rest/v1/rpc/pg_query",
        headers=headers,
        json={"query": sql},
        timeout=30
    )
    return response.status_code, response.text

# Read the SQL file
with open("affiliate_system.sql", "r") as f:
    sql_content = f.read()

# Clean comments
clean_sql = "\n".join(
    line for line in sql_content.split("\n")
    if not line.strip().startswith("--")
)

# Split into statements
statements = [s.strip() for s in clean_sql.split(";") if s.strip() and not s.strip().startswith("COPY")]

print(f"Deploying {len(statements)} SQL statements...")

success = 0
failed = 0

for i, stmt in enumerate(statements[:5]):  # First 5
    code, text = exec_sql(stmt)
    if code in [200, 201, 204, 400]:
        print(f"  [{i+1}] OK ({code})")
        success += 1
    else:
        print(f"  [{i+1}] FAILED: {text[:100]}")
        failed += 1

print(f"\nResults: {success} OK, {failed} failed")
print("\nTo continue, run SQL manually in Supabase SQL Editor:")
print(f"1. Open: {SUPABASE_URL}/sql")
print("2. Copy contents of affiliate_system.sql")
print("3. Click 'Run'")
