import { getDb } from './db';

// Get All Orders
export const getAllOrders = () => getDb()
  .prepare(` SELECT * FROM orders ORDER BY created_at DESC `).all();

// Get Order By ID
export const getOrderById = (id: number) =>
  getDb().prepare(` SELECT * FROM orders WHERE id = ?`).get(id);

// Add Order
export const addOrder = (product_id: number | null, product_name: string, product_price: number, receiver_name: string, phone: string, email: string, address: string, discount: number, quantity: number, final_amount: number, status: string = 'Pending') =>
  getDb().prepare(`INSERT INTO orders ( product_id, product_name, product_price, receiver_name, phone, email, address, discount, quantity, final_amount, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(product_id, product_name ?? '', product_price ?? 0, receiver_name, phone ?? '', email ?? '', address ?? '', discount ?? 0, quantity ?? 1, final_amount ?? 0, status ?? 'Pending');

// Update Order
export const updateOrder = (
  id: number, product_id: number | null, product_name: string, product_price: number, receiver_name: string, phone: string, email: string, address: string, discount: number, quantity: number, final_amount: number, status: string) =>
  getDb().prepare(`UPDATE orders SET product_id = ?, product_name = ?,product_price = ?,receiver_name = ?, phone = ?, email = ?, address = ?, discount = ?,  quantity = ?,   final_amount = ?, status = ? WHERE id = ?`)
    .run(product_id, product_name ?? '', product_price ?? 0, receiver_name, phone ?? '', email ?? '', address ?? '', discount ?? 0, quantity ?? 1, final_amount ?? 0, status ?? 'Pending', id);

// Delete Order
export const deleteOrder = (id: number) =>
  getDb().prepare(`DELETE FROM orders WHERE id = ?`).run(id);