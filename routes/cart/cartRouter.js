const express = require('express')
const cartQuery = require('./cartQuery')
const cartItemQuery = require('./cartItemQuery')
const orderQuery = require('./orderQuery')
const orderItemQuery = require('./orderItemQuery')
const cartRouter = express.Router()

cartRouter.get('/', async (req, res) => {
    try {
        const cart = await cartQuery.getCart(req.user.id)
        const items = await cartItemQuery.getItems(cart.id);
        cart.items = items;
        res.status(200).json(cart)
    }
    catch (e) {
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
    try {
        const cart = await cartQuery.getCart(req.user.id);
        const cartItem = await cartItemQuery.createItem(cart.id, req.body)
        res.json(cartItem)
    }
    catch (e) {
        res.status(500).json({ msg: "NUH UH" })
    }
})
cartRouter.put('/item/:id', async (req, res) => {
    try {
        const updatedItem = await cartItemQuery.updateItem(req.params.id, req.body)
        res.json(updatedItem)
    }
    catch (e) {
        res.status(500).json({ msg: "request error" })
    }
})
cartRouter.delete('/item/:id', async (req, res) => {
    try {
        await cartItemQuery.deleteItem(req.params.id)
        res.json({ msg: "Deleted" })

    }
    catch (e) {
        res.status(500).json({ msg: "request error" })
    }
})
cartRouter.post('/checkout', async (req, res) => {
    try {
        const cart = await cartQuery.getCart(req.user.id);
        const items = await cartItemQuery.getItems(cart.id)
        const total = items.reduce((total, current) => {
            return total += (Number(current.price) * Number(current.quantity))
        }, 0)
        const order = await orderQuery.createOrder(req.user.id, total);
    

        order.items = await Promise.all(items.map(async(item) => { await orderItemQuery.createItem({order_id: order.id, price: item.price,quantity: item.quantity, prod_id: item.prod_id})}));

        res.json(order)
    }
    catch (e) {
        res.status(500).json({msg: "request error"})
    }
})


module.exports = cartRouter;