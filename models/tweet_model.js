const mongoose = require('mongoose');
const converttime = require('../Utility/converttime');

const tweetschema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },

    tweetedby: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },

    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
    }],

    retweetby: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
    }],

    imageurl: {
        type: String,
    },

    imagepath: {
        type: String,
    },

    replies: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'tweet'
    }]

}, { timestamps: true });

tweetschema.pre('save', converttime);

mongoose.model('tweet', tweetschema);