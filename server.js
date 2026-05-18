const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const fs = require("fs");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const FILE = "rooms.json";

function loadRooms() {
    if (!fs.existsSync(FILE)) {
        fs.writeFileSync(FILE, "{}");
    }

    return JSON.parse(fs.readFileSync(FILE));
}

function saveRooms(data) {
    setTimeout(() => {
        fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
    }, 200);
}

let rooms = loadRooms();

io.on("connection", (socket) => {
    socket.on("createRoom", (username) => {
        const roomId =
            Math.random().toString(36).substring(2, 8);
        console.log("CREATE ROOM:", roomId, username);
        rooms[roomId] = {
            users: [username],
            messages: []
        };
        socket.join(roomId);

        socket.roomId = roomId;
        socket.username = username;
        saveRooms(rooms);
        socket.emit("roomCreated", {
            roomId,
            messages: rooms[roomId].messages
        });

        io.to(roomId).emit("message", {
            user: "System",
            text: `${username} created the room`
        });
    });
    socket.on("joinRoom", ({ roomId, username }) => {

        if (!rooms[roomId]) {
            socket.emit("errorMessage", "Room does not exist");
            return;
        }
        console.log("JOIN ROOM:", roomId, username);
        socket.join(roomId);

        socket.roomId = roomId;
        socket.username = username;

        rooms[roomId].users.push(username);
        saveRooms(rooms);
        socket.emit("oldMessages", rooms[roomId].messages);

        io.to(roomId).emit("message", {
            user: "System",
            text: `${username} joined the room`
        });
    });
    // SEND MESSAGE
    socket.on("chatMessage", ({ text, roomId, username }) => {

        console.log("SERVER RECEIVED MSG:", text, roomId, username);

        if (!roomId || !rooms[roomId]) {
            console.log("NO ROOM FOUND");
            return;
        }

        const data = {
            user: username,
            text
        };

        rooms[roomId].messages.push(data);
       saveRooms(rooms);
        io.to(roomId).emit("message", data);
    });
    socket.on("disconnect", () => {
        console.log("Disconnected");
    });
});

server.listen(3000, () => {
    console.log("Running on port 3000");
});
