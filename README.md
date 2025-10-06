# Article Extractor

Extract important information from any article using AI-powered analysis with Google's Gemini 2.5 Pro.

## What it does

This application takes any article URL and extracts key information in different formats:
- **Summary**: Main points and insights  
- **Key Points**: Important highlights as bullet points  
- **Structured**: Organized sections with clear formatting  
- **Entities**: People, organizations, dates, and locations mentioned  

## Requirements

- Python 3.8+  
- Google Gemini API key  
- Web browser  

## Setup

1. **Clone the project**
   ```bash
   git clone <repository-url>
   cd article-extractor
   ```

2. **Install dependencies**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. **Get API key**
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)  
   - Create a new API key  
   - Copy the key  

4. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your API key:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

## Running the application

1. **Start backend server**
   ```bash
   cd backend
   python app.py
   ```

2. **Start frontend** (in new terminal)
   ```bash
   cd frontend
   python -m http.server 8000
   ```

3. **Open in browser**
   Go to `http://localhost:8000`

## How to use

1. Paste an article URL in the input field  
2. Choose extraction type from dropdown  
3. Click **"Extract Analysis"**  
4. View results and copy or download them  

## Project structure

```
article-extractor/
├── backend/
│   ├── src/
│   │   ├── config.py      # Settings and prompts
│   │   ├── extractor.py   # Main AI logic
│   │   └── scraper.py     # Web scraping
│   ├── app.py             # Flask server
│   └── requirements.txt   # Python packages
├── frontend/
│   ├── index.html         # Web interface
│   └── script.js          # Frontend logic
└── .env.example           # Environment template
```

## Troubleshooting

- **Server won't start**: Check if port 5000 is free  
- **API errors**: Verify your Gemini API key is correct  
- **No results**: Make sure the URL is accessible and contains article content  

## Technology used

- **Backend**: Python, Flask, Gemini 2.5 Pro API  
- **Frontend**: HTML, JavaScript, Tailwind CSS  
- **AI**: Google Gemini 2.5 Pro for text analysis  