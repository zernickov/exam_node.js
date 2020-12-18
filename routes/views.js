const router = require('express').Router();
const path = require('path');

const redirectLogin = (req, res, next) => {
    if (!req.session.userId) {
        res.redirect('/login');
    } else {
        next();
    }
};

const redirectHome = (req, res, next) => {
    if (req.session.userId) {
        res.redirect('/');
    } else {
        next();
    }
};

router.get('/', redirectLogin, (req, res) => {
    res.sendFile(path.resolve('public/home_page/home_page.html'));
});

router.get("/login", redirectHome, (req, res) => {
    res.sendFile(path.resolve('public/login_page/login_page.html'));
});


router.get("/register", redirectHome, (req, res) => {
    res.sendFile(path.resolve('public/register_page/register_page.html'));
});

router.post("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/");
});

module.exports = router;