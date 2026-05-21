import { getDb } from './db';

export const getAllProjects = () =>
    getDb().prepare(`
        SELECT p.*, c.name as client_name, c.company_name
        FROM projects p
        LEFT JOIN clients c ON p.client_id = c.id
        ORDER BY p.created_at DESC
    `).all();

export const getProjectById = (id: number) =>
    getDb().prepare(`
        SELECT p.*, c.name as client_name, c.company_name
        FROM projects p
        LEFT JOIN clients c ON p.client_id = c.id
        WHERE p.id = ?
    `).get(id);



export const addProject = (
    name: string, client_id: number | null, detail: string,
    what_done: string, what_todo: string, completion: number, status: string
) => getDb().prepare(`
    INSERT INTO projects (name, client_id, detail, what_done, what_todo, completion, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
`).run(name, client_id ?? null, detail ?? '', what_done ?? '', what_todo ?? '', completion ?? 0, status ?? 'Active');

export const updateProject = (
    id: number, name: string, client_id: number | null, detail: string,
    what_done: string, what_todo: string, completion: number, status: string
) => getDb().prepare(`
    UPDATE projects SET name=?, client_id=?, detail=?, what_done=?, what_todo=?, completion=?, status=? WHERE id=?
`).run(name, client_id ?? null, detail ?? '', what_done ?? '', what_todo ?? '', completion ?? 0, status ?? 'Active', id);

export const deleteProject = (id: number) =>
    getDb().prepare('DELETE FROM projects WHERE id = ?').run(id);
