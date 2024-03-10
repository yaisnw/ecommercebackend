const db = require("../../db");

const createItem = async(data) => {
    const query = 'INSERT INTO order_item (order_id, prod_id, quantity, price) VALUES ($1, $2, $3, $4) RETURNING *';
    const result = await db.query(query, [data.order_id, data.prod_id, data.quantity, data.price])
    return result.rows[0]
}
const deleteItem = async(id) => {
    const query = 'DELETE FROM order_item WHERE id = $1';
    const result = await db.query(query, [id])
    return true
}
const updateItem = async(id, data) => {
    const query = 'UPDATE order_item SET prod_id = $1, quantity = $2, price = $3 WHERE id = $4 RETURNING *';
    const result = await db.query(query, [data.prod_id, data.quantity, data.price, id]);
    return result.rows[0]
}   

module.exports = {createItem, deleteItem, updateItem};
