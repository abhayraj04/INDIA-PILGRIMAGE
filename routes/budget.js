 const express = require("express");
const router = express.Router();
const Listing = require("../models/listing");

// Budget page
router.get("/", async (req, res) => {
  const listings = await Listing.find({}, "title distance");
  res.render("budget", { listings });
});

module.exports = router;
