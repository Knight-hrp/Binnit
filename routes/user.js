const express = require('express');
const router = express.Router();
const {DirectSignUpPage, DirectLoginPage, CreateAccount, LoginAccount} = require("../controllers/user")

router.get("/signUp",DirectSignUpPage);
router.get("/Login",DirectLoginPage);

router.post("/signUp", CreateAccount);
router.post("/Login",LoginAccount);


module.exports = router;