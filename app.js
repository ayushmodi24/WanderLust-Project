if(process.env.NODE_ENV != "production")
{
    require('dotenv').config();
}
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const expressError = require("./utils/expressError.js");
const {listingSchema, reviewSchema} = require("./schema.js")
const Review = require("./models/review.js")
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js")


const listingRouter = require("./routes/listing.js")
const reviewRouter = require("./routes/review.js")
const userRouter = require("./routes/user.js")

app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(express.static(path.join(__dirname, "public")));
app.engine("ejs", ejsMate);

const sessionOptions = {
    secret: "MySecret",
    resave:false,
    saveUninitialized: true,
    cookie: 
    {
        expires: Date.now() + 7*24*60*60*1000,
        maxAge: 7*24*60*60*1000,
        httpOnly:true
    }
};



main()
    .then(() => {
        console.log("res");
    })
    .catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/wander');
};


let port = 8080;

app.listen(port, () => {
    console.log(`app is listening on port ${port}`);
});

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next) =>
{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// app.get("/demoUser", async(req,res) =>
// {
//     let fakeUser = new User({
//         email:"abc@gmail.com",
//         username: "Student",
//     })
//     let registeruser = await User.register(fakeUser , "helloji");
//     res.send(registeruser);
// })

app.use("/listings" , listingRouter);
app.use("/listings/:id/reviews" , reviewRouter);
app.use("/" , userRouter);

// app.get("/", (req, res) => {
//     res.send("You contacted root path ");
// });

app.all("*", (req, res, next) => {
    next(new expressError(404, "Page not found!"))
})

app.use((err, req, res, next) => {
    let { status, message } = err;
    if (status === 404) {
        return res.status(status).render('error', { status, message });
    }
    res.status(status||500).render("error.ejs", { message })
    // res.status(status).render('error');
})



