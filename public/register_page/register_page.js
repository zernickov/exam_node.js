const app = require("../../app.js");

function createUser() {


    console.log("TESTTESTTESTTESTTESTTEST")
    app.connection.query(`INSERT INTO users VALUES ("pattest")`);
    app.connection.query(`SELECT * FROM users;`, (error, result, fields) => {
        console.log(result);
        console.log(fields);
    });
    app.connection.end();
}
