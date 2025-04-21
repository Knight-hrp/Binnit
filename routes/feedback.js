const express = require('express');
const router = express.Router();
const { restrictToNonLoginUser } = require('../middleware/auth');
const FEEDBACK = require('../models/feedback');
const {getDisplayFeedback} = require('../controllers/feedback')

// GET route to render feedback form
router.get('/', async (req, res) => {
    try {
        res.render('feedbackForm', {
            curr_user: req.user || null,
            success: req.query.success === 'true'
        });
    } catch (error) {
        console.error('Error rendering feedback page:', error);
        res.status(500).send('Internal Server Error');
    }
});

// POST route to submit feedback
router.post('/submit', restrictToNonLoginUser, async (req, res) => {
    try {
        const { title, description } = req.body;
        
        await FEEDBACK.create({
            user_id: req.user._id,
            title: title,
            description: description,
        });

        res.redirect('/feedback?success=true');
    } catch (error) {
        console.error('Error submitting feedback:', error);
        res.status(500).send('Internal Server Error');
    }
});


router.get('/show', restrictToNonLoginUser, getDisplayFeedback)


module.exports = router;