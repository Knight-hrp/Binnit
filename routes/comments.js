const express = require("express");
const router = express.Router();
const { getCommentsByPost, createComment } = require('../controllers/comments');
const { restrictToNonLoginUser } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(restrictToNonLoginUser);

// Route for getting comments by community and post ID
router.get('/:flag/:community/:postId', async (req,res)=>{
    getCommentsByPost(req.user._id, req.params.community, req.params.postId, req.params.flag, res);
});

// Route for creating a new comment
router.post('/:community/:postId', createComment);

module.exports = router;