const express = require('express');
const productsQuery = require('./productsQuery');
const productsRouter = express.Router();

productsRouter.get('/category', async (req, res, next) => {
    let category = req.query.category;
    let id = req.query.id;
    try {
        const result = await productsQuery.getByCategory(category, id);
        return res.json(result);
    } catch (e) {
        console.error('Error in retrieval:', e);
        return res.status(500).json({ msg: 'Internal serverrror' });
    }
});

productsRouter.get('/', async (req, res, next) => {
    try {
        const result = await productsQuery.getAll();
        return res.json(result);
    } catch (error) {
        console.error('Error retrieving products:', error);
        return res.status(500).json({ msg: 'Internal server error' });
    }
});

productsRouter.get('/:id', async (req, res, next) => {
    try {
        const result = await productsQuery.getOne(req.params.id);
        return res.json(result);
    } catch (e) {
        console.error('Error retrieving product:', e);
        return res.status(500).json({ msg: 'Internal server error' });
    }
});

module.exports = productsRouter;
