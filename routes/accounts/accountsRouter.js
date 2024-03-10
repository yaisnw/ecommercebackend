const express = require('express');
const accountsQuery = require('./accountsQuery');
const accountsRouter = express.Router();

accountsRouter.post('/register', async (req, res, next) => {

    const {username, email, password} = req.body;

    const newUser = await accountsQuery.createUser(username, email, password);
    if (newUser) {
        res.status(201).json({
            msg: "user created",
            newUser
        })
    }
    else {
        res.status(500).json({
            msg: "user wasn't created"
        })
    }
})
accountsRouter.get('/', async (req, res, next) => {
    try {
        const result = await accountsQuery.getAll();
        res.json(result);
    } catch (error) {
        console.error('Error retrieving accounts:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
})
accountsRouter.get('/:id', async (req, res, next) => {
    try {
        const result = await accountsQuery.getOneById(req.params.id);
        res.json(result)
    }
    catch (e) {
        console.error('error detected')
        res.status(500)
    }
})
accountsRouter.put('/:id', async (req, res, next) => {
    const {username, email, password} = req.body
    const {id} = req.params
    try {
        const result = await accountsQuery.changeInfo(id, username, email, password);
        res.json(result)
    }
    catch (e) {
        console.error('error detected')
        res.status(500).json({error: 'request failed'})
    }
})

module.exports = accountsRouter;
