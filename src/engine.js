export class SpeechEngine {
    constructor(config = {}) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            throw new Error("Speech recognition pipeline unsupported in this client engine layout.");
        }

        this.recognition = new SpeechRecognition();
        this.isListening = false;
        
        // Locked strictly into Odia Language Matrix
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'or-IN';

        this.finalTranscript = '';
        
        // Phonetical Sanitize Rules for Odia String Sequences
        this.correctionMap = {
            "ହେଲୋ": "ନମସ୍କାର",
            "ଗୁଗଲ": "Gemini"
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
                // Persistent connection wrapper for background cuts
                this.recognition.start();
            } else {
                onEndCallback();
            }
        };

        this.recognition.onerror = (err) => {
            if(err.error === 'no-speech') return; // Silence non-critical logs
            console.error("Internal API Level Matrix Fault:", err.error);
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
