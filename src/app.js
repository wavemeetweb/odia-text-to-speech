import { GroqSpeechEngine } from './engine.js';

document.addEventListener('DOMContentLoaded', () => {
    const outputCanvas = document.getElementById('outputCanvas');
    const toggleRecordBtn = document.getElementById('toggleRecordBtn');
    const btnText = toggleRecordBtn.querySelector('.btn-text');
    const clearCanvasBtn = document.getElementById('clearCanvasBtn');
    const copyTextBtn = document.getElementById('copyTextBtn');
    const statusIndicator = document.getElementById('statusIndicator');
    
    const configModal = document.getElementById('configModal');
    const groqApiKeyInput = document.getElementById('groqApiKey');
    const saveKeyBtn = document.getElementById('saveKeyBtn');
    const settingsBtn = document.getElementById('settingsBtn');

    const engine = new GroqSpeechEngine();

    const savedKey = localStorage.getItem('groq_app_key');
    if (!savedKey) {
        configModal.classList.add('active');
    } else {
        groqApiKeyInput.value = savedKey;
    }

    saveKeyBtn.addEventListener('click', () => {
        const inputKey = groqApiKeyInput.value.trim();
        if (!inputKey) {
            alert("Please enter a valid Groq API Key.");
            return;
        }
        localStorage.setItem('groq_app_key', inputKey);
        configModal.classList.remove('active');
    });

    settingsBtn.addEventListener('click', () => {
        configModal.classList.add('active');
        groqApiKeyInput.focus();
    });

    outputCanvas.addEventListener('click', () => outputCanvas.focus());

    toggleRecordBtn.addEventListener('click', async () => {
        const apiKey = localStorage.getItem('groq_app_key');
        if (!apiKey) {
            configModal.classList.add('active');
            return;
        }

        if (!engine.isRecording) {
            try {
                await engine.startRecording();
                toggleRecordBtn.setAttribute('data-state', 'listening');
                btnText.textContent = "Stop";
                statusIndicator.textContent = "RECORDING (OR-IN)...";
                statusIndicator.style.color = "var(--accent-danger)";
            } catch (err) {
                outputCanvas.innerHTML = `<span style="color: var(--accent-danger);">Mic Access Error: ${err.message}</span>`;
            }
        } else {
            statusIndicator.textContent = "PROCESSING LPU...";
            statusIndicator.style.color = "var(--accent-cyan)";
            btnText.textContent = "Processing...";
            toggleRecordBtn.disabled = true;

            try {
                const odiaText = await engine.stopRecording(apiKey);
                outputCanvas.innerHTML += `<span>${odiaText} </span>`;
                outputCanvas.scrollTop = outputCanvas.scrollHeight;
            } catch (err) {
                if(err.message.includes("API key") || err.message.includes("Unauthorized")) {
                    alert("Invalid API key. Please check your config parameters.");
                    configModal.classList.add('active');
                } else {
                    outputCanvas.innerHTML += `<br><span style="color: var(--accent-danger);">Groq Error: ${err.message}</span>`;
                }
            } finally {
                toggleRecordBtn.disabled = false;
                toggleRecordBtn.setAttribute('data-state', 'idle');
                btnText.textContent = "Listen";
                statusIndicator.textContent = "SYSTEM READY";
                statusIndicator.style.color = "var(--text-muted)";
            }
        }
    });

    copyTextBtn.addEventListener('click', async () => {
        const textToCopy = outputCanvas.innerText;
        if (!textToCopy) return;
        try {
            await navigator.clipboard.writeText(textToCopy);
            const originalText = copyTextBtn.textContent;
            copyTextBtn.textContent = "Copied";
            setTimeout(() => copyTextBtn.textContent = originalText, 1500);
        } catch (err) {
            console.error(err);
        }
    });

    clearCanvasBtn.addEventListener('click', () => {
        outputCanvas.innerHTML = '';
    });
});
