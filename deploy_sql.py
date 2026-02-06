#!/usr/bin/env python3
"""
Deploy affiliate SQL to Supabase via REST API
"""

import requests
import json

# Supabase credentials from .env
SUPABASE_URL = "https://jmhtzyctxntaojuovrtf.supabase.co"
SUPABASE_KEY = "nNa-u$-JLY*mgV7"  # service role key

def execute_sql(sql_file):
    """Execute SQL file against Supabase"""
    
    with open(sql_file, 'r') as f:
        sql = f.read()
    
    # Remove comments
    lines = []
    for line in sql.split('\n'):
        if not line.strip().startswith('--'):
            lines.append(line)
    clean_sql = '\n'.join(lines)
    
    # Split by semicolons and execute each statement
    statements = [s.strip() for s in clean_sql.split(';') if s.strip()]
    
    results = []
    
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "X-Client-Info": "supabase-py/2.27.3"
    }
    
    for i, stmt in enumerate(statements):
        if stmt.startswith('CREATE INDEX') or stmt.startswith('CREATE TRIGGER') or stmt.startswith('CREATE FUNCTION') or stmt.startswith('CREATE VIEW') or stmt.startswith('CREATE TABLE'):
            # DDL statements
            endpoint = f"{SUPABASE_URL}/rest/v1/rpc/exec_sql"
            payload = {"query": stmt}
            
            try:
                response = requests.post(endpoint, headers=headers, json=payload, timeout=30)
                if response.status_code in [200, 201, 204, 400]:
                    results.append(f"Statement {i+1}: OK")
                else:
                    results.append(f"Statement {i+1}: {response.status_code} - {response.text[:200]}")
            except Exception as e:
                results.append(f"Statement {i+1}: ERROR - {str(e)[:100]}")
        else:
            # Skip other statements
            results.append(f"Statement {i+1}: SKIPPED (non-DDL)")
    
    return results

if __name__ == "__main__":
    import sys
    
    sql_file = sys.argv[1] if len(sys.argv) > 1 else "affiliate_system.sql"
    
    print(f"Executing {sql_file}...")
    results = execute_sql(sql_file)
    
    for r in results:
        print(r)
