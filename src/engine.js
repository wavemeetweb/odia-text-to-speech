export class SarvamSpeechEngine {
    constructor() {
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.isRecording = false;
    }

    async startRecording() {
        this.audioChunks = [];
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // WebM container containing Opus audio data pipeline
        this.mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        
        this.mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) this.audioChunks.push(event.data);
        };

        this.mediaRecorder.start();
        this.isRecording = true;
    }

    async stopRecording(apiKey) {
        return new Promise((resolve, reject) => {
            if (!this.mediaRecorder) return reject("No active recording session found.");

            this.mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
                this.mediaRecorder.stream.getTracks().forEach(track => track.stop());

                try {
                    const transcribedText = await this._sendToSarvam(audioBlob, apiKey);
                    resolve(transcribedText);
                } catch (err) {
                    reject(err);
                }
            };

            this.mediaRecorder.stop();
            this.isRecording = false;
        });
    }

    async _sendToSarvam(audioBlob, apiKey) {
        const formData = new FormData();
        
        // Target structural file requirements for Sarvam speech framework
        formData.append('file', audioBlob, 'speech.wav');
        formData.append('language_code', 'or-IN'); 
        formData.append('model', 'saaras:v1');

        // Low-latency synchronous STT API pipeline
        const response = await fetch('https://api.sarvam.ai/speech-to-text', {
            method: 'POST',
            headers: { 
                'api-subscription-key': apiKey
            },
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP Error ${response.status}: Pipeline connection failure.`);
        }

        const data = await response.json();
        return data.transcript || "";
    }
}
