import requests
from bs4 import BeautifulSoup
import time
from typing import Optional
from .config import Config

class WebScraper:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update(Config.DEFAULT_HEADERS)
    
    def fetch_content(self, url: str) -> Optional[dict]:
        try:
            response = self.session.get(
                url, 
                timeout=Config.REQUEST_TIMEOUT
            )
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            title = self._extract_title(soup)
            
            self._remove_unwanted_elements(soup)
            
            content = self._extract_main_content(soup)
            
            cleaned_content = self._clean_text(content)
            
            if len(cleaned_content) > Config.MAX_CONTENT_LENGTH:
                cleaned_content = cleaned_content[:Config.MAX_CONTENT_LENGTH] + "..."
            
            return {
                'title': title,
                'content': cleaned_content,
                'length': len(cleaned_content),
                'url': url
            }
            
        except requests.RequestException as e:
            return {'error': f"Network error: {str(e)}"}
        except Exception as e:
            return {'error': f"Processing error: {str(e)}"}
    
    def _extract_title(self, soup: BeautifulSoup) -> str:
        title_selectors = ['h1', 'title', '.article-title', '.post-title']
        
        for selector in title_selectors:
            element = soup.select_one(selector)
            if element and element.get_text().strip():
                return element.get_text().strip()
        
        return "Article"
    
    def _remove_unwanted_elements(self, soup: BeautifulSoup) -> None:
        unwanted_tags = [
            'script', 'style', 'nav', 'header', 'footer', 
            'aside', 'advertisement', 'ads', 'comment', 'iframe'
        ]
        
        for tag in unwanted_tags:
            for element in soup.find_all(tag):
                element.decompose()
        
        unwanted_classes = [
            'advertisement', 'ads', 'sidebar', 'navigation',
            'menu', 'footer', 'header', 'social-share', 'comments'
        ]
        
        for class_name in unwanted_classes:
            for element in soup.find_all(class_=lambda x: x and class_name in str(x).lower()):
                element.decompose()
    
    def _extract_main_content(self, soup: BeautifulSoup) -> str:
        article = soup.find('article')
        if article:
            return article.get_text()
        
        main_selectors = [
            'main', '[role="main"]', '.main-content', 
            '.article-content', '.post-content', '.entry-content',
            '.story-body', '.article-body'
        ]
        
        for selector in main_selectors:
            element = soup.select_one(selector)
            if element:
                return element.get_text()
        
        content_classes = [
            'content', 'article-body', 'post-body', 
            'story-body', 'entry-text', 'text'
        ]
        
        for class_name in content_classes:
            element = soup.find(class_=lambda x: x and class_name in str(x).lower())
            if element:
                return element.get_text()
        
        body = soup.find('body')
        return body.get_text() if body else soup.get_text()
    
    def _clean_text(self, text: str) -> str:
        lines = (line.strip() for line in text.splitlines())
        
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        
        cleaned = ' '.join(chunk for chunk in chunks if chunk)
        
        return cleaned