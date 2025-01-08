require('dotenv').config();
const express = require('express');
const cartQuery = require('./cartQuery');
const cartItemQuery = require('./cartItemQuery');
const orderDetailQuery = require('./orderDetailQuery');
const orderItemQuery = require('./orderItemQuery');
const Passport = require('../../strategies');
const cartRouter = express.Router();

cartRouter.get('/', async (req, res) => {
    try {
        const cart = await cartQuery.getCart(req.user.id);
        if (!cart) {
            return res.status(501).json({ msg: "no cart" });
        }
        const items = await cartItemQuery.getItems(cart.id);
        console.log(cart);
        if (!items) {
            return res.status(502).json({ msg: "no items" });
        }
        cart.items = items;
        return res.status(200).json(cart);
    } catch (e) {
        console.log(e);
        return res.status(500).json({ msg: "NOT WORKING" });
    }
});

cartRouter.post('/', async (req, res) => {
    try {
        const newCart = await cartQuery.createCart(req.user.id);
        return res.json(newCart);
    } catch (e) {
        return res.status(500).json({ msg: "NUH UH" });
    }
});

cartRouter.post('/item', async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ msg: "Unauthorized" });
        }

        const { product_id, quantity } = req.body;
        if (!product_id || !quantity) {
            return res.status(400).json({ msg: "Bad Request" });
        }

        let cart = await cartQuery.getCart(req.user.id);

        if (!cart) {
            cart = await cartQuery.createCart(req.user.id);
        }
        const existingCartItem = await cartItemQuery.getExistingItem(product_id, cart.id);
        if (existingCartItem) {
            const updatedExistingCartItem = await cartItemQuery.updateExistingItem(quantity, product_id, cart.id);
            return res.status(201).json(updatedExistingCartItem);
        } else {
            const cartItem = await cartItemQuery.createItem(cart.id, product_id, quantity);
            return res.status(201).json(cartItem);
        }
    } catch (e) {
        console.error(e);
        return res.status(500).json({ msg: "Internal server error" });
    }
});

cartRouter.put('/item/:id', async (req, res) => {
    try {
        const product_id = req.params.id;
        const updatedItem = await cartItemQuery.updateItem(product_id, req.body.quantity);
        return res.json(updatedItem);
    } catch (e) {
        return res.status(500).json({ msg: "request error" });
    }
});

cartRouter.delete('/item/:id', async (req, res) => {
    try {
        await cartItemQuery.deleteItemByProduct(req.params.id);
        return res.json({ msg: "Deleted" });
    } catch (e) {
        return res.status(500).json({ msg: "request error" });
    }
});

cartRouter.post('/checkout', async (req, res) => {
    try {
        const cart = await cartQuery.getCart(req.user.id);
        const items = await cartItemQuery.getItems(cart.id);
        const total = items.reduce((total, current) => {
            const price = Number(current.price.replace('$', ''));
            return total + (price * Number(current.quantity));
        }, 0);

        const order = await orderDetailQuery.createOrder(req.user.id, total);

        order.items = await Promise.all(items.map(async (item) => {
            return await orderItemQuery.createItem({
                order_id: order.id,
                price: item.price,
                quantity: item.quantity,
                product_id: item.product_id
            });
        }));

        await cartItemQuery.deleteItemByCart(cart.id);
        await cartQuery.deleteCart(req.user.id);

        return res.status(200).json({ msg: "checked out!" });
    } catch (e) {
        return res.status(500).json({ msg: "request error" });
    }
});

module.exports = cartRouter;
