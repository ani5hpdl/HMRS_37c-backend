const RegisterUser = require("../models/userModels");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const registerUser= async(req,res) =>{
    const{username, email, password}=req.body;

    if(!username || !email || !password){
        return res.status(400).json({
            message:"please fill all fields"
        });
    }
    const user = await RegisterUser.findOne({where:{username:username}});
    if(user){
        return res.status(400).json({
            message:`${username} already exists` 
        });
    }

    // const verficationToken = crypto

    // hashing password
    const hashedpassword = bcrypt.hashSync(password,10)

    //passig data to model 
    const createUser =await RegisterUser.create({
        username,
        email,
        password : hashedpassword
    });
    return res.status(201).json({
        message:"user registered sucuessfully",
        user: {
            username :createUser.username,
            email : createUser.email
        }

    })
}
const userLogin = async(req,res) =>{
    const{email,password}= req.body;

    if(!email || !password){
        return res.status(400).json({
            message:"email or password cannot be empty"
        })
    }
    const user = await RegisterUser.findOne({where:{email : email}})
    if(!user){
        return res.status(404).json({
            message:`No user found with this email ${email}`
        })
    }

    const isMatch = await bcrypt.compare(password,user.password)

    if(isMatch){
        return res.status(201).json({
            message : "login succesfull"
        })
    }else{
        return res.status(401).json({
            message : "login failed"
        })
    }
}
module.exports = {registerUser,userLogin};