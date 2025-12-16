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

const userRouter = require("./routes/user.js")

const MONGO_URL = "mongodb://127.0.0.1:27017/visit";

main().then(() => {
    console.log("Connected to MongoDB");
})
.catch(err => {
    console.error("Error connecting to MongoDB:", err);
});

async function main(){
    await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

// app.get('/', (req, res) => {
//     res.send('Hello World!');
// }); 

const sessionOptions = {
    secret: "mybadsecrets",
    resave: false,
    saveUninitialized: true
};

app.use(session(sessionOptions));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())); 

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

 
app.use("/", userRouter);

//Home
app.get("/", async (req, res) => {
    const Listings = await Listing.find({});
    res.render("./listings/home.ejs", {Listings});
});

//Index
app.get("/listings", async (req, res) => {
    const allListings = await Listing.find({});
    res.render("./listings/index.ejs", {allListings});
});


//show
app.get("/listings/:id", async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("./listings/show.ejs", {listing});
})

 app.get("/search", async (req, res) => {
  try {
    const q = req.query.query;
    if (!q) return res.redirect("/listings");
     const escapeRegex = (text) => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    const results = await Listing.find({
      title: { $regex: escapeRegex(q), $options: "i" }
    });
    res.render("./listings/search.ejs", { results, query: q });
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).send("Error during search");
  }
});

app.listen(8080, () => {
    console.log('Server is running on port 8080');
});




