const express = require("express");
const mysql = require("mysql");
const app = express();

require("dotenv").config();

const connection = mysql.createConnection({
    host        : process.env.DB_HOST,
    user        : process.env.DB_USER,
    password    : process.env.DB_PASS
});

connection.connect();

connection.query(`USE bluekite3;`);
/*
connection.query(`CREATE TABLE users (username VARCHAR(50));`);
*/

connection.query(`INSERT INTO users VALUES ("robi0297")`);

connection.query(`SELECT * FROM users;`, (error, result, fields) => {
    console.log(result);
    console.log(fields);

    connection.end();
});
