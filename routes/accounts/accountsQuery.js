const db = require('../../db');

const createUser = async (username, email, password) => {
    const query = 'INSERT INTO accounts (username, email, password) VALUES ($1, $2, $3)'

    const result = await db.query(query, [username, email, password])
    const resultView = await db.query('SELECT * FROM accounts WHERE username = $1', [username])

    return resultView.rows[0]
}
const getOneById = async (id) => {
    const query = 'SELECT * FROM accounts WHERE id = $1;';
    const result = await db.query(query, [id])
    return result.rows[0]
}
const getOneByUsername = async (username) => {
    const query = 'SELECT * FROM accounts WHERE username = $1';
    const result = await db.query(query, [username])
    return result.rows[0]
}
const getAll = async () => {
    const query = 'SELECT * FROM accounts;';

    const result = await db.query(query)
    return result.rows
}
const changeInfo = async (id, username, email, password) => {
    const query = 'UPDATE accounts SET username = $1, email = $2, password = $3 WHERE id = $4';
    const querySelectResult = 'SELECT * FROM accounts WHERE id = $1';

    const result = await db.query(query, [username, email, password, id])
    const selectResult = await db.query(querySelectResult, [id])
    return selectResult.rows[0]
}

module.exports = {createUser, getAll, getOneById, getOneByUsername, changeInfo}