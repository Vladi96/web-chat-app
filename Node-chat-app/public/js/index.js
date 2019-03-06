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

socket.on('location', (location) => {
    let $li = $('<li>');
    $li.html(`From: ${location.from}<br/>
    <a target="_blank" href=${location.url}>My Location.</a><br/>
    ${location.lat}<br>
    ${location.long}<br>`);
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

function getCelsius(degrees) {
    const cel = Math.round((degrees - 32) * 5 / 9);
    return cel;
}

const $sendLocation = $('#send-location');

$sendLocation.on('click', function () {
    if (!navigator.geolocation) {
        $sendLocation.attr('disabled', 'disabled');
        return alert('Geolocation not supported by your browser.');
    }

    navigator.geolocation.getCurrentPosition(function (position) {
        socket.emit('geolocation', {
            from: 'User-3',
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        });
    }, function () {
        alert('Unable to fetch location.');
    });
});

function weather(data) {
    const apiUrl = 'http://localhost:3000'; // TODO: from config also

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