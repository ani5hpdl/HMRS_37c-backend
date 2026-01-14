const jwt = require("jsonwebtoken");
const { where } = require("sequelize");
const User = require('../models/userModel')

const authMiddleware = async(req,res,next) => {

    let token;

    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
        token = req.headers.authorization.split(" ")[1];
    }else if(res.cookies?.jwt){
        token = res.cookies.jwt
    }

    if(!token){
        return res.status(400).json({
            error : "No Authorized Token not Found  "
        })
    }

    try{
        //Verify the Token and extract the userId

        const decoded = jwt.verify(token,process.env.JWT_SECRET);

        const user = await User.findOne({where : {id : decoded.userId}});

        if(!user){
            return res.status(400).json({
                message : "User no longer exists!!"
            });
        }
        
        req.user = user;
        next();
    }catch(error){
        return res.status(400).json({
            message : "No Authorize Token",
            error : error.message
        });
    }
}

module.exports = authMiddleware;