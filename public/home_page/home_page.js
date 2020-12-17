const socket = io('http://localhost:3000');
const messageContainer = document.getElementById('message-container');
const messageForm = document.getElementById('send-container');
const messageInput = document.getElementById('message-input');

function appendMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.innerText = message;
    messageContainer.append(messageElement);
}

// const name = req.session.username;
const str = document.cookie;
const name = str.split('=').slice(-1);
appendMessage('You joined');
socket.emit('new-user', name);

socket.on('chat-message', (data) => {
    appendMessage(`${data.name}: ${data.message}`);
});

socket.on('user-connected', (name) => {
    appendMessage(`${name} connected`);
});

socket.on('user-disconnected', (name) => {
    appendMessage(`${name} disconnected`);
});

messageForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const message = messageInput.value;
    appendMessage(`You: ${message}`);
    socket.emit('send-chat-message', message);
    messageInput.value = '';
});