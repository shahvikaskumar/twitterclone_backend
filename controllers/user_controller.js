const mongoose = require("mongoose");
const usermodel= mongoose.model('user');
const tweetmodel= mongoose.model('tweet');
const { Cname, Capikey, Capisecret } = require("../Utility/config");
const cloudinary = require('cloudinary').v2;


cloudinary.config({
    cloud_name: Cname,
    api_key: Capikey,
    api_secret: Capisecret
});

//#region Get a single user detail
const Userdetail = async (req,res) => {
    try{
        const userid = req.params.id;

        // Find the user by ID and populate the following and followers fields
        let user = await usermodel.findById(userid)
            .select('-password -vtoken -vstatus -rptoken -rpexpires')
            .populate('following','-password -vtoken -vstatus -rptoken -rpexpires')
            .populate('followers','-password -vtoken -vstatus -rptoken -rpexpires');
        
        if(!user){
            return res.status(404).json({success:'User not found'});
        }
        
        // Remove the password field from the user object
        user = user.toObject();
        delete user.password;

        return res.status(200).json({user:user});
    }
    catch (error){
        console.error(error);
        return res.status(500).json({error:'Server error'});
    }
};
//#endregion

//#region Follow user
const Userfollow = async (req,res) => {
    try{
        const useridtofollow = req.params.id;
        const loggedinuserid = req.body.userid;

        // Check if the user is trying to follow himself
        if(useridtofollow === loggedinuserid.toString()){
            return res.status(400).json({success:'You cannot follow yourself'});
        }

        // Find the user to follow by ID
        const usertofollow = await usermodel.findById({_id:useridtofollow}).select('-password -vtoken -vstatus -rptoken -rpexpires');
        if(!usertofollow){
            return res.status(404).json({success:'User to follow not found.'});
        }

        // Find the logged-in user by ID
        const loggedinuser = await usermodel.findById({_id:loggedinuserid}).select('-password -vtoken -vstatus -rptoken -rpexpires');
        if(!loggedinuser){
            return res.status(404).json({success:'Logged in user not found'});
        }

        // Check if the user is already following the other user
        if(loggedinuser.following.includes(useridtofollow)){
            return res.status(400).json({success:'You are already following this user'});
        }

        // Add the user to follow's ID to the logged-in user's following array
        loggedinuser.following.push(useridtofollow);

        // Add the logged-in user's ID to the user to follow's followers array
        usertofollow.followers.push(loggedinuserid);

        // Save both users
        await loggedinuser.save();
        await usertofollow.save();

        res.status(200).json({success:true, loggedinuser:loggedinuser, usertofollow:usertofollow});
    }
    catch(error){
        console.error(error);
        return res.status(500).json({error:'Server error'});
    }
};
//#endregion

//#region  Unfollow user
const Userunfollow = async (req,res) => {
    try{
        const useridtounfollow = req.params.id;
        const loggedinuserid = req.body.userid;

        // Check if the user is trying to unfollow himself
        if(useridtounfollow === loggedinuserid.toString()){
            return res.status(400).json({success:'You cannot unfollow yourself'});
        }

        // Find the user to unfollow by ID
        const usertounfollow = await usermodel.findById({_id:useridtounfollow}).select('-password -vtoken -vstatus -rptoken -rpexpires');
        if(!usertounfollow){
            return res.status(404).json({success:'User to unfollow not found'});
        }

        // Find the logged-in user by ID
        const loggedinuser = await usermodel.findById({_id:loggedinuserid}).select('-password -vtoken -vstatus -rptoken -rpexpires');
        if(!loggedinuser){
            return res.status(404).json({success:'Logged in user not found'});
        }

        // Check if the logged-in user is following the user to unfollow
        if(!loggedinuser.following.includes(useridtounfollow)){
            return res.status(400).json({success:'You are not following this user'});
        }

        // Remove the user to unfollow's ID from the logged-in user's following array
        loggedinuser.following = loggedinuser.following.filter(
            userid => userid.toString() !==useridtounfollow        
        );

        // Remove the logged-in user's ID from the user to unfollow's followers array
        usertounfollow.followers = usertounfollow.followers.filter(
            userid => userid.toString() !== loggedinuserid
        );

        // Save both users
        await loggedinuser.save();
        await usertounfollow.save();

        return res.status(200).json({success:true,loggedinuser:loggedinuser, usertounfollow:usertounfollow});

    }
    catch(error){
        console.error(error);
        return res.status(500).json({error:'Server error'});
    }
};
//#endregion

//#region Edit user detail
const Usereditdetial = async (req,res) => {
    try{
        const userid = req.params.id;        
        const {name, dateofbirth, location} = req.body;

        
        // Validate the request body        
        if(!name && !dateofbirth && !location){
            return res.status(400).json({success:'Please provide name, date of birth, or location to update'});
        }

        // Find the user by ID
        const user=await usermodel.findById(userid).select('-password -vtoken -vstatus -rptoken -rpexpires');
        if(!user){
            return res.status(404).json({success:'User not found'});
        }

        // Update the user's details
        if(name) user.name=name;
        if(dateofbirth) user.dateofbirth = dateofbirth;
        if(location) user.location = location;

        // Save the updated user
        await user.save();
        
        return res.status(200).json({success:'User details updated successfully', user:user});
    }
    catch(error){
        console.error(error);
        return res.status(500).json({error:'Server error'});
    }
};
//#endregion

//#region Get user tweet
const Usertweets = async (req,res) => {
    try{
        const userid = req.params.id;

        // Find tweets by user ID
        const tweets = await tweetmodel.find({tweetedby:userid})
            .populate('tweetedby','-password -vtoken -vstatus -rptoken -rpexpires').sort({ createdAt: -1 })
            .sort({createdAt:-1});

        if(!tweets){
            return res.status(404).json({success:'No tweets found for this user'});
        }

        return res.status(200).json({tweets:tweets});
    }
    catch(error){
        console.error(error);
        return res.status(500).json({error:'Server error'});
    }
};
//#endregion

//#region Upload user profile picture
const Userprofilepic = async (req,res) => {
    
        try{
            const userid = req.params.id;            
            const profile_picurl = req.file ? req.file.path : '';
            const profile_picpath = req.file ? req.file.filename : '';
            
            // Find the user by ID
            const user = await usermodel.findById(userid).select('-password -vtoken -vstatus -rptoken -rpexpires');  
            if(!user){
                return res.status(404).json({message:'User not found'});
            }

            if(user.profile_picpath && typeof user.profile_picpath === 'string' && user.profile_picpath.trim() !== '') {
                await cloudinary.uploader.destroy(user.profile_picpath);
            }

            // Update the user's profilePic url
            user.profile_picurl = profile_picurl || user.profile_picurl;
            user.profile_picpath = profile_picpath || user.profile_picpath;

            // Save the updated user
            await user.save();

            return res.status(200).json({success:'Profile picture uploaded successfully.', user:user});
        }
        catch(error) {
            console.error(error);
            return res.status(500).json({message:'Server error'});
        }
    };
//#endregion

module.exports = { Userdetail, Userfollow, Userunfollow, Usereditdetial, Usertweets, Userprofilepic };