const db = require('../../db');

const getAll = async () => {
    const query = 'SELECT * FROM products;';

    const result = await db.query(query)
    return result.rows
}
const getOne = async (id) => {
    const query = 'SELECT * FROM products WHERE id = $1;';
    const result = await db.query(query, [id])
    return result.rows[0]
}
const getByCategory = async (category, id) => {
    const query = 'SELECT * FROM products WHERE category = $1 AND id != $2';
    const result = await db.query(query, [category, id]);
    return result.rows
}

module.exports = {getAll, getOne, getByCategory};