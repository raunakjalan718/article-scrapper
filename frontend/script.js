class ArticleExtractor {
    constructor() {
        this.apiUrl = 'http://localhost:5000';
        this.initializeElements();
        this.bindEvents();
        this.currentResult = null;
        this.currentSelection = 'summary';
    }

    initializeElements() {
        this.dropdownButton = document.getElementById('dropdownButton');
        this.dropdownMenu = document.getElementById('dropdownMenu');
        this.dropdownIcon = document.getElementById('dropdownIcon');
        this.selectedOption = document.getElementById('selectedOption');
        this.extractButton = document.getElementById('extractButton');
        this.loadingState = document.getElementById('loadingState');
        this.errorState = document.getElementById('errorState');
        this.errorMessage = document.getElementById('errorMessage');
        this.resultsSection = document.getElementById('resultsSection');
        this.articleUrl = document.getElementById('articleUrl');
        this.resultIcon = document.getElementById('resultIcon');
        this.resultTitle = document.getElementById('resultTitle');
        this.resultContent = document.getElementById('resultContent');
        this.copyBtn = document.getElementById('copyBtn');
        this.downloadBtn = document.getElementById('downloadBtn');
    }

    bindEvents() {
        this.dropdownButton.addEventListener('click', () => this.toggleDropdown());
        
        document.addEventListener('click', (e) => {
            if (!this.dropdownButton.contains(e.target) && !this.dropdownMenu.contains(e.target)) {
                this.closeDropdown();
            }
        });

        document.querySelectorAll('.dropdown-option').forEach(option => {
            option.addEventListener('click', (e) => this.selectOption(e));
        });

        this.extractButton.addEventListener('click', () => this.extractArticle());
        this.articleUrl.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.extractArticle();
        });
        this.copyBtn.addEventListener('click', () => this.copyResults());
        this.downloadBtn.addEventListener('click', () => this.downloadResults());
        this.articleUrl.addEventListener('input', () => this.hideAllSections());
    }

    toggleDropdown() {
        this.dropdownMenu.classList.toggle('hidden');
        this.dropdownIcon.classList.toggle('dropdown-open');
    }

    closeDropdown() {
        this.dropdownMenu.classList.add('hidden');
        this.dropdownIcon.classList.remove('dropdown-open');
    }

    selectOption(e) {
        const value = e.target.getAttribute('data-value');
        const text = e.target.textContent;
        this.currentSelection = value;
        this.selectedOption.textContent = text;
        this.closeDropdown();
    }

    async extractArticle() {
        const url = this.articleUrl.value.trim();
        
        if (!url) {
            this.showError('Please enter an article URL');
            return;
        }

        if (!this.isValidUrl(url)) {
            this.showError('Please enter a valid URL');
            return;
        }

        this.showLoading();
        this.extractButton.disabled = true;
        this.extractButton.textContent = 'Analyzing...';

        try {
            const response = await fetch(`${this.apiUrl}/extract`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    url: url,
                    extraction_type: this.currentSelection
                })
            });

            const result = await response.json();

            if (result.success) {
                this.displayResults(result);
            } else {
                this.showError(result.error || 'Failed to extract article content');
            }

        } catch (error) {
            this.showError('Connection error. Make sure the backend server is running.');
        } finally {
            this.extractButton.disabled = false;
            this.extractButton.textContent = '✨ Extract Analysis';
        }
    }

    isValidUrl(string) {
        try {
            new URL(string);
            return string.startsWith('http://') || string.startsWith('https://');
        } catch (_) {
            return false;
        }
    }

    showLoading() {
        this.hideAllSections();
        this.loadingState.classList.remove('hidden');
    }

    showError(message) {
        this.hideAllSections();
        this.errorMessage.textContent = message;
        this.errorState.classList.remove('hidden');
    }

    displayResults(result) {
        this.hideAllSections();
        this.currentResult = result;
        
        const icons = {
            'summary': '📋',
            'key_points': '🎯',
            'structured': '📊',
            'entities': '🏷️'
        };
        
        const titles = {
            'summary': 'Summary',
            'key_points': 'Key Points',
            'structured': 'Structured',
            'entities': 'Entities'
        };

        this.resultIcon.textContent = icons[result.extraction_type] || '📋';
        this.resultTitle.textContent = titles[result.extraction_type] || 'Results';
        this.resultContent.innerHTML = this.formatContent(result.extracted_text, result.extraction_type);

        this.resultsSection.classList.remove('hidden');
        this.resultsSection.classList.add('fade-in');
        this.resultsSection.scrollIntoView({ behavior: 'smooth' });
    }

    formatContent(content, type) {
        if (type === 'key_points') {
            return this.formatKeyPoints(content);
        } else if (type === 'structured') {
            return this.formatStructured(content);
        } else if (type === 'entities') {
            return this.formatEntities(content);
        } else {
            return this.formatSummary(content);
        }
    }

    formatSummary(content) {
        return content
            .replace(/\n\n/g, '</p><p class="mb-4">')
            .replace(/^(.)/gm, '<p class="mb-4">$1')
            .replace(/(.)$/gm, '$1</p>');
    }

    formatKeyPoints(content) {
        const lines = content.split('\n').filter(line => line.trim());
        let html = '<ul class="space-y-3">';
        
        lines.forEach(line => {
            if (line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*')) {
                const cleanLine = line.replace(/^[•\-*]\s*/, '');
                html += `
                    <li class="flex items-start">
                        <span class="text-olive-600 mr-3 mt-1">•</span>
                        <span>${cleanLine}</span>
                    </li>
                `;
            }
        });
        
        html += '</ul>';
        return html;
    }

    formatStructured(content) {
        const sections = content.split(/(?=##|\*\*)/);
        let html = '<div class="space-y-6">';
        
        sections.forEach((section, index) => {
            if (section.trim()) {
                const borderColors = ['border-olive-500', 'border-olive-600', 'border-olive-700', 'border-olive-800'];
                const borderColor = borderColors[index % borderColors.length];
                
                const lines = section.trim().split('\n');
                const title = lines[0].replace(/^##\s*|\*\*|\*\*/g, '');
                const content = lines.slice(1).join(' ').trim();
                
                html += `
                    <div class="border-l-4 ${borderColor} pl-4 bg-olive-50 rounded-r-lg py-3">
                        <h3 class="font-bold text-lg text-gray-800 mb-2">${title}</h3>
                        <p class="text-gray-700">${content}</p>
                    </div>
                `;
            }
        });
        
        html += '</div>';
        return html;
    }

    formatEntities(content) {
        const sections = content.split(/(?=##|\*\*)/);
        let html = '<div class="grid grid-cols-1 md:grid-cols-2 gap-6">';
        
        sections.forEach((section, index) => {
            if (section.trim()) {
                const lines = section.trim().split('\n');
                const title = lines[0].replace(/^##\s*|\*\*|\*\*/g, '');
                const items = lines.slice(1).filter(line => line.trim());
                
                const colors = ['bg-olive-100 text-olive-800', 'bg-olive-200 text-olive-900', 'bg-olive-300 text-olive-900', 'bg-olive-400 text-white'];
                const colorClass = colors[index % colors.length];
                
                html += `
                    <div>
                        <h3 class="font-bold text-lg text-gray-800 mb-3">${title}</h3>
                        <div class="flex flex-wrap gap-2">
                `;
                
                items.forEach(item => {
                    const cleanItem = item.replace(/^[•\-*]\s*/, '');
                    if (cleanItem.trim()) {
                        html += `<span class="px-3 py-1 ${colorClass} rounded-full text-sm shadow-sm">${cleanItem}</span>`;
                    }
                });
                
                html += '</div></div>';
            }
        });
        
        html += '</div>';
        return html;
    }

    hideAllSections() {
        this.resultsSection.classList.add('hidden');
        this.loadingState.classList.add('hidden');
        this.errorState.classList.add('hidden');
        [this.resultsSection, this.loadingState, this.errorState].forEach(el => {
            el.classList.remove('fade-in');
        });
    }

    async copyResults() {
        if (!this.currentResult) return;
        
        const textToCopy = `${this.currentResult.title || 'Article'}\n${this.currentResult.url}\n\n${this.currentResult.extracted_text}`;
        
        try {
            await navigator.clipboard.writeText(textToCopy);
            this.showSuccess(this.copyBtn, 'Copied!');
        } catch (error) {
            this.fallbackCopy(textToCopy);
        }
    }

    fallbackCopy(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        this.showSuccess(this.copyBtn, 'Copied!');
    }

    downloadResults() {
        if (!this.currentResult) return;
        
        const content = `${this.currentResult.title || 'Article'}\n${this.currentResult.url}\n\nExtraction Type: ${this.currentResult.extraction_type}\nProcessed by: Gemini 2.5 Pro\nDate: ${new Date().toLocaleString()}\n\n${'='.repeat(60)}\n\n${this.currentResult.extracted_text}`;
        
        const blob = new Blob([content], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        a.href = url;
        a.download = `article-extraction-${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        this.showSuccess(this.downloadBtn, 'Downloaded!');
    }

    showSuccess(button, message) {
        const originalText = button.textContent;
        button.textContent = message;
        button.style.background = '#27ae60';
        button.style.color = 'white';
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '';
            button.style.color = '';
        }, 2000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ArticleExtractor();
});
