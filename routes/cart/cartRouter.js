const express = require('express')
const cartQuery = require('./cartQuery')
const cartItemQuery = require('./cartItemQuery')
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


module.exports = cartRouter;