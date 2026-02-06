#!/usr/bin/env python3
"""
YouTube Auto-Uploader for THE DAILY 3
"""

import os
import json
from pathlib import Path
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

# Paths
WORKSPACE = Path(__file__).parent.parent
ENV_FILE = WORKSPACE / ".env"
TOKEN_FILE = WORKSPACE / "youtube_token.json"
CLIENT_SECRETS = WORKSPACE / "youtube_client_secrets.json"

# YouTube API scopes
SCOPES = ["https://www.googleapis.com/auth/youtube.upload"]

def get_client_secrets():
    """Get YouTube client secrets from .env."""
    secrets = {}
    with open(ENV_FILE, "r") as f:
        for line in f:
            if line.startswith("YOUTUBE_"):
                key, value = line.split("=", 1)
                secrets[key] = value.strip()
    return secrets

def create_client_secrets_file():
    """Create client_secrets.json from .env."""
    secrets = get_client_secrets()
    
    client_config = {
        "web": {
            "client_id": secrets.get("YOUTUBE_CLIENT_ID", ""),
            "project_id": "sifted-insight",
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
            "client_secret": secrets.get("YOUTUBE_CLIENT_SECRET", ""),
            "redirect_uris": ["http://localhost:8080/oauth2callback"]
        }
    }
    
    with open(CLIENT_SECRETS, "w") as f:
        json.dump(client_config, f, indent=2)
    
    return CLIENT_SECRETS

def get_authenticated_service():
    """Get authenticated YouTube service."""
    creds = None
    
    # Load existing credentials
    if TOKEN_FILE.exists():
        creds = Credentials.from_authorized_user_file(str(TOKEN_FILE), SCOPES)
    
    # If no valid credentials, authenticate
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            client_secrets = create_client_secrets_file()
            flow = InstalledAppFlow.from_client_secrets_file(str(client_secrets), SCOPES)
            creds = flow.run_local_server(port=8080)
        
        # Save credentials for next run
        with open(TOKEN_FILE, "w") as f:
            f.write(creds.to_json())
    
    return build("youtube", "v3", credentials=creds)

def upload_video(video_path, title, description, tags=None, category_id="22", privacy_status="public"):
    """Upload video to YouTube."""
    youtube = get_authenticated_service()
    
    tags = tags or []
    
    request_body = {
        "snippet": {
            "title": title,
            "description": description,
            "tags": tags,
            "categoryId": category_id
        },
        "status": {
            "privacyStatus": privacy_status,
            "selfDeclaredMadeForKids": False,
        },
        "recordingDetails": {
            "recordingDate": os.path.getmtime(video_path)
        }
    }
    
    media = MediaFileUpload(video_path, chunksize=-1, resumable=True)
    
    request = youtube.videos().insert(
        part="snippet,status",
        body=request_body,
        media_body=media
    )
    
    response = request.execute()
    
    return response

def upload_daily3(video_path=None):
    """Upload THE DAILY 3 video."""
    if video_path is None:
        video_path = WORKSPACE / "videos" / f"the_daily_3_{os.date.today()}.mp4"
    
    if not Path(video_path).exists():
        print(f"Video not found: {video_path}")
        return None
    
    date_str = os.date.today().strftime("%B %d, %Y")
    
    title = f"THE DAILY 3 - {date_str}"
    description = f"""Your daily news update for {date_str}.

3 stories you need to know, delivered in under 60 seconds.

Follow for tomorrow's update!

#thedaily3 #news #dailybrief"""
    
    tags = ["news", "daily news", "the daily 3", "news update", "briefing"]
    
    print(f"Uploading: {title}")
    response = upload_video(str(video_path), title, description, tags)
    
    if response:
        print(f"Upload successful! Video ID: {response['id']}")
        print(f"URL: https://www.youtube.com/watch?v={response['id']}")
    
    return response

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        video_path = sys.argv[1]
        upload_daily3(video_path)
    else:
        upload_daily3()
