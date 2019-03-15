const mongoose = require('mongoose');

// mongoose.connect('mongodb://localhost:27017/chat', (err) => {
//     console.log(err);
// });

mongoose.connect('mongodb+srv://Vladimir:Vladika96@chat-vladi-jfytr.mongodb.net/chat-app?retryWrites=true', {
    useNewUrlParser: true
}, (err) => {
    if (err) {
        console.log(err);
    }
});

module.exports = {
    mongoose
};