const socket = io();
const messageContainer = document.getElementById('message-container');
const chatContainer = document.getElementById('chat-container');
const messageForm = document.getElementById('send-container');
const messageInput = document.getElementById('message-input');

function runFunction() {
    chatContainer.scrollTop = chatContainer.scrollHeight;
}
const t=setInterval(runFunction,0);

$('#fetch-button').click(() => {
    let randomNumber = Math.floor(Math.random() * 199) + 800;
    fetch(`https://the-one-api.dev/v2/quote/5cd96e05de30eff6ebcce${randomNumber}`, {
        headers: new Headers({
            Authorization: 'Bearer IGf47gpefBGHvAgsnQd9'
        })
    }).then(r => r.json()).then(r => {
        appendMessage(`You: ${r['docs']['0']['dialog']}`);
        socket.emit('send-chat-message', r['docs']['0']['dialog']);
    });
});

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