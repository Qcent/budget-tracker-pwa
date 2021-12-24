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

// if no user is specified use the globalUser // no login
const globalUserId = "61c5e68a699a28529f231281";
app.use(function({ body, query, session }, res, next) {
    // check login
    if (query.userId === 'null') {
        query.userId = globalUserId;
        if (!session.loggedIn) { session.userId = globalUserId; }
    }
    if (!body.userId || body.userId == '') {
        body.userId = globalUserId;
    }
    next();
});

app.use(express.static("public"));
// routes
app.use(require("./routes/api.js"));

app.listen(PORT, () => {
    console.log(`App running on port ${PORT}!`);
});