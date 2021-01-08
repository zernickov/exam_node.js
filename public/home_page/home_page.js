const socket = io();
const messageContainer = document.getElementById('message-container');
const chatContainer = document.getElementById('chat-container');
const messageForm = document.getElementById('send-container');
const messageInput = document.getElementById('message-input');

function runFunction() {
    chatContainer.scrollTop = chatContainer.scrollHeight;
}
const t = setInterval(runFunction,0);

const header = {
    headers: new Headers({
        Authorization: 'Bearer IGf47gpefBGHvAgsnQd9'
    })
};

$('#fetch-quote-button').click(() => {
    let randomNumber = Math.floor(Math.random() * 199) + 800;
    fetch(`https://the-one-api.dev/v2/quote/5cd96e05de30eff6ebcce${randomNumber}`, header)
        .then(r => r.json()).then(r => {
        fetch(`https://the-one-api.dev/v2/movie`, header).then(r1 => r1.json()).then(r1 => {
            console.log(r1);
            r1['docs'].forEach(movie => {
                if (movie['_id'] === r['docs']['0']['movie']) {
                    const message = `${r['docs']['0']['dialog']}` + '\n' +
                        '--- Which movie is this quote from? ---';
                    appendMessage('You:', message);
                    appendMessage('Answer(only you can se this): ', movie['name']);
                    socket.emit('send-chat-message', message);
                }
            });
        });
    });
});

$('#fetch-movies-button').click(() => {
    fetch(`https://the-one-api.dev/v2/movie`, header).then(r => r.json()).then(r => {
        const mes = `The Hobbit: ${r['docs']['2']['name']}, 
        The Hobbit: ${r['docs']['3']['name']},
        The Hobbit: ${r['docs']['4']['name']},
        LOTR: ${r['docs']['6']['name']},
        LOTR: ${r['docs']['5']['name']},
        LOTR: ${r['docs']['7']['name']}
        --- Which is your favourite of the movies? ---`;
        appendMessage('You:', mes);
        socket.emit('send-chat-message', mes);
    });
});

$('#fetch-chapter-button').click(() => {
    let randomNumber61 = Math.floor(Math.random() * 62);
    fetch(`https://the-one-api.dev/v2/chapter`, header).then(r => r.json()).then(r => {
        fetch(`https://the-one-api.dev/v2/book`, header).then(r1 => r1.json()).then(r1 => {
            const message = `${r['docs'][randomNumber61]['chapterName']}`;
            r1['docs'].forEach(book => {if (book['_id'] === `${r['docs'][randomNumber61]['book']}`){
                const finishedMessage = message + 'from ' + book['name'] + '\n' +
                '--- What do you think about that chapter? --- ';
                appendMessage('You:', finishedMessage);
                socket.emit('send-chat-message', finishedMessage);
            }});
        });
    });
});

function appendMessage(name, message) {
    const nameElement = document.createElement('span');
    const messageElement = document.createElement('span');
    nameElement.style.cssText = 'color:red; padding-right: 10px';
    nameElement.innerText = name;
    messageElement.innerText = message + '\n';
    messageContainer.append(nameElement, messageElement);
}

// const name = req.session.username;
const str = document.cookie;
const name = str.split('=').slice(-1);
appendMessage('You joined', '');
socket.emit('new-user', name);


socket.on('chat-message', (data) => {
    appendMessage(`${data.name}:`, `${data.message}`);
});

socket.on('user-connected', (name) => {
    appendMessage(`${name} connected`, ``);
});

socket.on('user-disconnected', (name) => {
    appendMessage(`${name} disconnected`, ``)

});

messageForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const message = messageInput.value;
    appendMessage(`You:`, `${message}`);
    socket.emit('send-chat-message', message);
    messageInput.value = '';
});