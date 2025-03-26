const mongoose = require('mongoose');

const profilePictureSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true,
        ref: "users",
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