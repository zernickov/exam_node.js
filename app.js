const express = require('express');
const session = require('express-session');
require('dotenv').config();
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    name: 'ExamSession',
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false }
}));

const authRoute = require('./routes/auth.js');
const viewRoute = require('./routes/views.js');
app.use(authRoute);
app.use(viewRoute);

const users = {};

io.sockets.on('connection', (socket) => {
    socket.on('new-user', (name) => {
        users[socket.id] = name;
        socket.broadcast.emit('user-connected', name);
    });
    socket.on('send-chat-message', (message) => {
        socket.broadcast.emit('chat-message', { message: message, name: users[socket.id] });
    });
    socket.on('disconnect', () => {
        socket.broadcast.emit('user-disconnected', users[socket.id]);
        delete users[socket.id];
    });
});

const port = process.env.PORT || 8080;

http.listen(port, (error) => {
    if (error) {
        console.log('Server couldn\'t start:', error);
    }
    console.log('Server started on port:', Number(port));
});