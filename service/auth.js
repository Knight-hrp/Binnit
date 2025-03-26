const jwt = require('jsonwebtoken');
const secretKey = "752@Rishabh";

function setUser(user){
    return jwt.sign({
        _id:user._id,
        name: user.name,
        email: user.email,
        password: user.password,
        role: user.role,
    },secretKey);
}

function getUser(token)
{
    if(!token) return null;
    try{

        return jwt.verify(token,secretKey);
    }
    catch(error)
    {
        return null
    }
}

module.exports = {
    setUser,
    getUser
}