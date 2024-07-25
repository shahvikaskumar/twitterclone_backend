const mongoose = require("mongoose");
const usermodel= mongoose.model('user');
const tweetmodel= mongoose.model('tweet');

//#region Get a single user detail
const Userdetail = async (req,res) => {
    try{
        const userid = req.params.id;

        // Find the user by ID and populate the following and followers fields
        let user = await usermodel.findById(userid)
            .populate('following','-password')
            .populate('followers','-password');
        
        if(!user){
            return res.status(404).json({message:'User not found'});
        }
        
        // Remove the password field from the user object
        user = user.toObject();
        delete user.password;

        return res.status(200).json({user});
    }
    catch (error){
        console.error(error);
        return res.status(500).json({message:'Server error'});
    }
};
//#endregion

//#region Follow user
const Userfollow = async (req,res) => {
    try{
        const useridtofollow = req.params.id;
        const loggedinuserid = req.user._id;

        // Find the user to follow by ID
        const usertofollow = await usermodel.findById(useridtofollow);
        if(!usertofollow){
            return res.status(404).json({message:'User to follow not found.'});
        }

        // Find the logged-in user by ID
        const loggedinuser = await usermodel.findById(loggedinuserid);
        if(!loggedinuser){
            return res.status(404).json({message:'Logged in user not found'});
        }

        // Check if the user is already following the other user
        if(loggedinuser.following.includes(useridtofollow)){
            return res.status(400).json({message:'You are already following this user'});
        }

        // Add the user to follow's ID to the logged-in user's following array
        loggedinuser.following.push(useridtofollow);

        // Add the logged-in user's ID to the user to follow's followers array
        usertofollow.followers.push(loggedinuserid);

        // Save both users
        await loggedinuser.save();
        await usertofollow.save();

        return res.status(200).json({success:true});
    }
    catch(error){
        console.error(error);
        return res.status(500).json({message:'Server error'});
    }
};
//#endregion

//#region  Unfollow user
const Userunfollow = async (req,res) => {
    try{
        const useridtounfollow = req.params.id;
        const loggedinuserid = req.user._id;

        // Check if the user is trying to unfollow himself
        if(useridtounfollow === loggedinuserid.toString()){
            return res.status(400).json({message:'You cannot unfollow yourself'});
        }

        // Find the user to unfollow by ID
        const usertounfollow = await usermodel.findById(useridtounfollow);
        if(!usertounfollow){
            return res.status(404).json({message:'User to unfollow not found'});
        }

        // Find the logged-in user by ID
        const loggedinuser = await usermodel.findById(loggedinuserid);
        if(!loggedinuser){
            return res.status(404).json({message:'Logged in user not found'});
        }

        // Check if the logged-in user is following the user to unfollow
        if(!loggedinuser.following.includes(useridtounfollow)){
            return res.status(400).json({message:'You are not following this user'});
        }

        // Remove the user to unfollow's ID from the logged-in user's following array
        loggedinuser.following = loggedinuser.following.filter(
            userid => userid.toString() !==useridtounfollow        
        );

        // Remove the logged-in user's ID from the user to unfollow's followers array
        useridtounfollow.followers = usertounfollow.followers.filter(
            userid => userid.toString() !== loggedinuserid.toString()
        );

        // Save both users
        await loggedinuser.save();
        await usertounfollow.save();

        return res.status(200).json({success:true});

    }
    catch(error){
        console.error(error);
        return res.status(500).json({message:'Server error'});
    }
};
//#endregion

//#region Edit user detail
const Usereditdetial = async (req,res) => {
    try{
        const userid = req.params.id;
        const loggedinuserid = req.user._id;

        // Check if the user is trying to edit someone else's profile
        if(userid !== loggedinuserid.toString()){
            return res.status(403).json({messge:'You can not edit other user\'s details'});
        }

        // Validate the request body
        const {name, dateofbirth, location} = req.body;
        if(!name && !dateofbirth && !location){
            return res.status(400).json({message:'Please provide name, date of birth, or location to update'});
        }

        // Find the user by ID
        const user=await usermodel.findById(userid);
        if(!user){
            return res.status(404).json({message:'User not found'});
        }

        // Update the user's details
        if(name) user.name=name;
        if(dateofbirth) user.dateofbirth = dateofbirth;
        if(location) user.location = location;

        // Save the updated user
        await user.save();

        // Remove password field from the response
        const updateuser = user.toObject();
        delete updateuser.password;

        return res.status(200).json({message:'User details updated successfully', user:updateduser});
    }
    catch(error){
        console.error(error);
        return res.status(500).json({message:'Server error'});
    }
};
//#endregion

//#region Get user tweet
const Usertweets = async (req,res) => {
    try{
        const userid = req.params.id;

        // Find tweets by user ID
        const tweets = await tweetmodel.find({tweetedby:userid})
            .populate('tweetedby','-password');

        if(!tweets){
            return res.status(404).json({message:'No tweets found for this user'});
        }

        return res.status(200).json({tweets});
    }
    catch(error){
        console.error(error);
        return res.status(500).json({message:'Server error'});
    }
};
//#endregion

//#region Upload user profile picture
const Userprofilepic = async (req,res) => {
    
        try{
            const userid = req.params.id;
            const loggedinuserid = req.user._id;

            // Check if the user is trying to upload for someone else
            if(userid !== loggedinuserid.toString()){
                return res.status(403).json({message:'You cannot upload profile picture for another user'});
            }

            // Find the user by ID
            const user = await usermodel.findById(userid);  
            if(!user){
                return res.status(404).json({message:'User not found'});
            }

            // Update the user's profilePic path
            user.profilepic = `/images/${req.file.filename}`;

            // Save the updated user
            await user.save();

            return res.status(200).json({message:'Profile picture uploaded successfully.', profilepic:user.profilepic});
        }
        catch(error) {
            console.error(error);
            return res.status(500).json({message:'Server error'});
        }
    };
//#endregion

module.exports = { Userdetail, Userfollow, Userunfollow, Usereditdetial, Usertweets, Userprofilepic };