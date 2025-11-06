
const API_CONFIG = {
  
    API_KEY: 'ce54f8031f66eoe3bt1a9b3dc47a23f4',
    
 
    PROVIDER: 'openai',
    
  
    ENDPOINTS: {
        openai: 'https://api.openai.com/v1/chat/completions',
        gemini: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'
    },
    
   
    MODELS: {
        openai: 'gpt-3.5-turbo',
        gemini: 'gemini-pro'
    },
    MAX_TOKENS: 200,
    TEMPERATURE: 0.9, 
    TIMEOUT: 30000
};



const PoemAPI = {
    
    /**
     * Main function to generate a unique poem via AI API
     */
    async generatePoem(topic, style) {
        // Check if API key is configured
        if (!this.isApiConfigured()) {
            throw new Error('API key not configured. Please add your API key in api.js');
        }

        try {
            // Call the AI API to generate a unique poem
            const poem = await this.callAI(topic, style);
            return poem;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    /**
     * Call the AI API (OpenAI or Google Gemini)
     */
    async callAI(topic, style) {
        const provider = API_CONFIG.PROVIDER;
        
        if (provider === 'openai') {
            return await this.callOpenAI(topic, style);
        } else if (provider === 'gemini') {
            return await this.callGemini(topic, style);
        } else {
            throw new Error(`Unsupported provider: ${provider}`);
        }
    },

    /**
     * Call OpenAI API (ChatGPT)
     */
    async callOpenAI(topic, style) {
        const prompt = this.createPrompt(topic, style);
        
        try {
            const response = await axios({
                method: 'POST',
                url: API_CONFIG.ENDPOINTS.openai,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_CONFIG.API_KEY}`
                },
                data: {
                    model: API_CONFIG.MODELS.openai,
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a creative poet. Write only the poem, nothing else. No titles, no explanations, just the 4-line poem.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    max_tokens: API_CONFIG.MAX_TOKENS,
                    temperature: API_CONFIG.TEMPERATURE
                },
                timeout: API_CONFIG.TIMEOUT
            });

            const poem = response.data.choices[0].message.content.trim();
            return this.cleanPoem(poem);
            
        } catch (error) {
            if (error.response) {
                // API returned an error
                const status = error.response.status;
                const message = error.response.data?.error?.message || 'Unknown error';
                
                if (status === 401) {
                    throw new Error('Invalid API key. Please check your API key in api.js');
                } else if (status === 429) {
                    throw new Error('Rate limit exceeded. Please wait a moment and try again.');
                } else if (status === 500) {
                    throw new Error('OpenAI server error. Please try again later.');
                } else {
                    throw new Error(`API Error: ${message}`);
                }
            } else if (error.request) {
                throw new Error('Network error. Please check your internet connection.');
            } else {
                throw new Error('Failed to generate poem. Please try again.');
            }
        }
    },

    /**
     * Call Google Gemini API
     */
    async callGemini(topic, style) {
        const prompt = this.createPrompt(topic, style);
        const url = `${API_CONFIG.ENDPOINTS.gemini}?key=${API_CONFIG.API_KEY}`;
        
        try {
            const response = await axios({
                method: 'POST',
                url: url,
                headers: {
                    'Content-Type': 'application/json'
                },
                data: {
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }],
                    generationConfig: {
                        temperature: API_CONFIG.TEMPERATURE,
                        maxOutputTokens: API_CONFIG.MAX_TOKENS
                    }
                },
                timeout: API_CONFIG.TIMEOUT
            });

            const poem = response.data.candidates[0].content.parts[0].text.trim();
            return this.cleanPoem(poem);
            
        } catch (error) {
            if (error.response) {
                const status = error.response.status;
                if (status === 400) {
                    throw new Error('Invalid API key. Please check your Gemini API key in api.js');
                } else {
                    throw new Error('Gemini API error. Please try again.');
                }
            } else {
                throw new Error('Failed to connect to Gemini. Please check your internet connection.');
            }
        }
    },

    /**
     * Create a detailed prompt for the AI
     */
    createPrompt(topic, style) {
        const styleDescriptions = {
            inspirational: 'uplifting, hopeful, and empowering',
            motivational: 'energizing, encouraging, and action-oriented',
            philosophical: 'thoughtful, deep, and contemplative',
            romantic: 'loving, tender, and heartfelt',
            funny: 'humorous, witty, and playful'
        };

        return `Write a creative and original ${style} 4-line poem about "${topic}". 
The poem should be ${styleDescriptions[style]}.
Make it unique and creative. Use vivid imagery and emotion.
Write ONLY the 4-line poem, nothing else. No title, no explanations.`;
    },

    /**
     * Clean up the poem text
     */
    cleanPoem(poem) {
        return poem
            .trim()
            .replace(/^["']|["']$/g, '') // Remove quotes
            .replace(/^Title:.*\n/gm, '') // Remove title lines
            .replace(/^\*\*.*\*\*\n/gm, '') // Remove markdown titles
            .replace(/\n{3,}/g, '\n\n') // Max 2 line breaks
            .trim();
    },

    /**
     * Check if API is configured
     */
    isApiConfigured() {
        return API_CONFIG.API_KEY && 
               API_CONFIG.API_KEY !== 'ce54f8031f66eoe3bt1a9b3dc47a23f4' && 
               API_CONFIG.API_KEY.length > 0;
    }
};

// Make available globally
window.PoemAPI = PoemAPI;
window.API_CONFIG = API_CONFIG;
