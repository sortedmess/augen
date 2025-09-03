class AugenApp {
    constructor() {
        this.lastTap = 0;
        this.tapTimeout = null;
        this.morseEnabled = localStorage.getItem('morse-enabled') === 'true';
        this.hapticEnabled = localStorage.getItem('haptic-enabled') !== 'false'; // Default true
        this.userLanguage = this.detectUserLanguage();
        // Use deployed worker URL for now, later switch to custom domain
        this.apiBaseUrl = 'https://augen-api-prod.ignacioeloyola.workers.dev/api';
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
                'en': 'Augen vision assistant ready. Single tap for summary, double tap for full description.',
                'es': 'Asistente de visión Augen listo. Un toque para resumen, doble toque para descripción completa.',
                'fr': 'Assistant de vision Augen prêt. Un appui pour résumé, double appui pour description complète.',
                'de': 'Augen Seh-Assistent bereit. Ein Tipp für Zusammenfassung, Doppeltipp für vollständige Beschreibung.',
                'it': 'Assistente visivo Augen pronto. Un tocco per riassunto, doppio tocco per descrizione completa.',
                'pt': 'Assistente de visão Augen pronto. Um toque para resumo, toque duplo para descrição completa.',
                'ru': 'Помощник зрения Augen готов. Одно нажатие для краткого описания, двойное нажатие для подробного.',
                'ja': 'Augen視覚アシスタント準備完了。シングルタップで要約、ダブルタップで詳細説明。',
                'ko': 'Augen 시각 도우미 준비 완료. 한 번 탭하면 요약, 두 번 탭하면 상세 설명.',
                'zh': 'Augen视觉助手已准备就绪。单击获取摘要，双击获取完整描述。',
                'ar': 'مساعد الرؤية Augen جاهز. نقرة واحدة للملخص، نقرة مزدوجة للوصف الكامل.',
                'hi': 'Augen दृश्य सहायक तैयार। सारांश के लिए एक टैप, पूर्ण विवरण के लिए डबल टैप।'
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
            'describeButton': {
                'en': '📷 DESCRIBE',
                'es': '📷 DESCRIBIR',
                'fr': '📷 DÉCRIRE',
                'de': '📷 BESCHREIBEN',
                'it': '📷 DESCRIVI',
                'pt': '📷 DESCREVER',
                'ru': '📷 ОПИСАТЬ',
                'ja': '📷 説明',
                'ko': '📷 설명',
                'zh': '📷 描述',
                'ar': '📷 وصف',
                'hi': '📷 वर्णन'
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
                'en': 'Morse Code Output',
                'es': 'Salida en Código Morse',
                'fr': 'Sortie Code Morse',
                'de': 'Morse-Code-Ausgabe',
                'it': 'Uscita Codice Morse',
                'pt': 'Saída Código Morse',
                'ru': 'Выход кода Морзе',
                'ja': 'モールス信号出力',
                'ko': '모르스 부호 출력',
                'zh': '摩尔斯电码输出',
                'ar': 'إخراج شفرة مورس',
                'hi': 'मोर्स कोड आउटपुट'
            },
            'hapticFeedback': {
                'en': 'Haptic Feedback',
                'es': 'Retroalimentación Háptica',
                'fr': 'Retour Haptique',
                'de': 'Haptische Rückmeldung',
                'it': 'Feedback Aptico',
                'pt': 'Feedback Tátil',
                'ru': 'Тактильная обратная связь',
                'ja': '触覚フィードバック',
                'ko': '햅틱 피드백',
                'zh': '触觉反馈',
                'ar': 'التغذية الراجعة اللمسية',
                'hi': 'हैप्टिक फीडबैक'
            },
            'processing': {
                'en': 'Processing image, please wait...',
                'es': 'Procesando imagen, por favor espere...',
                'fr': 'Traitement de l\'image, veuillez patienter...',
                'de': 'Bild wird verarbeitet, bitte warten...',
                'it': 'Elaborazione immagine, attendere...',
                'pt': 'Processando imagem, aguarde...',
                'ru': 'Обработка изображения, пожалуйста подождите...',
                'ja': '画像を処理中、お待ちください...',
                'ko': '이미지 처리 중, 잠시 기다려 주세요...',
                'zh': '正在处理图像，请稍候...',
                'ar': 'معالجة الصورة، يرجى الانتظار...',
                'hi': 'छवि प्रसंस्करण, कृपया प्रतीक्षा करें...'
            },
            'error': {
                'en': 'Error processing image. Please try again.',
                'es': 'Error procesando imagen. Inténtelo de nuevo.',
                'fr': 'Erreur de traitement d\'image. Veuillez réessayer.',
                'de': 'Fehler beim Verarbeiten des Bildes. Bitte versuchen Sie es erneut.',
                'it': 'Errore nell\'elaborazione dell\'immagine. Riprova.',
                'pt': 'Erro processando imagem. Tente novamente.',
                'ru': 'Ошибка обработки изображения. Пожалуйста, попробуйте еще раз.',
                'ja': '画像処理エラー。もう一度試してください。',
                'ko': '이미지 처리 오류. 다시 시도해 주세요.',
                'zh': '图像处理错误。请重试。',
                'ar': 'خطأ في معالجة الصورة. يرجى المحاولة مرة أخرى.',
                'hi': 'छवि प्रसंस्करण त्रुटि। कृपया पुनः प्रयास करें।'
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
        
        // Update main button
        const cameraBtn = document.getElementById('camera-btn');
        if (cameraBtn) {
            cameraBtn.textContent = this.getLocalizedString('describeButton');
            cameraBtn.setAttribute('aria-label', this.getLocalizedString('buttonAriaLabel'));
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
        this.checkApiHealth();
    }

    setupEventListeners() {
        const cameraBtn = document.getElementById('camera-btn');
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
            
            console.log('Sending to API...');
            const description = await this.analyzeImage(base64Image, fullDescription);
            console.log('API response received:', description.substring(0, 100) + '...');
            
            this.updateStatus(`Image analyzed successfully!`, 'success');
            
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

    speak(text) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
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
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new AugenApp();
});