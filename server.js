const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");
const compression = require("compression");

const session = require("express-session");
const MongoStore = require('connect-mongo');
const cookieParser = require('cookie-parser');

const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/budget";

const app = express();

app.use(logger("dev"));

app.use(compression());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true
});
mongoose.Promise = global.Promise;

app.use(session({
    secret: 'my-secret',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: MONGODB_URI })
}));
app.use(cookieParser('my-secret'))
    // set a cookie
app.use(function(req, res, next) {
    // check login
    if (req.session.loggedIn === true) {
        res.cookie('loggedIn', req.session.loggedIn, { maxAge: 900000, httpOnly: false });
        res.cookie('username', req.session.username, { maxAge: 900000, httpOnly: false });
        res.cookie('userId', req.session.userId, { maxAge: 900000, httpOnly: false });
    } else {
        res.cookie('loggedIn', req.session.loggedIn, { maxAge: 900000, httpOnly: false });
        res.cookie('username', '', { maxAge: 900000, httpOnly: false });
        res.cookie('userId', '', { maxAge: 900000, httpOnly: false });
    }
    next(); // <-- important!
});

app.use(express.static("public"));
// routes
app.use(require("./routes/api.js"));

app.listen(PORT, () => {
    console.log(`App running on port ${PORT}!`);
});