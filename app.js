require('dotenv').config()
const express = require('express');
const session = require('express-session');
const productsRouter = require('./routes/products/productsRouter');
const accountsRouter = require('./routes/accounts/accountsRouter');
const cartRouter = require('./routes/cart/cartRouter');
const orderRouter = require('./routes/cart/orderRouter');
const accountsQuery = require('./routes/accounts/accountsQuery');
const Passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const bcrypt = require('bcryptjs')

const app = express();

app.use(session({
  secret: 'anything',
  resave: false,
  saveUninitialized: true,
}));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

app.use(function(error, req, res, next) {
  console.error('Unhandled Error:', error);
  res.status(500).send('Internal Server Error');
});

app.use(Passport.initialize());
app.use(Passport.session());

const login = async (data) => {
  const { username, password } = data;
  try {

    const user = await accountsQuery.getOneByUsername(username);

    if (!user) {
      throw createError(404, 'User not found');
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      throw createError(401, "Incorrect password")
    }
    console.log("logged in!")
    return user
  } catch (error) {
    throw error;
  }
}

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Allow requests from localhost:4000
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified HTTP methods
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Allow specified headers
  res.setHeader('Access-Control-Allow-Credentials', true); // Allow credentials (e.g., cookies)
  next();
});

Passport.serializeUser((user, done) => {
  done(null, user.id)
});
Passport.deserializeUser(async (id, done) => {
  const user = await accountsQuery.getOneById(id);
  done(null, user)

})

Passport.use(
  new LocalStrategy(async (username, password, done) => {
    const account = await login({ username, password })
    return done(null, account)

  })
);

Passport.use(new GoogleStrategy({
  clientID: '79094271802-tug705ru322fmknlhjh0gnp63d6b32s5.apps.googleusercontent.com',
  clientSecret: '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',
  callbackURL: 'http://localhost:4000/auth/google/callback'
},
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if the user already exists in your database
      const user = await accountsQuery.getOneByUsername(profile.emails[0].value);

      if (!user) {
        // If the user doesn't exist, create a new user in your database
        const newUser = await accountsQuery.createUser(profile.emails[0].value, profile.id);
        return done(null, newUser);
      }

      // If the user exists, return the user
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
      console.log(profile)
      // Check if the user already exists in your database
      const user = await accountsQuery.getOneByUsername(profile.emails[0].value);

      if (!user) {
        // If the user doesn't exist, create a new user in your database
        const newUser = await accountsQuery.createUser(profile.emails[0].value, profile.id);
        return done(null, newUser);
      }

      // If the user exists, return the user
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }));



const PORT = process.env.PORT || 4000;

app.use(express.json())
app.use('/accounts', accountsRouter)
app.use('/products', productsRouter)
app.use('/cart', cartRouter)
app.use('/orders', orderRouter)

app.get('/auth/google', Passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
  Passport.authenticate('google', { failureRedirect: 'http://localhost:3000/login' }),
  (req, res) => {
    // Successful authentication, redirect to home page or dashboard
    res.redirect('http://localhost:3000/home');
  }
);

app.get('/auth/facebook', Passport.authenticate('facebook', {scope: ['email']}));

app.get('/auth/facebook/callback',
  Passport.authenticate('facebook', {failureRedirect: 'http://localhost:3000/login' }), (req, res) => {
    res.redirect('http://localhost:3000/home');
  });

app.post('/login',
  Passport.authenticate('local', { failureRedirect: '/login' }),
  async (req, res, next) => {
    try {
      const account = await login(req.body);
      res.status(200).json(account);
      
    } catch (error) {
      next(error); // Return the error to the error handler middleware
    }
  }
);
app.get('/logout', (req, res) => {
  req.logout();
  res.json({ msg: 'logged out' })
  res.redirect('/login')
})

app.listen(PORT, () => {
  console.log(`Server is listening on ${PORT}`);
});