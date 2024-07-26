const mongoose = require('mongoose');
const converttime = require('../Utility/converttime');

const userschema = new mongoose.Schema({

    name:{
        type:String,
        required:true
    },
    
    username:{
        type:String,
        unique:true,
        required:true
    },

    email:{
        type:String,
        unique:true,
        required:true
    },

    password:{
        type:String,
        required:true
    },

    profile_picture:{
        type:String,
    },

    location:{
        type:String,        
    },

    dateofbirth:{
        type:Date,
    },

    followers:{
        type:[String]
    },

    following:{
        type:[String]
    },

    vtoken:{
        type:String,
    },

    vstatus:{
        type:String,
    },

    rptoken:{
        type:String,
    },

    rpexpires:{
        type:Date,
    },
    
},{timestamps:true});


userschema.pre('save',converttime);

mongoose.model('user', userschema);