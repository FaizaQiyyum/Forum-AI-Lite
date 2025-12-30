import requests
import os

# ⚠️ REPLACE THIS WITH YOUR REAL API KEY FROM FORU.MS DASHBOARD
FORUMS_API_KEY = "YOUR_API_KEY_HERE"  
FORUMS_API_BASE = "https://api.foru.ms/v1" # Verify this endpoint in their docs

def get_thread_from_api(thread_id):
    """
    Fetches a thread's content from the real Foru.ms API.
    """
    if FORUMS_API_KEY == "YOUR_API_KEY_HERE":
        return None # API Key not set yet

    headers = {
        "Authorization": f"Bearer {FORUMS_API_KEY}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.get(f"{FORUMS_API_BASE}/threads/{thread_id}", headers=headers)
        if response.status_code == 200:
            return response.json()
        return None
    except Exception as e:
        print(f"Error fetching from API: {e}")
        return None

def generate_summary(text):
    """
    Generates a summary. 
    Ideally, we would ALSO call an AI API here (like OpenAI), 
    but for now we will keep the text processing local 
    so we don't need a SECOND api key.
    """
    if not text:
        return ""
    
    # 1. Truncate text logic
    words = text.split()
    if len(words) < 20:
        return text 
    
    # 2. Extract key sentences
    sentences = text.replace('!', '.').replace('?', '.').split('.')
    sentences = [s.strip() for s in sentences if s.strip()]
    
    if not sentences:
        return text[:100] + "..."

    # Take first and last sentence
    summary_parts = [sentences[0]]
    if len(sentences) > 1:
        summary_parts.append(sentences[-1])
        
    final_summary = "TL;DR: " + ". ".join(summary_parts) + "."
    return final_summary

