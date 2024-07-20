const jwt=require('jsonwebtoken');
const {JWT_SECRET} = require('../Utility/config');
const mongoose = require("mongoose");
const usermodel = mongoose.model("user");

// Middleware function to authenticate requests using JWT
const requireauth= async (req,res,next) => {
    const {authorization} = req.headers;
    
    // If authorization header is missing, send a 401 Unauthorized response
    if(!authorization){
        return res.status(401).json({error:"Authorization header missing"});
    }

    // Extracting token from the authorization header
    const token= authorization.replace("Bearer ","");
    
    try{
        const decoded=jwt.verify(token,JWT_SECRET);
        const user=await usermodel.findById(decoded.userID).select('-password');
        // If user is not found, send a 401 Unauthorized response
        if(!user){
            return res.status(401).json({error:"User not found"});
        }

        req.userID=user;
        // Call the next middleware function
        next();
    }
    catch (err){
        // If token is invalid, send a 401 Unauthorized response
        res.status(401).json({error:"Invalid token"});
    }    
};

module.exports = requireauth;