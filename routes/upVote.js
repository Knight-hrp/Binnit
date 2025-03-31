const express = require('express');
const router = express.Router();
const {setUpVote} = require("../controllers/home");

router.get('/:post_id',async (req,res)=>
{
    setUpVote(req.params.post_id,req.user._id);
    res.redirect('/');
});

router.get('/:community/:post_id',async (req,res)=>
{
    const community = req.params.community;
    setUpVote(req.params.post_id,req.user._id);
    res.redirect(`/community/${community}`);
});
    
module.exports = router;