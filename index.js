const express = require("express");
const { sequelize, connectDB } = require("./database/Database")
const app = express();

app.get("/",(req,res) =>{
    res.json({message: "Welcome to the Home Page"});
});

const startServer = async () => {
    await connectDB();
    await sequelize.sync();
    app.listen(3000, ()=>{
    console.log(`Server is running on port ${3000}`);
    console.log(`Server is running on port http://localhost:3000`);
});
};

startServer();