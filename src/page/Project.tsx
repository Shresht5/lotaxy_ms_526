import { useEffect, useRef, useState } from 'react';

// ── Types ────────────────────────────────────────────────────────────────────

interface Project {
    id: number;
    name: string;
    client_id: number | null;
    client_name?: string;
    company_name?: string;
    detail?: string;
    what_done?: string;
    what_todo?: string;
    completion: number;
    status: string;
    created_at?: string;
}

interface Client {
    id: number;
    name: string;
    company_name?: string;
}

// ── Constants ────────────────────────────────────────────────────────────────

const STATUSES = ['Active', 'In Review', 'Completed', 'Paused'] as const;
type Status = typeof STATUSES[number];

const EMPTY_FORM = {
    name: '',
    client_id: '' as string | number,
    detail: '',
    what_done: '',
    what_todo: '',
    completion: 0,
    status: 'Active' as string,
};

// ── Helpers ──────────────────────────────────────────────────────────────────

const statusMeta: Record<string, { badge: string; bar: string; dot: string; accent: string }> = {
    'Active': { badge: 'bg-[#f3e6ff] text-[#8800ff]', bar: 'bg-gradient-to-r from-[#b35cff] to-[#8800ff]', dot: 'bg-[#8800ff]', accent: 'border-t-[#8800ff]' },
    'In Review': { badge: 'bg-amber-50 text-amber-700', bar: 'bg-gradient-to-r from-amber-300 to-amber-500', dot: 'bg-amber-500', accent: 'border-t-amber-500' },
    'Completed': { badge: 'bg-green-50 text-green-700', bar: 'bg-gradient-to-r from-green-400 to-green-600', dot: 'bg-green-600', accent: 'border-t-green-600' },
    'Paused': { badge: 'bg-slate-100 text-slate-500', bar: 'bg-gradient-to-r from-slate-300 to-slate-400', dot: 'bg-slate-400', accent: 'border-t-slate-400' },
};

const iconForIndex = (i: number) => {
    const icons = ['ti-briefcase', 'ti-code', 'ti-palette', 'ti-chart-bar', 'ti-bulb', 'ti-camera', 'ti-rocket', 'ti-device-laptop'];
    return icons[i % icons.length];
};

const iconBgForIndex = (i: number) => {
    const bgs = [
        'bg-[#f3e6ff] text-[#8800ff]',
        'bg-blue-50 text-blue-600',
        'bg-pink-50 text-pink-600',
        'bg-green-50 text-green-600',
        'bg-amber-50 text-amber-600',
        'bg-cyan-50 text-cyan-600',
    ];
    return bgs[i % bgs.length];
};

// ── Main Component ───────────────────────────────────────────────────────────

export const Projects = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilter] = useState<'All' | Status>('All');
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Project | null>(null);
    const [form, setForm] = useState({ ...EMPTY_FORM });
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const sliderRef = useRef<HTMLInputElement>(null);

    // ── Data ─────────────────────────────────────────────────────────────────

    const load = async () => {
        const data = await window.api.getAllProjects();
        setProjects(data ?? []);
    };

    const loadClients = async () => {
        const data = await window.api.getClients?.();
        setClients(data ?? []);
    };

    useEffect(() => { load(); loadClients(); }, []);

    // ── Filter / derived ─────────────────────────────────────────────────────

    const filtered = projects.filter(p => {
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
            (p.client_name ?? '').toLowerCase().includes(search.toLowerCase()) ||
            (p.detail ?? '').toLowerCase().includes(search.toLowerCase());
        const matchStatus = filterStatus === 'All' || p.status === filterStatus;
        return matchSearch && matchStatus;
    });

    const counts = {
        all: projects.length,
        active: projects.filter(p => p.status === 'Active').length,
        review: projects.filter(p => p.status === 'In Review').length,
        completed: projects.filter(p => p.status === 'Completed').length,
        paused: projects.filter(p => p.status === 'Paused').length,
    };

    const avgCompletion = projects.length
        ? Math.round(projects.reduce((s, p) => s + (p.completion ?? 0), 0) / projects.length)
        : 0;

    // ── Modal helpers ─────────────────────────────────────────────────────────

    const openAdd = () => {
        setEditing(null);
        setForm({ ...EMPTY_FORM });
        setShowModal(true);
    };

    const openEdit = (p: Project) => {
        setEditing(p);
        setForm({
            name: p.name,
            client_id: p.client_id ?? '',
            detail: p.detail ?? '',
            what_done: p.what_done ?? '',
            what_todo: p.what_todo ?? '',
            completion: p.completion ?? 0,
            status: p.status ?? 'Active',
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        const { name, client_id, detail, what_done, what_todo, completion, status } = form;
        if (!name.trim()) return;
        const cid = client_id !== '' ? Number(client_id) : null;
        if (editing) {
            await window.api.updateProject(editing.id, name, cid, detail, what_done, what_todo, completion, status);
        } else {
            await window.api.addProject(name, cid, detail, what_done, what_todo, completion, status);
        }
        setShowModal(false);
        load();
    };

    const handleDelete = async (id: number) => {
        if (confirm('Delete this project?')) { await window.api.deleteProject(id); load(); }
    };

    const setField = (key: keyof typeof EMPTY_FORM, val: unknown) =>
        setForm(f => ({ ...f, [key]: val }));

    // ── Shared input class ────────────────────────────────────────────────────

    const inputCls = "w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#b35cff] focus:outline-none focus:ring-2 focus:ring-[#f3e6ff] bg-white";

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">

            {/* ── Header ── */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Projects</h1>
                    <p className="mt-0.5 text-sm text-slate-500">
                        {projects.length} total · {avgCompletion}% avg completion
                    </p>
                </div>
                <button
                    onClick={openAdd}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#8800ff] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#5700a3] active:scale-95 transition-all self-start sm:self-auto"
                >
                    <i className="ti ti-plus text-base" /> New Project
                </button>
            </div>

            {/* ── Stats row ── */}
            <div className="mb-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: 'Active', val: counts.active, cls: 'text-[#8800ff]' },
                    { label: 'In Review', val: counts.review, cls: 'text-amber-600' },
                    { label: 'Completed', val: counts.completed, cls: 'text-green-600' },
                    { label: 'Paused', val: counts.paused, cls: 'text-slate-400' },
                ].map(s => (
                    <div key={s.label} className="rounded-xl bg-white border border-slate-200 px-4 py-3 flex items-center gap-3 shadow-sm">
                        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${statusMeta[s.label === 'In Review' ? 'In Review' : s.label]?.dot ?? 'bg-slate-300'}`} />
                        <div>
                            <div className={`text-xl font-bold leading-none ${s.cls}`}>{s.val}</div>
                            <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Search + Filters ── */}
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                    <i className="ti ti-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search projects, clients, details…"
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#b35cff] focus:outline-none focus:ring-2 focus:ring-[#f3e6ff]"
                    />
                </div>
                <div className="flex gap-1.5 bg-white border border-slate-200 rounded-xl p-1 flex-wrap sm:flex-nowrap">
                    {(['All', ...STATUSES] as const).map(s => (
                        <button
                            key={s}
                            onClick={() => setFilter(s as 'All' | Status)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filterStatus === s
                                ? 'bg-[#f3e6ff] text-[#8800ff]'
                                : 'text-slate-500 hover:bg-slate-50'
                                }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Empty State ── */}
            {filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-white rounded-2xl border border-slate-200">
                    <i className="ti ti-folder-off text-4xl block mb-3" />
                    <p className="text-sm font-medium">No projects found</p>
                    <p className="text-xs mt-1">Try a different search or filter</p>
                </div>
            )}

            {/* ── Project Cards Grid ── */}
            <div className="  grid lg:hidden grid-cols-1 sm:grid-cols-2  gap-4">
                {filtered.map((p, i) => {
                    const meta = statusMeta[p.status] ?? statusMeta['Paused'];
                    const isExp = expandedId === p.id;
                    const pct = Math.min(100, Math.max(0, p.completion ?? 0));

                    return (
                        <div
                            key={p.id}
                            className={`bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden border-t-4 ${meta.accent}`}
                        >
                            {/* Card Header */}
                            <div className="p-5 pb-4">
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${iconBgForIndex(i)}`}>
                                        <i className={`ti ${iconForIndex(i)}`} />
                                    </div>
                                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${meta.badge}`}>
                                        {p.status}
                                    </span>
                                </div>

                                <h3 className="font-bold text-slate-900 text-[15px] leading-snug mb-1 truncate">{p.name}</h3>

                                {(p.client_name || p.company_name) && (
                                    <p className="text-xs text-slate-400 mb-2 flex items-center gap-1">
                                        <i className="ti ti-building text-slate-300" />
                                        {p.company_name ?? p.client_name}
                                    </p>
                                )}

                                {p.detail && (
                                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{p.detail}</p>
                                )}
                            </div>

                            {/* Progress */}
                            <div className="px-5 pb-4">
                                <div className="flex justify-between items-center mb-1.5">
                                    <span className="text-xs text-slate-400 font-medium">Progress</span>
                                    <span className="text-xs font-bold text-[#8800ff]">{pct}%</span>
                                </div>
                                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-700 ${meta.bar}`}
                                        style={{ width: `${pct}%` }}
                                    />
                                </div>
                            </div>

                            {/* Expandable detail */}
                            {isExp && (p.what_done || p.what_todo) && (
                                <div className="px-5 pb-4 space-y-3 border-t border-slate-100 pt-3">
                                    {p.what_done && (
                                        <div>
                                            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Done</p>
                                            <p className="text-xs text-slate-600 leading-relaxed">{p.what_done}</p>
                                        </div>
                                    )}
                                    {p.what_todo && (
                                        <div>
                                            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">To-do</p>
                                            <p className="text-xs text-slate-600 leading-relaxed">{p.what_todo}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Footer */}
                            <div className="px-5 pb-4 pt-1 flex items-center justify-between border-t border-slate-100">
                                <button
                                    onClick={() => setExpandedId(isExp ? null : p.id)}
                                    className="text-xs text-[#b35cff] hover:text-[#8800ff] font-medium flex items-center gap-1 transition-colors"
                                >
                                    <i className={`ti ${isExp ? 'ti-chevron-up' : 'ti-chevron-down'} text-sm`} />
                                    {isExp ? 'Less' : 'Details'}
                                </button>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => openEdit(p)}
                                        className="p-2 rounded-lg hover:bg-[#f3e6ff] text-slate-400 hover:text-[#8800ff] transition-colors"
                                    >
                                        <i className="ti ti-edit text-base" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(p.id)}
                                        className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                                    >
                                        <i className="ti ti-trash text-base" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ── Desktop Table view (lg+) ── */}
            {filtered.length > 0 && (
                <div className="mt-8 hidden lg:block rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">All Projects — Table View</h2>
                    </div>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                <th className="px-5 py-3 text-left">Project</th>
                                <th className="px-5 py-3 text-left">Client</th>
                                <th className="px-5 py-3 text-left">Status</th>
                                <th className="px-5 py-3 text-left min-w-[160px]">Progress</th>
                                <th className="px-5 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filtered.map((p, i) => {
                                const meta = statusMeta[p.status] ?? statusMeta['Paused'];
                                const pct = Math.min(100, Math.max(0, p.completion ?? 0));
                                return (
                                    <tr key={p.id} className="group hover:bg-[#f3e6ff]/30 transition-colors">
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 ${iconBgForIndex(i)}`}>
                                                    <i className={`ti ${iconForIndex(i)}`} />
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-slate-800">{p.name}</div>
                                                    {p.detail && <div className="text-xs text-slate-400 truncate max-w-[200px]">{p.detail}</div>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3">
                                            {p.client_name
                                                ? <span className="text-sm text-slate-600">{p.company_name ?? p.client_name}</span>
                                                : <span className="text-slate-300">—</span>}
                                        </td>
                                        <td className="px-5 py-3">
                                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${meta.badge}`}>{p.status}</span>
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className={`h-full rounded-full ${meta.bar}`} style={{ width: `${pct}%` }} />
                                                </div>
                                                <span className="text-xs font-bold text-[#8800ff] w-8 text-right">{pct}%</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3 text-right">
                                            <button onClick={() => openEdit(p)} className="p-2 rounded-lg hover:bg-[#f3e6ff] text-slate-400 hover:text-[#8800ff] transition-colors mr-1">
                                                <i className="ti ti-edit text-base" />
                                            </button>
                                            <button onClick={() => handleDelete(p.id)} className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                                                <i className="ti ti-trash text-base" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ── Add / Edit Modal ── */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="w-full sm:max-w-lg bg-white rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto">

                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-[#f3e6ff] flex items-center justify-center">
                                    <i className="ti ti-briefcase text-[#8800ff] text-base" />
                                </div>
                                <h2 className="text-base font-bold text-slate-800">
                                    {editing ? 'Edit Project' : 'New Project'}
                                </h2>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
                                <i className="ti ti-x text-lg" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">

                            {/* Name */}
                            <div>
                                <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Project Name *</label>
                                <input
                                    placeholder="e.g. Website Redesign"
                                    value={form.name}
                                    onChange={e => setField('name', e.target.value)}
                                    className={inputCls}
                                />
                            </div>

                            {/* Client + Status */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Client</label>
                                    <select
                                        value={form.client_id}
                                        onChange={e => setField('client_id', e.target.value)}
                                        className={inputCls}
                                    >
                                        <option value="">— None —</option>
                                        {clients.map(c => (
                                            <option key={c.id} value={c.id}>
                                                {c.company_name ?? c.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Status</label>
                                    <select
                                        value={form.status}
                                        onChange={e => setField('status', e.target.value)}
                                        className={inputCls}
                                    >
                                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Detail */}
                            <div>
                                <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Description</label>
                                <textarea
                                    placeholder="Brief overview of the project…"
                                    value={form.detail}
                                    onChange={e => setField('detail', e.target.value)}
                                    rows={2}
                                    className={`${inputCls} resize-none`}
                                />
                            </div>

                            {/* What's done */}
                            <div>
                                <label className="text-xs font-semibold text-slate-500 mb-1.5 block">
                                    <i className="ti ti-circle-check text-green-500 mr-1" />
                                    What's Done
                                </label>
                                <textarea
                                    placeholder="Completed milestones or tasks…"
                                    value={form.what_done}
                                    onChange={e => setField('what_done', e.target.value)}
                                    rows={2}
                                    className={`${inputCls} resize-none`}
                                />
                            </div>

                            {/* What's todo */}
                            <div>
                                <label className="text-xs font-semibold text-slate-500 mb-1.5 block">
                                    <i className="ti ti-list-check text-[#b35cff] mr-1" />
                                    What's Next
                                </label>
                                <textarea
                                    placeholder="Remaining tasks or next steps…"
                                    value={form.what_todo}
                                    onChange={e => setField('what_todo', e.target.value)}
                                    rows={2}
                                    className={`${inputCls} resize-none`}
                                />
                            </div>

                            {/* Completion slider */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-xs font-semibold text-slate-500">Completion</label>
                                    <span className="text-sm font-bold text-[#8800ff]">{form.completion}%</span>
                                </div>
                                <div className="relative">
                                    <input
                                        ref={sliderRef}
                                        type="range"
                                        min={0}
                                        max={100}
                                        step={1}
                                        value={form.completion}
                                        onChange={e => setField('completion', Number(e.target.value))}
                                        className="w-full accent-[#8800ff] h-2 rounded-full cursor-pointer"
                                    />
                                    {/* progress track */}
                                    <div className="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 h-2 rounded-full bg-gradient-to-r from-[#b35cff] to-[#8800ff] transition-all"
                                        style={{ width: `${form.completion}%` }}
                                    />
                                </div>
                                <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-medium">
                                    <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 pb-6 flex gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={!form.name.trim()}
                                className="flex-1 rounded-xl bg-[#8800ff] py-2.5 text-sm font-semibold text-white hover:bg-[#5700a3] active:scale-95 transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                {editing ? 'Save Changes' : 'Create Project'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};