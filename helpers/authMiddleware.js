const authMiddleware = async(req,res,next) => {
    console.log("Auth Middlwware Running!!")
    let token;

    //Token passed through headers
    if(req.headers.authorize && req.headers.authorize.startsWith("Bearer")){
        token = req.headers.authorize.split(" ")[1];
    }else if(req.cookies.jwt){
    //Token passed through Cookiee
        token = req.cookies.jwt;
    }

    if(!token){
        return res.status(400).json({
            message : "Acess Denied"
        });
    }

    
}