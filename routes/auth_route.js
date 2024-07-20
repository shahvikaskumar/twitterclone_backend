const express = require("express");
const router=express.Router();
const requireauth=require('../middleware/auth');
const { Authregister, Authlogin, Authverify } = require("../controllers/auth_controllers");


router.post("/auth/register", Authregister);
router.post("/auth/login",Authlogin);
router.post("/auth/verify-token",requireauth, Authverify);


module.exports = router;