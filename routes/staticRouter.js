const express = require('express');
const router = express.Router();
const url  = require('url');

router.get('/',async(req,res)=>{
    res.render("home");
})

module.exports = router;

