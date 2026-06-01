import { OdiaSpeechEngine } from './engine.js';

const engine = new OdiaSpeechEngine();

const listenBtn = document.getElementById('listen-btn');
const copyBtn = document.getElementById('copy-btn');
const clearBtn = document.getElementById('clear-btn');
const textArea = document.getElementById('text-area');
const statusIndicator = document.getElementById('status-indicator');

// 🎤 ACTION 1: CAPTURE AND TRANSMIT AUDIO PAYLOADS
listenBtn.addEventListener('click', async () => {
    if (!engine.isRecording) {
        try {
            await engine.startRecording();
            
            // Mutate layout components to Recording Mode
            listenBtn.innerText = "Stop";
            listenBtn.style.borderColor = "#ef4444"; 
            listenBtn.style.color = "#ef4444";
            statusIndicator.innerText = "LISTENING...";
            statusIndicator.style.color = "#ef4444";
            
        } catch (error) {
            textArea.placeholder = "Error: System failed to claim active mic configuration pipeline.";
        }
    } else {
        try {
            // Transition layout components to Cloud Evaluation State
            statusIndicator.innerText = "PROCESSING...";
            statusIndicator.style.color = "#22d3ee"; 
            listenBtn.innerText = "Listen";
            listenBtn.style.borderColor = ""; 
            listenBtn.style.color = "";

            // Shut streaming layers down and receive response from T4 Cloud Engine
            const transcribedText = await engine.stopRecording();
            textArea.value = transcribedText;
            
            // Reset to clean operational state
            statusIndicator.innerText = "System Ready";
            statusIndicator.style.color = ""; 
            
        } catch (error) {
            textArea.value = "Error: Connection lost with GPU cluster. Reverify active Colab ngrok tunnel parameters.";
            statusIndicator.innerText = "SERVER ERROR";
            statusIndicator.style.color = "#ef4444";
            listenBtn.innerText = "Listen";
            listenBtn.style.borderColor = "";
            listenBtn.style.color = "";
        }
    }
});

// 📋 ACTION 2: COPIER BUFFER LAYER
copyBtn.addEventListener('click', () => {
    if (textArea.value.trim() !== "" && !textArea.value.startsWith("Error:")) {
        navigator.clipboard.writeText(textArea.value);
        
        const baselineText = statusIndicator.innerText;
        statusIndicator.innerText = "COPIED TO CLIPBOARD!";
        statusIndicator.style.color = "#10b981"; // Emerald confirmation accent
        
        setTimeout(() => {
            statusIndicator.innerText = baselineText;
            statusIndicator.style.color = "";
        }, 2000);
    }
});

// 🧹 ACTION 3: CLEAR DATA PIPELINE
clearBtn.addEventListener('click', () => {
    textArea.value = "";
    textArea.placeholder = "Initiate voice sequence...";
    statusIndicator.innerText = "System Ready";
    statusIndicator.style.color = "";
});
