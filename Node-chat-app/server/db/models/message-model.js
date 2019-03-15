const {
    mongoose
} = require('../mongoose');

const model = mongoose.Schema({
    room: {
        trim: true,
        type: String,
        maxlength: 20,
        required: true
    },
    from: {
        trim: true,
        type: String,
        maxlength: 20,
        required: true
    },
    text: {
        trim: true,
        type: String,
        maxlength: 200,
        required: true
    },
    type: {
        required: true,
        type: String,
        trim: true,
        maxlength: 20
    },
    createAt: {
        required: true,
        type: String,
        trim: true,
        maxlength: 20
    }
});

const messageModel = mongoose.model('message', model);

module.exports = {
    messageModel
};