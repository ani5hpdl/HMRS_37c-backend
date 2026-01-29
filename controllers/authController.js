const { ROWLOCK } = require("sequelize/lib/table-hints");
const generateToken = require("../helpers/generateToken");
const User = require("../models/userModel")
const bcrypt = require("bcrypt")
const crypto = require("crypto");
const {sendEmail,verificationEmailTemplate, forgetPasswordTemplate} = require("../helpers/sendEmail");

const register = async(req,res) => {
    try{
        const {name,email,password} = req.body;
        if(!name || !email || !password){
            return res.status(400).json({
                message : "All Fields are required!!"
            });
        }

        const userExists =await User.findOne({where : {
            email : email,
            isActive : true
        }});
        if(userExists){
            return res.status(409).json({
                message : "User already Exist with this Email"
            });
        }

        //Password Hashing
        const hashedPassword = await bcrypt.hash(password,10);

        //Verification Token
        const verificationToken = await crypto.randomBytes(32).toString('hex');

        const verificationExpiresIn = new Date(Date.now() + 1 * 60 * 60 * 1000);

        const verificationLink = `{http://localhost:3000/api/user/verify?token=${verificationToken}}`;

        const html = verificationEmailTemplate(name,verificationLink);

        //Send Email  to the user email to verify 
        const isEmailSent = sendEmail(email,"Verification Email",html);

        if(!isEmailSent){
            return res.status(400).json({
                message : "Error while sending Verification Code"
            });
        }
        
        //Create User
        const newUser = await User.create({
            name,
            email,
            password : hashedPassword,
            verificationToken : verificationToken,
            verificationExpiresIn : verificationExpiresIn,
            isEmailVerified : false,
            role : 'user',
            isActive : true
        });

        return res.status(201).json({
            message : "User Registered Sucessfully!!"
        });

    }catch(error){
        return res.status(500).json({
            message : "Error while Registering User",
            error : error.message
        });
    }
}

const login = async(req,res) => {
    try{
        const {email,password} = req.body;
        console.log(req.body);
        if(!email || !password){
            return res.status(400).json({
                success : false,
                message : "All Fields are Required"
            });
        }

        const fetchUser = await User.findOne({where: {email}});

        if(!fetchUser){
            return res.status(400).json({
                success : false,
                message : "Password and Email Doesnot Match!!"
            });
        }

        //compare Password
        const isValidUser = await bcrypt.compare(password,fetchUser.password);

        if(!isValidUser){
            return res.status(400).json({
                success : false,
                message : "Password and Email Doesnot Match!!!"
            });
        }

        //Sent email if email isnot verified
        if(!fetchUser.isEmailVerified){

            const verificationExpiresIn = new Date(Date.now() + 1 * 60 * 60 * 1000);

            await fetchUser.update({verificationExpiresIn : verificationExpiresIn});

            const verificationLink = `http://localhost:3000/api/user/verify?token=${fetchUser.verificationToken}`;

            const html = verificationEmailTemplate(await fetchUser.name,verificationLink);

            const isEmailSent = sendEmail(email,"Verification Email",html);

            if(!isEmailSent){
                return res.status(400).json({
                    success : false,
                    message : "Error while sending Verification Code"
                });
            }

            return res.status(400).json({
                success : false,
                message : "Your Mail isnot Verified!! Go back to your Mail and Try Verifying!!"
            });
        }

        if(!fetchUser.isActive){
            return res.status(400).json({
                success : false,
                message : "No User Found"
            });
        }

        //Cookies
        const token = generateToken(fetchUser.id,fetchUser.role);

        return res.status(200).json({
            success : true,
            message : "User Login Sucessfully",
            token : token
        });

    }catch(error){
        return res.status(500).json({
            success : false,
            message : "Error while Logging",
            error : error.message
        });
    }
}

const logout = async(req,res) => {
    try{    
        res.cookies("jwt","",{
            httpOnly : true,
            expires : new Date(0)
        });

        res.status(200).json({
            success : true,
            message : "User Logged Out Sucessfully"
        });
    }catch(error){
        res.status(500).json({
            success : false,
            message : "Error while Logging Out",
            error : error.message
        });
    }
}

const verifyEmail = async(req,res) => {

    try{
        const {token} = req.query;
        if(!token){
            return res.status(404).json({
                success : false,
                message : "Token is Missing"
            });
        }

        const fetchUser =await User.findOne({where :{verificationToken : token}});
        if(!fetchUser){
            return res.status(404).json({
                success : false,
                message : "Invalid Token"
            });
        }

        if(fetchUser.verificationExpiresIn < new Date()){
            return res.status(400).json({
                success : false,
                message : "User Token Exipres! Please Try Logging in!!"
            });
        }

        //Set verified email true and other verification values to null as Verification ends after being verified
        await fetchUser.update({isEmailVerified : true,
            verificationToken : null,
            verificationExpiresIn : null
        });
        await fetchUser.save();

        return res.status(200).json({
            success : true,
            message : "User Verified Sucessfully"
        });

    }catch(error){
        return res.status(500).json({
            success : false,
            message : "Error while Verifying Email",
            error : error.message
        });
    }
}

const getMe = async(req,res) => {
    try{
        const userId = req.user.id;
        const fetchUser = await User.findByPk(userId,{
            attributes : ['id','name','email','role','isActive','isEmailVerified']
        });
        if(!fetchUser){
            return res.status(404).json({
                success : false,
                message : "User Not Found"
            });
        }
        return res.status(200).json({
            success : true,
            data : fetchUser
        });
    }catch(error){
        return res.status(500).json({
            success : false,
            message : "Error while fetching User Data",
            error : error.message
        });
    }
}

const forgetPassword = async(req,res) => {
    try{
        const {email} = req.body;
        if( !email){
            return res.status(400).json({
                success : false,
                message : "Fill up the form First!"
            });
        }

        const userExists =await User.findOne({where : {
            email : email,
            isActive : true
        }});

        console.log(userExists);

        if(!userExists){
            return res.status(400).json({
                success : false,
                message : "Invalid Attempts"
            });
        }

        //Verification Token
        userExists.verificationToken = await crypto.randomBytes(32).toString('hex');

        userExists.verificationExpiresIn = new Date(Date.now() + 1 * 60 * 60 * 1000);

        userExists.save();

        const verificationLink = `http://localhost:5173/resetpassword?token=${userExists.verificationToken}&email=${email}`;

        const html = forgetPasswordTemplate(userExists.name,verificationLink);

        //Send Email  to the user email to verify 
        const isEmailSent =await sendEmail(email,"Reset Password Email",html);

        if(!isEmailSent){
            return res.status(400).json({
                message : "Error while sending Verification Code"
            });
        }
        
        return res.status(200).json({
            success : true,
            message : "Mail Sent Sucessfully ! Check there"
        });

    }catch(error){
        return res.status(500).json({
            success : false,
            message : "Error in Forget Password",
            error : error.message
        });
    }
}
const verifyResetPassword = async(req,res) => {
    try{
        console.log(req.body);
        const {token,email} = req.query;
        const {password, confirmPassword} = req.body;

        if(!token || !email){
            return res.status(404).json({
                success : false,
                message : "Invalid attempts"
            });
        }

        if(password !== confirmPassword){
            return res.status(400).json({
                success : false,
                message : "Password and Confirm Password Doesnot Match!!"
            });
        }

        const fetchUser =await User.findOne({where :{verificationToken : token, email : email}});
        if(!fetchUser){
            return res.status(404).json({
                success : false,
                message : "Invalid Token or User"
            });
        }

        if(fetchUser.verificationExpiresIn < new Date()){
            return res.status(400).json({
                success : false,
                message : "User Token Exipres! Please Try Logging in!!"
            });
        }

        const hashedPassword = await bcrypt.hash(password,10);

        //Set verified email true and other verification values to null as Verification ends after being verified
        await fetchUser.update({
            password : hashedPassword,
            verificationToken : null,
            verificationExpiresIn : null
        });
        await fetchUser.save();

        return res.status(200).json({
            success : true,
            message : "User Password Changed "
        });

    }catch(error){
        return res.status(500).json({
            success : false,
            message : "Error while Verifying Email",
            error : error.message
        });
    }
}

module.exports = {
    register,login,logout,verifyEmail,getMe,forgetPassword, verifyResetPassword
}
