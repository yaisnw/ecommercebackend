require('dotenv').config()
const express = require('express')
const cartQuery = require('./cartQuery')
const cartItemQuery = require('./cartItemQuery')
const orderDetailQuery = require('./orderDetailQuery')
const orderItemQuery = require('./orderItemQuery')
const Passport = require('../../strategies')
const cartRouter = express.Router()

cartRouter.get('/', async (req, res) => {
    try {
        const cart = await cartQuery.getCart(req.user.id)
        if (!cart) {
            res.status(501).json({ msg: "no cart" })
        }
        const items = await cartItemQuery.getItems(cart.id);
        if (!items) {
            res.status(502).json({ msg: "no items" })
        }
        cart.items = items;
        res.status(200).json(cart)
    }
    catch (e) {
        console.log(e)
        res.status(500).json({ msg: "NOT WORKING" })
    }
})

cartRouter.post('/', async (req, res) => {
    try {
        const newCart = await cartQuery.createCart(req.user.id)
        res.json(newCart)
    }
    catch (e) {
        res.status(500).json({ msg: "NUH UH" })
    }
})

cartRouter.post('/item', async (req, res) => {
    // console.log("Request user:", req.user); // Log the user object
    try {
        if (!req.user || !req.user.id) {
            return res.status(401)
        }
        
        const { product_id, quantity } = req.body;
        if (!product_id || !quantity) {
            return res.status(400)
        }

        let cart = await cartQuery.getCart(req.user.id);

        if (!cart) {
            cart = await cartQuery.createCart(req.user.id);
        }
        const existingCartItem = await cartItemQuery.getExistingItem(product_id, cart.id);
        if (existingCartItem) {
            const updatedExistingCartItem = await cartItemQuery.updateExistingItem(quantity, product_id, cart.id)
            return res.status(201).json(updatedExistingCartItem)
        }
        else {
            const cartItem = await cartItemQuery.createItem(cart.id, product_id, quantity);
            return res.status(201).json(cartItem)
        }

    } catch (e) {
        console.error(e);
        res.status(500).json({ msg: "Internal server error" });
    }
});



cartRouter.put('/item/:id', async (req, res) => {
    try {
        const product_id = req.params.id
        const updatedItem = await cartItemQuery.updateItem(product_id, req.body.quantity)
        res.json(updatedItem)
    }
    catch (e) {
        res.status(500).json({ msg: "request error" })
    }
})
cartRouter.delete('/item/:id', async (req, res) => {
    try {
        await cartItemQuery.deleteItemByProduct(req.params.id)
        res.json({ msg: "Deleted" })

    }
    catch (e) {
        res.status(500).json({ msg: "request error" })
    }
})
cartRouter.post('/checkout', async (req, res) => {
    try {
        const cart = await cartQuery.getCart(req.user.id);
        const items = await cartItemQuery.getItems(cart.id);
        const total = items.reduce((total, current) => {
            const price = Number(current.price.replace('$', ''));
            return total + (price * Number(current.quantity));
        }, 0)

        const order = await orderDetailQuery.createOrder(req.user.id, total);

        order.items = await Promise.all(items.map(async (item) => { return await orderItemQuery.createItem({ order_id: order.id, price: item.price, quantity: item.quantity, product_id: item.product_id }) }));


        const deletedCartItems = await cartItemQuery.deleteItemByCart(cart.id);
        const deletedCart = await cartQuery.deleteCart(req.user.id);

        res.status(200).json({msg: "checked out!"})
    }
    catch (e) {
        res.status(500).json({ msg: "request error" })
    }
})


module.exports = cartRouter;