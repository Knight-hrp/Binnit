const mongoose = require('mongoose');

const profilePictureSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    picture_name:
    {
        type: String,
        required: true,
        unique: true,
    }
})

const PROFILEPICTURE = mongoose.model("profilePictures",profilePictureSchema);
module.exports = PROFILEPICTURE;