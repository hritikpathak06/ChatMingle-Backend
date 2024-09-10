const generateToken = require("../helpers/generateToken");
const User = require("../models/userSchema");
const asyncHandler = require("express-async-handler");
const cloudinary = require("cloudinary").v2;

//******************************************** */ Cloudinary Config **********************************
cloudinary.config({
  cloud_name: "drbzzh6j7",
  api_key: "776943229854165",
  api_secret: "RWZatGE-U7hTRE0Re8XM8JnVv84",
});

// Register User Controller
exports.registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, pic } = req.body;
  if (!name || !email || !password) {
    return res.status(404).json({
      success: false,
      message: "Please Fill Out All The Fields",
    });
  }
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User Already Exists",
      });
    }

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(pic, {
      folder: "profile_images",
    });

    const user = await User.create({
      name,
      email,
      password,
      pic: result.secure_url,
    });
    const token = await generateToken(user._id);
    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      pic: user.pic,
      token: token,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

// Login User Controller
exports.loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please Fill Out All The Fields",
    });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User Not Found",
      });
    }
    const isPasswordMatched = await user.comparePassword(password);
    if (!isPasswordMatched) {
      return res.status(400).json({
        success: false,
        message: "Invalid Credeentials",
      });
    }
    const token = await generateToken(user._id);
    return res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      pic: user.pic,
      token: token,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

// Search User Controller
exports.allUsers = asyncHandler(async (req, res) => {
  try {
    const keyword = req.query.search
      ? {
          $or: [
            { name: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } },
          ],
        }
      : {};
    const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
});
