const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role:
    {
        type: String,
        required: true,
        enum: ["NORMAL", "Developer"],
        default: "NORMAL",
    }
})

const USER = mongoose.model("user",userSchema);
module.exports = USER;
