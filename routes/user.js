const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const passport = require("passport");
const mongoose = require("mongoose");

router.get("/singup", (req, res) => {
    res.render("users/singup.ejs");
});

router.post("/singup", async (req, res, next) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            console.warn("Database not connected for user signup");
            return res.redirect("/listings");
        }
        let { username, email, password } = req.body;
        const newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password);
        req.login(registeredUser, (err) => {
            if (err) return next(err);
            res.redirect("/listings");
        });
    } catch (err) {
        console.error("Signup error:", err);
        res.redirect("/singup");
    }
});

router.get("/login", (req, res) => {
    res.render("users/login.ejs");
});

router.post("/login", (req, res, next) => {
    if (mongoose.connection.readyState !== 1) {
        console.warn("Database not connected for user login");
        return res.redirect("/listings");
    }
    passport.authenticate("local", {
        failureRedirect: "/login"
    })(req, res, next);
}, (req, res) => {
    res.redirect("/listings");
});

module.exports = router;
