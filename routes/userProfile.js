const express = require('express');
const router = express.Router();
const multer = require('multer');
const { setProfilePicture, getProfilePicture } = require('../controllers/userProfile')
const UserProfilePicture = require('../models/userProfilePicture');

var userProfileName= "https://bootdey.com/img/Content/avatar/avatar6.png";

const storage = multer.diskStorage({
    destination: function (req,file, cb)
    {
        return cb(null, "./Uploads");
    },
    filename: function (req,file, cb)
    {
        const name = `${Date.now()}-${file.originalname}`;
        return cb (null ,name)
    }
})

const upload = multer({ storage });

router.get("/",async (req,res)=>{
    const profile =  await getProfilePicture(req.user._id);
    if(profile !== null)
    {
        userProfileName = profile.picture_name;
    }
    console.log(userProfileName);
    res.render("userProfile",{
        image: userProfileName,
    });
})

router.post("/upload", upload.single("profilePicture"),async(req,res) =>{
    if(!req.file)
    {
        return res.redirect("/profile");
    }
    setProfilePicture(req.user._id,req.file.filename);
    return res.redirect("/profile");
});

module.exports = router;