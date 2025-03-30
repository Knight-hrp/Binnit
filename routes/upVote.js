const express = require('express');
const router = express.Router();
const {setUpVote} = require("../controllers/home");

router.get('/:post_id',async (req,res)=>
    {
        //console.log(req.user);
        setUpVote(req.params.post_id,req.user._id);
        res.redirect('/');
    });
    
    module.exports = router;