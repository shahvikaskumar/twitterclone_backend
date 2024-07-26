const express = require("express");
const router=express.Router();
const requireauth=require('../middleware/auth');
const { Authregister, Authlogin, Authverify, Authverifyemail, Forgotpassword, Resetpassword } = require("../controllers/auth_controllers");


router.post("/auth/register", Authregister);
router.post("/auth/login",Authlogin);
router.post("/auth/verify-token",requireauth, Authverify);
router.get("/auth/verifyemail", Authverifyemail);
router.post("/auth/forgotpassword", Forgotpassword);
router.post("/auth/resetpassword", Resetpassword );


module.exports = router;