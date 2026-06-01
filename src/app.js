import { OdiaSpeechEngine } from './engine.js';

const engine = new OdiaSpeechEngine();

const listenBtn = document.getElementById('listen-btn');
const copyBtn = document.getElementById('copy-btn');
const clearBtn = document.getElementById('clear-btn');
const textArea = document.getElementById('text-area');
const statusIndicator = document.getElementById('status-indicator');

// 🎤 INTERCEPTOR 1: LISTEN AND SPEAK TOGGLE TRACKER
listenBtn.addEventListener('click', async () => {
    if (!engine.isRecording) {
        try {
            await engine.startRecording();
            
            // UI Mutation: Change layout to active audio logging state
            listenBtn.innerText = "Stop";
            listenBtn.style.borderColor = "#f43f5e"; // Glowing Rose Red
            listenBtn.style.color = "#f43f5e";
            statusIndicator.innerText = "LISTENING...";
            statusIndicator.style.color = "#f43f5e";
            
        } catch (error) {
            textArea.placeholder = "Error: System could not acquire hardware microphone authorization.";
        }
    } else {
        try {
            // UI Mutation: Shift to cloud computation loading layout
            statusIndicator.innerText = "PROCESSING...";
            statusIndicator.style.color = "#22d3ee"; // Cyber Cyan 
            listenBtn.innerText = "Listen";
            listenBtn.style.borderColor = ""; 
            listenBtn.style.color = "";

            // Disconnect recording track and collect response data from Colab GPU
            const transcribedText = await engine.stopRecording();
            
            // Deliver complete string context to viewport textarea
            textArea.value = transcribedText;
            
            // Revert state flags to default static system baseline
            statusIndicator.innerText = "SYSTEM READY";
            statusIndicator.style.color = ""; 
            
        } catch (error) {
            textArea.value = "Error: Upstream pipeline interface failure. Verify Google Colab log matrix and active Ngrok URL connection.";
            statusIndicator.innerText = "SERVER ERROR";
            statusIndicator.style.color = "#f43f5e";
            listenBtn.innerText = "Listen";
            listenBtn.style.borderColor = "";
            listenBtn.style.color = "";
        }
    }
});

// 📋 INTERCEPTOR 2: CLIPBOARD EXPORT TRUCKER
copyBtn.addEventListener('click', () => {
    if (textArea.value.trim() !== "" && !textArea.value.startsWith("Error:")) {
        navigator.clipboard.writeText(textArea.value);
        
        // Brief asynchronous dashboard response message
        const ancestralText = statusIndicator.innerText;
        statusIndicator.innerText = "COPIED TO CLIPBOARD!";
        statusIndicator.style.color = "#10b981"; // Emerald green
        
        setTimeout(() => {
            statusIndicator.innerText = ancestralText;
            statusIndicator.style.color = "";
        }, 2000);
    }
});

// 🧹 INTERCEPTOR 3: TERMINAL FLUSH PIPELINE
clearBtn.addEventListener('click', () => {
    textArea.value = "";
    textArea.placeholder = "Initiate voice sequence...";
    statusIndicator.innerText = "SYSTEM READY";
    statusIndicator.style.color = "";
});
