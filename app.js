const express = require("express");
const mysql = require("mysql");
const app = express();

require("dotenv").config();

app.use(express.static("public"));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/login_page/login_page.html")
});

app.get("/register", (req, res) => {
    res.sendFile(__dirname + "/public/register_page/register_page.html")
});

const connection = mysql.createConnection({
    host        : process.env.DB_HOST,
    user        : process.env.DB_USER,
    password    : process.env.DB_PASS
});

connection.connect();

connection.query(`USE bluekite3;`);
/*
exports.register = async function(req, res){
    const username = {"username": req.body.username}
    res.
};
*/

module.exports = {
    connection: "connection"
};

/*
connection.query(`CREATE TABLE users (username VARCHAR(50));`);
*/



connection.query(`SELECT * FROM users;`, (error, result, fields) => {
    console.log(result);
    console.log(fields);
});

const port = process.env.PORT || 8080;

app.listen(port, (error => {
    if (error) {
        console.log("Server couldn't start:", error);
    }
    console.log("Server started on port:", Number(port));
}));
