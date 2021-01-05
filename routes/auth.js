const router = require('express').Router();
const saltRounds = 10;
const bcrypt = require('bcrypt');
const rateLimiter = require('express-rate-limit');
const mysql = require('mysql');
const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'robogpat@gmail.com',
        pass: 'robogpat123'
    }
});

function mailSender(mail, name) {
    let mailOptions = {
        from: 'robogpat@gmail.com',
        to: mail,
        subject: 'Welcome',
        text: `Hello ${name} welcome to the app`
    };
    transporter.sendMail(mailOptions, (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log('Email Sent!');
        }
    });
}

const authLimiter = rateLimiter({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 100 // limit each IP to 6 requests per windowMs
});

router.use('/login', authLimiter);

const connection = mysql.createConnection({
    host        : process.env.DB_HOST,
    user        : process.env.DB_USER,
    password    : process.env.DB_PASS
});

connection.connect();
connection.query(`USE bluekite3;`);
// connection.query("DROP TABLE users;");
// connection.query(`CREATE TABLE users (user_id INT NOT NULL AUTO_INCREMENT, username VARCHAR(50) NOT NULL, email VARCHAR(50) NOT NULL, password VARCHAR(255) NOT NULL, PRIMARY KEY(user_id));`);
connection.query(`SELECT * FROM users;`, function (err, res, fields) {
    console.log(res);
});


router.post('/register', (req, res) => {
    bcrypt.genSalt(saltRounds,(saltErr, salt) => {
        if (saltErr) {
            console.log('SALT ERROR:', saltErr);
        }
        bcrypt.hash(req.body.password, salt, (hashErr, hash) => {
            if (hashErr) {
                console.log('HASH ERROR:', hashErr);
            }
            connection.query(`INSERT INTO users (username, email, password) VALUES (?, ?, ?);`, [req.body.username, req.body.email, hash], (dbErr) => {
                if (dbErr) {
                    console.log('DATABASE ERROR:', dbErr);
                } else {
                    mailSender(req.body.email, req.body.username);
                    connection.query(`SELECT user_id FROM users WHERE username=?`, req.body.username, (err, result) => {
                        const userid = JSON.parse(JSON.stringify(result[0].user_id));
                        req.session.userId = userid;
                        res.redirect(`/`);
                    })
                }
            });
        });
    });
});

router.post('/login', (req, res) => {
    connection.query(`SELECT * FROM users WHERE username=?;`, req.body.username, (err, result) => {
        try {
            const userid = JSON.parse(JSON.stringify(result[0].user_id));
            const hashed = JSON.parse(JSON.stringify(result[0].password));

            bcrypt.compare(req.body.password, hashed, (err, result1) => {
                if (err) {
                    console.log('ERROR:', err);
                } else if (result1) {
                    console.log('SUCCESS:', result1);
                    req.session.userId = userid;
                    res.cookie('name', req.body.username, {maxAge: 3600000});
                    console.log('session: ', req.session.userId);
                    res.redirect('/');
                } else {
                    console.log('SOMETHING ELSE WENT WRONG, RES:', result1);
                }
            })
        } catch (Exception){
            res.redirect('/');
        }});
});

module.exports = router;