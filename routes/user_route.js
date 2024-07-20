const express = require("express");
const router=express.Router();
const requireauth=require('../middleware/auth');
const { Userdetail, Userfollow, Userunfollow, Usereditdetial, Usertweets, Userprofilepic } = require("../controllers/user_controller");


router.get('/user/:id', requireauth ,Userdetail);
router.post('/user/:id/follow', requireauth, Userfollow);
router.post('/user/:id/unfollow', requireauth, Userunfollow);
router.put('/user/:id', requireauth, Usereditdetial);
router.post('/user/:id/tweets', requireauth, Usertweets);
router.post('/user/:id/uploadprofilepic', requireauth, Userprofilepic);

module.exports = router;