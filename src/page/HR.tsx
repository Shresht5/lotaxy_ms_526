import { useEffect, useState } from 'react';

const STATUSES = ['Present', 'Absent', 'Leave', 'Half Day'];

const statusStyle: Record<string, string> = {
    Present: 'bg-green-50 text-green-700',
    Absent: 'bg-red-50 text-red-600',
    Leave: 'bg-[#f3e6ff] text-[#8800ff]',
    'Half Day': 'bg-yellow-50 text-yellow-700',
};

const statusDot: Record<string, string> = {
    Present: 'bg-green-500',
    Absent: 'bg-red-500',
    Leave: 'bg-[#8800ff]',
    'Half Day': 'bg-yellow-500',
};

const today = () => new Date().toISOString().split('T')[0];
const nowTime = () => new Date().toTimeString().slice(0, 5);

export const HR = () => {
    const [records, setRecords] = useState<Attendance[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [date, setDate] = useState(today());
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Attendance | null>(null);
    const [form, setForm] = useState({ user_id: '', date: today(), check_in: nowTime(), status: 'Present', remark: '' });
    const [tab, setTab] = useState<'date' | 'all'>('date');

    const loadByDate = () => window.api.getAttendanceByDate(date).then(data => setRecords(data ?? []));
    const loadAll = () => window.api.getAllAttendance().then(data => setRecords(data ?? []));
    const load = () => tab === 'date' ? loadByDate() : loadAll();

    useEffect(() => { load(); }, [date, tab]);
    useEffect(() => { window.api.getUsers().then(data => setUsers(data ?? [])); }, []);

    const filtered = records.filter(r => {
        const matchSearch = r.name?.toLowerCase().includes(search.toLowerCase()) ||
            r.department?.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'All' || r.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const summary = {
        present: records.filter(r => r.status === 'Present').length,
        absent: records.filter(r => r.status === 'Absent').length,
        leave: records.filter(r => r.status === 'Leave').length,
        halfDay: records.filter(r => r.status === 'Half Day').length,
    };

    const openAdd = () => {
        setEditing(null);
        setForm({ user_id: '', date, check_in: nowTime(), status: 'Present', remark: '' });
        setShowModal(true);
    };

    const openEdit = (r: Attendance) => {
        setEditing(r);
        setForm({ user_id: String(r.user_id), date: r.date, check_in: r.check_in, status: r.status, remark: r.remark ?? '' });
        setShowModal(true);
    };

    const handleSave = async () => {
        const { user_id, date: d, check_in, status, remark } = form;
        if (!user_id || !check_in) return;
        if (editing) {
            await window.api.updateAttendance(editing.id, check_in, status, remark);
        } else {
            await window.api.markAttendance(+user_id, d, check_in, status, remark);
        }
        setShowModal(false);
        load();
    };

    const handleDelete = async (id: number) => {
        if (confirm('Delete this record?')) { await window.api.deleteAttendance(id); load(); }
    };

    const initials = (name: string) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
    const avatarColor = (name: string) => {
        const colors = ['#8800ff', '#5700a3', '#0066ff', '#00aa55', '#ff6600', '#cc0055'];
        return colors[(name?.charCodeAt(0) ?? 0) % colors.length];
    };

    const inputCls = "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#b35cff] focus:outline-none focus:ring-2 focus:ring-[#f3e6ff]";
    const selectCls = "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-[#b35cff] focus:outline-none focus:ring-2 focus:ring-[#f3e6ff] bg-white";

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Top bar */}
            <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <h1 className="text-lg font-bold text-slate-900">Attendance</h1>
                        <span className="rounded-full bg-[#f3e6ff] text-[#8800ff] text-xs font-semibold px-2.5 py-0.5">{records.length}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Tab toggle */}
                        <div className="flex bg-slate-100 rounded-lg p-0.5 text-xs font-medium">
                            <button onClick={() => setTab('date')} className={`px-3 py-1.5 rounded-md transition-colors ${tab === 'date' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}>
                                By Date
                            </button>
                            <button onClick={() => setTab('all')} className={`px-3 py-1.5 rounded-md transition-colors ${tab === 'all' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}>
                                All Records
                            </button>
                        </div>
                        {tab === 'date' && (
                            <input type="date" value={date} onChange={e => setDate(e.target.value)}
                                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm focus:border-[#b35cff] focus:outline-none focus:ring-2 focus:ring-[#f3e6ff]" />
                        )}
                        <button onClick={openAdd}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-[#8800ff] px-4 py-2 text-sm font-semibold text-white hover:bg-[#5700a3] active:scale-95 transition-all">
                            <i className="ti ti-plus" /> Mark
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
                {/* Summary cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { label: 'Present', value: summary.present, color: 'text-green-600', bg: 'bg-green-50', dot: 'bg-green-500' },
                        { label: 'Absent', value: summary.absent, color: 'text-red-600', bg: 'bg-red-50', dot: 'bg-red-500' },
                        { label: 'On Leave', value: summary.leave, color: 'text-[#8800ff]', bg: 'bg-[#f3e6ff]', dot: 'bg-[#8800ff]' },
                        { label: 'Half Day', value: summary.halfDay, color: 'text-yellow-600', bg: 'bg-yellow-50', dot: 'bg-yellow-500' },
                    ].map(s => (
                        <div key={s.label} className="bg-white rounded-2xl border border-slate-200 px-4 py-3 flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center`}>
                                <span className={`w-2.5 h-2.5 rounded-full ${s.dot}`} />
                            </div>
                            <div>
                                <div className={`text-xl font-bold leading-none ${s.color}`}>{s.value}</div>
                                <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <div className="relative flex-1">
                        <i className="ti ti-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                        <input value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Search by name or department..."
                            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-8 pr-4 text-sm placeholder:text-slate-400 focus:border-[#b35cff] focus:outline-none focus:ring-2 focus:ring-[#f3e6ff]" />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {['All', ...STATUSES].map(s => (
                            <button key={s} onClick={() => setStatusFilter(s)}
                                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${statusFilter === s ? 'bg-[#8800ff] text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-[#b35cff] hover:text-[#8800ff]'}`}>
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm min-w-[600px]">
                            <thead>
                                <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                    <th className="px-4 py-3 text-left">Employee</th>
                                    {tab === 'all' && <th className="px-4 py-3 text-left">Date</th>}
                                    <th className="px-4 py-3 text-left">Check In</th>
                                    <th className="px-4 py-3 text-left">Status</th>
                                    <th className="px-4 py-3 text-left">Remark</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filtered.length === 0 && (
                                    <tr><td colSpan={6} className="py-20 text-center">
                                        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                                            <i className="ti ti-calendar-off text-2xl text-slate-400" />
                                        </div>
                                        <p className="text-slate-500 font-medium">No attendance records</p>
                                        <p className="text-slate-400 text-xs mt-1">
                                            {tab === 'date' ? `No records for ${date}` : 'No records found'}
                                        </p>
                                    </td></tr>
                                )}
                                {filtered.map(r => (
                                    <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                                                    style={{ backgroundColor: avatarColor(r.name) }}>
                                                    {initials(r.name)}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-slate-800">{r.name}</div>
                                                    <div className="text-xs text-slate-400">{r.department || r.position || '—'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        {tab === 'all' && (
                                            <td className="px-4 py-3 text-xs text-slate-600">
                                                {new Date(r.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </td>
                                        )}
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1.5 text-slate-700">
                                                <i className="ti ti-clock text-slate-400 text-xs" />
                                                <span className="text-sm font-medium">{r.check_in || '—'}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium ${statusStyle[r.status] ?? 'bg-slate-100 text-slate-600'}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${statusDot[r.status] ?? 'bg-slate-400'}`} />
                                                {r.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-slate-500 max-w-[160px] truncate">{r.remark || '—'}</td>
                                        <td className="px-4 py-3 text-right">
                                            <button onClick={() => openEdit(r)} className="p-1.5 rounded-lg hover:bg-[#f3e6ff] text-slate-400 hover:text-[#8800ff] transition-colors mr-1">
                                                <i className="ti ti-edit text-sm" />
                                            </button>
                                            <button onClick={() => handleDelete(r.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                                                <i className="ti ti-trash text-sm" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                        <span>Showing {filtered.length} of {records.length} records</span>
                        {tab === 'date' && <span className="font-medium text-slate-600">{new Date(date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>}
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="w-full sm:max-w-md bg-white rounded-2xl shadow-2xl">
                        <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-base font-bold text-slate-800">{editing ? 'Edit Record' : 'Mark Attendance'}</h2>
                            <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
                                <i className="ti ti-x text-lg" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {!editing && (
                                <div>
                                    <label className="text-xs font-medium text-slate-500 mb-1 block">Employee *</label>
                                    <select value={form.user_id} onChange={e => setForm(f => ({ ...f, user_id: e.target.value }))} className={selectCls}>
                                        <option value="">Select employee</option>
                                        {users.map(u => <option key={u.id} value={u.id}>{u.name} {u.department ? `— ${u.department}` : ''}</option>)}
                                    </select>
                                </div>
                            )}

                            {!editing && (
                                <div>
                                    <label className="text-xs font-medium text-slate-500 mb-1 block">Date *</label>
                                    <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className={inputCls} />
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-medium text-slate-500 mb-1 block">Check In *</label>
                                    <input type="time" value={form.check_in} onChange={e => setForm(f => ({ ...f, check_in: e.target.value }))} className={inputCls} />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-slate-500 mb-1 block">Status *</label>
                                    <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className={selectCls}>
                                        {STATUSES.map(s => <option key={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-medium text-slate-500 mb-1 block">Remark</label>
                                <input placeholder="Optional note..." value={form.remark}
                                    onChange={e => setForm(f => ({ ...f, remark: e.target.value }))}
                                    className={inputCls} />
                            </div>
                        </div>

                        <div className="px-6 pb-6 flex gap-3">
                            <button onClick={() => setShowModal(false)}
                                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleSave}
                                className="flex-1 rounded-xl bg-[#8800ff] py-2.5 text-sm font-semibold text-white hover:bg-[#5700a3] active:scale-95 transition-all">
                                {editing ? 'Save Changes' : 'Mark Attendance'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};