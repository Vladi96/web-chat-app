let socket = io();

socket.on('connect',function(){
    console.log('connected to server!');
});

socket.on('disconnect',function(){
    console.log('Disconnected from server!');
});

socket.on('newMessage',function(msg){
    console.log('From: '+ msg.from);
    console.log('To: '+ msg.to);
    console.log(msg.text);
    console.log(msg.createAt.date);
    console.log(msg.createAt.time);
});

socket.emit('createMessage',{
    from:'Simo',
    to:'Vladi',
    text:'az sam Simo'
});