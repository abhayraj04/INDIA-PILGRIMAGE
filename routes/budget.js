const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Listing = require("../models/listing");
const sampleData = require("../init/data.js").data;

const fallbackListings = sampleData.map((item, index) => ({
    _id: `place_${index + 1}`,
    title: item.title,
    distance: item.distance || (150 + ((index * 73) % 1800))
}));

// Budget page
router.get("/", async (req, res) => {
    try {
        if (mongoose.connection.readyState === 1) {
            const listings = await Listing.find({}, "title distance");
            if (listings && listings.length > 0) {
                return res.render("budget", { listings });
            }
        }
    } catch (err) {
        console.warn("DB query error in budget, using fallback:", err.message);
    }

    res.render("budget", { listings: fallbackListings });
});

module.exports = router;
