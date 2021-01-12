const socket = io();
const messageContainer = document.getElementById('message-container');
const chatContainer = document.getElementById('chat-container');
const messageForm = document.getElementById('send-container');
const messageInput = document.getElementById('message-input');
const header = {
    headers: new Headers({
        Authorization: 'Bearer IGf47gpefBGHvAgsnQd9'
    })
};

function scrollFunction() {
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

$('#fetch-quote-button').click(() => {
    let randomNumber = Math.floor(Math.random() * 199) + 800;
    fetch(`https://the-one-api.dev/v2/quote/5cd96e05de30eff6ebcce${randomNumber}`, header)
        .then(quote => quote.json()).then(quote => {
        fetch(`https://the-one-api.dev/v2/movie`, header).then(movies => movies.json()).then(movies => {
            movies['docs'].forEach(movie => {
                if (movie['_id'] === quote['docs']['0']['movie']) {
                    const message = `${quote['docs']['0']['dialog']}` + '\n' +
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
    fetch(`https://the-one-api.dev/v2/movie`, header).then(movies => movies.json()).then(movies => {
        const message = `The Hobbit: ${movies['docs']['2']['name']}, 
        The Hobbit: ${movies['docs']['3']['name']},
        The Hobbit: ${movies['docs']['4']['name']},
        LOTR: ${movies['docs']['6']['name']},
        LOTR: ${movies['docs']['5']['name']},
        LOTR: ${movies['docs']['7']['name']}
        --- Which is your favourite of the movies? ---`;
        appendMessage('You:', message);
        socket.emit('send-chat-message', message);
    });
});

$('#fetch-chapter-button').click(() => {
    let randomNumber61 = Math.floor(Math.random() * 62);
    fetch(`https://the-one-api.dev/v2/chapter`, header).then(chapters => chapters.json()).then(chapters => {
        fetch(`https://the-one-api.dev/v2/book`, header).then(books => books.json()).then(books => {
            const message = `${chapters['docs'][randomNumber61]['chapterName']}`;
            books['docs'].forEach(book => {if (book['_id'] === `${r['docs'][randomNumber61]['book']}`){
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
    nameElement.style.cssText = 'color: #bf758c; padding-right: 10px';
    nameElement.innerText = name;
    messageElement.innerText = message + '\n';
    messageContainer.append(nameElement, messageElement);
    scrollFunction();
}


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


/*
async function fetchMovieButton(){
    let randomNumber = Math.floor(Math.random() * 199) + 800;
    let response = await fetch(`https://the-one-api.dev/v2/quote/5cd96e05de30eff6ebcce${randomNumber}`, header);
    let quote = await response.json();

    let response1 = await fetch(`https://the-one-api.dev/v2/movie`, header);
    let movies = await response1.json();

    movies['docs'].forEach(movie => {
        if (movie['_id'] === quote['docs']['0']['movie']) {
            const message = `${quote['docs']['0']['dialog']}` + '\n' +
                '--- Which movie is this quote from? ---';
            appendMessage('You:', message);
            appendMessage('Answer(only you can se this): ', movie['name']);
            socket.emit('send-chat-message', message);
        }
    });
}
*/