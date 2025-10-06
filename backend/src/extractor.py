import google.generativeai as genai
from typing import Optional, Dict, Any
from .config import Config
from .scraper import WebScraper

class ArticleExtractor:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or Config.GEMINI_API_KEY
        if not self.api_key:
            raise ValueError("Gemini API key is required. Set GEMINI_API_KEY environment variable or pass it directly.")
        
        genai.configure(api_key=self.api_key)
        
        self.model = genai.GenerativeModel(
            Config.GEMINI_MODEL,
            generation_config=genai.types.GenerationConfig(
                temperature=0.1,
                top_p=0.8,
                top_k=40,
                max_output_tokens=4096,
            )
        )
        
        self.scraper = WebScraper()
    
    def extract_from_url(self, url: str, extraction_type: str = "summary") -> Dict[str, Any]:
        content_result = self.scraper.fetch_content(url)
        
        if 'error' in content_result:
            return {
                'success': False,
                'error': content_result['error'],
                'url': url
            }
        
        extracted_text = self.extract_from_content(
            content_result['content'], 
            extraction_type,
            title=content_result['title']
        )
        
        if extracted_text:
            return {
                'success': True,
                'url': url,
                'title': content_result['title'],
                'extraction_type': extraction_type,
                'content_length': content_result['length'],
                'extracted_text': extracted_text
            }
        
        return {
            'success': False,
            'error': 'Failed to extract content with Gemini 2.5 Pro',
            'url': url
        }
    
    def extract_from_content(self, content: str, extraction_type: str = "summary", title: str = "") -> Optional[str]:
        if extraction_type not in Config.EXTRACTION_PROMPTS:
            raise ValueError(f"Invalid extraction type. Choose from: {list(Config.EXTRACTION_PROMPTS.keys())}")
        
        context = f"Article Title: {title}\n\n" if title else ""
        prompt = Config.EXTRACTION_PROMPTS[extraction_type] + context + content
        
        try:
            response = self.model.generate_content(prompt)
            return response.text
            
        except Exception as e:
            print(f"Error with Gemini 2.5 Pro API: {e}")
            return None