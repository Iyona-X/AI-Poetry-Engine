
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const form = document.getElementById('poemForm');
    const topicInput = document.getElementById('topic');
    const submitBtn = document.getElementById('submitBtn');
    const poemOutput = document.getElementById('poemOutput');
    const poemText = document.getElementById('poemText');
    const copyBtn = document.getElementById('copyBtn');
    const styleButtons = document.querySelectorAll('.style-tag');
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');

    let currentStyle = 'inspirational';

    // Check API configuration on load
    checkApiStatus();

    function checkApiStatus() {
        if (!PoemAPI.isApiConfigured()) {
            showError('⚠️ API Key not configured. Please add your API key in api.js file to generate poems.');
            console.error('API Configuration needed in api.js');
        } else {
            console.log('✅ API configured successfully');
        }
    }

    
    styleButtons.forEach(button => {
        button.addEventListener('click', function() {
            styleButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            currentStyle = this.getAttribute('data-style');
            
            
            poemOutput.classList.add('hidden');
            hideError();
        });
    });


    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const topic = topicInput.value.trim();


        if (!topic) {
            showError('Please enter a topic for your poem!');
            return;
        }

        if (topic.length < 2) {
            showError('Please enter a longer topic (at least 2 characters)');
            return;
        }


        if (!PoemAPI.isApiConfigured()) {
            showError('API key is not configured. Please add your API key in the api.js file.');
            return;
        }

        
        setLoadingState(true);
        hideError();
        poemOutput.classList.add('hidden');

        try {
    
            const generatedPoem = await PoemAPI.generatePoem(topic, currentStyle);

            if (!generatedPoem || generatedPoem.trim().length === 0) {
                throw new Error('Empty response from API');
            }

            
            displayPoem(generatedPoem);
            
        } catch (error) {
            console.error('Generation Error:', error);
            
            
            let errorMsg = 'Error: ';
            
            if (error.message.includes('API key')) {
                errorMsg += 'Invalid API key. Please check your api.js configuration.';
            } else if (error.message.includes('Rate limit')) {
                errorMsg += 'Too many requests. Please wait a moment and try again.';
            } else if (error.message.includes('Network')) {
                errorMsg += 'Network error. Please check your internet connection.';
            } else if (error.message.includes('API key not configured')) {
                errorMsg += error.message;
            } else {
                errorMsg += error.message || 'Something went wrong. Please try again.';
            }
            
            showError(errorMsg);
            
        } finally {
            setLoadingState(false);
        }
    });

    
    copyBtn.addEventListener('click', function() {
        const text = poemText.textContent;
        
        navigator.clipboard.writeText(text).then(() => {
            copyBtn.textContent = 'Copied!';
            copyBtn.classList.add('copied');
            
            setTimeout(() => {
                copyBtn.textContent = 'Copy to clipboard';
                copyBtn.classList.remove('copied');
            }, 2000);
        }).catch(err => {
            console.error('Copy failed:', err);
            showError('Failed to copy. Please select and copy manually.');
        });
    });

    // Loading state
    function setLoadingState(isLoading) {
        if (isLoading) {
            submitBtn.disabled = true;
            submitBtn.classList.add('loading');
            submitBtn.textContent = 'Generating';
            topicInput.disabled = true;
            styleButtons.forEach(btn => btn.disabled = true);
        } else {
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
            submitBtn.textContent = 'Submit';
            topicInput.disabled = false;
            styleButtons.forEach(btn => btn.disabled = false);
        }
    }

    // Display poem
    function displayPoem(poem) {
        poemText.innerHTML = `<p>${poem}</p>`;
        poemOutput.classList.remove('hidden');
        
        setTimeout(() => {
            poemOutput.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    }

    
    function showError(message) {
        errorText.textContent = message;
        errorMessage.classList.remove('hidden');
    }

    
    function hideError() {
        errorMessage.classList.add('hidden');
    }

    
    topicInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            form.dispatchEvent(new Event('submit'));
        }
    });

   
    topicInput.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            topicInput.value = '';
            poemOutput.classList.add('hidden');
            hideError();
        }
    });
});