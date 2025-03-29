const USER = require("../models/user");
const PROFILEPICTURE = require("../models/userProfilePicture")
const POST = require("../models/post");

async function renderHome(req,res)
{
    const post = await POST.find({}).sort({ upVote: -1 });
    const user = await USER.find({});
    const userProfile = await PROFILEPICTURE.find({}); 
    res.render("home",{posts: post,users:user,userProfiles: userProfile});
}

module.exports = {renderHome};