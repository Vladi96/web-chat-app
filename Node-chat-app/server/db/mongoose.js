const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
// mongoose.connect('mongodb://localhost:27017/chat');
mongoose.connect('mongodb+srv://Vladimir:Vladika96@chat-vladi-jfytr.mongodb.net/test?retryWrites=true', {
    useNewUrlParser: true
}, (err) => {
    console.log(err);
});

module.exports = {
    mongoose
};