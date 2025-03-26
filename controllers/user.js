const USER = require('../models/user');
const {setUser} = require('../service/auth');

async function DirectSignUpPage(req,res){
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
        await USER.create({
            name: name,
            email: email,
            password: password,
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
        if(password === isEmail.password)
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

module.exports = {
    DirectSignUpPage,
    DirectLoginPage,
    CreateAccount,
    LoginAccount,
    ChangeRole,
}
