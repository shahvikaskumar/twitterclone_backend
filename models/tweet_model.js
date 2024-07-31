const mongoose = require('mongoose');
const converttime = require('../Utility/converttime');
const { Cname, Capikey, Capisecret } = require("../Utility/config");
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: Cname,
    api_key: Capikey,
    api_secret: Capisecret
});


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

tweetschema.methods.cascadedelete = async function() {
    for(const replyid of this.replies){
        const reply = await this.model('tweet').findById(replyid);
        if(reply){
            await reply.cascadedelete();
        }
    }

    if (this.imagepath && typeof this.imagepath === 'string' && this.imagepath.trim() !== '') {        
        await cloudinary.uploader.destroy(this.imagepath);       
    }

    await this.model('tweet').deleteOne({_id:this._id});
};

mongoose.model('tweet', tweetschema);