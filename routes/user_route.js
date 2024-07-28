const express = require("express");
const router=express.Router();
const requireauth=require('../middleware/auth');
const { Userdetail, Userfollow, Userunfollow, Usereditdetial, Usertweets, Userprofilepic } = require("../controllers/user_controller");
const upload = require("../Utility/multer_config");


router.get('/user/:id', requireauth ,Userdetail);
router.post('/user/:id/follow', requireauth, Userfollow);
router.post('/user/:id/unfollow', requireauth, Userunfollow);
router.put('/user/:id', requireauth, Usereditdetial);
router.get('/user/:id/tweets', requireauth, Usertweets);
router.post('/user/:id/uploadprofilepic', requireauth, upload, Userprofilepic);

module.exports = router;