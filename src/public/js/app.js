const socket = io();

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");
const msgform = document.getElementById("msg");
const nameform = document.getElementById("name");

room.hidden = true;

let roomName;

function addMessage(msg) {
  const ul = room.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = msg;
  ul.appendChild(li);
}

function showRoom() {
  welcome.hidden = true;
  room.hidden = false;
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName}`;
}

function handleRoomSubmit(event) {
  event.preventDefault();
  const input = form.querySelector("input");
  socket.emit("enter_room", input.value, showRoom);
  roomName = input.value;
  input.value = "";
}

function handleMsgSubmit(event) {
  event.preventDefault();
  const input = msgform.querySelector("input");
  const value = input.value;
  socket.emit("new_message", value, roomName, () => {
    addMessage(`You: ${value}`);
  });
  input.value = "";
}

function handleNameSubmit(event) {
  event.preventDefault();
  const input = nameform.querySelector("input");
  const value = input.value;
  socket.emit("nickname", value);
  input.value = "";
}

form.addEventListener("submit", handleRoomSubmit);
msgform.addEventListener("submit", handleMsgSubmit);
nameform.addEventListener("submit", handleNameSubmit);

socket.on("welcome", (nickname) => {
  addMessage(`${nickname} joined!!`);
});
socket.on("bye", (nickname) => {
  addMessage(`${nickname} left!!`);
});
socket.on("new_message", addMessage);
