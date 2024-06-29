require('dotenv').config()
const Passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const accountsQuery = require('./routes/accounts/accountsQuery');

const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.SECRET,
}

// }))

Passport.use(new JwtStrategy(options, async (payload, done) => {
    try {
        const user = await accountsQuery.getOneById(payload.id);
      
        if (user) {
            // console.log(user) // req.user
            return done(null, user); 
        } else {
            return done(null, false);
        }
    } catch (err) {
        return done(err, false);
    }
}));

// UNIMPORTANT
Passport.use(new GoogleStrategy({
    clientID: '79094271802-tug705ru322fmknlhjh0gnp63d6b32s5.apps.googleusercontent.com',
    clientSecret: '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',
    callbackURL: 'http://localhost:4000/auth/google/callback'
},
    async (accessToken, refreshToken, profile, done) => {
        try {
            const user = await accountsQuery.getOneByUsername(profile.emails[0].value);

            if (!user) {
                const newUser = await accountsQuery.createUser(profile.emails[0].value, profile.id);
                return done(null, newUser);
            }

            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }));
Passport.use(new FacebookStrategy({
    clientID: '800642972004047',
    clientSecret: 'b55f8668f8e51a4fa6ff1a2215c3cee6',
    callbackURL: 'http://localhost:4000/auth/facebook/callback'
},
    async (accessToken, refreshToken, profile, done) => {
        try {

            const user = await accountsQuery.getOneByUsername(profile.emails[0].value);

            if (!user) {

                const newUser = await accountsQuery.createUser(profile.emails[0].value, profile.id);
                return done(null, newUser);
            }


            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }));

module.exports = Passport;
