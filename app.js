const express = require("express");
const mysql = require("mysql");
const rateLimiter = require("express-rate-limit");
const bcrypt = require("bcrypt");
const session = require("express-session");
require("dotenv").config();
const app = express();
const saltRounds = 10;
const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "robogpat@gmail.com",
        pass: "robogpat123"
    }
});

const authLimiter = rateLimiter({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 100 // limit each IP to 6 requests per windowMs
});

app.use(authLimiter);
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    name: "MandatorySession",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false }
}));

function mailSender(mail, name) {
    let mailOptions = {
        from: "robogpat@gmail.com",
        to: mail,
        subject: "Welcome",
        text: `Hello ${name} welcome to the app`
    };
    transporter.sendMail(mailOptions, (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log("Email Sent!!");
        }
    });
}

const redirectLogin = (req, res, next) => {
  if (!req.session.userId) {
    res.redirect("/login");
  } else {
      next();
  }
};

const redirectHome = (req, res, next) => {
    if (req.session.userId) {
        res.redirect("/");
    } else {
        next();
    }
};

const redirectAway = (req, res, next) => {
  if (!req.session.userId) {
      res.send("<h1>Unauthorized</h1>");
  } else {
      next();
  }
};

app.get("/", redirectLogin, (req, res) => {
    res.sendFile(__dirname + "/public/home_page/home_page.html")
});

app.get("/login", redirectHome, (req, res) => {
    res.sendFile(__dirname + "/public/login_page/login_page.html")
});

app.get("/register", redirectHome, (req, res) => {
    res.sendFile(__dirname + "/public/register_page/register_page.html")
});

app.get("/unauth", redirectAway, (req, res) => {
    res.sendFile(__dirname + "/public/unauth/unauth.html")
});

const connection = mysql.createConnection({
    host        : process.env.DB_HOST,
    user        : process.env.DB_USER,
    password    : process.env.DB_PASS
});

connection.connect();
connection.query(`USE bluekite3;`);
// connection.query("DROP TABLE users;");
// connection.query(`CREATE TABLE users (user_id INT NOT NULL AUTO_INCREMENT, username VARCHAR(50) NOT NULL, email VARCHAR(50) NOT NULL, password VARCHAR(255) NOT NULL, PRIMARY KEY(user_id));`);

app.post("/register", (req, res) => {
    bcrypt.genSalt(saltRounds,(saltErr, salt) => {
        if (saltErr) {
            console.log("SALT ERROR:", saltErr);
        }
        bcrypt.hash(req.body.password, salt, (hashErr, hash) => {
            if (hashErr) {
                console.log("HASH ERROR:", hashErr);
            }
            connection.query(`INSERT INTO users (username, email, password) VALUES (?, ?, ?);`, [req.body.username, req.body.email, hash], (dbErr) => {
                if (dbErr) {
                    console.log("DATABASE ERROR:", dbErr);
                } else {
                    mailSender(req.body.email, req.body.username);
                    connection.query(`SELECT user_id FROM users WHERE username=?`, req.body.username, (err, result) => {
                        const userid = JSON.parse(JSON.stringify(result[0].user_id));
                        req.session.userId = userid;
                        res.redirect("/");
                    })
                }
            });
        });
    });
});

app.post("/login", (req, res) => {
    connection.query(`SELECT * FROM users WHERE username=?;`, req.body.username, (err, result) => {
        try {
            const userid = JSON.parse(JSON.stringify(result[0].user_id));
            const hashed = JSON.parse(JSON.stringify(result[0].password));

        bcrypt.compare(req.body.password, hashed, (err, result1) => {
            if (err) {
                console.log("ERROR:", err);
            } else if (result1) {
                console.log("SUCCESS:", result1);
                req.session.userId = userid;
                console.log("session: ", req.session.userId);
                res.redirect("/");
            } else {
                console.log("SOMETHING ELSE WENT WRONG, RES:", result1);
            }
        })
    } catch (Exception){
            res.redirect("/");
        }});
});

app.post("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/");
});

connection.query(`SELECT * FROM users;`, (error, result) => {
    console.log(result);
});

const port = process.env.PORT || 8080;

app.listen(port, (error) => {
    if (error) {
        console.log("Server couldn't start:", error);
    }
    console.log("Server started on port:", Number(port));
});

