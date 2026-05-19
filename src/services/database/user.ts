import { getDb } from './db';

export const getAllUsers = () =>
    getDb().prepare('SELECT * FROM users').all();

export const getUserById = (id: number) =>
    getDb().prepare('SELECT * FROM users WHERE id = ?').get(id);

export const addUser = (name: string, email: string) =>
    getDb().prepare('INSERT INTO users (name, email) VALUES (?, ?)').run(name, email);

export const updateUser = (id: number, name: string, email: string) =>
    getDb().prepare('UPDATE users SET name=?, email=? WHERE id = ?').run(name, email, id);

export const deleteUser = (id: number) =>
    getDb().prepare('DELETE FROM users WHERE id = ?').run(id);