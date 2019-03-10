const express = require('express');
const path = require('path');
const socket = require('socket.io');
const http = require('http');
const bodyParser = require('body-parser');
const fs = require('fs');

const {
    generateLocation,
    emitMessage,
    weather
} = require('./functions');

const {
    Users
} = require('./users');
const User = new Users();

const port = process.env.PORT || 3000;
const app = express();
const publicPath = path.join(__dirname, '../public');
const server = http.createServer(app);
const io = socket(server);

app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.sendFile(publicPath + '/index.html');
});

app.get('/chat', (req, res) => {
    const userName = req.query.name;
    const room = req.query.room;

    if ((userName && room) && userName.trim() !== '' && room.trim() !== '') {
        res.sendFile(publicPath + '/chat.html');
    } else {
        res.redirect('/');
    }
});

app.get('/current-temperature', (req, res) => {
    const lat = req.query.lat;
    const lng = req.query.lng;

    res.header('Access-Control-Allow-Origin', '*', 'Content-Type', 'image/gif');

    if (!lng || !lat) {
        return res.send({
            error: 'Latitute and longitute are required'
        });
    }

    weather(lat, lng).then((body) => {
        const currentTemp = body.currently.temperature;
        const weather = body.currently.icon;
        if (!weather) {
            weather = 'weather';
        }
        const img = fs.readFileSync(path.join(__dirname, `/weather-img/${weather}.svg`));

        res.send({
            currentTemp,
            img: img.toString('binary')
        });
    });
});

io.on('connection', function (socket) {

    socket.on('createMessage', function (msg) {
        const user = User.getUser(socket.id);
        if (user) {
            if (msg.text.trim() !== '') {
                msg.from = user.name;
                io.to(user.room).emit('newMessage', emitMessage(msg));
            }
        }
    });

    socket.on('join', (data) => {

        socket.join(data.room);
        User.removeUser(socket.id);
        User.addUser(socket.id, data.name, data.room);

        io.to(data.room).emit('UpdateUserList', User.getUserList(data.room));

        socket.broadcast.to(data.room).emit('newMessage', emitMessage({
            from: 'Admin',
            text: `${data.name} has joined!`
        }));

    });

    socket.on('disconnect', function () {
        const user = User.removeUser(socket.id);

        if (user) {
            io.to(user.room).emit('UpdateUserList', User.getUserList(user.room));
            io.to(user.room).emit('newMessage', emitMessage({
                from: 'Admin',
                text: `${user.name} has left!`
            }));
        }
    });

    socket.on('geolocation', (location) => {
        const user = User.getUser(socket.id);
        if (user) {
            location.from = user.name;
            io.to(user.room).emit('location', generateLocation(location));
        }
    });
});

app.use(express.static(publicPath));

server.listen(port);