const bcrypt = require("bcrypt")
const User = require("../models/userModel.js");
const { where } = require("sequelize");
const generateToken = require("../helpers/generateToken.js");

const createUser = async(req,res) => {  
    try{
        const {name,email,password,role} = req.body;

        if(!name || !email || !password || !role){
            return res.status(400).res.json({
                message : "All Fields are required!!"
            });
        }

        const isEmailExist = await User.findOne({where: {email}});
        if(isEmailExist){
            return res.status(409).json({
                message : "Email is Already in Use!"
            });
        }

        const hashedPassword = await bcrypt.hash(password,10);

        const newUser = await User.create({
            name,
            email,
            password : hashedPassword,
            role : role,
            isActive : true,
            isEmailVerified : true,
            verificationToken : "qop"            
        });

        const token = generateToken(newUser.id,newUser.role,res);

        return res.status(200).json({
            message : "New User is Created by Admin"
        });
    }catch(error){
        res.status(500).json({
            message : "Error while creating user!",
            error : error.message
        })
    }
}
const getUserById = async(req,res) => {
    try{
        const id = req.params.id;

        if(id == null){
            return res.status(400).json({
                message : "Please provide userId to Fetch"
            });
        }

        const fetchUser = await User.findByPk(id);

        if(!fetchUser){
            return res.status(404).json({
                message : "User Not Found"
            });
        }

        return res.status(200).json({
            message : "User Available",
            data : {
                name : fetchUser.name,
                email : fetchUser.email,
                role : fetchUser.role,
                isActive : fetchUser.isActive
            }
        });
    }catch(error){
        return res.status(500).json({
            message : "Error while fetching data",
            error : error.message
        });
    }
}
const getAllUsers = async(req,res) => {
    try{
        const allUsers =await User.findAll({attributes: ['name','email','role','isActive','isEmailVerified']});
        if(!allUsers){
            return res.status(404).json({
                message : "No Users Found"
            });
        }

        return res.status(200).json({
            message : "All Users Fetched Sucessfully",
            data : {
                allUsers
            }
        })
    }catch(error){
        return res.status(500).json({
            message : "Error While Fetching all Users",
            error : error.message
        });
    }
}
const updateUser = async(req,res) => {
    try{
        const id = req.params.uid;
        if(!id){
            return res.status(400).json({
                message : "Please Provide us UserId"
            });
        }
        
        const user =await User.findByPk(id);
        if(!user){
            return res.status(404).json({
                message : "User Not Found"
            });
        }

        const {name,email,role,isActive,isEmailVerified} = req.body;

        if(email && email != user.email){
              const isEmailExist = await User.findOne({where: {email}});
            if(isEmailExist){
                return res.status(409).json({
                    message : "Email is Already in Use!"
                });
            }
        }

        await user.update({
            name : name || user.name,
            email : email || user.email,
            role : role || user.role,
            isActive : isActive || user.isActive,
            isEmailVerified : isEmailVerified || user.isEmailVerified
        });

        return res.status(200).json({
            message : "User Updated Successfully",
            data : {
                name : user.name,
                email : user.email,
                role : user.role,
                isActive : user.isActive,
                isEmailVerified : user.isEmailVerified
            }
        });
        
    }catch(error){
        return res.status(500).json({
            message : "Error While Updating User",
            error : error.message
        })
    }
}
const deleteUser = async(req,res) => {
    try {
        const id = req.params.did;

        const user =await User.findByPk(id);
        if(!user){
            return res.status(400).json({
                message : "No User Found"
            });
        }
        
        await user.update({isActive : false});
        await user.save();

        return res.status(200).json({
            message : "User Deleted Sucessfully"
        });
    } catch (error) {
        return res.status(500).json({
            message : "Error while deleting user",
            error : error.message
        });
    }
}

module.exports= {
    createUser, getUserById, getAllUsers, updateUser, deleteUser
}