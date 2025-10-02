const express = require("express");
const { v4: uuidV4 } = require("uuid");
const http = require("http");
const socketIo = require("socket.io");
const { ExpressPeerServer } = require("peerjs-server");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.set("view engine", "ejs");
app.use(express.static("public"));

// PeerJS server
const peerServer = ExpressPeerServer(server, {
  debug: true,
});
app.use("/peerjs", peerServer);

// Default route → generate unique room ID
app.get("/", (req, res) => {
  res.redirect(`/${uuidV4()}`);
});

// Room route
app.get("/:room", (req, res) => {
  res.render("index", { RoomId: req.params.room });
});

// Socket.io handling
io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).emit("user-connected", userId);

    socket.on("disconnect", () => {
      socket.to(roomId).emit("user-disconnected", userId);
    });
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`✅ Server running on http://localhost:${PORT}`)
);
