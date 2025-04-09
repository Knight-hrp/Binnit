const express = require('express');
const router = express.Router();
const DOWNVOTE = require('../models/downVote');
const {handleDownVote} = require('../controllers/downVote');

// Add GET route for downvoting
router.get('/:flag/:post_id',async (req,res)=>{
    console.log(req.user);
    await handleDownVote(req,res, req.user,req.params.flag);
});
router.post('/:flag/:post_id',async(req,res)=>{
    await handleDownVote(req,res,req.user,req.params.flag);
});

module.exports = router;
