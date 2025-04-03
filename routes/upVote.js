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

router.get('/:flag/:community_id/:post_id',async (req,res)=>
    {
        const community_id = req.params.community_id;
        const flag = req.params.flag;
        const post_id = req.params.post_id
        setUpVote(req.params.post_id,req.user._id);
        res.redirect(`/comments/${flag}/${community_id}/${post_id}`);
    });
    
module.exports = router;