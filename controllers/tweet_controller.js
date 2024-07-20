const mongoose = require("mongoose");
const tweetmodel= mongoose.model('tweet');

//#region Tweet Post
const Tweetpost = async (req,res) =>{
    const{userid,content,image} = req.body;

    if(!userid || !content){
        return res.status(400).json({error:"The content fields is empty"});
    };

    try{
        const newtweet = new tweetmodel({content:content, tweetedby:userid, image:image});
        await newtweet.save();
        res.status(201).json({success:"Tweet Succesfully."});
    }
    catch(err){
        console.error(err);
        res.status(500).json({error:"An error occurred during the tweet process."});
    }
};

//#endregion

//#region Tweet Like
const Tweetlike = async (req,res) => {
    try{
        
        const tweetid = req.params.id;
        const userid=req.body.userid;

        let tweet=await tweetmodel.findById(tweetid);
        if(!tweet){
            return res.status(404).json({message:"Tweet not found"});
        }

        if(tweetmodel.likes.includes(userid)){
            return res.status(400).json({message:"Tweet already liked by this user."});
        }

        tweetmodel.likes.push(userid);

        await tweetmodel.save();

        return res.status(200).json({message:"Tweet liked successfully.",tweet});
    }
    catch (error){
        console.error(error);
        return res.status(500).json({message:"Server error"});
    }
};
//#endregion

//#region Tweet dislike
const Tweetdislike = async (req, res) => {

    try{
        const tweetid = req.params.id;
        const userid = req.body.userid;

        let tweet = await tweetmodel.findById(tweetid);

        if(!tweet){
            return res.status(404).json({message:'Tweet not found'});
        }

        if(!tweet.likes.includes(userid)){
            return res.status(400).json({message:'Tweet not liked by this user.'});
        }

        tweetmodel.likes = tweetmodel.likes.filter(id => id.toDtring() !== userid.toString());

        await tweetmodel.save();

        return res.status(200).json({messge:'Tweet disliked successfully', tweet});
    }
    catch (error){
        console.error(error);
        return res.status(500).json({message:"Server error"});
    }

};
//#endregion

//#region Tweet Reply
const Tweetreply = async (req,res) => {

    try{
        const tweetid = req.param.id;
        const {content} = req.body;
        const userid = req.user._id;

        if(!content){
            return res.status(400).json({message:'content is required'});
        }

        let parenttweet = await tweetmodel.findById(tweetid);

        if(!parenttweet){
            return res.status(404).json({message:'Parent tweet not found'});
        }

        const replytweet = new tweetmodel({
            content:content,
            tweetedby:userid
            
        });

        await replytweet.save();

        parenttweet.replies.push(replytweet._id);

        await parenttweet.save();

        return res.status(201).json({message:'Reply posted successfully.', reply:replytweet});
    }
    catch(error){
        console.error(error);
        return res.status(500).json({message:'Server error'});
    }
};
//#endregion

//#region single Tweet Detail 
const Tweetdetail = async (req,res) => {

    try{
        const tweetid=req.param.id;

        let tweet = await tweetmodel.findById(tweetid)
            .populate('username','-password')
            .populate({
                path:'replies',
                populate:{path:'username', select:'-password'}                
            });

        if(!tweet){
            return res.status(404).json({message:'Tweet not found.'});
        }

        return res.status(200).json({tweet});       
            
    }
    catch(error){
        console.error(error);
        return res.status(500).json({message:'Server error'});
    }
};
//#endregion

//#region All tweet Details
const Alltweetdetail = async (req,res) => {
    try{

        let tweets = await tweetmodel.find({})
            .populate('tweetedby','-password')
            .populate({
                path:'replies',
                populate:{
                    path:'tweetedby',
                    select:'-password'}
                })
                .sort({createdAt:-1});
        
        return res.status(200).json({tweets});
             
    }
    catch (error){
        console.error(error);
        return res.status(500).json({message:'Server error.'});
    }
};
//#endregion

//#region Tweet Delete
const Tweetdelete = async (req,res) => {
    try{

        const tweetid = req.params.id;
        const userid = req.user._id;

        let tweet = await tweetmodel.findById(tweetid);

        if(!tweet){
            return res.status(404).json({message:'Tweet not found'});
        }

        if(tweet.tweetedby.toString() !== userid.toString()){
            return res.status(403).json({message:'You are not authorized to delete this tweet'});
        }

        await tweet.remove();

        return res.status(200).json({message:'Tweet deleted successfully.'});

    }
    catch (error){
        console.error(error);
        return res.status(500).json({message:'Server error'});
    }
};
//#endregion

//#region Tweet retweet
const Tweetretweet = async (req, res) => {

    try{
        const tweetid = req.params.id;
        const userid = req.user._id;

        let tweet = await tweetmodel.findById(tweetid);

        if(!tweet){
            return res.status(404).json({message:'Tweet not found'});
        }

        if(tweet.retweetby.includes(userid)){
            return res.status(400).json({message:'Tweet already retweeted by this user.'});
        }

        tweet.retweetby.push(userid);

        await tweet.save();

        return res.status(200).json({message:'Tweet retweeted successfully.',tweet});
    }
    catch (error){
        console.error(error);
        return res.status(500).json({message:'Server error'});
    }
};
//#endregion

module.exports = {Tweetpost, Tweetlike, Tweetdislike, Tweetreply, Tweetdetail, Alltweetdetail, Tweetdelete, Tweetretweet };