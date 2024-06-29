const express = require('express')
const orderQuery = require('./orderDetailQuery')
const orderRouter = express.Router()

orderRouter.get('/', async(req, res) => {
    try {
        const orders = await orderQuery.getOrders(req.user.id)
        res.json(orders)
    }
    catch (e) {
        res.status(500).json({msg: "request error"})
    }
})

orderRouter.get('/:id', async(req, res) => {
    try {
        const order = await orderQuery.findOrder(req.params.id)
        res.json(order)
    }
    catch (e) {
        res.status(500).json({msg: "request error"})
    }
})

module.exports = orderRouter;