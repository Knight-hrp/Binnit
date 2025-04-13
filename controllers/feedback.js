const FEEDBACK = require("../models/feedback");
const PROFILEPICTURE = require("../models/userProfilePicture")
const USER = require("../models/user");

async function getDisplayFeedback (req,res)
{
    try {
        // Fetch all feedback with user details, sorted by newest first
        const feedbacks = await FEEDBACK.find()
            .populate({
                path: 'user_id',
                select: 'name email', // Only get name and email from user
                model: USER
            })
            .sort({ createdAt: -1 }); // Sort by newest first

        // Get profile pictures for users
        const userProfiles = await PROFILEPICTURE.find({});

        // Render the feedback display page with the data
        res.render('feedbackDisplay', {
            feedbacks: feedbacks,
            userProfiles: userProfiles,
            curr_user: req.user || null
        });
    } catch (error) {
        console.error('Error fetching feedback:', error);
        res.status(500).send('Error fetching feedback data');
    }
}

module.exports = {getDisplayFeedback}
