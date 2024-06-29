const db = require('../../db');

const getItems = async (id) => {

    const query = `
        SELECT c.id, c.cart_id, c.quantity, c.product_id, p.name, p.price, p.category, p.image
        FROM cart_item c
        INNER JOIN products p ON p.id = c.product_id
        WHERE cart_id =$1;
        `

    const results = await db.query(query, [id]);
    return results.rows;

}
const createItem = async (cartId, product_id, quantity) => {
    const query = 'INSERT INTO cart_item (cart_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *';
    const results = await db.query(query, [cartId, product_id, quantity])
    return results.rows[0]
}
const updateItem = async (product_id, quantity) => {
    const query = 'UPDATE cart_item SET quantity = $1 WHERE product_id = $2 RETURNING *';
    const result = await db.query(query, [quantity, product_id])
    return result.rows[0]
}
const getExistingItem = async (product_id, cart_id) => {
    const query = 'SELECT * FROM cart_item WHERE product_id = $1 AND cart_id = $2';
    const result = await db.query(query, [product_id, cart_id])
    return result.rows[0]
}
const updateExistingItem = async (quantity, product_id, cart_id) => {
    const query = 'UPDATE cart_item SET quantity = quantity + $1 WHERE product_id = $2 AND cart_id = $3 RETURNING *';
    const result = await db.query(query, [quantity, product_id, cart_id]);
    return result.rows[0]
}
const deleteItemByProduct = async (id) => {
    const result = await db.query('DELETE FROM cart_item WHERE product_id = $1 RETURNING *', [id]);
    return result.rows[0]
}
const deleteItemByCart = async (id) => {
    const result = await db.query('DELETE FROM cart_item WHERE cart_id = $1 RETURNING *', [id]);
    return result.rows[0]
}

module.exports = { getItems, createItem, updateItem, deleteItemByProduct, getExistingItem, updateExistingItem, deleteItemByCart };