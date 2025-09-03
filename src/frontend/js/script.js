class AugenApp {
    constructor() {
        this.lastTap = 0;
        this.tapTimeout = null;
        this.morseEnabled = localStorage.getItem('morse-enabled') === 'true';
        this.hapticEnabled = localStorage.getItem('haptic-enabled') !== 'false'; // Default true
        // Use deployed worker URL for now, later switch to custom domain
        this.apiBaseUrl = 'https://augen-api.ignacioeloyola.workers.dev/api';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadSettings();
        this.checkApiHealth();
    }

    setupEventListeners() {
        const cameraBtn = document.getElementById('camera-btn');
        const fileInput = document.getElementById('file-input');
        const settingsBtn = document.getElementById('settings-btn');
        const settingsPanel = document.getElementById('settings-panel');
        const morseToggle = document.getElementById('morse-toggle');
        const hapticToggle = document.getElementById('haptic-toggle');

        // Enhanced button interaction with double-tap detection
        cameraBtn.addEventListener('click', (e) => this.handleButtonClick(e));
        cameraBtn.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
        
        // Keyboard accessibility
        cameraBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.takePicture(false); // Default to summary for keyboard
            }
        });
        
        // Settings panel
        settingsBtn.addEventListener('click', () => {
            settingsPanel.style.display = settingsPanel.style.display === 'none' ? 'block' : 'none';
        });
        
        // Settings toggles
        morseToggle.addEventListener('change', (e) => {
            this.morseEnabled = e.target.checked;
            localStorage.setItem('morse-enabled', this.morseEnabled);
        });
        
        hapticToggle.addEventListener('change', (e) => {
            this.hapticEnabled = e.target.checked;
            localStorage.setItem('haptic-enabled', this.hapticEnabled);
        });
        
        fileInput.addEventListener('change', (e) => this.handleImageUpload(e));
        
        // Announce app ready for screen readers
        this.announceToScreenReader('Augen vision assistant ready. Single tap for summary, double tap for full description.');
    }

    handleButtonClick(e) {
        const now = Date.now();
        const timeDiff = now - this.lastTap;
        
        // Clear any existing timeout
        if (this.tapTimeout) {
            clearTimeout(this.tapTimeout);
            this.tapTimeout = null;
        }
        
        if (timeDiff < 400 && timeDiff > 0) {
            // Double tap detected
            this.provideFeedback('double');
            this.takePicture(true); // Full description
        } else {
            // Single tap - wait to see if double tap follows
            this.lastTap = now;
            this.tapTimeout = setTimeout(() => {
                this.provideFeedback('single');
                this.takePicture(false); // Summary
                this.tapTimeout = null;
            }, 400);
        }
    }

    handleTouchStart(e) {
        // Prevent default to avoid double-triggering with click
        e.preventDefault();
        this.handleButtonClick(e);
    }

    provideFeedback(type) {
        // Haptic feedback
        if (this.hapticEnabled && navigator.vibrate) {
            if (type === 'single') {
                navigator.vibrate(100); // Short vibration for summary
            } else {
                navigator.vibrate([100, 50, 100]); // Pattern for full description
            }
        }
        
        // Audio feedback
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        if (type === 'single') {
            oscillator.frequency.value = 800; // Higher pitch for summary
            gainNode.gain.value = 0.1;
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.1);
        } else {
            oscillator.frequency.value = 600; // Lower pitch for full
            gainNode.gain.value = 0.1;
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.2);
        }
    }

    loadSettings() {
        const morseToggle = document.getElementById('morse-toggle');
        const hapticToggle = document.getElementById('haptic-toggle');
        
        morseToggle.checked = this.morseEnabled;
        hapticToggle.checked = this.hapticEnabled;
    }
    
    announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = message;
        document.body.appendChild(announcement);
        
        // Remove after announcement
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }

    async checkApiHealth() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/health`);
            if (response.ok) {
                console.log('API service is healthy');
            }
        } catch (error) {
            console.warn('API health check failed:', error);
        }
    }

    takePicture(fullDescription = false) {
        const fileInput = document.getElementById('file-input');
        fileInput.setAttribute('data-full-description', fullDescription);
        fileInput.click();
    }

    async handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const fullDescription = event.target.getAttribute('data-full-description') === 'true';
        const mode = fullDescription ? 'full description' : 'summary';
        
        this.updateStatus(`Processing image for ${mode}...`, 'loading');
        this.speak(`Processing image for ${mode}, please wait`);

        try {
            const base64Image = await this.fileToBase64(file);
            const description = await this.analyzeImage(base64Image, fullDescription);
            
            this.updateStatus(`Image analyzed successfully!`, 'success');
            
            if (this.morseEnabled) {
                await this.outputMorse(description);
            } else {
                await this.speakDescription(description);
            }
            
        } catch (error) {
            console.error('Error:', error);
            this.updateStatus('Error processing image. Please try again.', 'error');
            this.speak('Error processing image. Please try again.');
        }
    }

    async fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    async analyzeImage(base64Image, fullDescription) {
        const response = await fetch(`${this.apiBaseUrl}/analyze`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                image: base64Image,
                fullDescription: fullDescription
            })
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Failed to analyze image' }));
            throw new Error(error.error || 'Failed to analyze image');
        }

        const data = await response.json();
        return data.description;
    }

    async speakDescription(text) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/tts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: text,
                    voice: 'default'
                })
            });

            if (!response.ok) {
                throw new Error('Failed to generate speech');
            }

            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            
            audio.onended = () => {
                URL.revokeObjectURL(audioUrl);
                const statusDiv = document.getElementById('status');
                statusDiv.style.display = 'none';
            };
            
            audio.play();
            
        } catch (error) {
            console.error('TTS Error:', error);
            // Fallback to browser speech synthesis
            this.speak(text);
        }
    }

    async outputMorse(text) {
        // Morse code dictionary
        const morseCode = {
            'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
            'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
            'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
            'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
            'Y': '-.--', 'Z': '--..', '0': '-----', '1': '.----', '2': '..---',
            '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...',
            '8': '---..', '9': '----.', ' ': '/', '.': '.-.-.-', ',': '--..--',
            '?': '..--..', "'": '.----.', '!': '-.-.--', '/': '-..-.', '(': '-.--.',
            ')': '-.--.-', '&': '.-...', ':': '---...', ';': '-.-.-.', '=': '-...-',
            '+': '.-.-.', '-': '-....-', '_': '..--.-', '"': '.-..-.'
        };

        this.updateStatus('Outputting in Morse code...', 'loading');
        
        // Convert text to morse
        const morseText = text.toUpperCase()
            .split('')
            .map(char => morseCode[char] || '')
            .filter(code => code !== '')
            .join(' ');

        // Output morse code with audio and vibration
        const dotDuration = 200; // milliseconds
        const dashDuration = 600;
        const gapDuration = 200;
        const letterGap = 600;
        
        for (let i = 0; i < morseText.length; i++) {
            const char = morseText[i];
            
            if (char === '.') {
                // Dot: short beep and vibration
                this.playMorseBeep(800, dotDuration);
                if (navigator.vibrate) navigator.vibrate(dotDuration);
                await this.sleep(dotDuration + gapDuration);
            } else if (char === '-') {
                // Dash: long beep and vibration
                this.playMorseBeep(600, dashDuration);
                if (navigator.vibrate) navigator.vibrate(dashDuration);
                await this.sleep(dashDuration + gapDuration);
            } else if (char === ' ') {
                // Letter gap
                await this.sleep(letterGap);
            } else if (char === '/') {
                // Word gap
                await this.sleep(letterGap * 2);
            }
        }
        
        const statusDiv = document.getElementById('status');
        statusDiv.style.display = 'none';
    }

    playMorseBeep(frequency, duration) {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = frequency;
            gainNode.gain.value = 0.3;
            
            oscillator.start();
            oscillator.stop(audioContext.currentTime + duration / 1000);
        } catch (error) {
            console.error('Audio error:', error);
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    speak(text) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.8;
            utterance.volume = 1;
            speechSynthesis.speak(utterance);
        }
    }

    updateStatus(message, type = '') {
        const statusDiv = document.getElementById('status');
        statusDiv.textContent = message;
        statusDiv.className = `status-message ${type}`;
        statusDiv.style.display = 'flex';
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new AugenApp();
});