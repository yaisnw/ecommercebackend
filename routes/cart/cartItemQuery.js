const db = require('../../db');

const getItems = async (id) => {

    const query = `
        SELECT c.id, c.cart_id, c.quantity, c.prod_id, p.name, p.price::numeric::int, p.category
        FROM cart_item c
        INNER JOIN products p ON p.id = c.prod_id
        WHERE cart_id =$1;
        `

    const results = await db.query(query, [id]);
    return results.rows;

}
const createItem = async (cartId, data) => {
    const query = 'INSERT INTO cart_item (quantity, cart_id, prod_id) VALUES ($1, $2, $3) RETURNING *';
    const results = await db.query(query, [data.quantity, cartId, data.prod_id])
    return results.rows[0]
}
const updateItem = async (id, data) => {
    const query = 'UPDATE cart_item SET quantity = $1, prod_id = $2 WHERE id = $3 RETURNING *';
    const result = await db.query(query, [data.quantity, data.prod_id, id])
    return result.rows[0]
}
const deleteItem = async (id) => {
    const result = await db.query('DELETE FROM cart_item WHERE id = $1', [id]);
    return true
}

module.exports = {getItems, createItem, updateItem, deleteItem};