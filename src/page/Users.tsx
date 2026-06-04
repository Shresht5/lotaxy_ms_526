import { useEffect, useState } from 'react';
import { useToast } from '../store/ToastContext';

const EMPTY = {
    name: '', email: '', phone: '', department: '', position: '',
    date_of_joining: '', date_of_birth: '', total_experience: '',
    performance: 'Average', potential: 'Medium', ctc: ''
};

const PERFORMANCE = ['Exceptional', 'Excellent', 'Good', 'Average', 'Below Average'];
const POTENTIAL = ['High', 'Medium', 'Low'];

export const Users = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<User | null>(null);
    const [form, setForm] = useState(EMPTY);
    const [selected, setSelected] = useState<number[]>([]);

    const { addToast } = useToast();
    const load = () => window.api.getUsers().then(data => setUsers(data ?? []));
    useEffect(() => { load(); }, []);

    const filtered = users.filter(u =>
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase()) ||
        u.department?.toLowerCase().includes(search.toLowerCase()) ||
        u.position?.toLowerCase().includes(search.toLowerCase())
    );

    const openAdd = () => { setEditing(null); setForm(EMPTY); setShowModal(true); };
    const openEdit = (u: User) => {
        setEditing(u);
        setForm({
            name: u.name ?? '', email: u.email ?? '', phone: u.phone ?? '',
            department: u.department ?? '', position: u.position ?? '',
            date_of_joining: u.date_of_joining ?? '', date_of_birth: u.date_of_birth ?? '',
            total_experience: String(u.total_experience ?? ''),
            performance: u.performance ?? 'Average',
            potential: u.potential ?? 'Medium',
            ctc: String(u.ctc ?? ''),
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        const { name, email, phone, department, position, date_of_joining, date_of_birth, total_experience, performance, potential, ctc } = form;
        if (!name || !email) {
            addToast('add email or name', 'red')
            return;
        };
        if (editing) {
            await window.api.updateUser(editing.id, name, email, phone, department, position, date_of_joining, date_of_birth, +total_experience, performance, potential, +ctc);
        } else {
            await window.api.addUser(name, email, phone, department, position, date_of_joining, date_of_birth, +total_experience, performance, potential, +ctc);
        }
        setShowModal(false);
        load();
        addToast("user Saved", "green")
    };

    const handleDelete = async (id: number) => {
        if (confirm('Delete this user?')) { await window.api.deleteUser(id); load(); }
    };

    const toggleSelect = (id: number) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
    const toggleAll = () => setSelected(selected.length === filtered.length ? [] : filtered.map(u => u.id));

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
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <h1 className="text-lg font-bold text-slate-900">Users</h1>
                    <span className="rounded-full bg-[#f3e6ff] text-[#8800ff] text-xs font-semibold px-2.5 py-0.5">{users.length}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <i className="ti ti-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                        <input value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Search users..."
                            className="rounded-lg border border-slate-200 bg-slate-50 py-2 pl-8 pr-4 text-sm placeholder:text-slate-400 focus:border-[#b35cff] focus:outline-none focus:ring-2 focus:ring-[#f3e6ff] w-56" />
                    </div>
                    <button onClick={openAdd}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#8800ff] px-4 py-2 text-sm font-semibold text-white hover:bg-[#5700a3] active:scale-95 transition-all">
                        <i className="ti ti-plus" /> Add User
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="p-4 sm:p-6">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    {/* Table header with bulk actions */}
                    {selected.length > 0 && (
                        <div className="px-4 py-2.5 bg-[#f3e6ff] border-b border-[#b35cff]/20 flex items-center gap-3">
                            <span className="text-sm font-medium text-[#8800ff]">{selected.length} selected</span>
                            <button className="text-xs text-red-500 hover:text-red-700 font-medium">Delete selected</button>
                        </div>
                    )}

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm min-w-[800px]">
                            <thead>
                                <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                    <th className="px-4 py-3 text-left w-10">
                                        <input type="checkbox"
                                            checked={selected.length === filtered.length && filtered.length > 0}
                                            onChange={toggleAll}
                                            className="rounded border-slate-300 accent-[#8800ff]" />
                                    </th>
                                    <th className="px-4 py-3 text-left">User</th>
                                    <th className="px-4 py-3 text-left">Contact</th>
                                    <th className="px-4 py-3 text-left">Department</th>
                                    <th className="px-4 py-3 text-left">Position</th>
                                    <th className="px-4 py-3 text-left">Joined</th>
                                    <th className="px-4 py-3 text-left">Status</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filtered.length === 0 && (
                                    <tr><td colSpan={8} className="py-20 text-center">
                                        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                                            <i className="ti ti-users text-2xl text-slate-400" />
                                        </div>
                                        <p className="text-slate-500 font-medium">No users found</p>
                                        <p className="text-slate-400 text-xs mt-1">Add your first user to get started</p>
                                    </td></tr>
                                )}
                                {filtered.map(u => (
                                    <tr key={u.id} className={`hover:bg-slate-50 transition-colors ${selected.includes(u.id) ? 'bg-[#f3e6ff]/30' : ''}`}>
                                        <td className="px-4 py-3">
                                            <input type="checkbox" checked={selected.includes(u.id)} onChange={() => toggleSelect(u.id)}
                                                className="rounded border-slate-300 accent-[#8800ff]" />
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                                                    style={{ backgroundColor: avatarColor(u.name) }}>
                                                    {initials(u.name)}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-slate-800">{u.name}</div>
                                                    <div className="text-xs text-slate-400">ID #{u.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="text-slate-700 text-xs">{u.email}</div>
                                            <div className="text-slate-400 text-xs">{u.phone || '—'}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            {u.department
                                                ? <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">{u.department}</span>
                                                : <span className="text-slate-300 text-xs">—</span>}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-slate-600">{u.position || '—'}</td>
                                        <td className="px-4 py-3 text-xs text-slate-500">
                                            {u.date_of_joining ? new Date(u.date_of_joining).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-col gap-1">
                                                {u.performance && (
                                                    <span className="text-xs text-slate-500">
                                                        Perf: <span className="font-medium text-slate-700">{u.performance}</span>
                                                    </span>
                                                )}
                                                {u.potential && (
                                                    <span className={`inline-block rounded-md px-1.5 py-0.5 text-xs font-medium w-fit ${u.potential === 'High' ? 'bg-[#f3e6ff] text-[#8800ff]' : u.potential === 'Medium' ? 'bg-slate-100 text-slate-600' : 'bg-orange-50 text-orange-600'}`}>
                                                        {u.potential}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button onClick={() => openEdit(u)} className="p-1.5 rounded-lg hover:bg-[#f3e6ff] text-slate-400 hover:text-[#8800ff] transition-colors mr-1">
                                                <i className="ti ti-edit text-sm" />
                                            </button>
                                            <button onClick={() => handleDelete(u.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                                                <i className="ti ti-trash text-sm" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                        <span>Showing {filtered.length} of {users.length} users</span>
                        <span>{selected.length > 0 ? `${selected.length} selected` : ''}</span>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="w-full sm:max-w-xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
                            <div className="flex items-center gap-3">
                                {editing && (
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                                        style={{ backgroundColor: avatarColor(editing.name) }}>
                                        {initials(editing.name)}
                                    </div>
                                )}
                                <h2 className="text-base font-bold text-slate-800">{editing ? `Edit — ${editing.name}` : 'New User'}</h2>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
                                <i className="ti ti-x text-lg" />
                            </button>
                        </div>

                        <div className="p-6 space-y-5">
                            {/* Identity */}
                            <div>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Identity</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="sm:col-span-2">
                                        <label className="text-xs text-slate-500 mb-1 block">Full Name *</label>
                                        <input placeholder="John Doe" value={form.name}
                                            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                            className={inputCls} />
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-500 mb-1 block">Email *</label>
                                        <input type="email" placeholder="john@example.com" value={form.email}
                                            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                            className={inputCls} />
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-500 mb-1 block">Phone</label>
                                        <input placeholder="+91 9876543210" value={form.phone}
                                            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                                            className={inputCls} />
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-500 mb-1 block">Date of Birth</label>
                                        <input type="date" value={form.date_of_birth}
                                            onChange={e => setForm(f => ({ ...f, date_of_birth: e.target.value }))}
                                            className={inputCls} />
                                    </div>
                                </div>
                            </div>

                            {/* Role */}
                            <div>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Role</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-slate-500 mb-1 block">Department</label>
                                        <input placeholder="e.g. Engineering" value={form.department}
                                            onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                                            className={inputCls} />
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-500 mb-1 block">Position</label>
                                        <input placeholder="e.g. Senior Developer" value={form.position}
                                            onChange={e => setForm(f => ({ ...f, position: e.target.value }))}
                                            className={inputCls} />
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-500 mb-1 block">Date of Joining</label>
                                        <input type="date" value={form.date_of_joining}
                                            onChange={e => setForm(f => ({ ...f, date_of_joining: e.target.value }))}
                                            className={inputCls} />
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-500 mb-1 block">Experience (years)</label>
                                        <input type="number" placeholder="0" value={form.total_experience}
                                            onChange={e => setForm(f => ({ ...f, total_experience: e.target.value }))}
                                            className={inputCls} />
                                    </div>
                                </div>
                            </div>

                            {/* Metrics */}
                            <div>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Metrics</p>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div>
                                        <label className="text-xs text-slate-500 mb-1 block">Performance</label>
                                        <select value={form.performance}
                                            onChange={e => setForm(f => ({ ...f, performance: e.target.value }))}
                                            className={selectCls}>
                                            {PERFORMANCE.map(p => <option key={p}>{p}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-500 mb-1 block">Potential</label>
                                        <select value={form.potential}
                                            onChange={e => setForm(f => ({ ...f, potential: e.target.value }))}
                                            className={selectCls}>
                                            {POTENTIAL.map(p => <option key={p}>{p}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-500 mb-1 block">CTC (₹)</label>
                                        <input type="number" placeholder="0" value={form.ctc}
                                            onChange={e => setForm(f => ({ ...f, ctc: e.target.value }))}
                                            className={inputCls} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="px-6 pb-6 flex gap-3">
                            <button onClick={() => setShowModal(false)}
                                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleSave}
                                className="flex-1 rounded-xl bg-[#8800ff] py-2.5 text-sm font-semibold text-white hover:bg-[#5700a3] active:scale-95 transition-all">
                                {editing ? 'Save Changes' : 'Create User'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};