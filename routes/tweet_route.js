const express = require("express");
const router = express.Router();
const requireauth = require('../middleware/auth');
const { Tweetpost, Tweetlike, Tweetdislike, Tweetreply, Tweetdetail, Alltweetdetail, Tweetdelete, Tweetretweet } = require("../controllers/tweet_controller");
const upload = require("../Utility/multer_config");


router.post('/tweet', upload, requireauth, Tweetpost);
router.post('/tweet/:id/like', requireauth, Tweetlike);
router.post('/tweet/:id/dislike', requireauth, Tweetdislike);
router.post('/tweet/:id/reply', requireauth, Tweetreply);
router.get('/tweet/:id', requireauth, Tweetdetail);
router.get('/tweet', requireauth, Alltweetdetail);
router.delete('/tweet/:id', requireauth, Tweetdelete);
router.post('/tweet/:id/retweet', requireauth, Tweetretweet);

module.exports = router;