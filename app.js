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


const cors = require('cors');

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ msg: 'Username and password are required.' });
    }
    const user = await accountsQuery.getOneByUsername(username);

    if (!user) {
      return res.status(401).json({ msg: 'User not found' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(402).json({ msg: 'Password is incorrect' });
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