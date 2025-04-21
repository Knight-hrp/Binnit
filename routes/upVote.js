const express = require('express');
const router = express.Router();
const { setUpVote, upVoteComment } = require("../controllers/upVote");

router.get('/:post_id',async (req,res)=>
{
    setUpVote(req.params.post_id,req.user._id);
    res.redirect('/');
});

router.get('/:community/:post_id',async (req,res)=>
{
    const community = req.params.community;
    const result = await setUpVote(req.params.post_id,req.user._id);
    res.json({ success: true, upvotes: result.upvotes });
});

router.get('/:flag/:community_id/:post_id',async (req,res)=>
    {
        const community_id = req.params.community_id;
        const flag = req.params.flag;
        const post_id = req.params.post_id;
        const result = await setUpVote(post_id, req.user._id);
        res.json({ success: true, upvotes: result.upvotes });
    });

router.get('/:flag/:community_id/:post_id/:comment_id', upVoteComment);
    
module.exports = router;