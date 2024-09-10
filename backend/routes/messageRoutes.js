const express = require("express");
const isAuthenticated = require("../middlewares/auth");
const { sendMessage, getSingleMessage, sendAttachments } = require("../controllers/messageController");
const { upload } = require("../middlewares/multer");
const router = express.Router();


// Get Message
router.route("/:chatId").get(isAuthenticated,getSingleMessage)

// send message
router.route("/send").post(isAuthenticated,sendMessage);

// Attachemnst
router.route("/send-attachments").post( isAuthenticated,upload.array("attachments", 5), sendAttachments);



module.exports = router;
