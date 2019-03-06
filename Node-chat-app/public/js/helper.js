function getCelsius(degrees) {
    const cel = Math.round((degrees - 32) * 5 / 9);
    return cel;
}

module.exports = {
    getCelsius
}