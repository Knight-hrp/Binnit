const bcrypt = require('bcrypt');
const USER = require('../models/user');
const {setUser} = require('../service/auth');
const UPVOTE = require('../models/upVote');
const POST = require('../models/post');

async function DirectSignUpPage(req,res)
{
    return res.render("signup");
}

async function DirectLoginPage(req,res){
    return res.render("login");
}

async function CreateAccount(req,res) {
    const {name, email, password} = req.body;
    const isEmail = await USER.findOne({email});
    if(!isEmail)
    {
        const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds
        await USER.create({
            name: name,
            email: email,
            password: hashedPassword,
        });
        return res.redirect("/user/login");
    }
    else
    {
        return res.render("signup",{
            error: "Email is Already Exist, Please try again",
        });
    }
}

async function LoginAccount(req,res)
{
    const {email, password} = req.body;
    const isEmail = await USER.findOne({email});
    if(!isEmail)
    {
        return res.render("login",{
            error:"Wrong Email. Please Try again",
        })
    }
    else
    {
        const isPasswordValid = await bcrypt.compare(password, isEmail.password);
        if(isPasswordValid)
        {
            const token = setUser(isEmail);
            res.cookie("uid", token,{
                maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
                httpOnly: true, // Prevents client-side access for security
                secure: true, // Only send over HTTPS
                sameSite: "Strict" // Prevent CSRF attacks
            });
            return res.redirect("/");
        }
        else
        {
            return res.render("login",{
                error:"Wrong password. Please Try again",
            })
        }
    }
}

async function ChangeRole(id,role)
{
    await USER.findOneAndUpdate({_id: id},{role:role});
}

const getUserDetail = async (req, res) => {
    try {
        // ... existing code ...
        
        // Get the current user's upvoted posts to check against displayed posts
        const likedPosts = await UPVOTE.find({ user: req.user?._id }).lean();
        const likedPostsSet = new Set(likedPosts.map(like => like.post.toString()));
        
        // Add isLiked property to each post
        const userPosts = await POST.find({ user: user._id })
            .sort({ createdAt: -1 })
            .lean();
            
        userPosts.forEach(post => {
            post.isLiked = likedPostsSet.has(post._id.toString());
        });
        
        // Add isLiked property to saved posts
        const savedPosts = await POST.find({ _id: { $in: user.saved } })
            .sort({ createdAt: -1 })
            .lean();
            
        savedPosts.forEach(post => {
            post.isLiked = likedPostsSet.has(post._id.toString());
        });
        
        // Add isLiked property to liked posts
        const userLikedPosts = await POST.find({ _id: { $in: likedPosts.map(like => like.post) } })
            .sort({ createdAt: -1 })
            .lean();
            
        userLikedPosts.forEach(post => {
            post.isLiked = true; // These are definitely liked
        });
        
        // ... existing code ...
        
        res.render("userProfile", { 
            user: user,
            posts: userPosts,
            saved: savedPosts,
            liked: userLikedPosts,
            // ... existing code ...
        });
    } catch (error) {
        // ... existing code ...
    }
};

async function getLogOut(req,res)
{
    res.clearCookie("uid");
    return res.redirect("/");
}

module.exports = {
    DirectSignUpPage,
    DirectLoginPage,
    CreateAccount,
    LoginAccount,
    ChangeRole,
    getUserDetail,
    getLogOut,
}
