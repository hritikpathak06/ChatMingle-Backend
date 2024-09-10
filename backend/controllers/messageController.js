const Message = require("../models/messageSchema");
const asyncHandler = require("express-async-handler");
const User = require("../models/userSchema");
const Chat = require("../models/chatSchema");
const multer = require("multer");
const Attachment = require("../models/attachementSchema");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "drbzzh6j7",
  api_key: "776943229854165",
  api_secret: "RWZatGE-U7hTRE0Re8XM8JnVv84",
});

// Send Message Controller
exports.sendMessage = asyncHandler(async (req, res) => {
  try {
    const { content, chatId } = req.body;
    if (!content || !chatId) {
      return res.status(400).json({
        success: false,
        message: "Invalid Data",
      });
    }
    var newMessage = {
      sender: req.user._id,
      content: content,
      chat: chatId,
    };
    var message = await Message.create(newMessage);
    message = await message.populate("sender", "name pic");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });
    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });
    res.json(message);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

// Get My Message with a specific Chat Controller
exports.getSingleMessage = asyncHandler(async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic email")
      .populate("chat")
      .populate("attachments");
    res.json(messages);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

// Send Attachments controller
exports.sendAttachments = asyncHandler(async (req, res) => {
  try {
    const { chatId } = req.body;

    // Assuming you have configured Multer to handle file uploads
    const attachments = req.files; // This will be an array of files

    const uploadedAttachments = [];

    // Upload each attachment to Cloudinary and save the URL and type
    for (const attachment of attachments) {
      const result = await cloudinary.uploader.upload(attachment.path, {
        resource_type: "auto",
      });

      const newAttachment = new Attachment({
        url: result.secure_url,
        type: attachment.mimetype.split("/")[0],
      });
      await newAttachment.save();

      uploadedAttachments.push(newAttachment);
    }

    // Create a new message with the uploaded attachments
    const message = new Message({
      sender: req.user._id, // Assuming req.user contains the ID of the sender
      chat: chatId,
      attachments: uploadedAttachments,
    });
    await message.save();

    res.status(201).json({ message: "Attachments sent successfully", message });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Failed to send attachments", message: error.message });
  }
});
