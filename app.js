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

// Sample data fallback for when MongoDB is not connected
const sampleData = require("./init/data.js").data;
const defaultFallbackImage = "https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=1000";

const fallbackListings = sampleData.map((item, index) => {
    let img = item.image;
    if (!img || (!img.startsWith("http") && !img.startsWith("/"))) {
        img = defaultFallbackImage;
    }
    return {
        _id: `place_${index + 1}`,
        title: item.title,
        description: item.description,
        visitingTime: item.visitingTime,
        railwayStation: item.railwayStation,
        location: item.location,
        nearbyAttractions: item.nearbyAttractions,
        image: img,
        distance: item.distance || (150 + ((index * 73) % 1800))
    };
});

// MongoDB Connection
const MONGO_URL = process.env.MONGODB_URI || process.env.MONGO_URL || (process.env.VERCEL ? null : "mongodb://127.0.0.1:27017/visit");

async function connectDB() {
    if (!MONGO_URL || mongoose.connection.readyState >= 1) {
        return;
    }
    try {
        await mongoose.connect(MONGO_URL, {
            serverSelectionTimeoutMS: 3000
        });
        console.log("Connected to MongoDB");
    } catch (err) {
        console.warn("MongoDB unavailable:", err.message);
    }
}

if (MONGO_URL) {
    connectDB();
}

// Data Helpers with graceful fallback
async function getAllListings() {
    if (mongoose.connection.readyState === 1) {
        try {
            const docs = await Listing.find({});
            if (docs && docs.length > 0) return docs;
        } catch (err) {
            console.warn("DB query error, using local fallback data:", err.message);
        }
    }
    return fallbackListings;
}

async function getListingById(id) {
    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
        try {
            const doc = await Listing.findById(id);
            if (doc) return doc;
        } catch (err) {
            console.warn("DB findById error, checking local fallback data:", err.message);
        }
    }
    return fallbackListings.find(item => item._id === id || item._id.toString() === id);
}

async function searchListings(query) {
    if (mongoose.connection.readyState === 1) {
        try {
            const escapeRegex = (text) => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
            const results = await Listing.find({
                title: { $regex: escapeRegex(query), $options: "i" }
            });
            if (results && results.length > 0) return results;
        } catch (err) {
            console.warn("DB search error, searching local fallback data:", err.message);
        }
    }
    const qLower = query.toLowerCase();
    return fallbackListings.filter(item => 
        (item.title && item.title.toLowerCase().includes(qLower)) ||
        (item.description && item.description.toLowerCase().includes(qLower)) ||
        (item.nearbyAttractions && item.nearbyAttractions.toLowerCase().includes(qLower))
    );
}

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
        const Listings = await getAllListings();
        res.render("listings/home.ejs", { Listings });
    } catch (err) {
        next(err);
    }
});

// Index
app.get("/listings", async (req, res, next) => {
    try {
        const allListings = await getAllListings();
        res.render("listings/index.ejs", { allListings });
    } catch (err) {
        next(err);
    }
});

// Show
app.get("/listings/:id", async (req, res, next) => {
    try {
        const { id } = req.params;
        const listing = await getListingById(id);
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
        const results = await searchListings(q);
        res.render("listings/search.ejs", { results, query: q });
    } catch (err) {
        console.error("Search error:", err);
        next(err);
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error("Application Error:", err);
    res.status(500).send("Something went wrong! Please check server logs.");
});

// Start server if run directly
const PORT = process.env.PORT || 8080;
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

module.exports = app;
