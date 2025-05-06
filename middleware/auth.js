
async function restrictToNonLoginUser(req, res, next) {  
    const { getUser } = require('../service/auth');

    const userUid = req.cookies?.uid; 
    if (!userUid) {
        return res.redirect("/user/login");
    }
    
    const user = getUser(userUid);
    if (!user) return res.redirect('/user/login');

    req.user = user;
    next();
}

module.exports = {
    restrictToNonLoginUser,
};
