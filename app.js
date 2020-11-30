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


const redirectLogin = (req, res, next) => {
  if (!req.session.userId){
      console.log(req.session.userId);
    res.redirect("/login");
  } else {
      next();
  }
};

const redirectHome = (req, res, next) => {
    if (req.session.userId){
        console.log(req.session.userId);
        res.redirect("/");
    } else {
        next();
    }
};

const redirectAway = (req, res, next) => {
  if (!req.session.userId){
      res.send("<h1>Unauthorized</h1>");
  } else {
      next();
  }
};

app.get("/", redirectLogin, (req, res) => {
    // const { userId } = req.session;
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
/*
exports.register = async function(req, res){
    const username = {"username": req.body.username}
    res.
};
*/

// connection.query(``)

// connection.query(`CREATE TABLE users (user_id INT NOT NULL AUTO_INCREMENT, username VARCHAR(50) NOT NULL, password VARCHAR(255) NOT NULL, PRIMARY KEY(user_id));`);


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
                    connection.query(`SELECT user_id FROM users WHERE username=?`, req.body.username, function (err, result) {
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
    connection.query(`SELECT * FROM users WHERE username=?;`, req.body.username, function (err, result) {
        const userid = JSON.parse(JSON.stringify(result[0].user_id));
        console.log(userid);
        const hashed = JSON.parse(JSON.stringify(result[0].password));
        bcrypt.compare(req.body.password, hashed, function (err, result1) {
            if (err) {
                console.log("ERROR:", err);
            }
            else if (result1) {
                console.log("SUCCESS:", result1);
                req.session.userId = userid;
                console.log("session: ", req.session.userId);
                res.redirect("/");
            }
            else {
                console.log("SOMETHING ELSE WENT WRONG, RES:", result1);
            }
        })
    });
});

app.post("/logout", (req, res) => {
    req.session.destroy(err => {
        if(err){
            res.redirect("/");
        }
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
    // console.log(fields);

});

const port = process.env.PORT || 8080;

app.listen(port, (error => {
    if (error) {
        console.log("Server couldn't start:", error);
    }
    console.log("Server started on port:", Number(port));
}));
