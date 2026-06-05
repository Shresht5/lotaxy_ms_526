import { useEffect, useState } from 'react';
import { useToast } from '../store/ToastContext';
import { useTheme } from '../store/ThemeContext';

interface DashStats {
    totalUsers: number;
    totalClients: number;
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
    activeProjects: number;
    lowStockProducts: number;
    presentToday: number;
    totalUsers2: number;
}

export const Dashboard = () => {
    const [stats, setStats] = useState<DashStats>({
        totalUsers: 0, totalClients: 0, totalProducts: 0, totalOrders: 0,
        totalRevenue: 0, pendingOrders: 0, activeProjects: 0,
        lowStockProducts: 0, presentToday: 0, totalUsers2: 0,
    });
    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    const { addToast } = useToast();
    const { toggleTheme } = useTheme();

    useEffect(() => {
        const load = async () => {
            try {
                const [users, clients, products, orders, proj, attendance] = await Promise.all([
                    window.api.getUsers(),
                    window.api.getClients(),
                    window.api.getProducts(),
                    window.api.getOrders(),
                    window.api.getAllProjects(),
                    window.api.getAttendanceByDate(new Date().toISOString().split('T')[0]),
                ]);

                const revenue = orders.reduce((sum: number, o: any) => sum + Number(o.final_amount ?? 0), 0);
                const pending = orders.filter((o: any) => o.status === 'Pending').length;
                const lowStock = products.filter((p: any) => Number(p.stock) <= 5).length;
                const activeProj = proj.filter(p => p.status === 'Active').length;
                const present = attendance.filter((a: any) => a.status === 'Present').length;

                setStats({
                    totalUsers: users.length,
                    totalClients: clients.length,
                    totalProducts: products.length,
                    totalOrders: orders.length,
                    totalRevenue: revenue,
                    pendingOrders: pending,
                    activeProjects: activeProj,
                    lowStockProducts: lowStock,
                    presentToday: present,
                    totalUsers2: users.length,
                });

                setRecentOrders(orders.slice(0, 5));
                setProjects(proj.slice(0, 4));
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const fmt = (v: number) => `₹${Number(v ?? 0).toLocaleString('en-IN')}`;
    const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    const orderStatusStyle: Record<string, string> = {
        Pending: 'bg-yellow-50 text-yellow-700',
        Processing: 'bg-blue-50 text-blue-700',
        Shipped: 'bg-purple-50 text-purple-700',
        Delivered: 'bg-green-50 text-green-700',
        Cancelled: 'bg-red-50 text-red-600',
    };

    if (loading) return (
        <div className="min-h-screen bg-[var(--back-primary)] flex items-center justify-center">
            <div className="text-center">
                <div className="w-10 h-10 rounded-2xl bg-[var(--primary-bold-color)] animate-pulse mx-auto mb-3" />
                <p className="text-[var(--front-secondary)] text-sm">Loading dashboard...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[var(--back-primary)]">
            {/* Header */}
            <div className="bg-[var(--primary-very-light-color)] shadow-inner shadow-[var(--primary-color)]  border-[var(--back-secondary)] px-4 sm:px-6 py-4">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-lg font-bold text-[var(--front-primary)]">Dashboard</h1>
                        <p className="text-xs text-[var(--front-secondary)]">{today}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 rounded-lg bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            {stats.presentToday} present today
                        </div>
                        {stats.lowStockProducts > 0 && (
                            <div className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600">
                                <i className="ti ti-alert-triangle text-xs" />
                                {stats.lowStockProducts} low stock
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="p-4 sm:p-6 space-y-5">
                {/* Primary stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                        { label: 'Total Revenue', value: fmt(stats.totalRevenue), icon: 'ti-currency-rupee', color: 'text-purple-500', bg: 'bg-purple-50', sub: `${stats.totalOrders} orders` },
                        { label: 'Active Projects', value: stats.activeProjects, icon: 'ti-layout-kanban', color: 'text-blue-600', bg: 'bg-blue-50', sub: 'in progress' },
                        { label: 'Total Clients', value: stats.totalClients, icon: 'ti-building-community', color: 'text-green-600', bg: 'bg-green-50', sub: 'registered' },
                        { label: 'Employees', value: stats.totalUsers, icon: 'ti-users', color: 'text-orange-600', bg: 'bg-orange-50', sub: `${stats.presentToday} present` },
                    ].map(s => (
                        <div key={s.label} className="bg-[var(--primary-very-light-color)] shadow-inner shadow-[var(--primary-color)]  rounded-2xl border border-[var(--back-secondary)] p-4">
                            <div className="flex items-start justify-between mb-3">
                                <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                                    <i className={`ti ${s.icon} ${s.color} text-lg`} />
                                </div>
                            </div>
                            <div className={`text-2xl font-bold ${s.color} leading-none mb-1`}>{s.value}</div>
                            <div className="text-xs font-medium text-[var(--front-primary)]">{s.label}</div>
                            <div className="text-xs text-[var(--front-secondary)] mt-0.5">{s.sub}</div>
                        </div>
                    ))}
                </div>

                {/* Secondary stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { label: 'Pending Orders', value: stats.pendingOrders, icon: 'ti-clock', color: 'text-yellow-600', bg: 'bg-yellow-50' },
                        { label: 'Products', value: stats.totalProducts, icon: 'ti-package', color: 'text-black', bg: 'bg-white' },
                        { label: 'Low Stock', value: stats.lowStockProducts, icon: 'ti-alert-circle', color: 'text-red-500', bg: 'bg-red-50' },
                        { label: 'Total Orders', value: stats.totalOrders, icon: 'ti-shopping-cart', color: 'text-purple-500', bg: 'bg-purple-50' },
                    ].map(s => (
                        <div key={s.label} className="bg-[var(--primary-very-light-color)] shadow-inner shadow-[var(--primary-color)]  rounded-xl border border-[var(--back-secondary)] px-4 py-3 flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
                                <i className={`ti ${s.icon} ${s.color}`} />
                            </div>
                            <div>
                                <div className={`text-lg font-bold leading-none ${s.color}`}>{s.value}</div>
                                <div className="text-xs text-[var(--front-secondary)] mt-0.5">{s.label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main content grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* Recent Orders */}
                    <div className="lg:col-span-2 bg-[var(--primary-very-light-color)] shadow-inner shadow-[var(--primary-color)]  rounded-2xl border border-[var(--back-secondary)] overflow-hidden">
                        <div className="px-5 py-4 border-b border-[var(--primary-color)] flex items-center justify-between">
                            <h2 className="font-bold text-[var(--front-primary)] text-sm">Recent Orders</h2>
                            <span className="text-xs text-[var(--front-secondary)]">{recentOrders.length} latest</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm min-w-[400px]">
                                <thead>
                                    <tr className="text-xs font-semibold uppercase tracking-wide text-[var(--front-secondary)] border-b border-[var(--back-primary)]">
                                        <th className="px-5 py-3 text-left">Customer</th>
                                        <th className="px-5 py-3 text-left">Product</th>
                                        <th className="px-5 py-3 text-right">Amount</th>
                                        <th className="px-5 py-3 text-left">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--back-primary)]">
                                    {recentOrders.length === 0 && (
                                        <tr><td colSpan={4} className="py-10 text-center text-[var(--front-secondary)] text-xs">No orders yet</td></tr>
                                    )}
                                    {recentOrders.map((o: any) => (
                                        <tr key={o.id} className=" transition-colors">
                                            <td className="px-5 py-3">
                                                <div className="font-medium text-[var(--front-primary)] text-sm">{o.receiver_name}</div>
                                                <div className="text-xs text-[var(--front-secondary)]">{o.phone || o.email || '—'}</div>
                                            </td>
                                            <td className="px-5 py-3 text-xs text-[var(--front-secondary)] max-w-[120px] truncate">{o.product_name || '—'}</td>
                                            <td className="px-5 py-3 text-right font-semibold text-[var(--front-primary)] text-sm">{fmt(o.final_amount)}</td>
                                            <td className="px-5 py-3">
                                                <span className={`rounded-lg px-2 py-0.5 text-xs font-medium ${orderStatusStyle[o.status] ?? 'bg-[var(--back-primary)] text-[var(--front-secondary)]'}`}>
                                                    {o.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Projects */}
                    <div className="bg-[var(--primary-very-light-color)] shadow-inner shadow-[var(--primary-color)] rounded-2xl border border-[var(--back-secondary)] overflow-hidden">
                        <div className="px-5 py-4 border-b border-[var(--back-secondary)] flex items-center justify-between">
                            <h2 className="font-bold text-[var(--front-primary)] text-sm">Projects</h2>
                            <span className="text-xs text-[var(--front-secondary)]">{stats.activeProjects} active</span>
                        </div>
                        <div className="divide-y divide-[var(--back-primary)]">
                            {projects.length === 0 && (
                                <div className="py-10 text-center text-[var(--front-secondary)] text-xs">No projects yet</div>
                            )}
                            {projects.map(p => (
                                <div key={p.id} className="px-5 py-4  transition-colors">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-[var(--front-primary)] text-sm truncate">{p.name}</div>
                                            {p.client_name && <div className="text-xs text-[var(--front-secondary)] truncate">{p.client_name}</div>}
                                        </div>
                                        <span className={`ml-2 shrink-0 rounded-md px-1.5 py-0.5 text-xs font-medium ${p.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-[var(--back-primary)] text-[var(--front-secondary)]'}`}>
                                            {p.status}
                                        </span>
                                    </div>
                                    {/* Progress bar */}
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-1.5 bg-[var(--back-primary)] rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all"
                                                style={{
                                                    width: `${Number(p.completion ?? 0)}%`,
                                                    backgroundColor: Number(p.completion) >= 80 ? '#00aa55' : Number(p.completion) >= 40 ? 'var(--primary-color)' : '#ff9500'
                                                }}
                                            />
                                        </div>
                                        <span className="text-xs font-semibold text-[var(--front-secondary)] shrink-0">{p.completion ?? 0}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Attendance summary */}
                    <div className="bg-[var(--primary-very-light-color)] shadow-inner shadow-[var(--primary-color)] rounded-2xl border border-[var(--back-secondary)] p-5 ">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center">
                                <i className="ti ti-calendar-check text-[var(--primary-color)]" />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-[var(--front-primary)]">Today's Attendance</div>
                                <div className="text-xs text-[var(--front-secondary)]">{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            {[
                                { label: 'Present', value: stats.presentToday, color: 'bg-green-500' },
                                { label: 'Total Staff', value: stats.totalUsers, color: 'bg-[var(--primary-color)]' },
                            ].map(r => (
                                <div key={r.label} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${r.color}`} />
                                        <span className="text-xs text-[var(--front-secondary)]">{r.label}</span>
                                    </div>
                                    <span className="text-sm font-bold text-[var(--front-primary)]">{r.value}</span>
                                </div>
                            ))}
                            <div className="pt-2">
                                <div className="flex-1 h-2 bg-[var(--back-primary)] rounded-full overflow-hidden">
                                    <div className="h-full bg-green-500 rounded-full"
                                        style={{ width: stats.totalUsers ? `${(stats.presentToday / stats.totalUsers) * 100}%` : '0%' }} />
                                </div>
                                <div className="text-xs text-[var(--front-secondary)] mt-1">
                                    {stats.totalUsers ? Math.round((stats.presentToday / stats.totalUsers) * 100) : 0}% attendance rate
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Inventory health */}
                    <div className="bg-[var(--primary-very-light-color)] shadow-inner shadow-[var(--primary-color)] rounded-2xl border border-[var(--back-secondary)] p-5 ">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center">
                                <i className="ti ti-package text-orange-500" />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-[var(--front-primary)]">Inventory</div>
                                <div className="text-xs text-[var(--front-secondary)]">Stock health</div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            {[
                                { label: 'Total Products', value: stats.totalProducts, color: 'bg-[var(--front-secondary)]' },
                                { label: 'Low Stock', value: stats.lowStockProducts, color: 'bg-red-500' },
                                { label: 'Healthy', value: stats.totalProducts - stats.lowStockProducts, color: 'bg-green-500' },
                            ].map(r => (
                                <div key={r.label} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${r.color}`} />
                                        <span className="text-xs text-[var(--front-secondary)]">{r.label}</span>
                                    </div>
                                    <span className="text-sm font-bold text-[var(--front-primary)]">{r.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick links */}
                    <div className="bg-[var(--primary-very-light-color)] shadow-inner shadow-[var(--primary-color)] rounded-2xl border border-[var(--back-secondary)] p-5 ">
                        <div className="text-sm font-bold text-[var(--front-primary)] mb-4">Quick Access</div>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { label: 'Add Employee', icon: 'ti-user-plus', color: 'text-purple-600', bg: 'bg-purple-50', do: () => { addToast('Employ', 'green') } },
                                { label: 'New Order', icon: 'ti-shopping-cart-plus', color: 'text-green-600', bg: 'bg-green-50', do: () => { addToast('mange', 'blue') } },
                                { label: 'Add Product', icon: 'ti-package', color: 'text-orange-500', bg: 'bg-orange-50', do: () => { addToast('error', 'red') } },
                                { label: 'Mark Attendance', icon: 'ti-calendar-plus', color: 'text-blue-600', bg: 'bg-blue-50', do: () => { addToast('go', 'green'); toggleTheme(); } },
                            ].map(q => (
                                <button key={q.label} className="flex flex-col bg-[var(--back-primary)] shadow-md shadow-[var(--primary-color)] hover:shadow-inner items-center gap-1.5 p-3 rounded-xl border border-[var(--back-secondary)] hover:border-[var(--back-secondary)] hover:bg-[var(--back-primary)] transition-all text-center" onClick={q.do}>
                                    <div className={`w-8 h-8 rounded-lg ${q.bg} flex items-center justify-center`}>
                                        <i className={`ti ${q.icon} ${q.color} text-sm`} />
                                    </div>
                                    <span className="text-xs text-[var(--front-secondary)] dark:text-white font-medium leading-tight">{q.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};