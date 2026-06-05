import { useEffect, useState } from 'react';
import { useToast } from '../store/ToastContext';

const EMPTY = { name: '', email: '', phone: '', address: '', company_name: '', status: 'Active' };

export const Clients = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Client | null>(null);
    const [form, setForm] = useState(EMPTY);
    const [selected, setSelected] = useState<number[]>([]);
    const [viewDetail, setViewDetail] = useState<Client | null>(null);
    const { addToast } = useToast();

    const load = () => window.api.getClients().then(data => setClients(data ?? []));
    useEffect(() => { load(); }, []);

    const filtered = clients.filter(c => {
        const matchSearch =
            c.name?.toLowerCase().includes(search.toLowerCase()) ||
            c.email?.toLowerCase().includes(search.toLowerCase()) ||
            c.company_name?.toLowerCase().includes(search.toLowerCase()) ||
            c.phone?.includes(search);
        const matchStatus = statusFilter === 'All' || c.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const openAdd = () => { setEditing(null); setForm(EMPTY); setShowModal(true); };
    const openEdit = (c: Client) => {
        setEditing(c);
        setForm({ name: c.name, email: c.email, phone: c.phone ?? '', address: c.address ?? '', company_name: c.company_name ?? '', status: c.status ?? 'Active' });
        setShowModal(true);
    };

    const handleSave = async () => {
        const { name, email, phone, address, company_name, status } = form;
        if (!name || !email) return;
        if (editing) {
            await window.api.updateClient(editing.id, name, email, phone, address, company_name, status);
        } else {
            await window.api.addClient(name, email, phone, address, company_name, status);
        }
        setShowModal(false);
        load();
        addToast('Client Saved', 'green')
    };

    const handleDelete = async (id: number) => {
        if (confirm('Delete this client?')) { await window.api.deleteClient(id); load(); addToast('Client Removed', 'blue') }
    };

    const toggleSelect = (id: number) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
    const toggleAll = () => setSelected(selected.length === filtered.length ? [] : filtered.map(c => c.id));

    const initials = (name: string) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
    const avatarColor = (name: string) => {
        const colors = ['#8800ff', '#5700a3', '#0066ff', '#00aa55', '#ff6600', '#cc0055'];
        return colors[(name?.charCodeAt(0) ?? 0) % colors.length];
    };

    const active = clients.filter(c => c.status === 'Active').length;
    const inactive = clients.filter(c => c.status === 'Inactive').length;


    const inputCls = "w-full rounded-lg border bg-[var(--back-primary)] border-[var(--primary-color)] px-3 py-2 text-sm text-[var(--front-primary)] placeholder:text-[var(--front-secondary)] focus:border-[var(--primary-very-bold-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]";
    const selectCls = "w-full rounded-lg border bg-[var(--back-primary)] border-[var(--primary-color)] px-3 py-2 text-sm text-[var(--front-primary)] placeholder:text-[var(--front-secondary)] focus:border-[var(--primary-very-bold-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]";
    return (
        <div className="min-h-screen bg-[var(--back-primary)]">
            {/* Top bar */}
            <div className="bg-[var(--primary-very-light-color)] shadow-inner shadow-[var(--primary-color)] border-[var(--back-secondary)] px-4 sm:px-6 py-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <h1 className="text-lg font-bold text-[var(--front-primary)]">Clients</h1>
                        <span className="rounded-full bg-[var(--primary-very-light-color)] text-[var(--primary-color)] text-xs font-semibold px-2.5 py-0.5">{clients.length}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <div className="relative">
                            <i className="ti ti-search absolute left-3 top-1/2 -translate-y-1/2 text-[var(--front-secondary)] text-sm" />
                            <input value={search} onChange={e => setSearch(e.target.value)}
                                placeholder="Search clients..."
                                className={`${inputCls}  pl-8`} />
                        </div>
                        <button onClick={openAdd}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--primary-color)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--primary-bold-color)] active:scale-95 transition-all">
                            <i className="ti ti-plus" /> Add Client
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { label: 'Total Clients', value: clients.length, color: 'text-[var(--front-primary)]', icon: 'ti-building-community', bg: 'bg-[var(--back-primary)]' },
                        { label: 'Active', value: active, color: 'text-green-600', icon: 'ti-circle-check', bg: 'bg-green-50' },
                        { label: 'Inactive', value: inactive, color: 'text-[var(--front-secondary)]', icon: 'ti-circle-x', bg: 'bg-[var(--back-primary)]' },
                    ].map(s => (
                        <div key={s.label} className="bg-[var(--primary-very-light-color)] shadow-inner shadow-[var(--primary-color)] rounded-2xl border border-[var(--back-secondary)] px-4 py-3 flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center`}>
                                <i className={`ti ${s.icon} ${s.color} text-base`} />
                            </div>
                            <div>
                                <div className={`text-xl font-bold leading-none ${s.color}`}>{s.value}</div>
                                <div className="text-xs text-[var(--front-secondary)] mt-0.5">{s.label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filter tabs */}
                <div className="flex items-center gap-2 flex-wrap">
                    {['All', 'Active', 'Inactive'].map(s => (
                        <button key={s} onClick={() => setStatusFilter(s)}
                            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${statusFilter === s ? 'bg-[var(--primary-color)] text-white  shadow-md shadow-[var(--primary-very-light-color)] ' : 'bg-[var(--back-pirmary)] border border-[var(--back-secondary)] text-[var(--front-secondary)] hover:border-[var(--primary-light-color)] hover:text-[var(--primary-color)]  shadow-md shadow-[var(--primary-bold-color)] hover:shadow-none'}`}>
                            {s}
                        </button>
                    ))}
                    <span className="text-xs text-[var(--front-secondary)] ml-auto">{filtered.length} results</span>
                </div>

                {/* Table */}
                <div className="bg-[var(--primary-very-light-color)] shadow-inner shadow-[var(--primary-color)] rounded-2xl border border-[var(--back-secondary)] overflow-hidden">
                    {selected.length > 0 && (
                        <div className="px-4 py-2.5 bg-[var(--primary-very-light-color)] border-b border-[var(--primary-light-color)] flex items-center gap-3">
                            <span className="text-sm font-medium text-[var(--primary-color)]">{selected.length} selected</span>
                            <button className="text-xs text-red-500 hover:text-red-700 font-medium">Delete selected</button>
                        </div>
                    )}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm min-w-[640px]">
                            <thead>
                                <tr className="border-b border-[var(--back-secondary)] text-xs font-semibold uppercase tracking-wide text-[var(--front-secondary)]">
                                    <th className="px-4 py-3 text-left w-10">
                                        <input type="checkbox"
                                            checked={selected.length === filtered.length && filtered.length > 0}
                                            onChange={toggleAll}
                                            className="rounded border-[var(--back-secondary)] accent-[var(--primary-color)]" />
                                    </th>
                                    <th className="px-4 py-3 text-left">Client</th>
                                    <th className="px-4 py-3 text-left">Company</th>
                                    <th className="px-4 py-3 text-left">Contact</th>
                                    <th className="px-4 py-3 text-left">Address</th>
                                    <th className="px-4 py-3 text-left">Status</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--back-primary)]">
                                {filtered.length === 0 && (
                                    <tr><td colSpan={7} className="py-20 text-center">
                                        <div className="w-14 h-14 rounded-2xl bg-[var(--back-primary)] flex items-center justify-center mx-auto mb-3">
                                            <i className="ti ti-building-community text-2xl text-[var(--front-secondary)]" />
                                        </div>
                                        <p className="text-[var(--front-primary)] font-medium">No clients found</p>
                                        <p className="text-[var(--front-secondary)] text-xs mt-1">Add your first client to get started</p>
                                    </td></tr>
                                )}
                                {filtered.map(c => (
                                    <tr key={c.id} className={`hover:bg-[var(--back-primary)] transition-colors cursor-pointer ${selected.includes(c.id) ? 'bg-[var(--primary-very-light-color)]' : ''}`}>
                                        <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                                            <input type="checkbox" checked={selected.includes(c.id)} onChange={() => toggleSelect(c.id)}
                                                className="rounded border-[var(--back-secondary)] accent-[var(--primary-color)]" />
                                        </td>
                                        <td className="px-4 py-3" onClick={() => setViewDetail(c)}>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                                                    style={{ backgroundColor: avatarColor(c.name) }}>
                                                    {initials(c.name)}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-[var(--front-primary)]">{c.name}</div>
                                                    <div className="text-xs text-[var(--front-secondary)]">#{c.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3" onClick={() => setViewDetail(c)}>
                                            {c.company_name
                                                ? <div className="flex items-center gap-1.5">
                                                    <i className="ti ti-building text-[var(--front-secondary)] text-xs" />
                                                    <span className="text-[var(--front-primary)] text-sm">{c.company_name}</span>
                                                </div>
                                                : <span className="text-[var(--front-secondary)] text-xs">—</span>}
                                        </td>
                                        <td className="px-4 py-3" onClick={() => setViewDetail(c)}>
                                            <div className="text-xs text-[var(--front-primary)]">{c.email}</div>
                                            <div className="text-xs text-[var(--front-secondary)]">{c.phone || '—'}</div>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-[var(--front-secondary)] max-w-[160px] truncate" onClick={() => setViewDetail(c)}>
                                            {c.address || '—'}
                                        </td>
                                        <td className="px-4 py-3" onClick={() => setViewDetail(c)}>
                                            <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium ${c.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-[var(--back-primary)] text-[var(--front-secondary)]'}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${c.status === 'Active' ? 'bg-green-500' : 'bg-[var(--front-secondary)]'}`} />
                                                {c.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button onClick={e => { e.stopPropagation(); openEdit(c); }} className="p-1.5 rounded-lg hover:bg-[var(--primary-very-light-color)] text-[var(--front-secondary)] hover:text-[var(--primary-color)] transition-colors mr-1">
                                                <i className="ti ti-edit text-sm" />
                                            </button>
                                            <button onClick={e => { e.stopPropagation(); handleDelete(c.id); }} className="p-1.5 rounded-lg hover:bg-red-50 text-[var(--front-secondary)] hover:text-red-500 transition-colors">
                                                <i className="ti ti-trash text-sm" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="px-4 py-3 border-t border-[var(--back-secondary)] flex items-center justify-between text-xs text-[var(--front-secondary)]">
                        <span>Showing {filtered.length} of {clients.length} clients</span>
                        <span>{selected.length > 0 ? `${selected.length} selected` : ''}</span>
                    </div>
                </div>
            </div>

            {/* Detail drawer */}
            {viewDetail && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setViewDetail(null)} />
                    <div className="relative w-full max-w-sm bg-white h-full shadow-2xl overflow-y-auto flex flex-col">
                        <div className="px-6 py-4 border-b border-[var(--back-secondary)] flex items-center justify-between">
                            <h2 className="font-bold text-[var(--front-primary)]">Client Details</h2>
                            <button onClick={() => setViewDetail(null)} className="p-1.5 rounded-lg hover:bg-[var(--back-primary)] text-[var(--front-secondary)]">
                                <i className="ti ti-x" />
                            </button>
                        </div>
                        <div className="p-6 flex-1">
                            {/* Avatar */}
                            <div className="flex flex-col items-center mb-6">
                                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold mb-3"
                                    style={{ backgroundColor: avatarColor(viewDetail.name) }}>
                                    {initials(viewDetail.name)}
                                </div>
                                <h3 className="text-lg font-bold text-[var(--front-primary)]">{viewDetail.name}</h3>
                                {viewDetail.company_name && <p className="text-sm text-[var(--front-secondary)]">{viewDetail.company_name}</p>}
                                <span className={`mt-2 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium ${viewDetail.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-[var(--back-primary)] text-[var(--front-secondary)]'}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${viewDetail.status === 'Active' ? 'bg-green-500' : 'bg-[var(--front-secondary)]'}`} />
                                    {viewDetail.status}
                                </span>
                            </div>

                            {/* Info rows */}
                            <div className="space-y-3">
                                {[
                                    { icon: 'ti-mail', label: 'Email', value: viewDetail.email },
                                    { icon: 'ti-phone', label: 'Phone', value: viewDetail.phone || '—' },
                                    { icon: 'ti-map-pin', label: 'Address', value: viewDetail.address || '—' },
                                    { icon: 'ti-calendar', label: 'Added', value: new Date(viewDetail.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) },
                                ].map(row => (
                                    <div key={row.label} className="flex items-start gap-3 p-3 rounded-xl bg-[var(--back-primary)]">
                                        <div className="w-8 h-8 rounded-lg bg-white border border-[var(--back-secondary)] flex items-center justify-center shrink-0">
                                            <i className={`ti ${row.icon} text-[var(--front-secondary)] text-sm`} />
                                        </div>
                                        <div>
                                            <div className="text-xs text-[var(--front-secondary)]">{row.label}</div>
                                            <div className="text-sm text-[var(--front-primary)] font-medium break-all">{row.value}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="p-6 border-t border-[var(--back-secondary)] flex gap-2">
                            <button onClick={() => { setViewDetail(null); openEdit(viewDetail); }}
                                className="flex-1 rounded-xl bg-[var(--primary-color)] py-2.5 text-sm font-semibold text-white hover:bg-[var(--primary-bold-color)] transition-colors">
                                Edit Client
                            </button>
                            <button onClick={() => { handleDelete(viewDetail.id); setViewDetail(null); }}
                                className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors">
                                <i className="ti ti-trash" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="w-full sm:max-w-xl bg-[var(--back-primary)] rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className=" border-b border-[var(--back-secondary)] px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
                            <div className="flex items-center gap-3">
                                {editing && (
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                                        style={{ backgroundColor: avatarColor(editing.name) }}>
                                        {initials(editing.name)}
                                    </div>
                                )}
                                <h2 className="text-base font-bold text-[var(--front-primary)]">{editing ? `Edit — ${editing.name}` : 'New Client'}</h2>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-[var(--back-primary)] text-[var(--front-secondary)] transition-colors">
                                <i className="ti ti-x text-lg" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <p className="text-[11px] font-bold text-[var(--front-secondary)] uppercase tracking-widest mb-3">Identity</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="sm:col-span-2">
                                        <label className="text-xs text-[var(--front-secondary)] mb-1 block">Full Name *</label>
                                        <input placeholder="John Doe" value={form.name}
                                            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                            className={inputCls} />
                                    </div>
                                    <div>
                                        <label className="text-xs text-[var(--front-secondary)] mb-1 block">Email *</label>
                                        <input type="email" placeholder="john@company.com" value={form.email}
                                            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                            className={inputCls} />
                                    </div>
                                    <div>
                                        <label className="text-xs text-[var(--front-secondary)] mb-1 block">Phone</label>
                                        <input placeholder="+91 9876543210" value={form.phone}
                                            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                                            className={inputCls} />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <p className="text-[11px] font-bold text-[var(--front-secondary)] uppercase tracking-widest mb-3">Company</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="sm:col-span-2">
                                        <label className="text-xs text-[var(--front-secondary)] mb-1 block">Company Name</label>
                                        <input placeholder="Acme Corp" value={form.company_name}
                                            onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))}
                                            className={inputCls} />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="text-xs text-[var(--front-secondary)] mb-1 block">Address</label>
                                        <textarea placeholder="123 Main St, City, State" value={form.address}
                                            onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                                            rows={2} className={`${inputCls} resize-none`} />
                                    </div>
                                    <div>
                                        <label className="text-xs text-[var(--front-secondary)] mb-1 block">Status</label>
                                        <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className={selectCls}>
                                            <option>Active</option>
                                            <option>Inactive</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="px-6 pb-6 flex gap-3">
                            <button onClick={() => setShowModal(false)}
                                className="flex-1 rounded-xl border border-[var(--back-secondary)] py-2.5 text-sm font-medium text-[var(--front-secondary)] hover:bg-[var(--back-primary)] transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleSave}
                                className="flex-1 rounded-xl bg-[var(--primary-color)] py-2.5 text-sm font-semibold text-white hover:bg-[var(--primary-bold-color)] active:scale-95 transition-all">
                                {editing ? 'Save Changes' : 'Add Client'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};