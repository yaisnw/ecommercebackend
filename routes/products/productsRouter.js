const express = require('express');
const productsQuery = require('./productsQuery')
const productsRouter = express.Router();


productsRouter.get('/category', async (req, res, next) => {
    let category = req.query.category;
    try {
        const result = await productsQuery.getByCategory(category);
        res.json(result)
    }
    catch (e) {
        console.error('error in retrieval')
        res.status(500).json({error: 'error'})
    }
})
productsRouter.get('/', async (req, res, next) => {
    try {
        const result = await productsQuery.getAll();
        res.json(result);
    } catch (error) {
        console.error('Error retrieving products:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
})

productsRouter.get('/:id', async (req, res, next) => {
    try {
        const result = await productsQuery.getOne(req.params.id);
        res.json(result)
    }
    catch (e) {
        console.error('error detected')
        res.status(500)
    }
})


module.exports = productsRouter;