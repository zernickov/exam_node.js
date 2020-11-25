const express = require("express");
const mysql = require("mysql");
const app = express();
const bcrypt = require("bcrypt");
const saltRounds = 10;
const session = require("express-session");
require("dotenv").config();

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

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

//connection.query("DROP TABLE users;");
/*
exports.register = async function(req, res){
    const username = {"username": req.body.username}
    res.
};
*/

//connection.query(``)

//connection.query(`CREATE TABLE users (user_id INT NOT NULL AUTO_INCREMENT, username VARCHAR(50) NOT NULL, password VARCHAR(255) NOT NULL, PRIMARY KEY(user_id));`);


app.post("/register", (req, res) => {
    bcrypt.genSalt(saltRounds, function (saltErr, salt) {
        if (saltErr) {
            console.log("SALT ERROR:", saltErr);
        }
        bcrypt.hash(req.body.password, salt, function (hashErr, hash) {
            if (hashErr) {
                console.log("HASH ERROR:", hashErr);
            }
            connection.query(`INSERT INTO users (username, password) VALUES (?, ?);`, [req.body.username, hash], function (dbErr) {
                if (dbErr) {
                    console.log("DATABASE ERROR:", dbErr);
                }
                else {
                    res.redirect("/");
                }
            });
        });
    });
});

app.post("/login", (req, res) => {
    connection.query(`SELECT password FROM users WHERE username=?;`, req.body.username, function (err, result) {
        const hashed = JSON.parse(JSON.stringify(result[0].password));
        bcrypt.compare(req.body.password, hashed, function (err, res) {
            if (err) {
                console.log("ERROR:", err);
            }
            else if (res) {
                console.log("SUCCESS:", res);
            }
            else {
                console.log("SOMETHING ELSE WENT WRONG, RES:", res);
            }
        })
    });
    res.redirect("/");
});

/*
exports.register = async function(req,res){
    const password = req.body.password;

    let users={
        "username":req.body.username,
        "password":password
    };

    connection.query('INSERT INTO users SET ?',users, function (error, results, fields) {
        if (error) {
            res.send({
                "code":400,
                "failed":"error ocurred"
            })
        } else {
            res.send({
                "code":200,
                "success":"user registered sucessfully"
            });
        }
    });
};

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
