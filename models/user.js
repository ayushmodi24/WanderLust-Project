const express = require("express");
const { required } = require("joi");
const router = express.Router();
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

userSchema = Schema({
    email: {
        type:String,
        required:true
    }
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User" , userSchema);