const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const passport = require("passport");
// const wrapAsync = require("../utils/wrapAsync.js");

router.get("/singup", (req, res) => {
    res.render("users/singup.ejs");
});

router.post("/singup", async(req, res) => {
    let {username, email, password} = req.body;
    const newUser = new User({email, username});
    const registeredUser = await User.register(newUser, password);
    console.log(registeredUser);
    res.redirect("/listings");
});

router.get("/login", (req, res) => {
    res.render("users/login.ejs");
});

router.post("/login",passport.authenticate("local", {failureRedirect: '/login'}), async(req, res) => {
    res.redirect("/listings");
});

module.exports = router;