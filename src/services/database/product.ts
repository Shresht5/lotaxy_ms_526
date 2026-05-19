import { getDb } from './db';

export const getAllProducts = () =>
    getDb().prepare('SELECT * FROM products').all();

export const addProduct = (name: string, price: number, mrp: number, stock: number, category: string, detail: string, image_path: string) =>
    getDb().prepare('INSERT INTO products (name, price, mrp, stock, category, detail, image_path) VALUES (?, ?, ?, ?, ?, ?, ?)').run(name, price, mrp, stock, category, detail, image_path);

export const updateProduct = (id: number, name: string, price: number, mrp: number, stock: number, category: string, detail: string, image_path: string) =>
    getDb().prepare('UPDATE products SET name=?, price=?, mrp=?, stock=?, category=?, detail=?, image_path=? WHERE id=?').run(name, price, mrp, stock, category, detail, image_path, id);

export const deleteProduct = (id: number) =>
    getDb().prepare('DELETE FROM products WHERE id = ?').run(id);