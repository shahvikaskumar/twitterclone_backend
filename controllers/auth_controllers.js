const mongoose = require("mongoose");
const usermodel = mongoose.model('user');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const { JWT_SECRET , Fronturl} = require('../Utility/config');
const { Sendmail } = require('../Utility/nodemailer');
const crypto = require('crypto');


//#region Auth Register api
const Authregister = async (req, res) => {
    const { fname, email, uname, password } = req.body;
    
    if (!fname || !email || !uname || !password) {
        return res.status(400).json({ error: "One or more fields are empty" });
    }

    try {
        const userindb = await usermodel.findOne({ $or: [{ email: email }, { username: uname }] });

        if (userindb) {
            if (userindb.email === email) {
                return res.status(409).json({ error: "This email already registered." });
            }
            else if (userindb.username === uname) {
                return res.status(409).json({ error: "Username already taken." });
            }
        }

        const hashedpassword = await bcryptjs.hash(password, 12);

        const vtoken = crypto.randomBytes(32).toString('hex');
        const verificationurl = `${Fronturl}verifyemail?token=${vtoken}&email=${email}`;
        const emailtext = `Hello ${fname}, please verify your email by clicking the link: ${verificationurl}`;
        const emailhtml = `<p>Hello ${fname},</p><p>Please verify your email by clicking the link: <a href="${verificationurl}">Verify Email</a></p>`;
        await Sendmail(email , 'Email Verification', emailtext,emailhtml);

        const newuser = new usermodel({ name: fname, email: email, username: uname, password: hashedpassword });
        await newuser.save();

        res.status(201).json({ success: "Registration successfully." });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "An error occurred during the signup process." });
    }
};
//#endregion

//#region Auth login
const Authlogin = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email or password are empty." });
    }

    try {
        const userin = await usermodel.findOne({ email: email });
        if (!userin) {
            return res.status(401).json({ error: "Email Id is not registered." });
        }

        const ismatch = await bcryptjs.compare(password, userin.password);
        if (!ismatch) {
            return res.status(401).json({ error: "Invalid email or password." });
        }

        const token = jwt.sign({ userID: userin._id }, JWT_SECRET, { expiresIn: '1h' });
        const user = userin.toObject();
        delete user.password;

        res.status(200).json({ success: "Login Successfully", token, user });


    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "An error occurred during the login process" });
    }
};
//#endregion

//#region Auth verify
const Authverify = (req, res) => {
    res.status(200).json({ valid: true, user: req.userID });
}
//#endregion

//#region email verification
const Authverifyemail = async (req,res) => {
    const {token, email} = req.query;

    try{
        const userindb = await usermodel.findOne({email:email}).select('-password');
        
        if(userindb.vstatus === "false"){       
            if((userindb.email === email)  && (userindb.vtoken === token)){
                userindb.vstatus="true";
                await userindb.save();       
                res.status(200).json({success:"Email ID verified successfully."});
                
            }
            else {
                res.status(200).json({success:"Email ID not verified."});                
            }
        }
        else {
            res.status(200).json({success:"Email ID already verified."});            
        }        
    }
    catch(error){
        console.log(error); 
        res.status(500).json({error:"an error occured while verification email."});       
    }   

}
//#endregion

//#region Forgot Password
const Forgotpassword = async (req,res) => {
    try{
        const {email} = req.body;
        const userin = await usermodel.findOne({ email:email});
        if(!userin){
            return res.status(404).json({success:'User not found'});
        }       

        const token = crypto.randomBytes(32).toString('hex');
        userin.rptoken = token;
        userin.rpexpires = Date.now() + 900000;
        await userin.save();

        const resetlink = `${Fronturl}resetpassword/${token}`;
        const emailtext = `Please click the link to reset your password: ${resetlink}`;
        const emailhtml=`<p>Hello ${userin.name},</p><p>Please Reset your password by clicking the link: <a href="${resetlink}">Reset Password</a></p>`;
        await Sendmail(email , 'Password Reset Request', emailtext, emailhtml); 

        res.status(200).json({success:'Password reset link sent to your email'});
    }
    catch(err){
        console.error(err);
        res.status(500).json({error:"An error occurred during the reset link send."});
    }   
};

//#endregion

//#region Reset Password
const Resetpassword = async (req,res) => {
    try{

        const { token , password} = req.body;
        const userin = await usermodel.findOne({rptoken:token, rpexpires: { $gt: Date.now()}});
        if(!userin){
            return res.status(400).json({message:'Invalid or expired token'});            
        }

        const hashedpassword = await bcryptjs.hash(password, 12);

        userin.password = hashedpassword;
        userin.rptoken = undefined;
        userin.rpexipres = undefined;
        await userin.save();

        res.send({success:'Password reset successfully.'});
    }
    catch(err){
        console.error(err);
        res.status(500).json({error:"An error occurred during the Reset Pawword."});
    }
    
};
//#endregion

module.exports = {Authregister, Authlogin, Authverify, Authverifyemail, Forgotpassword, Resetpassword};