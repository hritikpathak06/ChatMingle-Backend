const express = require("express");
const { registerUser, loginUser, allUsers } = require("../controllers/userController");
const isAuthenticated = require("../middlewares/auth");
const router = express.Router();


router.route("/register").post(registerUser);

router.route("/login").post(loginUser);

router.route("/allusers").get(isAuthenticated, allUsers);


module.exports = router;