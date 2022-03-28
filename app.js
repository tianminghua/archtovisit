if (process.env.NODE_ENV !== "production") {
    require('dotenv').config()
}

const express = require('express');
const methodOverride = require('method-override')
const path = require('path')
const ejsMate = require('ejs-mate')
const ExpressError = require('./utils/ExpressError')
const session = require('express-session')
const flash = require('connect-flash')
const passport = require('passport')
const localStrategy = require('passport-local')
const User = require('./models/user')
const MongoStore = require('connect-mongo');

// import Express Router
const campgroundsRouter = require('./routes/campgrounds')
const reviewsRouter = require('./routes/reviews')
const usersRouter = require('./routes/users')

const app = express();

// import mongoose and connect to MongoDB
const mongoose = require('mongoose');

main().catch(err => console.log(err));

async function main() {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('MONGO CONNECTED')
}



// set EJS as the HTML Template
app.engine('ejs', ejsMate);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// setup the query string value for method-override
app.use(methodOverride('_method'))

// enable express to parse the post data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(flash())

app.use(express.static('public'))

const store = MongoStore.create({
    mongoUrl: process.env.MONGO_URL,
    touchAfter: 24 * 3600,
    crypto: {
        secret: 'trythissecret'
    },
    autoRemove: 'native'
})

store.on("error", (e) => {
    console.log("Sesstion Store Error", e)
})

// setup session in Express
const sessionConfig = {
    store,
    name: 'session',
    secret: 'thisismysecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))

// initialize Passport 
app.use(passport.initialize())
app.use(passport.session())
passport.use(new localStrategy(User.authenticate()))

// how to store and unstore user in the Session
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

// golbal variables avalable
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.warning = req.flash("warning");
    res.locals.error = req.flash("error");
    res.locals.currentUser = req.user;
    next();
})

//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ Review Routing $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
app.use('/campgrounds', reviewsRouter)

//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ CampGround Routing $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
app.use('/campgrounds', campgroundsRouter)

//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ User Routing $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
app.use('/', usersRouter)

app.get('/', (req, res) => {
    res.render('home')
})

//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ Error Handler $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
// app.all('*', (req, res, next) => {
//     next(new ExpressError('URL not found!!!!!', 404))
// })

app.use((err, req, res, next) => {
    const { statusCode = 500, message = 'We are not sure but something went wrong' } = err;
    req.flash('error', message)
    res.status(statusCode).redirect('/campgrounds')

})

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log('$$$$$ listening on port 3000 $$$$$')
})


