const express = require('express');
const path = require('path');
const socket = require('socket.io');
const http = require('http');

const port = process.env.PORT || 3000;
const app = express();
const publicPath = path.join(__dirname,'../public');
const server = http.createServer(app);
const io = socket(server);

io.on('connection',(socket)=>{
    console.log('Client connected to server!');

    socket.emit('newMessage',{
        from:'Vladi',
        to: 'Simo',
        text:'Hello my Messenger!',
        createAt: getDate()
    });

    socket.on('createMessage',function(msg){
        socket.emit('newMessage',emitMessage(msg));
    });

    socket.on('disconnect',function(){
        console.log('User disconnect from server!');
    });
});

function emitMessage(msg){
    return {
        from:msg.from,
        to:msg.to,
        text:msg.text,
        createAt:{
            date:getDate().date,
            time: getDate().time
        }
    }
}

function getDate(){
    const date = new Date();
    return {
        date:`${('0'+ date.getDate()).slice(-2)}/${('0'+ (date.getMonth()+1)).slice(-2)}/${date.getFullYear()}`,
        time:`${('0'+ date.getHours()).slice(-2)}:${('0'+date.getMinutes()).slice(-2)}`    
    }
}

app.use(express.static(publicPath));

server.listen(port);
