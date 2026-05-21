import { getDb } from './db';

export const getAllAttendance = () =>
    getDb().prepare(`
        SELECT a.*, u.name, u.department, u.position
        FROM attendance a
        JOIN users u ON a.user_id = u.id
        ORDER BY a.date DESC
    `).all();

export const getAttendanceByDate = (date: string) =>
    getDb().prepare(`
        SELECT a.*, u.name, u.department, u.position
        FROM attendance a
        JOIN users u ON a.user_id = u.id
        WHERE a.date = ?
        ORDER BY u.name
    `).all(date);

export const getAttendanceByUser = (userId: number) =>
    getDb().prepare(`
        SELECT a.*, u.name FROM attendance a
        JOIN users u ON a.user_id = u.id
        WHERE a.user_id = ?
        ORDER BY a.date DESC
    `).all(userId);

export const markAttendance = (
    user_id: number, date: string,
    check_in: string, status: string, remark: string
) => getDb().prepare(`
    INSERT INTO attendance (user_id, date, check_in, status, remark)
    VALUES (?, ?, ?, ?, ?)
`).run(user_id, date, check_in, status, remark ?? '');

export const updateAttendance = (
    id: number, check_in: string, status: string, remark: string
) => getDb().prepare(`
    UPDATE attendance SET check_in=?, status=?, remark=? WHERE id=?
`).run(check_in, status, remark ?? '', id);

export const deleteAttendance = (id: number) =>
    getDb().prepare('DELETE FROM attendance WHERE id = ?').run(id);