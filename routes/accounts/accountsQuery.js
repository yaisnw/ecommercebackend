const db = require('../../db');

const createUser = async (username, email, password) => {
    const query = 'INSERT INTO accounts (username, email, password) VALUES ($1, $2, $3)'

    const result = await db.query(query, [username, email, password])
    const resultView = await db.query('SELECT * FROM accounts WHERE username = $1', [username])

    return resultView.rows[0]
}
const getAll = async () => {
    const query = 'SELECT * FROM accounts;';

    const result = await db.query(query)
    return result.rows
}

module.exports = {createUser, getAll}