const express = require("express");
const isAuthenticated = require("../middlewares/auth");
const {
  createChat,
  getMyChats,
  createGroupChat,
  renameGroupName,
  removeUserFromGroup,
  addUserToGroup,
} = require("../controllers/chatController");

const router = express.Router();

// Creating the chat
router.route("/create").post(isAuthenticated, createChat);

// Get All Chats
router.route("/mychats").get(isAuthenticated, getMyChats);

// Create Group Chat
router.route("/creategroup").post(isAuthenticated, createGroupChat);

// Rename The Group
router.route("/renamegroup").put(isAuthenticated, renameGroupName);

// Remove or Leave The Group
router.route("/remove").put(isAuthenticated, removeUserFromGroup);

// Add Users to Group
router.route("/add").put(isAuthenticated, addUserToGroup);

module.exports = router;
