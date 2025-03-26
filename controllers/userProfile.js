const UserProfilePicture = require('../models/userProfilePicture');


async function setProfilePicture(user_id, profilePictureName) {
    try {
        let profile = await UserProfilePicture.findOne({ user_id });
        const pathPicture = `/Uploads/${profilePictureName}`;
        if (!profile) {
            profile = await UserProfilePicture.create({
                user_id,
                picture_name: pathPicture,
            });
        } else {
            profile = await UserProfilePicture.findOneAndUpdate(
                { user_id },
                { picture_name: pathPicture },
                { new: true }
            );
        }

        console.log(`Profile picture updated for User ID: ${user_id}, New Picture: ${profilePictureName}`);
        return profile;
    } catch (error) {
        console.error("Error setting profile picture:", error);
        throw error;
    }
}

async function getProfilePicture(user_id)
{
    const profile =  await UserProfilePicture.findOne({ user_id:user_id }); 
    if(!profile)
    {
        return null;
    }
    else
    {
        return profile;
    }
}

module.exports = {
    setProfilePicture,
    getProfilePicture,
};
