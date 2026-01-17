const express = require("express");
const { sequelize, connectDB } = require("./database/Database")
const app = express();

app.get("/",(req,res) =>{
    res.json({message: "Welcome to the Home Page"});
});
app.use(express.json());
// app.use(require('./helpers/authMiddleware'));
app.use("/api/admin",require('./routes/adminRoutes'))
app.use("/api/user",require('./routes/authRoutes'))
app.use("/api/rooms",require('./routes/roomRoutes'))
app.use("/api/reservations",require('./routes/reservationsRoutes'))

const startServer = async () => {
    await connectDB();
    await sequelize.sync();
    app.listen(3000, ()=>{
    console.log(`Server is running on port ${3000}`);
    console.log(`Server is running on port http://localhost:3000`);
});
};

startServer();