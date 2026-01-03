const jwt = require("jsonwebtoken");

const authMiddleware = async(req,res,next) => {
    console.log("Auth Middleware is Running!!");
    next();
}

module.exports = authMiddleware;