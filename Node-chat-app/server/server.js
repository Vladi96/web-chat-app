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

const port = process.env.PORT || 3000;
const app = express();
const publicPath = path.join(__dirname, '../public');
const server = http.createServer(app);
const io = socket(server);

app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.sendFile(publicPath + '/index.html');
});

app.get('/current-temperature', (req, res) => {
    const lat = req.query.lat;
    const lng = req.query.lng;

    // res.setHeader('Access-Control-Allow-Origin', '*');
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
    console.log('Client connected to server!');

    socket.on('createMessage', function (msg) {
        if (msg.text.trim() !== '') {
            io.emit('newMessage', emitMessage(msg));
        }
    });

    socket.on('disconnect', function () {
        console.log('User disconnect from server!');
    });

    socket.on('geolocation', (location) => {
        io.emit('location', generateLocation(location));
    });
});

app.use(express.static(publicPath));

server.listen(port);