const express = require('express');
const path = require('path');
const socket = require('socket.io');
const http = require('http');
const bodyParser = require('body-parser');
const fs = require('fs');

const {
    makeAndSaveModel,
    generateLocation,
    emitMessage,
    weather
} = require('./functions');

const {
    messageModel
} = require('./db/models/message-model');

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
        const img = fs.readFileSync(path.join(__dirname, `../weather-img/${weather}.svg`));

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
                makeAndSaveModel(msg.from, msg.text, user.room, 'message');
            }
        }
    });

    socket.on('join', (data) => {
        socket.join(data.room);
        User.removeUser(socket.id);
        User.addUser(socket.id, data.name, data.room);

        io.to(data.room).emit('UpdateUserList', User.getUserList(data.room));

        if (User.getUserList(data.room).length > 1) {
            messageModel.findOneAndDelete({
                text: `${data.name} has joined!`
            });
            makeAndSaveModel('Admin', `${data.name} has joined!`, data.room, 'message');
        }

        socket.broadcast.to(data.room).emit('newMessage', emitMessage({
            from: 'Admin',
            text: `${data.name} has joined!`
        }));

        messageModel.find({
            room: data.room
        }, (err, res) => {
            res.forEach((message) => {
                if (message) {
                    if (message.type === 'message') {
                        io.to(socket.id).emit('newMessage', ({
                            from: message.from,
                            text: message.text,
                            createAt: {
                                time: message.createAt
                            }
                        }));
                    } else if (message.type === 'location') {
                        io.to(socket.id).emit('location', ({
                            from: message.from,
                            url: message.text,
                            createAt: {
                                time: message.createAt
                            }
                        }));
                    }
                }
            });
        });
    });

    socket.on('disconnect', function () {
        const user = User.removeUser(socket.id);

        if (user) {
            if (User.getUserList(user.room).length > 0) {
                io.to(user.room).emit('UpdateUserList', User.getUserList(user.room));
                io.to(user.room).emit('newMessage', emitMessage({
                    from: 'Admin',
                    text: `${user.name} has left!`
                }));
                messageModel.find({
                    text: `${user.name} has left!`
                }, (err, res) => {
                    if (res[0]) {
                        messageModel.findOneAndDelete({
                            text: `${user.name} has left!`
                        });
                    }
                });

                makeAndSaveModel('Admin', `${user.name} has left!`, user.room, 'message');
            } else {
                messageModel.deleteMany({
                    room: user.room
                }, (doc) => {
                    console.log('doc');
                });
            }
        }
    });

    socket.on('geolocation', (location) => {
        const user = User.getUser(socket.id);
        if (user) {
            location.from = user.name;
            io.to(user.room).emit('location', generateLocation(location));

            const locationObject = generateLocation(location);
            makeAndSaveModel(user.name, locationObject.url, user.room, 'location');
        }
    });
});

app.use(express.static(publicPath));

server.listen(port);