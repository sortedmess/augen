class AugenApp {
    constructor() {
        this.lastTap = 0;
        this.tapTimeout = null;
        this.morseEnabled = localStorage.getItem('morse-enabled') === 'true';
        this.hapticEnabled = localStorage.getItem('haptic-enabled') !== 'false'; // Default true
        this.userLanguage = this.detectUserLanguage();
        
        // New accessibility settings with better defaults
        this.currentTheme = localStorage.getItem('theme') || 'standard';
        this.fontSize = localStorage.getItem('font-size') || 'large'; // Default to large for accessibility
        this.ttsEchoEnabled = localStorage.getItem('tts-echo-enabled') === 'true';
        
        // TTS control properties
        this.currentUtterance = null;
        this.lastSpokenText = '';
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
        
        // App modes: 'chat' (default), 'image' (after taking photo), 'query' (image + can ask)
        this.currentMode = 'chat';
        
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
        
        const detectedLang = supportedLanguages.includes(langCode) ? langCode : 'en';
        
        // Auto-save the detected language as user preference (not as 'auto')
        localStorage.setItem('user-language', detectedLang);
        
        return detectedLang;
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
            },
            'imageCaptured': {
                'en': 'Image captured! Choose an action below.',
                'es': 'Imagen capturada. Elige una acción abajo.',
                'fr': 'Image capturée! Choisissez une action ci-dessous.',
                'de': 'Bild aufgenommen! Wählen Sie unten eine Aktion.',
                'it': 'Immagine catturata! Scegli un\'azione sotto.',
                'pt': 'Imagem capturada! Escolha uma ação abaixo.',
                'ru': 'Изображение захвачено! Выберите действие ниже.',
                'ja': '画像をキャプチャしました！下からアクションを選択してください。',
                'ko': '이미지가 캡처되었습니다! 아래에서 작업을 선택하세요.',
                'zh': '图像已捕获！请在下方选择操作。',
                'ar': 'تم التقاط الصورة! اختر إجراء أدناه.',
                'hi': 'छवि कैप्चर की गई! नीचे एक क्रिया चुनें।'
            },
            'speechStopped': {
                'en': 'Speech stopped',
                'es': 'Audio detenido',
                'fr': 'Discours arrêté',
                'de': 'Sprache gestoppt',
                'it': 'Discorso fermato',
                'pt': 'Fala interrompida',
                'ru': 'Речь остановлена',
                'ja': 'スピーチが停止されました',
                'ko': '음성이 중지되었습니다',
                'zh': '语音已停止',
                'ar': 'توقف الكلام',
                'hi': 'भाषण रुक गया'
            },
            'readyNewChat': {
                'en': 'Ready for new chat',
                'es': 'Listo para nueva conversación',
                'fr': 'Prêt pour un nouveau chat',
                'de': 'Bereit für neuen Chat',
                'it': 'Pronto per nuova chat',
                'pt': 'Pronto para nova conversa',
                'ru': 'Готов к новому чату',
                'ja': '新しいチャットの準備ができました',
                'ko': '새 채팅 준비 완료',
                'zh': '准备新聊天',
                'ar': 'جاهز للدردشة الجديدة',
                'hi': 'नई चैट के लिए तैयार'
            },
            'imageDescribeSuccess': {
                'en': 'Image described successfully!',
                'es': '¡Imagen descrita con éxito!',
                'fr': 'Image décrite avec succès!',
                'de': 'Bild erfolgreich beschrieben!',
                'it': 'Immagine descritta con successo!',
                'pt': 'Imagem descrita com sucesso!',
                'ru': 'Изображение успешно описано!',
                'ja': '画像の説明が成功しました！',
                'ko': '이미지 설명이 성공했습니다!',
                'zh': '图像描述成功！',
                'ar': 'تم وصف الصورة بنجاح!',
                'hi': 'छवि सफलतापूर्वक वर्णित!'
            },
            'voiceQuerySuccess': {
                'en': 'Voice query processed successfully!',
                'es': '¡Consulta de voz procesada con éxito!',
                'fr': 'Requête vocale traitée avec succès!',
                'de': 'Sprachanfrage erfolgreich verarbeitet!',
                'it': 'Query vocale elaborata con successo!',
                'pt': 'Consulta de voz processada com sucesso!',
                'ru': 'Голосовой запрос успешно обработан!',
                'ja': '音声クエリが正常に処理されました！',
                'ko': '음성 쿼리가 성공적으로 처리되었습니다!',
                'zh': '语音查询处理成功！',
                'ar': 'تمت معالجة الاستعلام الصوتي بنجاح!',
                'hi': 'आवाज क्वेरी सफलतापूर्वक संसाधित!'
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
        
        // Set up periodic TTS state checker
        this.ttsStateChecker = setInterval(() => {
            this.checkTTSState();
        }, 1000); // Check every second
    }

    setupEventListeners() {
        const cameraBtn = document.getElementById('camera-btn');
        const voiceBtn = document.getElementById('voice-btn');
        const describeBtn = document.getElementById('describe-btn');
        const askAboutBtn = document.getElementById('ask-about-btn');
        const resetBtn = document.getElementById('reset-btn');
        const stopTtsBtn = document.getElementById('stop-tts-btn');
        const fileInput = document.getElementById('file-input');
        const settingsBtn = document.getElementById('settings-btn');
        const settingsPanel = document.getElementById('settings-panel');
        const languageSelect = document.getElementById('language-select');
        const morseToggle = document.getElementById('morse-toggle');
        const hapticToggle = document.getElementById('haptic-toggle');
        
        // New setting controls
        const themeSelect = document.getElementById('theme-select');
        const fontSizeSelect = document.getElementById('font-size-select');
        const ttsEchoToggle = document.getElementById('tts-echo-toggle');
        
        // TTS control buttons
        const repeatTtsBtn = document.getElementById('repeat-tts-btn');

        // Chat mode buttons
        if (voiceBtn) {
            voiceBtn.addEventListener('click', (e) => this.handleVoiceClick(e));
            voiceBtn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.handleVoiceClick(e);
                }
            });
        }
        
        if (cameraBtn) {
            cameraBtn.addEventListener('click', (e) => this.takePicture());
            cameraBtn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.takePicture();
                }
            });
        }
        
        // Image mode buttons
        if (describeBtn) {
            describeBtn.addEventListener('click', (e) => this.describeCurrentImage());
            describeBtn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.describeCurrentImage();
                }
            });
        }
        
        if (askAboutBtn) {
            askAboutBtn.addEventListener('click', (e) => this.handleImageVoiceClick(e));
            askAboutBtn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.handleImageVoiceClick(e);
                }
            });
        }
        
        // Reset button
        if (resetBtn) {
            resetBtn.addEventListener('click', (e) => this.resetToChat());
            resetBtn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.resetToChat();
                }
            });
        }
        
        // Stop TTS button
        if (stopTtsBtn) {
            stopTtsBtn.addEventListener('click', (e) => this.stopTTS());
            stopTtsBtn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.stopTTS();
                }
            });
        }
        
        // Settings panel
        settingsBtn.addEventListener('click', () => {
            const isHidden = settingsPanel.style.display === 'none';
            settingsPanel.style.display = isHidden ? 'block' : 'none';
            
            // Update button aria-label and visual state
            settingsBtn.setAttribute('aria-label', isHidden ? 'Close settings' : 'Open settings');
            settingsBtn.classList.toggle('active', isHidden);
            
            if (isHidden) {
                // Announce to screen readers
                this.announceToScreenReader('Settings panel opened');
                
                // Smooth scroll to the top so user can see the panel
                window.scrollTo({ top: 0, behavior: 'smooth' });
                
                // Focus the settings panel for screen readers
                settingsPanel.setAttribute('tabindex', '-1');
                setTimeout(() => {
                    settingsPanel.focus();
                }, 300); // Wait for scroll animation
                
                // Provide haptic feedback
                if (this.hapticEnabled && navigator.vibrate) {
                    navigator.vibrate(50);
                }
            } else {
                // Announce closing
                this.announceToScreenReader('Settings panel closed');
                
                // Provide haptic feedback
                if (this.hapticEnabled && navigator.vibrate) {
                    navigator.vibrate(30);
                }
            }
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
        
        if (morseToggle) {
            morseToggle.addEventListener('change', (e) => {
                console.log('Morse toggle changed:', e.target.checked);
                this.morseEnabled = e.target.checked;
                localStorage.setItem('morse-enabled', this.morseEnabled.toString());
            });
        }
        
        if (hapticToggle) {
            hapticToggle.addEventListener('change', (e) => {
                console.log('Haptic toggle changed:', e.target.checked);
                this.hapticEnabled = e.target.checked;
                localStorage.setItem('haptic-enabled', this.hapticEnabled.toString());
            });
        }
        
        // New setting event listeners
        if (themeSelect) {
            themeSelect.addEventListener('change', (e) => {
                this.currentTheme = e.target.value;
                localStorage.setItem('theme', this.currentTheme);
                this.applyTheme();
            });
        }
        
        if (fontSizeSelect) {
            fontSizeSelect.addEventListener('change', (e) => {
                this.fontSize = e.target.value;
                localStorage.setItem('font-size', this.fontSize);
                this.applyFontSize();
            });
        }
        
        
        if (ttsEchoToggle) {
            ttsEchoToggle.addEventListener('change', (e) => {
                console.log('TTS echo toggle changed:', e.target.checked);
                this.ttsEchoEnabled = e.target.checked;
                localStorage.setItem('tts-echo-enabled', this.ttsEchoEnabled.toString());
            });
        }
        
        // TTS control event listeners
        if (repeatTtsBtn) {
            repeatTtsBtn.addEventListener('click', () => this.repeatTTS());
        }
        
        fileInput.addEventListener('change', (e) => this.handleImageUpload(e));
        
        // Add keyboard shortcuts for TTS controls
        document.addEventListener('keydown', (e) => {
            // Only activate shortcuts when not typing in an input field
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') {
                return;
            }
            
            if (e.ctrlKey || e.metaKey) {
                switch (e.key.toLowerCase()) {
                    case 's': // Ctrl+S: Stop
                        e.preventDefault();
                        this.stopTTS();
                        break;
                    case 'r': // Ctrl+R: Repeat
                        e.preventDefault();
                        this.repeatTTS();
                        break;
                }
            }
        });
        
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
        const themeSelect = document.getElementById('theme-select');
        const fontSizeSelect = document.getElementById('font-size-select');
        const ttsEchoToggle = document.getElementById('tts-echo-toggle');
        
        // Set language selector to detected language (not 'auto')
        const savedLanguage = localStorage.getItem('user-language');
        if (languageSelect) languageSelect.value = savedLanguage || this.userLanguage;
        
        if (morseToggle) {
            morseToggle.checked = this.morseEnabled;
            console.log('Morse toggle set to:', this.morseEnabled);
        }
        if (hapticToggle) {
            hapticToggle.checked = this.hapticEnabled;
            console.log('Haptic toggle set to:', this.hapticEnabled);
        }
        
        // Load new settings
        if (themeSelect) themeSelect.value = this.currentTheme;
        if (fontSizeSelect) fontSizeSelect.value = this.fontSize;
        if (ttsEchoToggle) {
            ttsEchoToggle.checked = this.ttsEchoEnabled;
            console.log('TTS echo toggle set to:', this.ttsEchoEnabled);
        }
        
        // Apply settings
        this.applyTheme();
        this.applyFontSize();
    }
    
    applyTheme() {
        const body = document.body;
        // Remove existing theme classes
        body.classList.remove('theme-standard', 'theme-high-contrast', 'theme-dark-high-contrast', 'theme-yellow-black', 'theme-white-blue');
        // Apply selected theme
        body.classList.add(`theme-${this.currentTheme}`);
    }
    
    applyFontSize() {
        const body = document.body;
        // Remove existing font size classes
        body.classList.remove('font-size-small', 'font-size-standard', 'font-size-large', 'font-size-extra-large', 'font-size-huge');
        // Apply selected font size
        body.classList.add(`font-size-${this.fontSize}`);
    }
    
    
    repeatTTS() {
        if (this.lastSpokenText) {
            console.log('Repeating last spoken text');
            this.speak(this.lastSpokenText);
            this.announceToScreenReader('Repeating last message');
        } else {
            console.log('No text to repeat');
            this.announceToScreenReader('No previous message to repeat');
        }
    }
    
    
    showTTSControls() {
        const ttsControls = document.getElementById('tts-controls');
        
        if (ttsControls) {
            ttsControls.style.display = 'flex';
        }
        
        console.log('TTS controls shown');
    }
    
    hideTTSControls() {
        const ttsControls = document.getElementById('tts-controls');
        if (ttsControls) {
            ttsControls.style.display = 'none';
        }
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

    takePicture() {
        const fileInput = document.getElementById('file-input');
        
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

    async describeCurrentImage() {
        if (!this.currentImage) {
            this.updateStatus('No image to describe', 'error');
            return;
        }

        this.updateStatus(this.getLocalizedString('processing'), 'loading');
        
        try {
            const description = await this.analyzeImage(this.currentImage, true); // Always full description
            this.updateStatus(this.getLocalizedString('imageDescribeSuccess'), 'success');
            
            if (this.morseEnabled) {
                await this.outputMorse(description);
            } else {
                await this.speakDescription(description);
            }
            
        } catch (error) {
            console.error('Description error:', error);
            const errorMsg = this.getLocalizedString('error');
            this.updateStatus(errorMsg, 'error');
            this.speak(errorMsg);
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
            
            // Store the current image and switch to image mode
            this.currentImage = base64Image;
            this.imageTimestamp = Date.now();
            this.updateMode('image');
            
            this.updateStatus(this.getLocalizedString('imageCaptured'), 'success');
            
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
            // Cancel any existing speech first
            if (speechSynthesis.speaking) {
                speechSynthesis.cancel();
            }
            
            // Apply intelligent number formatting
            const formattedText = this.formatNumbersForSpeech(text);
            this.lastSpokenText = formattedText; // Store for repeat functionality
            
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
            
            // Store current utterance reference
            this.currentUtterance = utterance;
            
            // Show TTS controls when speech starts
            utterance.onstart = () => {
                console.log('Speech started');
                this.showTTSControls();
            };
            
            // Hide TTS controls when speech ends
            utterance.onend = () => {
                console.log('Speech ended');
                this.hideTTSControls();
                this.currentUtterance = null;
            };
            
            // Handle speech errors
            utterance.onerror = (event) => {
                console.error('Speech error:', event);
                this.hideTTSControls();
                this.currentUtterance = null;
                // Announce error to user
                this.announceToScreenReader('Speech error occurred');
            };
            
            try {
                speechSynthesis.speak(utterance);
            } catch (error) {
                console.error('Failed to start speech:', error);
                this.hideTTSControls();
                this.currentUtterance = null;
                this.announceToScreenReader('Failed to start speech');
            }
        } else {
            // Speech synthesis not supported
            this.announceToScreenReader('Speech synthesis not supported on this device');
        }
    }

    stopTTS() {
        try {
            if (speechSynthesis.speaking || speechSynthesis.paused) {
                speechSynthesis.cancel();
                console.log('Speech stopped');
            }
            this.hideTTSControls();
            this.currentUtterance = null;
            this.updateStatus(this.getLocalizedString('speechStopped'), 'success');
            this.announceToScreenReader(this.getLocalizedString('speechStopped'));
        } catch (error) {
            console.error('Failed to stop speech:', error);
            this.announceToScreenReader('Failed to stop speech');
        }
    }

    // Add periodic check to ensure TTS state is consistent
    checkTTSState() {
        if (this.currentUtterance) {
            const actualSpeaking = speechSynthesis.speaking;
            const actualPaused = speechSynthesis.paused;
            
            if (!actualSpeaking && !actualPaused) {
                // Speech ended but our state doesn't reflect that
                console.log('Speech ended unexpectedly, cleaning up state');
                this.hideTTSControls();
                this.currentUtterance = null;
            }
        }
    }

    showStopTTSButton() {
        const stopTtsBtn = document.getElementById('stop-tts-btn');
        if (stopTtsBtn) {
            stopTtsBtn.style.display = 'flex';
        }
    }

    hideStopTTSButton() {
        const stopTtsBtn = document.getElementById('stop-tts-btn');
        if (stopTtsBtn) {
            stopTtsBtn.style.display = 'none';
        }
    }

    updateStatus(message, type = '') {
        const statusDiv = document.getElementById('status');
        statusDiv.textContent = message;
        statusDiv.className = `status-message ${type}`;
        statusDiv.style.display = 'flex';
    }

    updateMode(newMode) {
        this.currentMode = newMode;
        
        const chatModeButtons = document.getElementById('chat-mode-buttons');
        const imageModeButtons = document.getElementById('image-mode-buttons');
        const resetBtn = document.getElementById('reset-btn');
        const modeIndicator = document.getElementById('mode-indicator');
        const modeIcon = modeIndicator?.querySelector('.mode-icon');
        const modeText = modeIndicator?.querySelector('.mode-text');
        const modeDescription = modeIndicator?.querySelector('.mode-description');
        
        // Hide all button sets first
        chatModeButtons.style.display = 'none';
        imageModeButtons.style.display = 'none';
        resetBtn.style.display = 'none';
        
        switch (newMode) {
            case 'chat':
                chatModeButtons.style.display = 'flex';
                if (modeIcon) modeIcon.textContent = 'chat';
                if (modeText) modeText.textContent = 'Chat Mode';
                if (modeDescription) modeDescription.textContent = 'Ask me anything by voice';
                break;
                
            case 'image':
                imageModeButtons.style.display = 'flex';
                resetBtn.style.display = 'block';
                if (modeIcon) modeIcon.textContent = 'photo_camera';
                if (modeText) modeText.textContent = 'Image Mode';
                if (modeDescription) modeDescription.textContent = 'Describe or ask about this image';
                break;
        }
        
        // Add animation
        if (modeIndicator) {
            modeIndicator.style.animation = 'none';
            modeIndicator.offsetHeight; // Trigger reflow
            modeIndicator.style.animation = 'fadeIn 0.3s ease-in-out';
        }
    }

    resetToChat() {
        this.currentImage = null;
        this.imageTimestamp = null;
        this.updateMode('chat');
        this.updateStatus(this.getLocalizedString('readyNewChat'), 'success');
        
        // Clear any ongoing speech
        if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
        }
    }

    updateButtonStates() {
        // This method is now replaced by updateMode()
        // Keep for backwards compatibility but delegate to updateMode
        if (this.currentImage && (Date.now() - this.imageTimestamp < 300000)) {
            this.updateMode('image');
        } else {
            this.updateMode('chat');
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

    async handleImageVoiceClick(event) {
        // Special handler for voice queries about images
        if (this.isRecording) {
            await this.stopImageRecording();
        } else {
            await this.startImageRecording();
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
            if (voiceBtn) {
                voiceBtn.classList.add('recording');
                
                const icon = voiceBtn.querySelector('.icon');
                const buttonText = voiceBtn.querySelector('.button-text');
                if (icon) icon.textContent = 'stop';
                if (buttonText) buttonText.textContent = 'STOP';
            }
            
            this.updateStatus(this.getLocalizedString('listening'), 'loading');
            
            // Provide haptic feedback for recording start
            if (this.hapticEnabled && navigator.vibrate) {
                navigator.vibrate([200, 100, 200]);
            }
            
        } catch (error) {
            console.error('Error starting recording:', error);
            const micErrorMsg = {
                'en': 'Microphone access denied. Please allow microphone access.',
                'es': 'Acceso al micrófono denegado. Por favor, permite el acceso al micrófono.',
                'fr': 'Accès au microphone refusé. Veuillez autoriser l\'accès au microphone.',
                'de': 'Mikrofonzugriff verweigert. Bitte erlauben Sie den Mikrofonzugriff.',
                'it': 'Accesso al microfono negato. Concedi l\'accesso al microfono.',
                'pt': 'Acesso ao microfone negado. Permita o acesso ao microfone.',
                'ru': 'Доступ к микрофону запрещен. Разрешите доступ к микрофону.',
                'ja': 'マイクアクセスが拒否されました。マイクアクセスを許可してください。',
                'ko': '마이크 액세스가 거부되었습니다. 마이크 액세스를 허용해 주세요.',
                'zh': '麦克风访问被拒绝。请允许麦克风访问。',
                'ar': 'تم رفض الوصول إلى الميكروفون. يرجى السماح بالوصول إلى الميكروفون.',
                'hi': 'माइक्रोफोन एक्सेस अस्वीकृत। कृपया माइक्रोफोन एक्सेस की अनुमति दें।'
            };
            this.updateStatus(micErrorMsg[this.userLanguage] || micErrorMsg['en'], 'error');
        }
    }

    async startImageRecording() {
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
            
            const askAboutBtn = document.getElementById('ask-about-btn');
            if (askAboutBtn) {
                askAboutBtn.classList.add('recording');
                
                const icon = askAboutBtn.querySelector('.icon');
                const buttonText = askAboutBtn.querySelector('.button-text');
                if (icon) icon.textContent = 'stop';
                if (buttonText) buttonText.textContent = 'STOP';
            }
            
            this.updateStatus(this.getLocalizedString('listening'), 'loading');
            
            // Provide haptic feedback for recording start
            if (this.hapticEnabled && navigator.vibrate) {
                navigator.vibrate([200, 100, 200]);
            }
            
        } catch (error) {
            console.error('Error starting recording:', error);
            const micErrorMsg = {
                'en': 'Microphone access denied. Please allow microphone access.',
                'es': 'Acceso al micrófono denegado. Por favor, permite el acceso al micrófono.',
                'fr': 'Accès au microphone refusé. Veuillez autoriser l\'accès au microphone.',
                'de': 'Mikrofonzugriff verweigert. Bitte erlauben Sie den Mikrofonzugriff.',
                'it': 'Accesso al microfono negato. Concedi l\'accesso al microfono.',
                'pt': 'Acesso ao microfone negado. Permita o acesso ao microfone.',
                'ru': 'Доступ к микрофону запрещен. Разрешите доступ к микрофону.',
                'ja': 'マイクアクセスが拒否されました。マイクアクセスを許可してください。',
                'ko': '마이크 액세스가 거부되었습니다. 마이크 액세스를 허용해 주세요.',
                'zh': '麦克风访问被拒绝。请允许麦克风访问。',
                'ar': 'تم رفض الوصول إلى الميكروفون. يرجى السماح بالوصول إلى الميكروفون.',
                'hi': 'माइक्रोफोन एक्सेस अस्वीकृत। कृपया माइक्रोफोन एक्सेस की अनुमति दें।'
            };
            this.updateStatus(micErrorMsg[this.userLanguage] || micErrorMsg['en'], 'error');
        }
    }

    async stopRecording() {
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            this.mediaRecorder.stop();
            this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
        }
        
        this.isRecording = false;
        
        const voiceBtn = document.getElementById('voice-btn');
        if (voiceBtn) {
            voiceBtn.classList.remove('recording');
            
            const icon = voiceBtn.querySelector('.icon');
            const buttonText = voiceBtn.querySelector('.button-text');
            if (icon) icon.textContent = 'mic';
            if (buttonText) buttonText.textContent = this.getLocalizedString('askButton').replace(/🎤\s*/, '');
        }
        
        this.updateStatus(this.getLocalizedString('processingAudio'), 'loading');
    }

    async stopImageRecording() {
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            this.mediaRecorder.stop();
            this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
        }
        
        this.isRecording = false;
        
        const askAboutBtn = document.getElementById('ask-about-btn');
        if (askAboutBtn) {
            askAboutBtn.classList.remove('recording');
            
            const icon = askAboutBtn.querySelector('.icon');
            const buttonText = askAboutBtn.querySelector('.button-text');
            if (icon) icon.textContent = 'help';
            if (buttonText) buttonText.textContent = 'ASK ABOUT IT';
        }
        
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
            console.log('Starting transcription with blob size:', audioBlob.size);
            
            // Convert to appropriate format for Groq
            const formData = new FormData();
            formData.append('file', audioBlob, 'recording.webm');
            formData.append('model', 'whisper-large-v3-turbo');
            formData.append('language', this.userLanguage);
            formData.append('temperature', '0.0');

            console.log('Sending transcription request to:', `${this.apiBaseUrl}/transcribe`);
            const response = await fetch(`${this.apiBaseUrl}/transcribe`, {
                method: 'POST',
                body: formData
            });

            console.log('Transcription response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Transcription API error:', errorText);
                throw new Error(`Transcription failed: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log('Transcription response data:', data);
            const transcript = data.text || data.transcript;
            
            if (!transcript || transcript.trim().length === 0) {
                throw new Error('No speech detected');
            }

            console.log('Transcription successful:', transcript);
            await this.handleVoiceQuery(transcript);
            
        } catch (error) {
            console.error('Groq transcription error:', error);
            this.updateStatus(`Voice transcription failed: ${error.message}`, 'error');
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
        
        // Only echo what user said if TTS echo is enabled
        if (this.ttsEchoEnabled) {
            this.speak(`Processing your request: ${sanitizedTranscript}`);
        } else {
            // Just announce that we're processing without repeating their words
            const processingMsg = this.getLocalizedString('processing') || 'Processing your request...';
            this.speak(processingMsg);
        }
        
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
            
            this.updateStatus(this.getLocalizedString('voiceQuerySuccess'), 'success');
            
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
        
        // For voice-only mode, provide general assistant capabilities without focusing on images
        return `The user asked: "${cleanTranscript}". You are Augen, an AI assistant. Answer their question helpfully and conversationally. You can discuss any topic - technology, advice, explanations, creative tasks, etc. Only mention your vision capabilities if the user specifically asks about analyzing images or visual content.`;
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