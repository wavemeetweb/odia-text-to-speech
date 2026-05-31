import { SarvamSpeechEngine } from './engine.js';

document.addEventListener('DOMContentLoaded', () => {
    const outputCanvas = document.getElementById('outputCanvas');
    const toggleRecordBtn = document.getElementById('toggleRecordBtn');
    const btnText = toggleRecordBtn.querySelector('.btn-text');
    const clearCanvasBtn = document.getElementById('clearCanvasBtn');
    const copyTextBtn = document.getElementById('copyTextBtn');
    const statusIndicator = document.getElementById('statusIndicator');
    
    const configModal = document.getElementById('configModal');
    const sarvamApiKeyInput = document.getElementById('sarvamApiKey');
    const saveKeyBtn = document.getElementById('saveKeyBtn');
    const settingsBtn = document.getElementById('settingsBtn');

    const engine = new SarvamSpeechEngine();

    // Verification checking for existing subscription credentials
    const savedKey = localStorage.getItem('sarvam_app_key');
    if (!savedKey) {
        configModal.classList.add('active');
    } else {
        sarvamApiKeyInput.value = savedKey;
    }

    saveKeyBtn.addEventListener('click', () => {
        const inputKey = sarvamApiKeyInput.value.trim();
        if (!inputKey) {
            alert("Please enter a valid Sarvam Subscription Key.");
            return;
        }
        localStorage.setItem('sarvam_app_key', inputKey);
        configModal.classList.remove('active');
    });

    settingsBtn.addEventListener('click', () => {
        configModal.classList.add('active');
        sarvamApiKeyInput.focus();
    });

    outputCanvas.addEventListener('click', () => outputCanvas.focus());

    toggleRecordBtn.addEventListener('click', async () => {
        const apiKey = localStorage.getItem('sarvam_app_key');
        if (!apiKey) {
            configModal.classList.add('active');
            return;
        }

        if (!engine.isRecording) {
            try {
                await engine.startRecording();
                toggleRecordBtn.setAttribute('data-state', 'listening');
                btnText.textContent = "Stop";
                statusIndicator.textContent = "LISTENING (OR-IN)...";
                statusIndicator.style.color = "var(--accent-danger)";
            } catch (err) {
                outputCanvas.innerHTML = `<span style="color: var(--accent-danger);">Hardware Access Error: ${err.message}</span>`;
            }
        } else {
            statusIndicator.textContent = "COMPUTING SARVAM INFRASTRUCTURE...";
            statusIndicator.style.color = "var(--accent-cyan)";
            btnText.textContent = "Processing...";
            toggleRecordBtn.disabled = true;

            try {
                const odiaText = await engine.stopRecording(apiKey);
                if (odiaText) {
                    outputCanvas.innerHTML += `<span>${odiaText} </span>`;
                    outputCanvas.scrollTop = outputCanvas.scrollHeight;
                }
            } catch (err) {
                if(err.message.includes("401") || err.message.includes("Unauthorized") || err.message.includes("key")) {
                    alert("Invalid Subscription Key. Verification sequence failed.");
                    configModal.classList.add('active');
                } else {
                    outputCanvas.innerHTML += `<br><span style="color: var(--accent-danger);">Sarvam Exception: ${err.message}</span>`;
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
