const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const COOKIE_SECRET = '8fywWLR4tWnLRZV063rW';

passport.use(new LocalStrategy((email, password, cb) => {

    db.User
        .findOne({ email })
        .then(function (user) {
            if (!user || !user.validPassword(password)) {
                return done(null, false, {
                    message: 'Invalid credentials'
                });
            }

            return done(null, user);
        })
        .catch(done);

}));

// Save the user's email address in the cookie
passport.serializeUser((user, cb) => {
    cb(null, user.email);
});

passport.deserializeUser((email, cb) => {
    // Fetch the user record corresponding to the provided email address
    db.User
        .findOne({ email })
        .then((user) => {
            cb(null, user);
        })
        .catch(cb);
});

module.exports = {
    passport: passport,
    secret: COOKIE_SECRET
};
