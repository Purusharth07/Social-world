var mongoose = require('mongoose');

var postSchema = mongoose.Schema({
    content : String,
    userId : {
        type : mongoose.Schema.ObjectId,
        ref : 'User'
    },
    dateCreated : Date
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Post', postSchema);