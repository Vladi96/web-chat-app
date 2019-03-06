const fetch = require('node-fetch');

function generateLocation(location) {
    return {
        from: location.from,
        url: `https://www.google.com/maps?q=${location.latitude},${location.longitude}`,
        createAt: {
            date: getDate().date,
            time: getDate().time
        },
        lat: location.latitude,
        long: location.longitude
    }
}

function emitMessage(msg) {
    return {
        from: msg.from,
        to: msg.to,
        text: escapeHtml(msg.text),
        createAt: {
            date: getDate().date,
            time: getDate().time
        }
    }
}

function escapeHtml(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function getDate() {
    const date = new Date();
    return {
        date: `${('0'+ date.getDate()).slice(-2)}/${('0'+ (date.getMonth()+1)).slice(-2)}/${date.getFullYear()}`,
        time: `${('0'+ date.getHours()).slice(-2)}:${('0'+date.getMinutes()).slice(-2)}:${('0'+date.getMilliseconds()).slice(-2)}`,
    }
}

function weather(lat, lng) {
    const keyForecast = '61959ef1333665a09c1562f5fe269099';

    let promise = async () => {
        let res = await fetch(`https://api.darksky.net/forecast/${keyForecast}/${lat},${lng}`);

        let js = await res.json();
        return js;
    }
    return promise();
}

module.exports = {
    generateLocation,
    emitMessage,
    weather
}