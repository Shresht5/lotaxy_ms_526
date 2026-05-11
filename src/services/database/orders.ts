import { getDb } from './db';

export const getAllOrders = () =>
    getDb().prepare(`
    SELECT orders.*, users.name as user_name, products.name as product_name
    FROM orders
    JOIN users ON orders.user_id = users.id
    JOIN products ON orders.product_id = products.id
  `).all();

export const addOrder = (userId: number, productId: number, quantity: number) =>
    getDb().prepare('INSERT INTO orders (user_id, product_id, quantity) VALUES (?, ?, ?)').run(userId, productId, quantity);