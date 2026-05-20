import { getDb } from './db';

export const getAttendanceByDate = (date: string) =>
    getDb().prepare(`
        SELECT a.*, u.name, u.department, u.position
        FROM attendance a
        JOIN users u ON a.user_id = u.id
        WHERE a.date = ?
        ORDER BY u.name
    `).all(date);

export const getAttendanceByUser = (userId: number, from: string, to: string) =>
    getDb().prepare(`
        SELECT * FROM attendance
        WHERE user_id = ? AND date BETWEEN ? AND ?
        ORDER BY date DESC
    `).all(userId, from, to);

export const getMonthlyAttendance = (userId: number, year: string, month: string) =>
    getDb().prepare(`
        SELECT * FROM attendance
        WHERE user_id = ? AND date LIKE ?
        ORDER BY date
    `).all(userId, `${year}-${month}-%`);

export const markAttendance = (
    user_id: number, date: string, status: string,
    check_in: string, check_out: string, work_hours: number,
    is_late: number, overtime_hours: number,
    leave_type: string, remarks: string, approved_by: number
) => getDb().prepare(`
    INSERT INTO attendance (user_id, date, status, check_in, check_out, work_hours, is_late, overtime_hours, leave_type, remarks, approved_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id, date) DO UPDATE SET
        status=excluded.status, check_in=excluded.check_in, check_out=excluded.check_out,
        work_hours=excluded.work_hours, is_late=excluded.is_late,
        overtime_hours=excluded.overtime_hours, leave_type=excluded.leave_type,
        remarks=excluded.remarks, approved_by=excluded.approved_by
`).run(user_id, date, status, check_in ?? '', check_out ?? '', work_hours ?? 0, is_late ?? 0, overtime_hours ?? 0, leave_type ?? '', remarks ?? '', approved_by ?? null);

export const deleteAttendance = (id: number) =>
    getDb().prepare('DELETE FROM attendance WHERE id = ?').run(id);

export const getAttendanceSummary = (userId: number, year: string, month: string) =>
    getDb().prepare(`
        SELECT
            COUNT(*) as total_days,
            SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as present,
            SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END) as absent,
            SUM(CASE WHEN status = 'Leave' THEN 1 ELSE 0 END) as on_leave,
            SUM(CASE WHEN status = 'Half Day' THEN 1 ELSE 0 END) as half_day,
            SUM(CASE WHEN is_late = 1 THEN 1 ELSE 0 END) as late_count,
            SUM(work_hours) as total_work_hours,
            SUM(overtime_hours) as total_overtime
        FROM attendance
        WHERE user_id = ? AND date LIKE ?
    `).get(userId, `${year}-${month}-%`);

export const getLeaveBalance = (userId: number, year: number) =>
    getDb().prepare('SELECT * FROM leave_balance WHERE user_id = ? AND year = ?').get(userId, year);

export const upsertLeaveBalance = (userId: number, year: number) =>
    getDb().prepare(`
        INSERT INTO leave_balance (user_id, year) VALUES (?, ?)
        ON CONFLICT(user_id, year) DO NOTHING
    `).run(userId, year);