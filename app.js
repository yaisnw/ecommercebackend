require('dotenv').config()
const express = require('express');
const session = require('express-session');
const productsRouter = require('./routes/products/productsRouter');
const accountsRouter = require('./routes/accounts/accountsRouter');
const cartRouter = require('./routes/cart/cartRouter');
const orderRouter = require('./routes/cart/orderRouter');
const accountsQuery = require('./routes/accounts/accountsQuery');
const Passport = require('passport');
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcryptjs')

const app = express();

app.use(session({
  secret: 'anything'
}));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

app.use(Passport.initialize());
app.use(Passport.session());

const login = async (data) => {
  const { username, password } = data;
  try {
    const salt = await bcrypt.genSalt(10);

    // Hash the password with salt
    const user = await accountsQuery.getOneByUsername(username);

    if (!user) {
      throw createError(404, 'User not found');
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if(!isPasswordMatch) {
      throw createError(401, "Incorrect password")
    }
    console.log("logged in!")
    return user
  } catch (error) {
    throw error;
  }
}

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Allow requests from localhost:3000
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

const PORT = process.env.PORT || 4000;

app.use(express.json())
app.use('/accounts', accountsRouter)
app.use('/products', productsRouter)
app.use('/cart', cartRouter)
app.use('/orders', orderRouter)

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
})

app.listen(PORT, () => {
  console.log(`Server is listening on ${PORT}`);
});