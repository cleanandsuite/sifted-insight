#!/usr/bin/env python3
"""
Auto-Video Pipeline - Generates Codie-style short videos from articles
Uses: GLM-4.7-Flash + ElevenLabs + ffmpeg
"""

import json
import os
import sys
from datetime import datetime
from pathlib import Path
import requests

# Load env
from dotenv import load_dotenv
load_dotenv()

# Paths
WORKSPACE = Path(__file__).parent.parent
ARTICLES_FILE = WORKSPACE / "scraped_articles.json"
OUTPUT_DIR = WORKSPACE / "videos"
OUTPUT_DIR.mkdir(exist_ok=True)

# GLM Config
GLM_API_URL = "https://open.bigmodel.cn/api/paas/v4/chat/completions"
GLM_MODEL = "glm-4.7-flash"  # Use Flash for cost savings

# ElevenLabs Config
ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1/text-to-speech"
ELEVENLABS_VOICE_ID = os.getenv("ELEVENLABS_VOICE_ID", "56AoDkrOh6qfVPDXZ7Pt")

def call_glm(prompt):
    """Call GLM-4.7-Flash for narrative script."""
    headers = {
        "Authorization": f"Bearer {os.getenv('GLM_API_KEY')}",
        "Content-Type": "application/json"
    }
    data = {
        "model": GLM_MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.7,
        "max_tokens": 200
    }
    response = requests.post(GLM_API_URL, headers=headers, json=data)
    return response.json()["choices"][0]["message"]["content"]

def detect_tone(title, summary):
    """Simple tone detection based on keywords."""
    text = (title + " " + summary).lower()
    
    tragic_keywords = ["death", "died", "killed", "murder", "tragedy", "disaster", "crash", "attack"]
    serious_keywords = ["crisis", "war", "conflict", "sanctions", "crisis", "emergency"]
    
    if any(kw in text for kw in tragic_keywords):
        return "respectful"
    elif any(kw in text for kw in serious_keywords):
        return "serious"
    else:
        return "witty"

def generate_script(article):
    """Generate Codie-style script using GLM."""
    tone = detect_tone(article["title"], article.get("summary", ""))
    
    tone_instructions = {
        "respectful": "Keep it dignified and informative. No humor.",
        "serious": "Professional and measured. No jokes.",
        "witty": "Conversational, a bit playful, like texting a friend."
    }
    
    prompt = f"""
You are a witty, authentic narrator like Codie Sanchez.
{tone_instructions[tone]}

Write a SHORT script (2-3 sentences max):
- Hook: "So here's the thing..."
- Context: Explain the article simply
- Insight: One interesting takeaway

Article: {article['title']}
{'Summary: ' + article.get('summary', '')[:200] if article.get('summary') else ''}

Keep it under 50 words. Conversational tone.
"""
    
    return call_glm(prompt)

def generate_audio(script, output_path, voice_id=ELEVENLABS_VOICE_ID):
    """Generate TTS audio using ElevenLabs."""
    headers = {
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": os.getenv("ELEVENLABS_API_KEY")
    }
    data = {
        "text": script,
        "model_id": "eleven_monolingual_v1",
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.75
        }
    }
    
    response = requests.post(
        f"{ELEVENLABS_API_URL}/{voice_id}",
        headers=headers,
        json=data
    )
    
    with open(output_path, "wb") as f:
        f.write(response.content)

def download_image(url, output_path):
    """Download article image or return False."""
    if not url:
        return False
    
    try:
        headers = {"User-Agent": "Mozilla/5.0"}
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code == 200:
            with open(output_path, "wb") as f:
                f.write(response.content)
            return True
    except:
        pass
    return False

def create_video(image_path, audio_path, output_path, duration=None):
    """Create video from image + audio using ffmpeg."""
    import subprocess
    
    # Get audio duration if not specified
    if not duration:
        probe = subprocess.run(
            ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", audio_path],
            capture_output=True, text=True
        )
        duration = float(probe.stdout.strip())
    
    # Build ffmpeg command
    cmd = [
        "ffmpeg", "-y",
        "-loop", "1", "-i", image_path,
        "-i", audio_path,
        "-c:v", "libx264",
        "-tune", "stillimage",
        "-c:a", "aac",
        "-b:a", "128k",
        "-pix_fmt", "yuv420p",
        "-t", str(duration),
        output_path
    ]
    
    subprocess.run(cmd, capture_output=True)

def main():
    """Main pipeline."""
    print("=" * 50)
    print("Auto-Video Pipeline")
    print("=" * 50)
    
    # Load articles
    with open(ARTICLES_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    articles = data.get("articles", [])[:3]  # Top 3
    
    print(f"Processing {len(articles)} articles...")
    
    for i, article in enumerate(articles):
        print(f"\n[{i+1}] {article['title'][:50]}...")
        
        # Generate script
        script = generate_script(article)
        print(f"  Script: {script[:80]}...")
        
        # Detect tone
        tone = detect_tone(article["title"], article.get("summary", ""))
        print(f"  Tone: {tone}")
        
        # Generate audio
        audio_path = OUTPUT_DIR / f"audio_{i+1}.mp3"
        generate_audio(script, str(audio_path))
        print(f"  Audio: {audio_path}")
        
        # Download image
        image_path = OUTPUT_DIR / f"image_{i+1}.jpg"
        if not download_image(article.get("image"), str(image_path)):
            print(f"  Warning: No image, using placeholder")
        
        # Create video
        video_path = OUTPUT_DIR / f"video_{datetime.now().strftime('%Y-%m-%d')}_{i+1}.mp4"
        create_video(str(image_path), str(audio_path), str(video_path))
        print(f"  Video: {video_path}")
    
    print("\n" + "=" * 50)
    print(f"Done! Videos saved to: {OUTPUT_DIR}")
    print("=" * 50)

if __name__ == "__main__":
    main()
