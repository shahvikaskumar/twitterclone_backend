const mongoose = require("mongoose");
const tweetmodel = mongoose.model('tweet');
const { Cname, Capikey, Capisecret } = require("../Utility/config");
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: Cname,
    api_key: Capikey,
    api_secret: Capisecret
});


//#region Tweet Post
const Tweetpost = async (req, res) => {
    try {
        const { userid, content } = req.body;
        const imageurl = req.file ? req.file.path : '';
        const imagepath = req.file ? req.file.filename : '';

        if (!userid || !content) {
            return res.status(400).json({ error: "The content fields is empty" });
        };

        const newtweet = new tweetmodel({ content: content, tweetedby: userid, imageurl: imageurl, imagepath: imagepath });
        await newtweet.save();
        const populatetweet = await newtweet
            .populate({
                path: 'tweetedby',
                select: '-password -vtoken -vstatus -rptoken -rpexpires' 
            });
            

        res.status(201).json({ success: "Tweet Succesfully.", tweet: populatetweet });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "An error occurred during the tweet process." });
    }
};

//#endregion

//#region Tweet Like
const Tweetlike = async (req, res) => {
    try {

        const tweetid = req.params.id;
        const userid = req.body.userid;

        const tweet = await tweetmodel.findById(tweetid);
        if (!tweet) {
            return res.status(404).json({ error: "Tweet not found" });
        }

        if (tweet.likes.includes(userid)) {
             return res.status(400).json({ error: "Tweet already liked by this user." });
        }

        tweet.likes.push(userid);

        await tweet.save();

        res.status(200).json({ success: "Tweet liked successfully.", tweet:tweet });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server error" });
    }
};
//#endregion

//#region Tweet dislike
const Tweetdislike = async (req, res) => {

    try {
        const tweetid = req.params.id;
        const userid = req.body.userid;

        let tweet = await tweetmodel.findById(tweetid);

        if (!tweet) {
            return res.status(404).json({ error: 'Tweet not found' });
        }

        if (!tweet.likes.includes(userid)) {
            return res.status(400).json({ error: 'Tweet not liked by this user.' });
        }

        tweet.likes = tweet.likes.filter(id => id.toString() !== userid.toString());

        await tweet.save();

        return res.status(200).json({ success: 'Tweet disliked successfully', tweet });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server error" });
    }

};
//#endregion

//#region Tweet Reply
const Tweetreply = async (req, res) => {

    try {
        const tweetid = req.params.id;
        const { content, userid} = req.body;
        const imageurl = req.file ? req.file.path : '';
        const imagepath = req.file ? req.file.filename : '';
        
        if (!userid || !content) {
            return res.status(400).json({ error: "The content fields is empty" });
        };

        
        const parenttweet = await tweetmodel.findById(tweetid);

        if (!parenttweet) {
            return res.status(404).json({ error: 'Parent tweet not found' });
        }

        const replytweet = new tweetmodel({content: content, tweetedby: userid, imageurl: imageurl, imagepath: imagepath});

        await replytweet.save();

        parenttweet.replies.push(replytweet._id);

        await parenttweet.save();

        const populatetweet = await parenttweet
            .populate({
                path: 'tweetedby',
                select: '-password -vtoken -vstatus -rptoken -rpexpires' 
            });

        res.status(201).json({ success: 'Reply posted successfully.', tweet:populatetweet  });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Server error' });
    }
};
//#endregion

//#region single Tweet Detail 
const Tweetdetail = async (req, res) => {

    try {
        const tweetid = req.params.id;
        
        const tweet = await tweetmodel.find({_id:tweetid})
            .populate('tweetedby', '-password -vtoken -vstatus -rptoken -rpexpires')
            .populate({
                path: 'replies',
                populate: {
                    path: 'tweetedby',
                    select: '-password -vtoken -vstatus -rptoken -rpexpires'
                }
            });


        if (!tweet) {
            res.status(404).json({ error: 'Tweet not found.' });
        }

        res.status(200).json({success: 'User related tweet received' , tweet: tweet });

    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Server error' });
    }
};
//#endregion

//#region All tweet Details
const Alltweetdetail = async (req, res) => {
    try {

        const repliedTweetIds = await tweetmodel.distinct('replies');

        const tweets = await tweetmodel.find({
            _id: { $nin: repliedTweetIds }
        })
            .populate('tweetedby', '-password -vtoken -vstatus -rptoken -rpexpires')
            .populate({
                path:'retweetby.user',
                select:'-password -vtoken -vstatus -rptoken -rpexpires'
            })
            .sort({ createdAt: -1 });

        if (!tweets) {
            res.status(404).json({ error: 'Tweets not found' });
        }

        
        res.status(200).json({success:'All tweet received.' , tweets: tweets });

    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error.' });
    }
};
//#endregion

//#region Tweet Delete
const Tweetdelete = async (req, res) => {
    try {

        const tweetid = req.params.tid;
        const userid = req.params.uid;

        const tweet = await tweetmodel.findById({_id:tweetid});

        if (!tweet) {
            return res.status(404).json({ error: 'Tweet not found' });
        }

        if (tweet.tweetedby.toString() !== userid.toString()) {
            return res.status(403).json({ error: 'You are not authorized to delete this tweet' });
        }
        
        await tweet.cascadedelete();

        res.status(200).json({ success: 'Tweet and all nested replies deleted successfully.' , tweet:tweet });

    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Server error' });
    }
};
//#endregion

//#region Tweet retweet
const Tweetretweet = async (req, res) => {

    try {
        const tweetid = req.params.id;
        const {userid} = req.body;

        let tweet = await tweetmodel.findById({_id:tweetid});

        if (!tweet) {
            return res.status(404).json({ error: 'Tweet not found' });
        }

        if (tweet.retweetby.some(retweet => retweet.user.toString() === userid)) {
            return res.status(400).json({ error: 'Tweet already retweeted by you.' });
        }

        tweet.retweetby.push({user:userid});

        await tweet.save();

        tweet = await tweetmodel.findById(tweetid)
        .populate({
            path: 'tweetedby',
            select: '-password -vtoken -vstatus -rptoken -rpexpires'
        })
        .populate({
            path: 'retweetby.user',
            select: '-password -vtoken -vstatus -rptoken -rpexpires'
        });

        return res.status(200).json({ success: 'Tweet retweeted successfully.', tweet:tweet });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Server error' });
    }
};
//#endregion





module.exports = { Tweetpost, Tweetlike, Tweetdislike, Tweetreply, Tweetdetail, Alltweetdetail, Tweetdelete, Tweetretweet };