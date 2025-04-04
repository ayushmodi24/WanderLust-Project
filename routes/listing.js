const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const {isLoggedin , isOwner, validateListing} = require("../middleware.js")
const multer  = require('multer')
const {storage} = require("../cloudConfig.js")
const upload = multer({ storage })


const listingController = require("../controllers/listings.js");

router.route("/")
.get( wrapAsync(listingController.index))
.post( isLoggedin,upload.single('listing[image]') ,validateListing, wrapAsync(listingController.createListing));


//new route
router.get("/new",isLoggedin, wrapAsync(listingController.newForm));

router.route("/:id")
.get(wrapAsync(listingController.showListing))
.put(isLoggedin,isOwner,upload.single('listing[image]'),validateListing, wrapAsync(listingController.updateListing))
.delete(isLoggedin,isOwner, wrapAsync(listingController.deleteListing));

//index route
// router.get("/", wrapAsync(listingController.index));

//show route
// router.get("/:id", wrapAsync(listingController.showListing));

//create Route
// router.post("/", validateListing,isLoggedin, wrapAsync(listingController.createListing));

// Edit Route
router.get("/:id/edit",isLoggedin,isOwner, wrapAsync(listingController.editListing));

//Update Route
// router.put("/:id" ,isLoggedin,isOwner,validateListing, wrapAsync(listingController.updateListing));


//Delete Rorouter
// router.delete("/:id",isLoggedin,isOwner, wrapAsync(listingController.deleteListing));


module.exports = router;