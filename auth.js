const passport = require('passport');
const Strategy = require('passport-strategy');
const LocalStrategy = require('passport-local').Strategy;
const db = require('./database');

const COOKIE_SECRET = '8fywWLR4tWnLRZV063rW';

passport.use(new LocalStrategy((email, password, done) => {

    db.User
        .findOne({ email })
        .then((user) => {
            if (!user || password != user.password) {
                return done(null, false, {
                    message: 'Les identifiants sont invalides.'
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
