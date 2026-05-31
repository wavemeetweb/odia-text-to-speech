import { SpeechEngine } from './engine.js';

document.addEventListener('DOMContentLoaded', () => {
    const outputCanvas = document.getElementById('outputCanvas');
    const toggleRecordBtn = document.getElementById('toggleRecordBtn');
    const btnText = toggleRecordBtn.querySelector('.btn-text');
    const clearCanvasBtn = document.getElementById('clearCanvasBtn');

    let engine;

    try {
        engine = new SpeechEngine({ lang: 'en-US' });
    } catch (error) {
        outputCanvas.innerHTML = `<span style="color: var(--accent-danger);">${error.message}</span>`;
        toggleRecordBtn.disabled = true;
        return;
    }

    // Capture execution loop
    const handleSpeechResults = ({ final, interim }) => {
        outputCanvas.innerHTML = `<span>${final}</span><span style="color: var(--text-interim);">${interim}</span>`;
        outputCanvas.scrollTop = outputCanvas.scrollHeight;
    };

    // UI state recovery loop
    const handleSpeechDisconnections = () => {
        toggleRecordBtn.setAttribute('data-state', 'idle');
        btnText.textContent = "Start Listening";
    };

    toggleRecordBtn.addEventListener('click', () => {
        const currentState = toggleRecordBtn.getAttribute('data-state');

        if (currentState === 'idle') {
            toggleRecordBtn.setAttribute('data-state', 'listening');
            btnText.textContent = "Stop Listening";
            engine.start(handleSpeechResults, handleSpeechDisconnections);
        } else {
            engine.stop();
            handleSpeechDisconnections();
        }
    });

    clearCanvasBtn.addEventListener('click', () => {
        engine.clear();
        outputCanvas.innerHTML = '';
    });
});
