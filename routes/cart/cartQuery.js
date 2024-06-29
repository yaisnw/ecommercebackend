const db = require('../../db');

const getCart = async (id) => {
    const query = 'SELECT * FROM cart WHERE account_id = $1';

    const result = await db.query(query, [id])
    return result.rows[0]

}
const createCart = async (id) => {
    const query = 'INSERT INTO cart (account_id) VALUES ($1) RETURNING *';

    const result = await db.query(query, [id]);
    return result.rows[0]
}

const deleteCart = async(id) => {
    const query = 'DELETE FROM cart WHERE account_id = $1 RETURNING *';

    const result = await db.query(query, [id])
    return result.rows[0]
}
module.exports = {getCart, createCart, deleteCart};