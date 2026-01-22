const express = require("express");
const { sequelize, connectDB } = require("./database/Database")
const app = express();
const cors = require('cors'); 
require("./models"); // IMPORTANT: loads associations

app.use(cors({
    origin : ["http://localhost:5173","http://localhost:5174"],
    credentials : true
}));

app.get("/",(req,res) =>{
    res.json({message: "Welcome to the Home Page"});
});
app.use(express.json());
// app.use(require('./helpers/authMiddleware'));
app.use("/api/admin",require('./routes/adminRoutes'))
app.use("/api/user",require('./routes/authRoutes'))
app.use("/api/rooms",require('./routes/roomRoutes'))
app.use("/api/room-types", require("./routes/roomTypeRoutes"));
app.use("/api/room-amenities", require("./routes/roomAmenityRoutes"));
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