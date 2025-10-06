from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from src.extractor import ArticleExtractor
from src.config import Config

app = Flask(__name__)
CORS(app)

try:
    extractor = ArticleExtractor()
except ValueError as e:
    print(f"Configuration error: {e}")
    extractor = None

@app.route('/')
def health_check():
    return jsonify({
        'status': 'healthy',
        'model': Config.GEMINI_MODEL,
        'api_configured': extractor is not None
    })

@app.route('/extract', methods=['POST'])
def extract_article():
    if not extractor:
        return jsonify({
            'success': False,
            'error': 'Gemini API not configured. Please set GEMINI_API_KEY environment variable.'
        }), 500
    
    data = request.get_json()
    
    if not data or 'url' not in data:
        return jsonify({
            'success': False,
            'error': 'URL is required'
        }), 400
    
    url = data['url']
    extraction_type = data.get('extraction_type', 'summary')
    
    valid_types = ['summary', 'key_points', 'structured', 'entities']
    if extraction_type not in valid_types:
        return jsonify({
            'success': False,
            'error': f'Invalid extraction type. Must be one of: {valid_types}'
        }), 400
    
    try:
        result = extractor.extract_from_url(url, extraction_type)
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Extraction failed: {str(e)}'
        }), 500

@app.route('/extraction-types', methods=['GET'])
def get_extraction_types():
    return jsonify({
        'types': [
            {
                'id': 'summary',
                'name': 'Summary',
                'description': 'Comprehensive summary with key insights'
            },
            {
                'id': 'key_points',
                'name': 'Key Points',
                'description': 'Bulleted list of important points'
            },
            {
                'id': 'structured',
                'name': 'Structured',
                'description': 'Organized format with sections'
            },
            {
                'id': 'entities',
                'name': 'Entities',
                'description': 'Extract people, organizations, dates, etc.'
            }
        ]
    })

if __name__ == '__main__':
    app.run(
        host=Config.FLASK_HOST,
        port=Config.FLASK_PORT,
        debug=Config.FLASK_DEBUG
    )