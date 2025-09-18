// Helper to fetch IP addresses from your backend proxy
async function getIPAddresses() {
    const res = await fetch('/api/ip');
    if (!res.ok) return { ipv4: 'Unavailable', ipv6: 'Unavailable' };
    const data = await res.json();
    return { ipv4: data.ipv4, ipv6: data.ipv6 };
}

// ChatGPT API call via backend proxy
async function chatWithGPT(message) {
    const response = await fetch('/api/chatgpt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
    });
    const data = await response.json();
    return data.reply || 'No response';
}

// UI rendering
document.body.innerHTML = `
    <div style="font-family:sans-serif;max-width:500px;margin:auto;padding:2em;">
        <h2>Your IP Addresses</h2>
        <div>IPv4: <span id="ipv4">Loading...</span></div>
        <div>IPv6: <span id="ipv6">Loading...</span></div>
        <hr>
        <h2>Chatbot (ChatGPT)</h2>
        <div id="chatbox" style="border:1px solid #ccc;padding:1em;height:200px;overflow:auto;background:#fafafa;"></div>
        <input id="chatinput" type="text" style="width:80%;" placeholder="Type your message...">
        <button id="sendbtn">Send</button>
    </div>
`;

// Load IP addresses
getIPAddresses().then(({ ipv4, ipv6 }) => {
    document.getElementById('ipv4').textContent = ipv4;
    document.getElementById('ipv6').textContent = ipv6;
});

// Chatbot logic
const chatbox = document.getElementById('chatbox');
const chatinput = document.getElementById('chatinput');
const sendbtn = document.getElementById('sendbtn');

function appendMessage(sender, text) {
    chatbox.innerHTML += `<div><b>${sender}:</b> ${text}</div>`;
    chatbox.scrollTop = chatbox.scrollHeight;
}

sendbtn.onclick = async () => {
    const userMsg = chatinput.value.trim();
    if (!userMsg) return;
    appendMessage('You', userMsg);
    chatinput.value = '';
    appendMessage('Bot', 'Thinking...');
    const botReply = await chatWithGPT(userMsg);
    chatbox.lastChild.remove();
    appendMessage('Bot', botReply);
};
