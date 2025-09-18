
// Helper to fetch IP addresses from your backend proxy
async function getIPAddresses() {
    try {
        const res = await fetch('/api/ip');
        if (!res.ok) return { ipv4: 'Unavailable', ipv6: 'Unavailable' };
        const data = await res.json();
        return { ipv4: data.ipv4, ipv6: data.ipv6 };
    } catch {
        return { ipv4: 'Unavailable', ipv6: 'Unavailable' };
    }
}

// ChatGPT API call via backend proxy
async function chatWithGPT(message) {
    try {
        const response = await fetch('/api/chatgpt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
        });
        const data = await response.json();
        return data.reply || 'No response';
    } catch {
        return 'Error connecting to ChatGPT.';
    }
}

// Enhance existing HTML UI
window.addEventListener('DOMContentLoaded', () => {
    // IP addresses
    getIPAddresses().then(({ ipv4, ipv6 }) => {
        if (document.getElementById('ipv4')) document.getElementById('ipv4').textContent = ipv4;
        if (document.getElementById('ipv6')) document.getElementById('ipv6').textContent = ipv6;
    });

    // Chatbot logic
    const messagesDiv = document.getElementById('chatbot-messages');
    const input = document.getElementById('chatbot-input');
    const sendBtn = document.getElementById('chatbot-send');

    function appendMessage(sender, text) {
        if (!messagesDiv) return;
        const msg = document.createElement('div');
        msg.innerHTML = `<strong>${sender}:</strong> ${text}`;
        messagesDiv.appendChild(msg);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    if (sendBtn && input) {
        sendBtn.addEventListener('click', async () => {
            const msg = input.value.trim();
            if (!msg) return;
            appendMessage('You', msg);
            input.value = '';
            appendMessage('Bot', 'Thinking...');
            const botReply = await chatWithGPT(msg);
            // Remove 'Thinking...' message
            if (messagesDiv.lastChild && messagesDiv.lastChild.textContent.includes('Thinking...')) {
                messagesDiv.lastChild.remove();
            }
            appendMessage('Bot', botReply);
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                sendBtn.click();
            }
        });
    }

    // Welcome message
    appendMessage('Bot', 'Hello! Ask me anything.');
});
