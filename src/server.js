import express from "express";

const app = express();

app.set("view engine", "pug"); // template engine의 종류 : pug
app.set("views", __dirname + "/views"); // template file 위치

app.get("/", (req, res) => res.render("home")); // template file (home.pug)

console.log("hello");

app.listen(3000);