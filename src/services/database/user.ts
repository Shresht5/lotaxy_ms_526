import { getDb } from './db';

export const getAllUsers = () => getDb().prepare('SELECT * FROM users').all();

export const getUserById = (id: number) => getDb().prepare('SELECT * FROM users WHERE id = ?').get(id);

export const addUser = (name: string, email: string, phone: string, department: string, position: string, date_of_joining: string, date_of_birth: string, total_experience: number, performance: string, potential: string, ctc: number) => getDb().prepare(`    INSERT INTO users (name, email, phone, department, position, date_of_joining, date_of_birth, total_experience, performance, potential, ctc)    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(name, email, phone, department, position, date_of_joining, date_of_birth, total_experience, performance, potential, ctc);

export const updateUser = (id: number, name: string, email: string, phone: string, department: string, position: string, date_of_joining: string, date_of_birth: string, total_experience: number, performance: string, potential: string, ctc: number) => getDb().prepare(`    UPDATE users SET name=?, email=?, phone=?, department=?, position=?,    date_of_joining=?, date_of_birth=?, total_experience=?, performance=?,    potential=?, ctc=? WHERE id=?`).run(name, email, phone, department, position, date_of_joining, date_of_birth, total_experience, performance, potential, ctc, id);

export const deleteUser = (id: number) => getDb().prepare('DELETE FROM users WHERE id = ?').run(id);