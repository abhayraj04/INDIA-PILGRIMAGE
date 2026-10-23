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
        default: "https://www.bing.com/images/search?view=detailV2&ccid=eKE8nrMR&id=F9F95AE8DCC80F87305A08F166C82F227428F26F&thid=OIP.eKE8nrMRCK3bdvd62kWJ_wHaEK&mediaurl=https%3a%2f%2fth.bing.com%2fth%2fid%2fR.78a13c9eb31108addb76f77ada4589ff%3frik%3db%252fIodCIvyGbxCA%26riu%3dhttp%253a%252f%252ffiles.all-free-download.com%252fdownloadfiles%252fwallpapers%252f1920_1080%252fpeaceful_lake_wallpaper_landscape_nature_1208.jpg%26ehk%3d6EYMLnN48Cs4mGNjCqvvjwaPz6MF2KRLIUOhJG57Z8g%253d%26risl%3d%26pid%3dImgRaw%26r%3d0&exph=1080&expw=1920&q=image&FORM=IRPRST&ck=9D8DDD31F1DB9387D7A28162496CDDE8&selectedIndex=0&itb=0&idpp=overlayview&ajaxhist=0&ajaxserp=0",
        set: (v) => v==="" ? "https://www.bing.com/images/search?view=detailV2&ccid=eKE8nrMR&id=F9F95AE8DCC80F87305A08F166C82F227428F26F&thid=OIP.eKE8nrMRCK3bdvd62kWJ_wHaEK&mediaurl=https%3a%2f%2fth.bing.com%2fth%2fid%2fR.78a13c9eb31108addb76f77ada4589ff%3frik%3db%252fIodCIvyGbxCA%26riu%3dhttp%253a%252f%252ffiles.all-free-download.com%252fdownloadfiles%252fwallpapers%252f1920_1080%252fpeaceful_lake_wallpaper_landscape_nature_1208.jpg%26ehk%3d6EYMLnN48Cs4mGNjCqvvjwaPz6MF2KRLIUOhJG57Z8g%253d%26risl%3d%26pid%3dImgRaw%26r%3d0&exph=1080&expw=1920&q=image&FORM=IRPRST&ck=9D8DDD31F1DB9387D7A28162496CDDE8&selectedIndex=0&itb=0&idpp=overlayview&ajaxhist=0&ajaxserp=0" : v,
    },
    location: String,
    visitingTime: String,
    railwayStation: String,
    nearbyAttractions: String,
    distance: {
        type: Number,
        default: 500
    }
});

const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;
