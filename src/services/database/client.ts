import { getDb } from './db';

export const getAllClients = () =>
    getDb().prepare('SELECT * FROM clients ORDER BY created_at DESC').all();

export const getClientById = (id: number) =>
    getDb().prepare('SELECT * FROM clients WHERE id = ?').get(id);

export const addClient = (
    name: string, email: string, phone: string,
    address: string, company_name: string, status: string
) => getDb().prepare(`
    INSERT INTO clients (name, email, phone, address, company_name, status)
    VALUES (?, ?, ?, ?, ?, ?)
`).run(name, email, phone ?? '', address ?? '', company_name ?? '', status ?? 'Active');

export const updateClient = (
    id: number, name: string, email: string, phone: string,
    address: string, company_name: string, status: string
) => getDb().prepare(`
    UPDATE clients SET name=?, email=?, phone=?, address=?, company_name=?, status=? WHERE id=?
`).run(name, email, phone ?? '', address ?? '', company_name ?? '', status ?? 'Active', id);

export const deleteClient = (id: number) =>
    getDb().prepare('DELETE FROM clients WHERE id = ?').run(id);