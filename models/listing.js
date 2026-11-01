const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    image: {
        type: String,
        default: "https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=1000",
        set: (v) => v === "" ? "https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=1000" : v,
    },
    location: String,
    visitingTime: String,
    railwayStation: String,
    nearbyAttractions: String,
    distance: {
        type: Number,
        default: 500
    },
    faith: {
        type: String,
        default: "Hinduism"
    }
});

const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;
