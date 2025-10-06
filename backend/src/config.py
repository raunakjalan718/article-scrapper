import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
    
    REQUEST_TIMEOUT = 30
    MAX_RETRIES = 3
    
    MAX_CONTENT_LENGTH = 100000
    
    DEFAULT_HEADERS = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    GEMINI_MODEL = 'gemini-2.5-pro'
    
    FLASK_HOST = '0.0.0.0'
    FLASK_PORT = 5000
    FLASK_DEBUG = True
    
    EXTRACTION_PROMPTS = {
        "summary": """
        Analyze this article and provide a comprehensive yet concise summary. Focus on:
        1. **Main Topic**: What is this article primarily about?
        2. **Key Insights**: What are the most important findings or points?
        3. **Supporting Evidence**: Key facts, statistics, or examples
        4. **Implications**: What does this mean or why does it matter?
        
        Make it informative but easy to understand. Article content:
        """,
        
        "key_points": """
        Extract the most important points from this article as a well-organized bulleted list. 
        Focus on actionable insights, key facts, and main arguments. Format as:
        
        • **Point 1**: Brief explanation
        • **Point 2**: Brief explanation
        
        Article content:
        """,
        
        "structured": """
        Extract and organize the important information from this article using this structure:
        
        ## 📋 Article Summary
        **Topic**: [Main subject]
        **Key Thesis**: [Main argument or point]
        
        ## 🎯 Main Points
        - [Point 1]
        - [Point 2]
        - [Point 3]
        
        ## 📊 Key Facts & Data
        - [Important statistics or facts]
        
        ## 💡 Key Takeaways
        - [What readers should remember]
        
        ## 🔗 Important Context
        - [Background information or implications]
        
        Article content:
        """,
        
        "entities": """
        Extract and categorize important entities and information from this article:
        
        ## 👥 People & Roles
        - [Names and their roles/significance]
        
        ## 🏢 Organizations & Companies
        - [Companies, institutions, groups mentioned]
        
        ## 📍 Locations
        - [Places, countries, cities mentioned]
        
        ## 📅 Important Dates & Timeline
        - [Key dates and time periods]
        
        ## 📈 Numbers & Statistics
        - [Important figures, percentages, measurements]
        
        ## 🏷️ Topics & Keywords
        - [Main subjects and themes discussed]
        
        Article content:
        """
    }