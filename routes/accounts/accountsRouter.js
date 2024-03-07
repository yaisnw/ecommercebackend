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

module.exports = accountsRouter;
