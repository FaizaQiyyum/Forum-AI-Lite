
import requests
import time
import sys

API_BASE = "http://127.0.0.1:8000/api"

DEMO_DATA = [
    {
        "title": "The Future of AI in Education",
        "posts": [
            {"author": "Sarah Chen", "content": "I honestly think AI is going to revolutionize how we learn. Imagine a personalized tutor for every student?"},
            {"author": "Mark D.", "content": "I'm skeptical. It might just make students lazy and dependent on tools instead of thinking critically."},
            {"author": "Prof. Miller", "content": "We are already seeing this. Students submit essays they clearly didn't write. We need new assessment methods immediately."},
            {"author": "Student_01", "content": "But it helps me understand complex topics! It explains things better than my textbook."},
            {"author": "TechOptimist", "content": "Exactly. It's a tool like a calculator. We just need to learn how to use it responsibly."}
        ]
    },
    {
        "title": "React vs Vue in 2025",
        "posts": [
            {"author": "FrontendDev", "content": "Is it just me or is React getting too complex with Server Components? Vue feels so much simpler now."},
            {"author": "ReactFanboi", "content": "React is standard for a reason. The ecosystem is huge. You can't beat that for employability."},
            {"author": "VueLover", "content": "Vue's Composition API is literally the best of both worlds. Clean and powerful."},
            {"author": "AngularOldie", "content": "Meanwhile I'm still maintaining an Angular 1.x app... send help."},
            {"author": "JQuery4Life", "content": "$('#app').hide(); // Just kidding, but simplicity was nice."}
        ]
    },
    {
        "title": "Global Warming Solutions: Nuclear?",
        "posts": [
            {"author": "EcoWarrior", "content": "We need to stop burning coal yesterday. Solar and Wind are the only way forward."},
            {"author": "PhysicsGrad", "content": "Solar isn't reliable enough yet. Nuclear base load is statistically the safest and cleanest option we have."},
            {"author": "GreenPeace_Fan", "content": "Nuclear waste is a problem we still haven't solved though. It's too risky."},
            {"author": "Realist", "content": "If we want to decarbonize fast, we can't be picky. We need a mix of everything, including Nuclear."},
            {"author": "FutureThinker", "content": "Fusion is the dream. Hopefully we get there before it's too late."}
        ]
    }
]

def create_thread(data):
    print(f"Creating Thread: {data['title']}...")
    try:
        # 1. Create Thread
        res = requests.post(f"{API_BASE}/threads/", json={"title": data['title']})
        if res.status_code != 201:
            print(f"Failed to create thread: {res.text}")
            return
        
        thread_id = res.json()['id']
        
        # 2. Add Posts
        for post in data['posts']:
            time.sleep(0.2) # Small delay for realism in timestamps
            p_res = requests.post(
                f"{API_BASE}/threads/{thread_id}/posts/", 
                json={"content": post['content'], "author_name": post['author']}
            )
            if p_res.status_code == 201:
                print(f"  -> Posted reply by {post['author']}")
            else:
                print(f"  -> Failed to post reply: {p_res.text}")
                
        print(f"Done! Thread ID: {thread_id}\n")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    print("--- Starting Demo Data Injection ---")
    
    # Check if server is up
    try:
        requests.get(f"{API_BASE}/threads/")
    except:
        print("❌ Error: Server does not seem to be running at http://127.0.0.1:8000")
        print("Please run 'python manage.py runserver' first.")
        sys.exit(1)

    for thread in DEMO_DATA:
        create_thread(thread)

    print("--- Injection Complete! Refresh your browser. ---")
