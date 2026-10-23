if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Listing = require('./models/listing.js');
const path = require("path");
const session = require('express-session');
const ejsMate = require("ejs-mate");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const userRouter = require("./routes/user.js");
const budgetRoutes = require("./routes/budget.js");

const MONGO_URL = process.env.MONGODB_URI || process.env.MONGO_URL || "mongodb://127.0.0.1:27017/visit";

async function connectDB() {
    if (mongoose.connection.readyState >= 1) {
        return;
    }
    try {
        await mongoose.connect(MONGO_URL);
        console.log("Connected to MongoDB");
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
    }
}

connectDB();

// Ensure DB connection before handling requests (especially for serverless cold-starts)
app.use(async (req, res, next) => {
    if (mongoose.connection.readyState === 0) {
        await connectDB();
    }
    next();
});

// View engine setup
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const sessionOptions = {
    secret: process.env.SESSION_SECRET || process.env.SECRET || "mybadsecrets",
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000
    }
};

app.use(session(sessionOptions));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())); 

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Pass current user to views if needed
app.use((req, res, next) => {
    res.locals.currUser = req.user;
    next();
});

// Routes
app.use("/", userRouter);
app.use("/budget", budgetRoutes);

// Home
app.get("/", async (req, res, next) => {
    try {
        const Listings = await Listing.find({});
        res.render("listings/home.ejs", { Listings });
    } catch (err) {
        next(err);
    }
});

// Index
app.get("/listings", async (req, res, next) => {
    try {
        const allListings = await Listing.find({});
        res.render("listings/index.ejs", { allListings });
    } catch (err) {
        next(err);
    }
});

// Show
app.get("/listings/:id", async (req, res, next) => {
    try {
        const { id } = req.params;
        const listing = await Listing.findById(id);
        if (!listing) {
            return res.status(404).send("Listing not found");
        }
        res.render("listings/show.ejs", { listing });
    } catch (err) {
        next(err);
    }
});

// Search
app.get("/search", async (req, res, next) => {
    try {
        const q = req.query.query;
        if (!q) return res.redirect("/listings");
        const escapeRegex = (text) => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
        const results = await Listing.find({
            title: { $regex: escapeRegex(q), $options: "i" }
        });
        res.render("listings/search.ejs", { results, query: q });
    } catch (err) {
        console.error("Search error:", err);
        next(err);
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error("Application Error:", err);
    res.status(500).send("Something went wrong! Please check database connection or configuration.");
});

// Start server if run directly
const PORT = process.env.PORT || 8080;
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

module.exports = app;
