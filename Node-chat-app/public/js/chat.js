const socket = io();

socket.on('connect', function () {
    const search = location.search.substring(1);
    const data = JSON.parse('{"' + decodeURI(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}');

    socket.emit('join', data);

    console.log('connected to server!');
});

socket.on('UpdateUserList', function (data) {
    let ol = $('<ol></ol>');

    data.forEach(element => {
        ol.append($(`<li>${element}</li>`));
    });

    $('#users').html(ol);
});

socket.on('disconnect', function () {
    console.log('Disconnected from server!');
});

socket.on('newMessage', function (msg) {
    const $template = $('#message-template').html();

    let html = Mustache.render($template, {
        from: msg.from,
        text: msg.text,
        time: msg.createAt.time
    });

    $('#messages').append(html);
    scrollToBottom();
});

socket.on('location', (location) => {
    const template = $('#message-location').html();
    let html = Mustache.render(template, {
        from: location.from,
        link: location.url,
        time: location.createAt.time
    });
    $('#messages').append(html);
    scrollToBottom();
});

$('#message-form').on('submit', function (e) {
    e.preventDefault();
    let $message = $('input[name=message]');

    socket.emit('createMessage', {
        text: $message.val()
    });

    $message.val('');
});

const $sendLocation = $('#send-location');

$sendLocation.on('click', function () {
    if (!navigator.geolocation) {
        $sendLocation.attr('disabled', 'disabled');
        return alert('Geolocation not supported by your browser.');
    }

    navigator.geolocation.getCurrentPosition(function (position) {
        socket.emit('geolocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        });
    }, function () {
        alert('Unable to fetch location.');
    });
});

function scrollToBottom() {
    const screen = $('#messages');
    const newMessage = screen.children('li:last-child');

    const clientHeight = screen.prop('clientHeight');
    const scrollTop = screen.prop('scrollTop');
    const scrollHeight = screen.prop('scrollHeight');
    const newMessageHeight = newMessage.innerHeight();
    const lastMessageHeight = newMessage.prev().innerHeight();

    if (clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight) {
        screen.scrollTop(scrollHeight);
    }
}

function getCelsius(degrees) {
    const cel = Math.round((degrees - 32) * 5 / 9);
    return cel;
}

function weather(data) {
    const apiUrl = 'http://localhost:3000'; // TODO: from config also
    // const apiUrl = 'https://calm-shore-34441.herokuapp.com'; //Heroku Url

    let latitude = '';
    let longitude = '';
    let city = '';

    try {
        latitude = data.coords.latitude;
        longitude = data.coords.longitude;
        city = 'Currently';
    } catch (error) {
        latitude = '40.730610';
        longitude = '-73.935242';
        city = 'New York';
        $sendLocation.attr('disabled', 'disabled');
    }

    const url = `${apiUrl}/current-temperature?lat=${latitude}&lng=${longitude}`;

    $.ajax({
        url: url,
        type: 'GET',
        success: (result) => {
            $('#location-weather').append(getCelsius(result.currentTemp));
            $('#weather-ico').append(result.img);
            $('#location').append(`Location: ${city}`);
        }
    });
}

$(() => {
    if (!navigator.geolocation) {
        return alert('Geolocation not supported by your browser.');
    }
    navigator.geolocation.getCurrentPosition(function (position) {
            weather(position);
        },
        function () {
            weather();
            console.log('Unable to fetch location.');
        });
});