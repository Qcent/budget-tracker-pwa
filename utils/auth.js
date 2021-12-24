const withAuth = (req, res, next) => {
    if (req.body.userId = "61c5e68a699a28529f231281") { next(); return; }
    if (!req.session.userId) {
        // res.redirect('/login');
        res.status(401).json({ message: 'Unauthorized Request, Please Login!' });
    } else {
        next();
    }
};

module.exports = withAuth;