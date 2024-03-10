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

const app = express();

app.use(session({
  secret: 'anything'
}));

app.use(Passport.initialize());
app.use(Passport.session());

const login = async(data) => {
  const { username, password } = data;
  try {
      const user = await accountsQuery.getOneByUsername(username);
      if (!user) {
          throw createError(404, 'User not found');
      }

      if (user.password != password) {
          throw createError(401, 'Incorrect password')
      }
      return user
  } catch(error) {
      throw error;
  }
}


Passport.serializeUser((user, done) => {
  done(null, user.id)
});
Passport.deserializeUser(async (id, done) => {
  const user = await accountsQuery.getOneById(id);
  done(null, user)

})

Passport.use(
  new LocalStrategy(async (username, password, done) => {
    const account = await login({username, password})
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
  async (req, res) => {
    try {
      const account = await login(req.body);
      res.status(200).json(account)
    }
    catch(e) {
      next(error)
    }
  }
)
app.get('/logout', (req, res) => {
  req.logout();
  res.json({ msg: 'logged out' })
})

app.listen(PORT, () => {
  console.log(`Server is listening on ${PORT}`);
});