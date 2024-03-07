require('dotenv').config() 
const express = require('express');
const app = express();
const productsRouter = require('./routes/products/productsRouter');
const accountsRouter = require('./routes/accounts/accountsRouter')

const PORT = process.env.PORT || 4000;

app.use(express.json())
app.use('/accounts', accountsRouter)
app.use('/products', productsRouter)

app.listen(PORT, () => {
    console.log(`Server is listening on ${PORT}`);
  });