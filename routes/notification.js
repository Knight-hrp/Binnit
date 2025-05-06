const express = require('express');
const router = express.Router();
const NOTIFICATION = require('../models/notification');
const USER = require('../models/user');
const POST = require('../models/post');
const COMMENTS = require('../models/comments');
const COMMUNITY = require('../models/community');
const PROFILEPICTURE = require('../models/userProfilePicture');

router.get('/', async (req, res) => {
    try {
        const notifications = await NOTIFICATION.find({ recipient: req.user._id })
            .sort({ createdAt: -1 });

        const profilePictures = await PROFILEPICTURE.find();
        const users = await USER.find();
        const communities = await COMMUNITY.find();
        const comments = await COMMENTS.find();
        const posts = await POST.find();
        res.render('notification', { 
            notifications,
            curr_user: req.user,
            profilePicture: profilePictures,
            users: users,
            communities: communities,
            comments: comments,
            posts: posts,
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).send('Error loading notifications');
    }
});

// Mark a notification as read
router.put('/:id/read', async (req, res) => {
    try {
        const notification = await NOTIFICATION.findOneAndUpdate(
            { _id: req.params.id, recipient: req.user._id },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ error: 'Error marking notification as read' });
    }
});

// Mark all notifications as read
router.put('/mark-all-read', async (req, res) => {
    try {
        await NOTIFICATION.updateMany(
            { recipient: req.user._id, isRead: false },
            { isRead: true }
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({ error: 'Error marking all notifications as read' });
    }
});

// Delete a notification
router.delete('/:id', async (req, res) => {
    try {
        const notification = await NOTIFICATION.findOneAndDelete({
            _id: req.params.id,
            recipient: req.user._id
        });

        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({ error: 'Error deleting notification' });
    }
});

module.exports = router;
