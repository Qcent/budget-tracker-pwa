const withAuth = (req, res, next) => {
    if (!req.session.loggedIn) {
        // res.redirect('/login');
        res.status(401).json({ message: 'Unauthorized Request, Please Login!' });
    } else {
        next();
    }
};

const sameUser = (req, res, next) => {
    if (req.session.userId === req.body.userId || req.session.userId === req.query.userId) {
        next();

    } else {
        res.status(401).json({ message: 'Unauthorized Request! User Mismatch!' });
    }
};

module.exports = { withAuth, sameUser }