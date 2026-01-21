const { ROWLOCK } = require("sequelize/lib/table-hints");
const generateToken = require("../helpers/generateToken");
const User = require("../models/userModel")
const bcrypt = require("bcrypt")
const crypto = require("crypto");
const {sendEmail,verificationEmailTemplate} = require("../helpers/sendEmail");

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
        if(!email || !password){
            return res.status(400).json({
                message : "All Fields are Required"
            });
        }

        const fetchUser = await User.findOne({where: {email}});

        //compare Password
        const isValidUser = await bcrypt.compare(password,fetchUser.password);

        if(isValidUser){
            return res.status(400).json({
                message : "Password and Email Doesnot Match!!"
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
                    message : "Error while sending Verification Code"
                });
            }

            return res.status(400).json({
                message : "Your Mail isnot Verified!! Go back to your Mail and Try Verifying!!"
            });
        }

        if(!fetchUser.isActive){
            return res.status(400).json({
                message : "No User Found"
            });
        }

        //Cookies
        const token = generateToken(fetchUser.id,fetchUser.role);

        return res.status(200).json({
            message : "User Login Sucessfully",
            token : token
        });

    }catch(error){
        return res.status(500).json({
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
            message : "User Logged Out Sucessfully"
        });
    }catch(error){
        res.status(500).json({
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
                message : "Token is Missing"
            });
        }

        const fetchUser =await User.findOne({where :{verificationToken : token}});
        if(!fetchUser){
            return res.status(404).json({
                message : "Invalid Token"
            });
        }

        if(fetchUser.verificationExpiresIn < new Date()){
            return res.status(400).json({
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
            message : "User Verified Sucessfully"
        });

    }catch(error){
        return res.status(500).json({
            message : "Error while Verifying Email",
            error : error.message
        });
    }
}


//forgect password
const forgotPassword = async(req, res) =>{
    try{
        const {email} = req.body;

        if(!email){
            return res.status(400).json({
                message : "pleasee enter valid email address"
            })
        }

        const user = await User.findOne({where:{email: email}});
        if(!user){
            return res.status(400).json({
                message : "unregistered email"
            })
        }
        
        
        //Verification Token
        const verificationToken = await crypto.randomBytes(32).toString('hex');

        const verificationExpiresIn = new Date(Date.now() + 1 * 60 * 60 * 1000);

        //link inside email
        const verifyLink = `http://localhost:3000/api/user/reset-password?token=${verificationToken}`;

        const html = verificationEmailTemplate("email",verifyLink);

        //Send Email  to the user email to verify 
        const isEmailSent = sendEmail(email,"Verification Email",html);

        if(!isEmailSent){
            return res.status(400).json({
                message : "Error while sending Verification Code"
            });
        }
        

        user.verificationToken = verificationToken,
        user.verificationTokenExpires = verificationExpiresIn,

        await user.save();

        return res.status(201).json({
            message: "email sent, please verify yourself"
        })

    
    }catch(error){
        return res.status(400).json({
            message: "something went wrong",
            error: error.message
        })
    }
}

module.exports = {
    register,login,logout,verifyEmail, forgotPassword
}