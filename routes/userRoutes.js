const router = require('express').Router();

const {registerUser,userLogin} = require("../controllers/userController")

router.post("/registerUser",registerUser);
router.post("/userLogin",userLogin);

module.exports = router;