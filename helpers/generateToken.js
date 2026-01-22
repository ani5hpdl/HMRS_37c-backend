const jwt = require("jsonwebtoken")

const generateToken = (userId , role) => {
    const payload = {userId,role};
    const token = jwt.sign(payload,process.env.JWT_SECRET,{
        expiresIn : process.env.JWT_EXPIRES_IN || "7d"
    });

    // res.cookie("jwt",token,{
    //     httpOnly :true,
    //     sameSite : "strict",
    //     maxAge : 1000*60*60*24*7
    // });

    return token;
}

module.exports = generateToken