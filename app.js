require('dotenv').config()
const express = require('express');
const productsRouter = require('./routes/products/productsRouter');
const accountsRouter = require('./routes/accounts/accountsRouter');
const cartRouter = require('./routes/cart/cartRouter');
const orderRouter = require('./routes/cart/orderRouter');
const Passport = require('./strategies');
const bcrypt = require('bcryptjs')
const accountsQuery = require('./routes/accounts/accountsQuery');
const jwt = require('jsonwebtoken')

const app = express();

const PORT = process.env.PORT || 4000;

app.use(Passport.initialize());
app.use(express.json())
// cors

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', true);
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});
// oauth
// app.get('/auth/google', Passport.authenticate('google', { scope: ['profile', 'email'] }));

// app.get('/auth/google/callback',
//   Passport.authenticate('google', { failureRedirect: 'http://localhost:3000/login' }),
//   (req, res) => {
//     res.redirect('http://localhost:3000/products');
//   }
// );

// app.get('/auth/facebook', Passport.authenticate('facebook', { scope: ['email'] }));

// app.get('/auth/facebook/callback',
//   Passport.authenticate('facebook', { failureRedirect: 'http://localhost:3000/login' }), (req, res) => {
//     res.redirect('http://localhost:3000/products');
//   });

app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await accountsQuery.getOneByUsername(username);

    if (!user) {
      return res.status(401).json({ msg: 'User not found' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(402).json({ msg: 'Password incorrect' });
    }

    const payload = { id: user.id, username: user.username };
    const token = jwt.sign(payload, process.env.SECRET, { expiresIn: '1h' });
    res.status(200).send(token);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Internal server error' });
  }
});



app.use('/accounts', accountsRouter)
app.use('/products', Passport.authenticate('jwt', { session: false }), productsRouter)
app.use('/cart', Passport.authenticate('jwt', { session: false }), cartRouter)
app.use('/orders', orderRouter)


app.listen(PORT, () => {
  console.log(`Server is listening on ${PORT}`);
});