let socket = io();

socket.on('connect', function () {
    console.log('connected to server!');
});

socket.on('disconnect', function () {
    console.log('Disconnected from server!');
});

socket.on('newMessage', function (msg) {
    let $li = $('<li>');

    $li.html(`
        From: ${msg.from}<br>
        To: ${msg.to}<br>   
        Message: ${msg.text}<br>
        ${msg.createAt.time}<br>
    `);

    $li.appendTo('#messages');
});

$('#message-form').on('submit', function (e) {
    e.preventDefault();
    let $message = $('input[name=message]');

    socket.emit('createMessage', {
        from: 'User-1',
        to: 'User-2',
        text: $message.val()
    });

    $message.val('');
});

// socket.emit('createMessage', {
//     from: 'Simo',
//     to: 'Vladi',
//     text: 'az sam Simo'
// });