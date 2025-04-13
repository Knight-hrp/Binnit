const express = require('express');
const router = express.Router();
const {DirectSignUpPage, DirectLoginPage, CreateAccount, LoginAccount, getLogOut} = require("../controllers/user")

router.get("/signUp",DirectSignUpPage);
router.get("/Login",DirectLoginPage);

router.post("/signUp", CreateAccount);
router.post("/Login",LoginAccount);
router.get("/Logout", getLogOut);

module.exports = router;