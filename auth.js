const passport = require('passport');
const Strategy = require('passport-strategy');
const LocalStrategy = require('passport-local').Strategy;
const db = require('./database');

const COOKIE_SECRET = '8fywWLR4tWnLRZV063rW';

passport.use(new LocalStrategy((email, password, done) => {

    db.User
        .findOne({
            where: {
                email: email,
                password: password
            }
        })
        .then((user) => {
            return done(null, user);
        })
        .catch(done);

}));

passport.serializeUser((user, cb) => {
    cb(null, user.email);
});

passport.deserializeUser((email, cb) => {
    db.User
        .findOne({
            where: { email: email }
        })
        .then((user) => {
            cb(null, user);
        })
        .catch(cb);
});

module.exports = {
    passport: passport,
    secret: COOKIE_SECRET
};
