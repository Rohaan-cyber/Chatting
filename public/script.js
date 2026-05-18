const socket = io();
let currentRoom = "";
let usernameGlobal = "";
function createRoom() {

    const username =
        document.getElementById("username").value;

    if (!username) return;

    usernameGlobal = username;

    socket.emit("createRoom", username);
}
function joinRoom() {

    const username =
        document.getElementById("username").value;

    const roomId =
        document.getElementById("roomId").value;

    if (!username || !roomId) return;
    usernameGlobal = username;
    currentRoom = roomId; // (only in join)

    socket.emit("joinRoom", {
        roomId,
        username
    });
}
function sendMessage() {

    const input =
        document.getElementById("messageInput");

    const msg = input.value.trim();

    if (!msg) return;

    console.log("CLIENT SEND:", {
        text: msg,
        roomId: currentRoom,
        username: usernameGlobal
    });

    socket.emit("chatMessage", {
        text: msg,
        roomId: currentRoom,
        username: usernameGlobal
    });

    input.value = "";
}

socket.on("oldMessages", (messages) => {

    document.getElementById("menu").style.display =
        "none";

    document.getElementById("chat").style.display =
        "block";

    document.getElementById("roomText").innerText =
        currentRoom;

    document.getElementById("messages").innerHTML = "";

    messages.forEach(addMessage);
});
socket.on("roomCreated", (data) => {

    console.log("ROOM CREATED:", data);

    currentRoom = data.roomId;

    document.getElementById("menu").style.display = "none";
    document.getElementById("chat").style.display = "block";

    document.getElementById("roomText").innerText = data.roomId;

    document.getElementById("messages").innerHTML = "";

    data.messages.forEach(addMessage);
});
socket.on("message", addMessage);

socket.on("errorMessage", (msg) => {
    alert(msg);
});

function addMessage(data) {

    const div = document.createElement("div");

    div.className = "message";

    div.innerHTML =
        `<b>${data.user}</b>: ${data.text}`;

    document.getElementById("messages")
        .appendChild(div);

    div.scrollIntoView();
}
