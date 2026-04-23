# Forum Intelligence Layer 🧠

> **AI-Powered Discussion Summarizer for Foru.ms**  
> Built for the [Foru.ms x v0 by Vercel Hackathon](https://foru-ms-x-v0-by-vercel.devpost.com/) - **AI & Intelligence Track**

An intelligent dashboard that automatically summarizes forum threads and analyzes sentiment using the Foru.ms API + local NLP.

![Track](https://img.shields.io/badge/Track-AI%20%26%20Intelligence-blue)
![Python](https://img.shields.io/badge/Python-3.11-green)
![Django](https://img.shields.io/badge/Django-5.2-darkgreen)
![React](https://img.shields.io/badge/React-18-blue)

---

## 🎯 What It Does

- **Auto-Summarization**: Click a button to generate TL;DR summaries of long discussions
- **Sentiment Analysis**: Each post gets a sentiment badge (Positive/Neutral/Critical)
- **Topic Extraction**: Automatically identifies key topics using NLP
- **Foru.ms API Integration**: Fetches live data from your Foru.ms instance
- **Hybrid Architecture**: Falls back to local processing if API is unavailable
- **Privacy-First**: All NLP runs locally - no data sent to external AI services

---

## 🏆 Hackathon Track: AI & Intelligence

This project demonstrates:
- ✅ **Foru.ms API Integration** (required)
- ✅ **LLM/NLP Features** (TextBlob for summarization + sentiment)
- ✅ **Real-World Impact** (helps community managers save time)
- ✅ **Innovation** (hybrid API + local processing)

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/forum-intelligence-layer.git
   cd forum-intelligence-layer
   ```

2. **Set up Python virtual environment**
   ```bash
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   
   # Mac/Linux
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install django djangorestframework django-cors-headers textblob requests
   ```

4. **Run database migrations**
   ```bash
   python manage.py migrate
   ```

5. **Start the servers**

   **Terminal 1** (Backend):
   ```bash
   python manage.py runserver
   ```

   **Terminal 2** (Frontend):
   ```bash
   cd client
   python -m http.server
   ```

6. **Open your browser**
   

---

## 🎨 Features

### 1. Three-Column Dashboard
- **Left**: Thread list with search
- **Center**: Conversation view with sentiment badges
- **Right**: AI Analysis sidebar

### 2. AI Summarization
- Click "Refresh Analysis ↻" on any thread
- Generates extractive summary using TextBlob
- Identifies key topics and overall sentiment

### 3. Sentiment Analysis
- Each post automatically tagged (Positive/Neutral/Critical)
- Uses TextBlob's polarity scoring
- Helps moderators spot toxic content quickly

### 4. Foru.ms API Integration
- Fetches thread data from live Foru.ms instance
- Hybrid fallback to local data if API unavailable
- See `posts/utils.py` for implementation

---

## 🛠️ Tech Stack

- **Backend**: Django 5.2 + Django REST Framework
- **Frontend**: React 18 + Tailwind CSS
- **Database**: SQLite (local development)
- **NLP**: TextBlob (sentiment + summarization)
- **API**: Foru.ms REST API
- **HTTP Client**: Python Requests

---

## 📁 Project Structure

```
forum-intelligence-layer/
├── client/                 # React frontend
│   ├── index.html
│   └── app.jsx
├── posts/                  # Django app
│   ├── models.py          # Thread & Post models
│   ├── views.py           # API endpoints
│   ├── utils.py           # NLP logic
│   └── services.py        # Foru.ms API integration
├── forum_project/         # Django settings
├── db.sqlite3            # Local database
├── manage.py
├── populate_demo.py      # Demo data generator
└── README.md
```

---

## 🔑 Foru.ms API Setup

1. Create a Foru.ms instance at [foru.ms](https://foru.ms)
2. Get your API Key and Instance ID from the dashboard
3. Update `posts/utils.py`:
   ```python
   FORUMS_INSTANCE_ID = "your-instance-id"
   FORUMS_API_KEY = "your-api-key"
   ```

---

## 🎬 Demo

### Generate Demo Data
```bash
python populate_demo.py
```
This creates 3 sample threads with realistic discussions.

### Test AI Summarization
1. Click any thread in the sidebar
2. Click "Refresh Analysis ↻" in the AI sidebar
3. Watch the summary appear!

---


---

## 🧪 How It Works

### Summarization Pipeline
1. User clicks "Refresh Analysis"
2. Backend fetches thread from Foru.ms API (or local DB)
3. TextBlob extracts noun phrases and scores sentences
4. Top sentences selected based on topic relevance
5. Summary returned to frontend with topic badges

### Sentiment Analysis
1. Each post analyzed on creation
2. TextBlob calculates polarity (-1 to +1)
3. Categorized: Positive (>0.1), Critical (<-0.1), Neutral (else)
4. Badge displayed in UI

---

## 🙏 Acknowledgments

- **Foru.ms** for the headless forum API
- **v0 by Vercel** for UI inspiration
- **TextBlob** for making NLP accessible

---

## 👨‍💻 Author

Built for the Foru.ms x v0 Hackathon 
**⭐ If you found this helpful, star the repo!**
