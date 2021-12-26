const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");
const compression = require("compression");

const session = require("express-session");
const MongoStore = require('connect-mongo');
const cookieParser = require('cookie-parser');

const yearsFromNow = require('./utils/yearsFromNow');

const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/budget";
const DB_SECRET = process.env.DB_SECRET || 'aFairlyOpenSecr3t';
const GLOBAL_UserId = process.env.GLOBAL_UserId || "61c7b8cf58ceb0798eec5c5b";

const app = express();

app.use(logger("dev"));

app.use(compression());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}, () => {
    //uncomment to rest database
    // mongoose.connection.db.dropDatabase();
});
mongoose.Promise = global.Promise;

app.use(session({
    secret: DB_SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: MONGODB_URI })
}));
app.use(cookieParser(DB_SECRET))
    // set a cookie
app.use(function(req, res, next) {
    // check login
    if (req.session.loggedIn === true) {
        res.cookie('loggedIn', req.session.loggedIn, { expires: yearsFromNow(1), httpOnly: false });
        res.cookie('username', req.session.username, { expires: yearsFromNow(1), httpOnly: false });
        res.cookie('userId', req.session.userId, { expires: yearsFromNow(1), httpOnly: false });
    } else {
        res.cookie('loggedIn', req.session.loggedIn, { maxAge: -1, httpOnly: true });
        res.cookie('username', '', { maxAge: -1, httpOnly: true });
        res.cookie('userId', '', { maxAge: -1, httpOnly: true });
    }
    next(); // <-- important!
});

// if user is not logged in use the GLOBAL_UserId for a "login"
app.use(function({ body, query, session }, res, next) {
    // check login
    if (query.userId === 'null') {
        query.userId = GLOBAL_UserId;
        if (!session.loggedIn) { session.userId = GLOBAL_UserId; }
    }
    if (!body.userId || body.userId == '') {
        body.userId = GLOBAL_UserId;
    }
    next();
});

app.use(express.static("public"));
// routes
app.use(require("./routes/api"));

app.listen(PORT, () => {
    console.log(`App Server listening on port ${PORT}!`);
});