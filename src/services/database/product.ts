import { getDb } from './db';

export const getAllProducts = () =>
    getDb().prepare('SELECT * FROM products').all();

export const addProduct = (name: string, price: number, stock: number) =>
    getDb().prepare('INSERT INTO products (name, price, stock) VALUES (?, ?, ?)').run(name, price, stock);

export const updateStock = (id: number, stock: number) =>
    getDb().prepare('UPDATE products SET stock = ? WHERE id = ?').run(stock, id);

export const deleteProduct = (id: number) =>
    getDb().prepare('DELETE FROM products WHERE id = ?').run(id);