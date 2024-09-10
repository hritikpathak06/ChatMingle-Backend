const express = require("express");
const app = express();
const dotenv = require("dotenv");
const connectToDB = require("./database/connection.js");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const userRoutes = require("./routes/userRoutes.js");
const chatRoutes = require("./routes/chatRoutes.js");
const messageRoutes = require("./routes/messageRoutes.js");
const path = require("path");
const cors = require("cors");

// Config
dotenv.config();
connectToDB();

// Middlewares
app.use(express.json({ limit: "100mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "100mb" }));
app.use(morgan("common"));
app.use(cors({
  origin:process.env.APP_URL
}))

// Routes
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/chat", chatRoutes);
app.use("/api/v1/message", messageRoutes);

// Demo Routes
// app.get("/", (req, res) => {
//   res.send("Homepage of the server");
// });

// *************************************Deployemnt**************************************//
// const __dirname1 = path.resolve();
// if (process.env.NODE_ENV == "production") {
//   app.use(express.static(path.join(__dirname1, "/frontend/build")));
//   app.get("*", (req, res) => {
//     res.sendFile(path.resolve(__dirname1, "frontend", "build", "index.html"));
//   });
// } else {
//   app.get("/", (req, res) => {
//     res.send("Homepage of the server");
//   });
// }
// *************************************Deployemnt**************************************//

const port = process.env.PORT || 9000;

const server = app.listen(port, () => {
  console.log("Server Is Running On The Port: ", port);
});

// ***************** Socket.io Config *******************************//
const io = require("socket.io")(server, {
  cors: {
    origin: process.env.APP_URL,
    // credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("A user connceted to socket");

  socket.on("setup", (userData) => {
    socket.join(userData._id);
    console.log(userData._id);
    socket.emit("connected");
  });

  socket.on("join-room", (room) => {
    socket.join(room);
    console.log(`User Joined Room ${room}`);
  });

  socket.on("typing", (room) => {
    socket.in(room).emit("typing");
  });

  socket.on("stop-typing", (room) => {
    socket.in(room).emit("stop-typing");
  });

  socket.on("new-message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;
    if (!chat.users) return console.log("Chat.users Not Defined");
    chat.users.forEach((user) => {
      if (user._id === newMessageRecieved.sender._id) return;

      socket.in(user._id).emit("message-recieved", newMessageRecieved);
    });
  });

  socket.on("send-attachment", async ({ chatId, attachments }) => {
    console.log(
      "User send this Attachemnts: ",
      attachments,
      "To room: ",
      chatId
    );
    socket.to(chatId).emit("receive-attachment", attachments);
  });

  socket.off("setup", () => {
    console.log("User Disconnected");
    socket.leave(userData._id);
  });
});
