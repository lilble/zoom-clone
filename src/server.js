import http from "http";
// import WebSocket from "ws";
import SocketIO from "socket.io";
import express from "express";

const app = express();

app.set("view engine", "pug"); // template engine의 종류 : pug
app.set("views", __dirname + "/views"); // template file 위치
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (_, res) => res.render("home")); // route handler - rendering "home.pug"
app.get("/*", (_, res) => res.redirect("/"));

const httpserver = http.createServer(app);
const io = SocketIO(httpserver);

function publicRooms() {
  const {
    sockets: {
      adapter: { sids, rooms },
    },
  } = io;
  const publicRooms = [];
  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) {
      publicRooms.push(key);
    }
  });
  console.log(rooms);
  return publicRooms;
}

function countRoom(roomName) {
  return io.sockets.adapter.rooms.get(roomName)?.size;
}

io.on("connection", (socket) => {
  socket["nickname"] = "Anonymous";
  socket.on("refresh", () => {
    io.sockets.emit("room_change", publicRooms());
  });
  socket.onAny((event) => {
    console.log(`socket event: ${event}`);
    // console.log(io.sockets.adapter);
  });
  socket.on("enter_room", (roomName, done) => {
    socket.join(roomName);
    const numPeople = countRoom(roomName);
    done(numPeople);
    socket.to(roomName).emit("welcome", socket.nickname, numPeople);
    io.sockets.emit("room_change", publicRooms());
  });
  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) =>
      socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1)
    );
  });
  socket.on("disconnect", () => {
    io.sockets.emit("room_change", publicRooms());
  });
  socket.on("new_message", (msg, roomName, done) => {
    socket.to(roomName).emit("new_message", `${socket.nickname}: ${msg}`);
    done();
  });
  socket.on("nickname", (nickname) => (socket["nickname"] = nickname));
});

// using websocket
/*
    // 같은 서버에서 http, web socket 둘 다 작동 가능
    const httpserver = http.createServer(app);
    const wss = new WebSocket.Server({ httpserver });
    
    const sockets = [];
    
    wss.on("connection", (socket) => {
        sockets.push(socket);
        socket["nickname"] = "Anonymous";
        console.log("Connected to Browser ✅");
        socket.on("close", () => console.log("Disconnected from the Browser ❌"));
        socket.on("message", (msg) => {
            const parsed = JSON.parse(msg);
            switch (parsed.type) {
                case "new_message":
                    sockets.forEach((aSocket) =>
                    aSocket.send(`${socket.nickname}: ${parsed.payload}`)
        );
        break;
        case "nickname":
            socket["nickname"] = parsed.payload;
            break;
        }
    });
});
*/

const handleListen = () => console.log(`Listening on http://localhost:3000`);
httpserver.listen(3000, handleListen);
