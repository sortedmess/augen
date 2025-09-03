class AugenApp {
    constructor() {
        this.lastTap = 0;
        this.tapTimeout = null;
        this.morseEnabled = localStorage.getItem('morse-enabled') === 'true';
        this.hapticEnabled = localStorage.getItem('haptic-enabled') !== 'false'; // Default true
        this.userLanguage = this.detectUserLanguage();
        // Use deployed worker URL for now, later switch to custom domain
        this.apiBaseUrl = 'https://augen-api-prod.ignacioeloyola.workers.dev/api';
        
        // Voice-related properties
        this.isRecording = false;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.hasNativeSTT = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
        
        // Image state for combined photo + voice queries
        this.currentImage = null;
        this.imageTimestamp = null;
        
        this.init();
    }

    detectUserLanguage() {
        // Try to get saved language preference first
        const savedLanguage = localStorage.getItem('user-language');
        if (savedLanguage && savedLanguage !== 'auto') {
            return savedLanguage;
        }

        // Auto-detect from browser/phone settings
        const browserLang = navigator.language || navigator.userLanguage;
        
        // Extract just the language code (e.g., 'en' from 'en-US')
        const langCode = browserLang.split('-')[0].toLowerCase();
        
        // Map to supported languages
        const supportedLanguages = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh', 'ar', 'hi'];
        
        return supportedLanguages.includes(langCode) ? langCode : 'en';
    }

    getLanguageName(langCode) {
        const languageNames = {
            'en': 'English',
            'es': 'Spanish', 
            'fr': 'French',
            'de': 'German',
            'it': 'Italian',
            'pt': 'Portuguese',
            'ru': 'Russian',
            'ja': 'Japanese',
            'ko': 'Korean', 
            'zh': 'Chinese',
            'ar': 'Arabic',
            'hi': 'Hindi'
        };
        
        return languageNames[langCode] || 'English';
    }

    getLocalizedString(key) {
        const strings = {
            'ready': {
                'en': 'Augen ready. SEE or ASK.',
                'es': 'Augen listo. VER o PREGUNTA.',
                'fr': 'Augen prêt. VOIR ou DEMANDE.',
                'de': 'Augen bereit. SEHEN oder FRAGE.',
                'it': 'Augen pronto. VEDI o CHIEDI.',
                'pt': 'Augen pronto. VER ou PERGUNTE.',
                'ru': 'Augen готов. СМОТРИМ или СПРОСИ.',
                'ja': 'Augen準備完了。見るか聞く。',
                'ko': 'Augen 준비완료. 보기 또는 질문.',
                'zh': 'Augen就绪。看或问。',
                'ar': 'Augen جاهز. انظر أو اسأل.',
                'hi': 'Augen तैयार। देखें या पूछें।'
            },
            'title': {
                'en': 'Augen - AI Vision Assistant',
                'es': 'Augen - Asistente de Visión IA',
                'fr': 'Augen - Assistant Vision IA',
                'de': 'Augen - KI-Seh-Assistent',
                'it': 'Augen - Assistente Visivo IA',
                'pt': 'Augen - Assistente de Visão IA',
                'ru': 'Augen - ИИ Помощник Зрения',
                'ja': 'Augen - AI視覚アシスタント',
                'ko': 'Augen - AI 시각 도우미',
                'zh': 'Augen - AI视觉助手',
                'ar': 'Augen - مساعد الرؤية بالذكاء الاصطناعي',
                'hi': 'Augen - AI दृश्य सहायक'
            },
            'seeButton': {
                'en': '📷 SEE',
                'es': '📷 VER',
                'fr': '📷 VOIR',
                'de': '📷 SEHEN',
                'it': '📷 VEDI',
                'pt': '📷 VER',
                'ru': '📷 СМОТРИМ',
                'ja': '📷 見る',
                'ko': '📷 보기',
                'zh': '📷 看',
                'ar': '📷 انظر',
                'hi': '📷 देखें'
            },
            'askButton': {
                'en': '🎤 ASK',
                'es': '🎤 PREGUNTA',
                'fr': '🎤 DEMANDE',
                'de': '🎤 FRAGE',
                'it': '🎤 CHIEDI',
                'pt': '🎤 PERGUNTE',
                'ru': '🎤 СПРОСИ',
                'ja': '🎤 聞く',
                'ko': '🎤 질문',
                'zh': '🎤 问',
                'ar': '🎤 اسأل',
                'hi': '🎤 पूछें'
            },
            'settings': {
                'en': 'Settings',
                'es': 'Configuración',
                'fr': 'Paramètres',
                'de': 'Einstellungen',
                'it': 'Impostazioni',
                'pt': 'Configurações',
                'ru': 'Настройки',
                'ja': '設定',
                'ko': '설정',
                'zh': '设置',
                'ar': 'الإعدادات',
                'hi': 'सेटिंग्स'
            },
            'language': {
                'en': 'Language',
                'es': 'Idioma',
                'fr': 'Langue',
                'de': 'Sprache',
                'it': 'Lingua',
                'pt': 'Idioma',
                'ru': 'Язык',
                'ja': '言語',
                'ko': '언어',
                'zh': '语言',
                'ar': 'اللغة',
                'hi': 'भाषा'
            },
            'morseCode': {
                'en': 'Morse',
                'es': 'Morse',
                'fr': 'Morse',
                'de': 'Morse',
                'it': 'Morse',
                'pt': 'Morse',
                'ru': 'Морзе',
                'ja': 'モールス',
                'ko': '모르스',
                'zh': '摩尔斯',
                'ar': 'مورس',
                'hi': 'मोर्स'
            },
            'hapticFeedback': {
                'en': 'Vibration',
                'es': 'Vibración',
                'fr': 'Vibration',
                'de': 'Vibration',
                'it': 'Vibrazione',
                'pt': 'Vibração',
                'ru': 'Вибрация',
                'ja': '振動',
                'ko': '진동',
                'zh': '振动',
                'ar': 'اهتزاز',
                'hi': 'कंपन'
            },
            'processing': {
                'en': 'Processing...',
                'es': 'Procesando...',
                'fr': 'Traitement...',
                'de': 'Verarbeitung...',
                'it': 'Elaborazione...',
                'pt': 'Processando...',
                'ru': 'Обработка...',
                'ja': '処理中...',
                'ko': '처리중...',
                'zh': '处理中...',
                'ar': 'معالجة...',
                'hi': 'प्रसंस्करण...'
            },
            'listening': {
                'en': 'Listening... Speak now',
                'es': 'Escuchando... Habla ahora',
                'fr': 'Écoute... Parlez maintenant',
                'de': 'Höre zu... Sprechen Sie jetzt',
                'it': 'Ascolto... Parla ora',
                'pt': 'Ouvindo... Fale agora',
                'ru': 'Слушаю... Говорите сейчас',
                'ja': '聞いています... 今話してください',
                'ko': '듣는 중... 지금 말하세요',
                'zh': '正在聆听... 现在说话',
                'ar': 'أستمع... تحدث الآن',
                'hi': 'सुन रहा हूं... अब बोलें'
            },
            'processingAudio': {
                'en': 'Processing audio...',
                'es': 'Procesando audio...',
                'fr': 'Traitement audio...',
                'de': 'Audio wird verarbeitet...',
                'it': 'Elaborazione audio...',
                'pt': 'Processando áudio...',
                'ru': 'Обработка аудио...',
                'ja': '音声処理中...',
                'ko': '오디오 처리중...',
                'zh': '处理音频中...',
                'ar': 'معالجة الصوت...',
                'hi': 'ऑडियो प्रसंस्करण...'
            },
            'error': {
                'en': 'Error. Try again.',
                'es': 'Error. Reintente.',
                'fr': 'Erreur. Réessayez.',
                'de': 'Fehler. Wiederholen.',
                'it': 'Errore. Riprova.',
                'pt': 'Erro. Tente novamente.',
                'ru': 'Ошибка. Повторите.',
                'ja': 'エラー。再試行。',
                'ko': '오류. 재시도.',
                'zh': '错误。重试。',
                'ar': 'خطأ. حاول مرة أخرى.',
                'hi': 'त्रुटि। पुनः प्रयास।'
            },
            'buttonAriaLabel': {
                'en': 'Take picture - single tap for summary, double tap for full description',
                'es': 'Tomar foto - un toque para resumen, doble toque para descripción completa',
                'fr': 'Prendre photo - un appui pour résumé, double appui pour description complète',
                'de': 'Foto aufnehmen - ein Tipp für Zusammenfassung, Doppeltipp für vollständige Beschreibung',
                'it': 'Scatta foto - un tocco per riassunto, doppio tocco per descrizione completa',
                'pt': 'Tirar foto - um toque para resumo, toque duplo para descrição completa',
                'ru': 'Сделать фото - одно нажатие для краткого описания, двойное для полного',
                'ja': '写真を撮る - シングルタップで要約、ダブルタップで詳細説明',
                'ko': '사진 촬영 - 한 번 탭하면 요약, 두 번 탭하면 상세 설명',
                'zh': '拍照 - 单击获取摘要，双击获取完整描述',
                'ar': 'التقاط صورة - نقرة واحدة للملخص، نقرة مزدوجة للوصف الكامل',
                'hi': 'फोटो लें - सारांश के लिए एक टैप, पूर्ण विवरण के लिए डबल टैप'
            }
        };
        
        return strings[key]?.[this.userLanguage] || strings[key]?.['en'] || key;
    }

    updateUILanguage() {
        // Update HTML lang attribute
        document.documentElement.lang = this.userLanguage;
        
        // Update page title
        document.title = this.getLocalizedString('title');
        
        // Update main buttons
        const cameraBtn = document.getElementById('camera-btn');
        if (cameraBtn) {
            const buttonText = cameraBtn.querySelector('.button-text');
            if (buttonText) {
                buttonText.textContent = this.getLocalizedString('seeButton').replace(/📷\s*/, '');
            }
            cameraBtn.setAttribute('aria-label', this.getLocalizedString('buttonAriaLabel'));
        }
        
        const voiceBtn = document.getElementById('voice-btn');
        if (voiceBtn) {
            const buttonText = voiceBtn.querySelector('.button-text');
            if (buttonText) {
                buttonText.textContent = this.getLocalizedString('askButton').replace(/🎤\s*/, '');
            }
        }
        
        // Update settings panel
        const settingsTitle = document.querySelector('#settings-panel h2');
        if (settingsTitle) {
            settingsTitle.textContent = this.getLocalizedString('settings');
        }
        
        // Update language label
        const languageLabel = document.querySelector('label:has(#language-select) span');
        if (languageLabel) {
            languageLabel.textContent = this.getLocalizedString('language');
        }
        
        // Update morse code label
        const morseLabel = document.querySelector('label:has(#morse-toggle) span');
        if (morseLabel) {
            morseLabel.textContent = this.getLocalizedString('morseCode');
        }
        
        // Update haptic feedback label
        const hapticLabel = document.querySelector('label:has(#haptic-toggle) span');
        if (hapticLabel) {
            hapticLabel.textContent = this.getLocalizedString('hapticFeedback');
        }

        // Add RTL support for Arabic
        if (this.userLanguage === 'ar') {
            document.documentElement.dir = 'rtl';
            document.body.classList.add('rtl');
        } else {
            document.documentElement.dir = 'ltr';
            document.body.classList.remove('rtl');
        }
    }

    init() {
        this.setupEventListeners();
        this.loadSettings();
        this.updateUILanguage();
        this.updateButtonStates(); // Initialize button states
        this.checkApiHealth();
    }

    setupEventListeners() {
        const cameraBtn = document.getElementById('camera-btn');
        const voiceBtn = document.getElementById('voice-btn');
        const fileInput = document.getElementById('file-input');
        const settingsBtn = document.getElementById('settings-btn');
        const settingsPanel = document.getElementById('settings-panel');
        const languageSelect = document.getElementById('language-select');
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
        
        // Voice button interactions
        voiceBtn.addEventListener('click', (e) => this.handleVoiceClick(e));
        voiceBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.handleVoiceClick(e);
            }
        });
        
        // Settings panel
        settingsBtn.addEventListener('click', () => {
            settingsPanel.style.display = settingsPanel.style.display === 'none' ? 'block' : 'none';
        });
        
        // Settings toggles
        languageSelect.addEventListener('change', (e) => {
            const selectedLang = e.target.value;
            if (selectedLang === 'auto') {
                localStorage.setItem('user-language', 'auto');
                this.userLanguage = this.detectUserLanguage();
            } else {
                localStorage.setItem('user-language', selectedLang);
                this.userLanguage = selectedLang;
            }
            this.updateUILanguage();
            this.announceToScreenReader(`Language changed to ${this.getLanguageName(this.userLanguage)}`);
        });
        
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
        this.announceToScreenReader(this.getLocalizedString('ready'));
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
        const languageSelect = document.getElementById('language-select');
        const morseToggle = document.getElementById('morse-toggle');
        const hapticToggle = document.getElementById('haptic-toggle');
        
        // Set language selector
        const savedLanguage = localStorage.getItem('user-language');
        languageSelect.value = savedLanguage || 'auto';
        
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
        
        // Mobile-specific handling
        try {
            // Reset the input to ensure change event fires
            fileInput.value = '';
            
            // For mobile browsers, we need to trigger click in user gesture context
            if (/Mobi|Android/i.test(navigator.userAgent)) {
                // Mobile device
                setTimeout(() => {
                    fileInput.click();
                }, 10);
            } else {
                fileInput.click();
            }
        } catch (error) {
            console.error('Error triggering file input:', error);
            this.updateStatus('Camera access failed. Please try again.', 'error');
        }
    }

    async handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) {
            console.log('No file selected');
            return;
        }

        console.log('File selected:', file.name, 'Size:', file.size, 'Type:', file.type);

        const fullDescription = event.target.getAttribute('data-full-description') === 'true';
        const processingMsg = this.getLocalizedString('processing');
        
        this.updateStatus(processingMsg, 'loading');
        this.speak(processingMsg);

        try {
            console.log('Converting file to base64...');
            const base64Image = await this.fileToBase64(file);
            console.log('Base64 conversion complete, length:', base64Image.length);
            
            // Store the current image for potential voice queries
            this.currentImage = base64Image;
            this.imageTimestamp = Date.now();
            
            console.log('Sending to API...');
            const description = await this.analyzeImage(base64Image, fullDescription);
            console.log('API response received:', description.substring(0, 100) + '...');
            
            this.updateStatus(`Image analyzed successfully!`, 'success');
            this.updateButtonStates();
            
            if (this.morseEnabled) {
                await this.outputMorse(description);
            } else {
                await this.speakDescription(description);
            }
            
        } catch (error) {
            console.error('Detailed error:', error);
            console.error('Error stack:', error.stack);
            const errorMsg = this.getLocalizedString('error') + ': ' + error.message;
            this.updateStatus(errorMsg, 'error');
            this.speak(errorMsg);
        }
    }

    async fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            img.onload = () => {
                // Calculate optimal dimensions
                let { width, height } = this.calculateOptimalDimensions(img.width, img.height);
                
                canvas.width = width;
                canvas.height = height;
                
                // Draw and compress image
                ctx.drawImage(img, 0, 0, width, height);
                
                // Convert to base64 with compression
                // Use JPEG for photos (smaller) but maintain quality for text
                const quality = file.size > 2000000 ? 0.7 : 0.8; // Lower quality for larger files
                const dataURL = canvas.toDataURL('image/jpeg', quality);
                
                console.log(`Image compressed: ${img.width}x${img.height} -> ${width}x${height}, quality: ${quality}`);
                console.log(`File size reduced: ${file.size} -> ~${Math.round(dataURL.length * 0.75)} bytes`);
                
                resolve(dataURL.split(',')[1]);
            };
            
            img.onerror = reject;
            
            // Load the image
            const reader = new FileReader();
            reader.onload = (e) => {
                img.src = e.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
    
    calculateOptimalDimensions(originalWidth, originalHeight) {
        const maxWidth = 1920;  // Good balance for text readability
        const maxHeight = 1920;
        const maxPixels = 2073600; // ~2MP max to keep under API limits
        
        let width = originalWidth;
        let height = originalHeight;
        
        // Calculate current pixels
        const currentPixels = width * height;
        
        // If image is too large by pixel count, scale down
        if (currentPixels > maxPixels) {
            const scale = Math.sqrt(maxPixels / currentPixels);
            width = Math.round(width * scale);
            height = Math.round(height * scale);
        }
        
        // Ensure dimensions don't exceed max width/height
        if (width > maxWidth) {
            const scale = maxWidth / width;
            width = maxWidth;
            height = Math.round(height * scale);
        }
        
        if (height > maxHeight) {
            const scale = maxHeight / height;
            height = maxHeight;
            width = Math.round(width * scale);
        }
        
        return { width, height };
    }

    async analyzeImage(base64Image, fullDescription) {
        const response = await fetch(`${this.apiBaseUrl}/analyze`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                image: base64Image,
                fullDescription: fullDescription,
                language: this.userLanguage
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
        // Use native browser speech synthesis
        this.speak(text);
        
        // Hide status after speech starts
        setTimeout(() => {
            const statusDiv = document.getElementById('status');
            statusDiv.style.display = 'none';
        }, 1000);
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

    formatNumbersForSpeech(text) {
        // Intelligent number formatting for TTS
        let formattedText = text;
        
        // Phone numbers (various patterns)
        const phonePatterns = [
            /\b(\d{3})[ -]?(\d{3})[ -]?(\d{4})\b/g, // 123-456-7890 or 123 456 7890
            /\b(\d{3})(\d{3})(\d{3})\b/g, // 654123123 (9 digits)
            /\b(\d{2})[ -]?(\d{4})[ -]?(\d{4})\b/g, // 12-3456-7890
            /\b(\d{4})[ -]?(\d{3})[ -]?(\d{3})\b/g, // 1234-567-890
            /\b(\d{3})[ -]?(\d{2})[ -]?(\d{2})[ -]?(\d{2})\b/g // 123-45-67-89
        ];
        
        phonePatterns.forEach(pattern => {
            formattedText = formattedText.replace(pattern, (match) => {
                // Convert to individual digits
                return match.replace(/\D/g, '').split('').join(' ');
            });
        });
        
        // Currency amounts
        const currencyPatterns = [
            /\$(\d+(?:,\d{3})*(?:\.\d{2})?)/g, // $1,234.56
            /(\d+(?:,\d{3})*(?:\.\d{2})?)€/g, // 1,234.56€
            /(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(euros?|dollars?|pounds?)/gi
        ];
        
        currencyPatterns.forEach(pattern => {
            formattedText = formattedText.replace(pattern, (match, amount) => {
                if (match.includes('$')) return `${amount} dollars`;
                if (match.includes('€')) return `${amount} euros`;
                return match; // Keep original for other currency words
            });
        });
        
        // Credit card numbers (16 digits grouped)
        formattedText = formattedText.replace(/\b(\d{4})[ -]?(\d{4})[ -]?(\d{4})[ -]?(\d{4})\b/g, 
            (match, g1, g2, g3, g4) => {
                return `${g1.split('').join(' ')} ${g2.split('').join(' ')} ${g3.split('').join(' ')} ${g4.split('').join(' ')}`;
            });
        
        // Large numbers (avoid reading as huge numbers)
        // Convert numbers with 6+ digits to grouped format
        formattedText = formattedText.replace(/\b(\d{6,})\b/g, (match) => {
            // Don't format if it's already been processed as phone/credit card
            if (match.includes(' ')) return match;
            
            // Group by 3 digits from right to left
            const reversed = match.split('').reverse();
            const groups = [];
            for (let i = 0; i < reversed.length; i += 3) {
                groups.push(reversed.slice(i, i + 3).reverse().join(''));
            }
            return groups.reverse().join(' thousand, ') + (groups.length > 1 ? '' : '');
        });
        
        return formattedText;
    }

    speak(text) {
        if ('speechSynthesis' in window) {
            // Apply intelligent number formatting
            const formattedText = this.formatNumbersForSpeech(text);
            
            const utterance = new SpeechSynthesisUtterance(formattedText);
            utterance.rate = 0.8;
            utterance.volume = 1;
            
            // Set language for speech synthesis
            // Map our language codes to speech synthesis language codes
            const speechLangMap = {
                'en': 'en-US',
                'es': 'es-ES', 
                'fr': 'fr-FR',
                'de': 'de-DE',
                'it': 'it-IT',
                'pt': 'pt-PT',
                'ru': 'ru-RU',
                'ja': 'ja-JP',
                'ko': 'ko-KR',
                'zh': 'zh-CN',
                'ar': 'ar-SA',
                'hi': 'hi-IN'
            };
            
            utterance.lang = speechLangMap[this.userLanguage] || 'en-US';
            
            speechSynthesis.speak(utterance);
        }
    }

    updateStatus(message, type = '') {
        const statusDiv = document.getElementById('status');
        statusDiv.textContent = message;
        statusDiv.className = `status-message ${type}`;
        statusDiv.style.display = 'flex';
    }

    updateButtonStates() {
        const voiceBtn = document.getElementById('voice-btn');
        const cameraBtn = document.getElementById('camera-btn');
        
        if (this.currentImage && (Date.now() - this.imageTimestamp < 300000)) { // 5 minutes
            // Image available - change voice button to blue to match image context
            voiceBtn.style.background = 'linear-gradient(145deg, #2196f3, #1976d2)';
            voiceBtn.setAttribute('aria-label', 'Ask question about the captured image');
            
            // Add subtle indicator to camera button
            cameraBtn.style.boxShadow = '0 8px 24px rgba(33, 150, 243, 0.4), 0 4px 8px rgba(0, 0, 0, 0.2), inset 0 0 0 2px rgba(76, 175, 80, 0.6)';
        } else {
            // No image - reset to default states
            voiceBtn.style.background = 'linear-gradient(145deg, #ff6b35, #f7931e)';
            voiceBtn.setAttribute('aria-label', 'Voice input - ask general questions');
            
            cameraBtn.style.boxShadow = '0 8px 24px rgba(33, 150, 243, 0.4), 0 4px 8px rgba(0, 0, 0, 0.2)';
            this.currentImage = null;
            this.imageTimestamp = null;
        }
    }

    // Voice functionality methods
    async handleVoiceClick(event) {
        if (this.isRecording) {
            await this.stopRecording();
        } else {
            await this.startRecording();
        }
    }

    async startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: { 
                    sampleRate: 16000,
                    channelCount: 1,
                    echoCancellation: true,
                    noiseSuppression: true
                } 
            });
            
            this.audioChunks = [];
            this.mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'audio/webm;codecs=opus'
            });
            
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data);
                }
            };
            
            this.mediaRecorder.onstop = () => {
                this.processRecording();
            };
            
            this.mediaRecorder.start(100); // Collect chunks every 100ms
            this.isRecording = true;
            
            const voiceBtn = document.getElementById('voice-btn');
            voiceBtn.classList.add('recording');
            
            const icon = voiceBtn.querySelector('.icon');
            const buttonText = voiceBtn.querySelector('.button-text');
            if (icon) icon.textContent = 'stop';
            if (buttonText) buttonText.textContent = 'STOP';
            
            this.updateStatus(this.getLocalizedString('listening'), 'loading');
            
            // Provide haptic feedback for recording start
            if (this.hapticEnabled && navigator.vibrate) {
                navigator.vibrate([200, 100, 200]);
            }
            
        } catch (error) {
            console.error('Error starting recording:', error);
            this.updateStatus('Microphone access denied. Please allow microphone access.', 'error');
        }
    }

    async stopRecording() {
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            this.mediaRecorder.stop();
            this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
        }
        
        this.isRecording = false;
        
        const voiceBtn = document.getElementById('voice-btn');
        voiceBtn.classList.remove('recording');
        
        const icon = voiceBtn.querySelector('.icon');
        const buttonText = voiceBtn.querySelector('.button-text');
        if (icon) icon.textContent = 'mic';
        if (buttonText) buttonText.textContent = this.getLocalizedString('askButton').replace(/🎤\s*/, '');
        
        this.updateStatus(this.getLocalizedString('processingAudio'), 'loading');
    }

    async processRecording() {
        if (this.audioChunks.length === 0) {
            this.updateStatus('No audio recorded. Please try again.', 'error');
            return;
        }

        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        
        // Try native STT first, fallback to Groq
        if (this.hasNativeSTT && this.shouldUseNativeSTT()) {
            await this.transcribeWithNativeSTT();
        } else {
            await this.transcribeWithGroq(audioBlob);
        }
    }

    shouldUseNativeSTT() {
        // Use native STT for privacy-sensitive users or if Groq is unavailable
        // For now, prefer Groq for better accuracy and language support
        return false;
    }

    async transcribeWithNativeSTT() {
        return new Promise((resolve, reject) => {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = this.getSpeechRecognitionLang();
            
            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.handleVoiceQuery(transcript);
                resolve();
            };
            
            recognition.onerror = (event) => {
                console.error('Native STT error:', event.error);
                this.updateStatus('Voice recognition failed. Please try again.', 'error');
                reject(event.error);
            };
            
            recognition.start();
        });
    }

    async transcribeWithGroq(audioBlob) {
        try {
            // Convert to appropriate format for Groq
            const formData = new FormData();
            formData.append('file', audioBlob, 'recording.webm');
            formData.append('model', 'whisper-large-v3-turbo');
            formData.append('language', this.userLanguage);
            formData.append('temperature', '0.0');

            const response = await fetch(`${this.apiBaseUrl}/transcribe`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Transcription failed');
            }

            const data = await response.json();
            const transcript = data.text || data.transcript;
            
            if (!transcript || transcript.trim().length === 0) {
                throw new Error('No speech detected');
            }

            await this.handleVoiceQuery(transcript);
            
        } catch (error) {
            console.error('Groq transcription error:', error);
            this.updateStatus('Voice transcription failed. Please try again.', 'error');
        }
    }

    getSpeechRecognitionLang() {
        const langMap = {
            'en': 'en-US',
            'es': 'es-ES',
            'fr': 'fr-FR',
            'de': 'de-DE',
            'it': 'it-IT',
            'pt': 'pt-PT',
            'ru': 'ru-RU',
            'ja': 'ja-JP',
            'ko': 'ko-KR',
            'zh': 'zh-CN',
            'ar': 'ar-SA',
            'hi': 'hi-IN'
        };
        return langMap[this.userLanguage] || 'en-US';
    }

    async handleVoiceQuery(transcript) {
        // Sanitize the transcript
        const sanitizedTranscript = this.sanitizeInput(transcript);
        
        this.updateStatus(`You said: "${sanitizedTranscript}"`, 'success');
        this.speak(`Processing your request: ${sanitizedTranscript}`);
        
        try {
            let response;
            
            // Check if we have a current image (within 5 minutes)
            if (this.currentImage && (Date.now() - this.imageTimestamp < 300000)) {
                // Mode 3: Image + Voice Query
                console.log('Processing voice query with image context');
                const enhancedPrompt = this.enhanceVoiceQueryWithImage(sanitizedTranscript);
                response = await this.analyzeImageWithVoiceQuery(this.currentImage, enhancedPrompt);
            } else {
                // Mode 1: Voice Only
                console.log('Processing voice query without image');
                const enhancedPrompt = this.enhanceVoiceQuery(sanitizedTranscript);
                response = await this.processVoiceQuery(enhancedPrompt);
            }
            
            this.updateStatus('Voice query processed successfully!', 'success');
            
            if (this.morseEnabled) {
                await this.outputMorse(response);
            } else {
                await this.speakDescription(response);
            }
            
        } catch (error) {
            console.error('Voice query processing error:', error);
            const errorMsg = 'Failed to process voice query. Please try again.';
            this.updateStatus(errorMsg, 'error');
            this.speak(errorMsg);
        }
    }

    enhanceVoiceQuery(transcript) {
        // Clean up the transcript and add context for voice-only queries
        const cleanTranscript = transcript.trim();
        
        // For voice-only mode, provide general assistant capabilities
        return `The user asked: "${cleanTranscript}". You are Augen, an AI vision assistant. Since no image is provided, respond to their general question as helpfully as possible. If they're asking about visual content, politely explain that you need an image to analyze.`;
    }

    enhanceVoiceQueryWithImage(transcript) {
        // Clean up the transcript and add context for image + voice queries
        const cleanTranscript = transcript.trim();
        
        // Detect intent and enhance prompt for image analysis
        const lowerTranscript = cleanTranscript.toLowerCase();
        
        if (lowerTranscript.includes('describe') || lowerTranscript.includes('what') || lowerTranscript.includes('see')) {
            return `The user asked: "${cleanTranscript}". Please provide a detailed description of what you see in the image, focusing on answering their specific question.`;
        } else if (lowerTranscript.includes('read') || lowerTranscript.includes('text')) {
            return `The user asked: "${cleanTranscript}". Please read any text visible in the image clearly and completely.`;
        } else if (lowerTranscript.includes('help') || lowerTranscript.includes('assist')) {
            return `The user needs help: "${cleanTranscript}". Please describe what you see and provide relevant assistance based on the image content.`;
        } else if (lowerTranscript.includes('count') || lowerTranscript.includes('how many')) {
            return `The user asked: "${cleanTranscript}". Please count and identify the specific items they're asking about in the image.`;
        } else if (lowerTranscript.includes('color') || lowerTranscript.includes('colour')) {
            return `The user asked: "${cleanTranscript}". Please describe the colors and visual appearance of what they're asking about in the image.`;
        } else {
            return `The user asked: "${cleanTranscript}". Please analyze the image and respond to their specific question as helpfully as possible.`;
        }
    }

    async analyzeImageWithVoiceQuery(base64Image, enhancedPrompt) {
        const response = await fetch(`${this.apiBaseUrl}/analyze`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                image: base64Image,
                fullDescription: true, // Always use full description for voice queries
                language: this.userLanguage,
                customPrompt: enhancedPrompt // Add custom prompt for voice query
            })
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Failed to analyze image with voice query' }));
            throw new Error(error.error || 'Failed to analyze image with voice query');
        }

        const data = await response.json();
        return data.description;
    }

    async processVoiceQuery(enhancedPrompt) {
        const response = await fetch(`${this.apiBaseUrl}/voice-query`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: enhancedPrompt,
                language: this.userLanguage
            })
        });

        if (!response.ok) {
            throw new Error('Voice query processing failed');
        }

        const data = await response.json();
        return data.response;
    }

    // Add prompt injection protection
    sanitizeInput(input) {
        // Basic prompt injection protection
        const dangerous = [
            'ignore', 'forget', 'system', 'prompt', 'instruction',
            'override', 'bypass', 'admin', 'root', 'execute'
        ];
        
        let sanitized = input.toLowerCase();
        dangerous.forEach(word => {
            if (sanitized.includes(word)) {
                console.warn(`Potentially dangerous input detected: ${word}`);
                // Could implement more sophisticated filtering here
            }
        });
        
        return input.length > 500 ? input.substring(0, 500) : input;
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new AugenApp();
});