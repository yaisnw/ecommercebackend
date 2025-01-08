const express = require('express');
const orderQuery = require('./orderDetailQuery');
const orderRouter = express.Router();

orderRouter.get('/', async (req, res) => {
    try {
        const orders = await orderQuery.getOrders(req.user.id);
        return res.json(orders);
    } catch (e) {
        return res.status(500).json({ msg: "Request error" });
    }
});

orderRouter.get('/:id', async (req, res) => {
    try {
        const order = await orderQuery.findOrder(req.params.id);
        return res.json(order);
    } catch (e) {
        return res.status(500).json({ msg: "Request error" });
    }
});

module.exports = orderRouter;
