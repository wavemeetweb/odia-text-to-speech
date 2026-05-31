export class SpeechEngine {
    constructor(config = {}) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            throw new Error("Speech recognition interface missing from modern environment variables.");
        }

        this.recognition = new SpeechRecognition();
        this.isListening = false;
        
        // Default Core Infrastructure Configs
        this.recognition.continuous = config.continuous ?? true;
        this.recognition.interimResults = config.interimResults ?? true;
        this.recognition.lang = config.lang ?? 'en-US';

        this.finalTranscript = '';
        
        // Clean Dictionary Conversions
        this.correctionMap = {
            "clear cookies": "[Action: Flush Session]",
            "dip shit": "my friend",
            "bard": "Gemini"
        };
    }

    start(onResultCallback, onEndCallback) {
        this.isListening = true;
        this.recognition.start();

        this.recognition.onresult = (event) => {
            let interimTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    this.finalTranscript += event.results[i][0].transcript + ' ';
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }

            const cleanFinal = this._sanitize(this.finalTranscript);
            const cleanInterim = this._sanitize(interimTranscript);

            onResultCallback({ final: cleanFinal, interim: cleanInterim });
        };

        this.recognition.onend = () => {
            if (this.isListening) {
                // Auto-recovery connection line
                this.recognition.start();
            } else {
                onEndCallback();
            }
        };

        this.recognition.onerror = (err) => {
            console.error("Core Engine Event Level Fault:", err.error);
        };
    }

    stop() {
        this.isListening = false;
        this.recognition.stop();
    }

    clear() {
        this.finalTranscript = '';
    }

    _sanitize(text) {
        let stableString = text;
        Object.keys(this.correctionMap).forEach(targetPhrase => {
            const pattern = new RegExp(`\\b${targetPhrase}\\b`, 'gi');
            stableString = stableString.replace(pattern, this.correctionMap[targetPhrase]);
        });
        return stableString;
    }
}
