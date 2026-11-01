if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Listing = require('./models/listing.js');
const path = require("path");
const fs = require("fs");
const session = require('express-session');
const ejsMate = require("ejs-mate");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const userRouter = require("./routes/user.js");
const budgetRoutes = require("./routes/budget.js");
const aiRoutes = require("./routes/ai.js");

// Multi-Faith Detection Helper (All major Indian spiritual traditions)
function detectFaith(item) {
    if (item.faith && item.faith !== "Other" && item.faith !== "Hinduism") return item.faith;
    const text = ((item.title || '') + ' ' + (item.description || '') + ' ' + (item.nearbyAttractions || '')).toLowerCase();
    if (text.includes('gurdwara') || text.includes('sikh') || text.includes('sahib') || text.includes('harmandir') || text.includes('langar') || text.includes('guru') || text.includes('amritsar') || text.includes('takht')) return 'Sikhism';
    if (text.includes('buddha') || text.includes('buddhist') || text.includes('stupa') || text.includes('monastery') || text.includes('bodh') || text.includes('sarnath') || text.includes('gompa') || text.includes('kushinagar') || text.includes('rajgir')) return 'Buddhism';
    if (text.includes('dargah') || text.includes('mosque') || text.includes('masjid') || text.includes('sufi') || text.includes('chishti') || text.includes('islam') || text.includes('muslim') || text.includes('hazratbal') || text.includes('ajmer')) return 'Islam & Sufism';
    if (text.includes('jain') || text.includes('tirthankar') || text.includes('shikharji') || text.includes('palitana') || text.includes('sonagiri') || text.includes('hastinapur') || text.includes('dilwara') || text.includes('bahubali') || text.includes('digambar') || text.includes('shravanabelagola')) return 'Jainism';
    if (text.includes('church') || text.includes('cathedral') || text.includes('basilica') || text.includes('christian') || text.includes('jesus') || text.includes('mary') || text.includes('francis') || text.includes('velankanni') || text.includes('joseph') || text.includes('sacred heart')) return 'Christianity';
    return 'Hinduism';
}

function getFaithIcon(faith) {
    switch (faith) {
        case 'Sikhism': return '☬';
        case 'Islam & Sufism': return '☪️';
        case 'Buddhism': return '☸️';
        case 'Jainism': return '🌸';
        case 'Christianity': return '✝️';
        default: return '🛕';
    }
}

// Sample data fallback for when MongoDB is not connected
let sampleData = [];
try {
    sampleData = require("./init/data.js").data;
} catch (e1) {
    try {
        sampleData = require("../init/data.js").data;
    } catch (e2) {
        console.warn("Could not load sample data:", e2.message);
    }
}

const defaultFallbackImage = "https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=1000";

const fallbackListings = (sampleData || []).map((item, index) => {
    let img = item.image;
    if (!img || (!img.startsWith("http") && !img.startsWith("/"))) {
        img = defaultFallbackImage;
    }
    const faith = detectFaith(item);
    return {
        _id: `place_${index + 1}`,
        title: item.title,
        description: item.description,
        visitingTime: item.visitingTime,
        railwayStation: item.railwayStation,
        location: item.location,
        nearbyAttractions: item.nearbyAttractions,
        image: img,
        distance: item.distance || (150 + ((index * 73) % 1800)),
        faith: faith,
        faithIcon: getFaithIcon(faith)
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

// Data Helpers with graceful fallback and faith enrichment
async function getAllListings() {
    if (mongoose.connection.readyState === 1) {
        try {
            const docs = await Listing.find({});
            if (docs && docs.length > 0) {
                return docs.map(d => {
                    const obj = d.toObject ? d.toObject() : { ...d };
                    const faith = obj.faith && obj.faith !== "Other" ? obj.faith : detectFaith(obj);
                    obj.faith = faith;
                    obj.faithIcon = getFaithIcon(faith);
                    return obj;
                });
            }
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
            if (doc) {
                const obj = doc.toObject ? doc.toObject() : { ...doc };
                const faith = obj.faith && obj.faith !== "Other" ? obj.faith : detectFaith(obj);
                obj.faith = faith;
                obj.faithIcon = getFaithIcon(faith);
                return obj;
            }
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
            if (results && results.length > 0) {
                return results.map(d => {
                    const obj = d.toObject ? d.toObject() : { ...d };
                    const faith = obj.faith && obj.faith !== "Other" ? obj.faith : detectFaith(obj);
                    obj.faith = faith;
                    obj.faithIcon = getFaithIcon(faith);
                    return obj;
                });
            }
        } catch (err) {
            console.warn("DB search error, searching local fallback data:", err.message);
        }
    }
    const qLower = query.toLowerCase();
    return fallbackListings.filter(item => 
        (item.title && item.title.toLowerCase().includes(qLower)) ||
        (item.description && item.description.toLowerCase().includes(qLower)) ||
        (item.nearbyAttractions && item.nearbyAttractions.toLowerCase().includes(qLower)) ||
        (item.faith && item.faith.toLowerCase().includes(qLower))
    );
}

// Locate views directory (robust across local and Vercel environments)
let viewsDir = path.join(__dirname, "views");
if (!fs.existsSync(viewsDir)) {
    viewsDir = path.join(process.cwd(), "views");
}
if (!fs.existsSync(viewsDir)) {
    viewsDir = path.join(__dirname, "../views");
}

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", viewsDir);

// Locate public directory
let publicDir = path.join(__dirname, "public");
if (!fs.existsSync(publicDir)) {
    publicDir = path.join(process.cwd(), "public");
}
if (!fs.existsSync(publicDir)) {
    publicDir = path.join(__dirname, "../public");
}

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(publicDir));

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

// Health check endpoint
app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        viewsDir: viewsDir,
        viewsExist: fs.existsSync(viewsDir),
        dbReadyState: mongoose.connection.readyState
    });
});

// Routes
app.use("/", userRouter);
app.use("/budget", budgetRoutes);
app.use("/", aiRoutes);

// Home
app.get("/", async (req, res, next) => {
    try {
        const Listings = await getAllListings();
        res.render("listings/home.ejs", { Listings });
    } catch (err) {
        next(err);
    }
});

// Index (All Places with Faith support)
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

// Multi-Faith Sacred Calendar & Festivals
app.get("/festivals", (req, res) => {
    res.render("festivals.ejs");
});

// Universal Sacred Etiquette Guide
app.get("/etiquette", (req, res) => {
    res.render("etiquette.ejs");
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error("Application Error:", err);
    res.status(500).send(`Server Error: ${err.message || err}`);
});

// Start server if run directly (and not in Vercel serverless)
const PORT = process.env.PORT || 8080;
if (require.main === module && !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

module.exports = app;
