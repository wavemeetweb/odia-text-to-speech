import { SpeechEngine } from './engine.js';

document.addEventListener('DOMContentLoaded', () => {
    const outputCanvas = document.getElementById('outputCanvas');
    const toggleRecordBtn = document.getElementById('toggleRecordBtn');
    const btnText = toggleRecordBtn.querySelector('.btn-text');
    const clearCanvasBtn = document.getElementById('clearCanvasBtn');
    const copyTextBtn = document.getElementById('copyTextBtn');
    const statusIndicator = document.getElementById('statusIndicator');

    let engine;

    try {
        engine = new SpeechEngine();
    } catch (error) {
        outputCanvas.innerHTML = `<span style="color: var(--accent-danger); font-size: 0.95rem;">${error.message}</span>`;
        toggleRecordBtn.disabled = true;
        return;
    }

    // Interactive Textbox Focus Hook: Clicking/tapping canvas instantly drops focus natively
    outputCanvas.addEventListener('click', () => {
        outputCanvas.focus();
    });

    const handleSpeechResults = ({ final, interim }) => {
        outputCanvas.innerHTML = `<span>${final}</span><span style="color: var(--text-interim);">${interim}</span>`;
        outputCanvas.scrollTop = outputCanvas.scrollHeight;
    };

    const handleSpeechDisconnections = () => {
        toggleRecordBtn.setAttribute('data-state', 'idle');
        btnText.textContent = "Listen";
        statusIndicator.textContent = "SYSTEM IDLE";
        statusIndicator.style.color = "var(--text-muted)";
    };

    toggleRecordBtn.addEventListener('click', () => {
        const currentState = toggleRecordBtn.getAttribute('data-state');

        if (currentState === 'idle') {
            toggleRecordBtn.setAttribute('data-state', 'listening');
            btnText.textContent = "Stop";
            statusIndicator.textContent = "LIVE CAPTURE (OR-IN)";
            statusIndicator.style.color = "var(--accent-primary)";
            engine.start(handleSpeechResults, handleSpeechDisconnections);
        } else {
            engine.stop();
            handleSpeechDisconnections();
        }
    });

    // Native Mobile Clipboard Integration Layer
    copyTextBtn.addEventListener('click', async () => {
        const textToCopy = outputCanvas.innerText;
        if (!textToCopy) return;

        try {
            await navigator.clipboard.writeText(textToCopy);
            const originalText = copyTextBtn.textContent;
            copyTextBtn.textContent = "Copied!";
            copyTextBtn.style.borderColor = "var(--accent-primary)";
            setTimeout(() => {
                copyTextBtn.textContent = originalText;
                copyTextBtn.style.borderColor = "rgba(255, 255, 255, 0.08)";
            }, 1500);
        } catch (err) {
            console.error("Clipboard drop trace fault:", err);
        }
    });

    clearCanvasBtn.addEventListener('click', () => {
        engine.clear();
        outputCanvas.innerHTML = '';
    });
});
