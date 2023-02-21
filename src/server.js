import http from "http"
import WebSocket from "ws";
import express from "express";

const app = express();

app.set("view engine", "pug"); // template engine의 종류 : pug
app.set("views", __dirname + "/views"); // template file 위치
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home")); // route handler - rendering "home.pug"
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);
// app.listen(3000, handleListen);

// 같은 서버에서 http, web socket 둘 다 작동 가능
const server = http.createServer(app);  
const wss = new WebSocket.Server({server}); 

server.listen(3000, handleListen);