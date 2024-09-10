const mongoose = require("mongoose");

const attachmentSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["image", "video", "audio"],
      required: true,
    },
    // Add any other fields you need for the attachment
  },
  { timestamps: true }
);

const Attachment = mongoose.model("Attachment", attachmentSchema);

module.exports = Attachment;
