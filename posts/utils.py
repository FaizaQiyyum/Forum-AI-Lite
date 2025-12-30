from textblob import TextBlob
import requests

# --- FORU.MS API CONFIG ---
FORUMS_INSTANCE_ID = "6c8265fa-760a-4ffa-beb2-fadf98aab982"
FORUMS_API_KEY = "cee11105-5be3-4765-ad81-0daf4235310a"
FORUMS_API_BASE = "https://foru.ms/api/v1"

def fetch_thread_from_api(thread_id):
    """
    Fetches the *real* thread content from Foru.ms API.
    """
    headers = {
        "Authorization": f"Bearer {FORUMS_API_KEY}",
        "Content-Type": "application/json"
    }
    try:
        # Construct URL (assuming standard structure, may need adjustment based on specific endpoint)
        # Note: If thread_id in local DB is 1, it might not exist in API. 
        # This is a 'Hybrid' approach for the Hackathon demo.
        url = f"{FORUMS_API_BASE}/instances/{FORUMS_INSTANCE_ID}/threads/{thread_id}"
        response = requests.get(url, headers=headers)
        
        # Write debug log to file for user verification
        with open("api_debug_log.txt", "w") as f:
            if response.status_code == 200:
                f.write("SUCCESS: Connected to Foru.ms API (Status 200)!\n")
                f.write(f"Data: {response.text[:100]}...")
            else:
                f.write(f"FAILED: Connected to Foru.ms API but got error (Status {response.status_code}).\n")
                f.write(f"This proves connectivity works, but the content wasn't found.\nResponse: {response.text}")
                
        if response.status_code == 200:
            print("\n" + "="*50, flush=True)
            print("✅ SUCCESS: Data successfully fetched from Foru.ms API!", flush=True)
            print("="*50 + "\n", flush=True)
            data = response.json()
            # Assuming data structure has 'content' or 'posts'
            return data.get('content', '') or data.get('title', '')
        
        print(f"\n❌ API REQUEST FAILED: Status Code {response.status_code}", flush=True)
        print(f"Response: {response.text}\n", flush=True)
        return None
    except Exception as e:
        print(f"API Fetch Error: {e}", flush=True)
        return None

def generate_summary(text, thread_id=None, sentence_count=3):
    """
    A smart summarizer using TextBlob.
    Now supports HYBID mode: Tries to fetch from API if thread_id is provided.
    """
    
    # 1. Hybrid Fetch: Try to get 'real' content from API if we have an ID
    if thread_id:
        api_content = fetch_thread_from_api(thread_id)
        if api_content:
            text = api_content + "\n" + text # Combine or replace
            
    if not text:
        return "No content to summarize."
        
    blob = TextBlob(text)
    
    # 2. Extract Key Topics (Noun Phrases)
    noun_phrases = list(set(blob.noun_phrases))
    topics = ", ".join(noun_phrases[:3]).title()
    
    # 3. Key Sentiment
    polarity = blob.sentiment.polarity
    sentiment = "Unknown"
    if polarity > 0.1: sentiment = "Positive"
    elif polarity < -0.1: sentiment = "Critical"
    else: sentiment = "Neutral"

    # 4. Handle Short Text
    if len(blob.sentences) <= sentence_count:
        if not topics:
            return f"A short discussion ({sentiment}) with no clear key topics detected yet."
        return f"Key topics discussed: {topics}. The overall sentiment is {sentiment}."

    # 5. Handle Long Text (Extractive Summary)
    sentence_scores = {}
    for sent in blob.sentences:
        score = 0
        for word in sent.words:
            if word.lower() in noun_phrases:
                score += 1
        sentence_scores[str(sent)] = score
        
    sorted_sents = sorted(sentence_scores, key=sentence_scores.get, reverse=True)[:sentence_count]
    summary_sentences = [str(s) for s in blob.sentences if str(s) in sorted_sents]
    extractive_summary = " ".join(summary_sentences)
    
    return f"Key topics: {topics}. \n\nSummary: {extractive_summary}"
