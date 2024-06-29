const db = require("../../db");

const getOrder = async (id) => {
    const query = 'SELECT * FROM order_detail WHERE account_id = $1';

    const result = await db.query(query, [id]);

    return result.rows[0]
}
const findOrder = async (id) => {
    const query = 'SELECT * FROM order_detail WHERE id = $1';
    const result = await db.query(query, [id])
    return result.rows[0]
}
const createOrder = async(account_id, total) =>{
    const query = 'INSERT INTO order_detail (account_id, total) VALUES ($1, $2) RETURNING *;';
    const result = await db.query(query, [account_id, total]);
    return result.rows[0]
}

module.exports = {getOrder, findOrder, createOrder};