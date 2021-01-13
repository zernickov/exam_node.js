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
        text: `Hello ${name} welcome to WeChat LOTR`
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
    windowMs:  10 * 60 * 1000, // 10 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

router.use('/login', authLimiter);


let pool = mysql.createPool({
    host           : process.env.DB_HOST,
    user           : process.env.DB_USER,
    password       : process.env.DB_PASS,
    database       : 'bluekite3'
});

// connection.query(`USE bluekite3;`);
// connection.query("DROP TABLE users;");
// connection.query(`CREATE TABLE users (user_id INT NOT NULL AUTO_INCREMENT, username VARCHAR(50) NOT NULL, email VARCHAR(50) NOT NULL, password VARCHAR(255) NOT NULL, PRIMARY KEY(user_id));`);
//connection.query(`DELETE FROM users WHERE user_id > 1;`);


pool.getConnection((err, connection) => {
    if (err) throw err;

    connection.query('SELECT * FROM users;', (error, res, fields) => {
        console.log(res);
        connection.release();
        if (error) throw error;
    });
});


router.post('/register', (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) throw err;
        connection.query(`SELECT * FROM users WHERE username=?;`, req.body.username, (err, result) => {
            try {
                const username = JSON.parse(JSON.stringify(result[0].username));
                console.log(result);
                res.redirect("/register");
            }
            catch (Exception){
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
                                    res.cookie('name', req.body.username);
                                    res.redirect(`/`);
                                })
                            }
                        });
                    });
                });
            }
            connection.release();
        });
    })
});

router.post('/login', (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) throw err;
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
                        res.cookie('name', req.body.username);
                        console.log('session: ', req.session.userId);
                        res.redirect('/');
                    } else {
                        console.log('SOMETHING ELSE WENT WRONG, RES:', result1);
                    }
                })
            } catch (Exception){
                res.redirect('/');
            }});
        connection.release();
    })
});

router.post('/deleteuser', (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) throw err;
        console.log(req.session.userId);
        connection.query(`DELETE FROM users WHERE user_id=?`, req.session.userId, (err) => {
            if (!err) {
                req.session.destroy();
                res.redirect('/')
            }
        });
        connection.release();
    });
});


module.exports = router;