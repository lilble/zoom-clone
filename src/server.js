import http from "http";
import WebSocket from "ws";
import express from "express";

const app = express();

app.set("view engine", "pug"); // template engine의 종류 : pug
app.set("views", __dirname + "/views"); // template file 위치
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (_, res) => res.render("home")); // route handler - rendering "home.pug"
app.get("/*", (_, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);
// app.listen(3000, handleListen);

// 같은 서버에서 http, web socket 둘 다 작동 가능
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

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

server.listen(3000, handleListen);
