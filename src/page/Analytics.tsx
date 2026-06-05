import { useEffect, useState } from 'react';

export const Analytics = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        users: 0, clients: 0, products: 0,
        orders: 0, revenue: 0, projects: 0, attendance: 0,
    });
    const [monthlyRevenue, setMonthlyRevenue] = useState<number[]>([]);
    const [orderSegs, setOrderSegs] = useState<{ label: string, val: number, color: string }[]>([]);
    const [revTooltip, setRevTooltip] = useState<{ x: number, y: number, val: number } | null>(null);
    const [pieTooltip, setPieTooltip] = useState<{ label: string, val: number, x: number, y: number } | null>(null);
    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const [users, clients, products, orders, projects, attendance] =
                await Promise.all([
                    window.api.getUsers(),
                    window.api.getClients(),
                    window.api.getProducts(),
                    window.api.getOrders(),
                    window.api.getAllProjects(),
                    window.api.getAttendanceByDate(new Date().toISOString().split('T')[0]),
                ]);

            const revenue = orders.reduce((s: number, o: any) => s + Number(o.final_amount || 0), 0);
            setStats({
                users: users.length, clients: clients.length, products: products.length,
                orders: orders.length, revenue, projects: projects.length, attendance: attendance.length,
            });

            // Monthly revenue (6 months)
            const monthly = new Array(6).fill(0);
            orders.forEach(o => {
                if (!o.created_at) return;
                const m = new Date(o.created_at).getMonth();
                monthly[m % 6] += Number(o.final_amount || 0);
            });
            setMonthlyRevenue(monthly);

            // Order segments
            const p = orders.filter(o => o.status === 'Pending').length;
            const d = orders.filter(o => o.status === 'Delivered').length;
            setOrderSegs([
                { val: p, color: '#ff9500', label: 'Pending' },
                { val: d, color: '#8800ff', label: 'Delivered' }
            ]);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const cards = [
        { title: 'Revenue', value: `₹${stats.revenue.toLocaleString('en-IN')}`, icon: 'ti-currency-rupee' },
        { title: 'Orders', value: stats.orders, icon: 'ti-shopping-cart' },
        { title: 'Clients', value: stats.clients, icon: 'ti-building' },
        { title: 'Users', value: stats.users, icon: 'ti-users' },
        { title: 'Projects', value: stats.projects, icon: 'ti-layout-kanban' },
        { title: 'Products', value: stats.products, icon: 'ti-package' },
    ];

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--back-primary)]">
            <div className="text-[var(--front-secondary)]">Loading Analytics...</div>
        </div>
    );

    // Revenue line chart points
    const revW = 700, revH = 300;
    const maxRev = Math.max(...monthlyRevenue, 1);
    const revPoints = monthlyRevenue.map((v, i) => {
        const x = 50 + (i * (revW - 100)) / 5;
        const y = revH - 50 - (v / maxRev) * (revH - 100);
        return `${x},${y}`;
    }).join(' ');

    // Order pie chart arcs
    const totalOrders = orderSegs.reduce((s, o) => s + o.val, 0) || 1;
    let startAngle = 0;
    const pieArcs = orderSegs.map(seg => {
        const ang = (seg.val / totalOrders) * Math.PI * 2;
        const endAngle = startAngle + ang;
        const largeArc = ang > Math.PI ? 1 : 0;
        const r = 80, cx = 150, cy = 150;
        const x1 = cx + r * Math.cos(startAngle);
        const y1 = cy + r * Math.sin(startAngle);
        const x2 = cx + r * Math.cos(endAngle);
        const y2 = cy + r * Math.sin(endAngle);
        const d = `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${largeArc} 1 ${x2},${y2} Z`;
        startAngle = endAngle;
        return { d, color: seg.color, label: seg.label, val: seg.val };
    });

    return (
        <div className="min-h-screen bg-[var(--back-primary)]">
            <div className="mb-6 bg-[var(--primary-very-light-color)] p-2 sm:p-4 lg:p-6 shadow-inner shadow-[var(--primary-color)]">
                <h1 className="text-2xl font-bold text-[var(--front-primary)]">Analytics</h1>
                <p className="text-sm text-[var(--front-secondary)]">Business overview and performance insights</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 p-2 sm:p-4 lg:p-6">
                {cards.map(c => (
                    <div key={c.title} className="bg-[var(--primary-very-light-color)] shadow-inner shadow-[var(--primary-color)] rounded-2xl border border-[var(--back-secondary)] p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-[var(--front-secondary)]">{c.title}</span>
                            <div className="w-8 h-8 rounded-lg bg-[var(--primary-very-light-color)] flex items-center justify-center">
                                <i className={`ti ${c.icon} text-[var(--primary-color)]`} />
                            </div>
                        </div>
                        <div className="mt-3 text-2xl font-bold text-[var(--front-primary)]">{c.value}</div>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-6 p-2 sm:p-4 lg:p-6">
                <div className="bg-[var(--primary-very-light-color)] shadow-inner shadow-[var(--primary-color)] rounded-2xl border border-[var(--back-secondary)] p-5">
                    <h2 className="font-semibold text-[var(--front-primary)] mb-4">Revenue Trend</h2>
                    <div className="relative">
                        <svg width={revW} height={revH} className="w-full">
                            {/* Axes */}
                            <line x1="50" y1={revH - 50} x2={revW - 50} y2={revH - 50} stroke="#ccc" />
                            <line x1="50" y1={50} x2="50" y2={revH - 50} stroke="#ccc" />
                            {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
                                const y = revH - 50 - t * (revH - 100);
                                const val = Math.round(maxRev * t);
                                return (
                                    <g key={i}>
                                        <line x1="45" y1={y} x2="50" y2={y} stroke="#ccc" />
                                        <text x={40} y={y + 4} textAnchor="end" fontSize="12" fill="var(--front-secondary)">
                                            ₹{val}
                                        </text>
                                    </g>
                                );
                            })}
                            <polyline points={revPoints} fill="none" stroke="#8800ff" strokeWidth="3" />
                            {revPoints.split(' ').map((pt, i) => {
                                const [x, y] = pt.split(',').map(Number);
                                return (
                                    <circle key={i} cx={x} cy={y} r={5} fill="#5700a3"
                                        onMouseEnter={(e) => {
                                            const rect = (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect();
                                            setRevTooltip({
                                                x: e.clientX - rect.left,   // horizontal position inside container
                                                y: e.clientY - rect.top,    // vertical position inside container
                                                val: monthlyRevenue[i]
                                            });
                                        }}
                                        onMouseMove={(e) => {
                                            const rect = (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect();
                                            setRevTooltip({
                                                x: e.clientX - rect.left,
                                                y: e.clientY - rect.top,
                                                val: monthlyRevenue[i]
                                            });
                                        }}
                                    />
                                );
                            })}
                            {monthlyRevenue.map((v, i) => {
                                const x = 50 + (i * (revW - 100)) / 5;
                                return (
                                    <text key={i} x={x} y={revH - 30} textAnchor="middle" fontSize="12" fill="var(--front-secondary)"                                    >
                                        {`M${i + 1}`}
                                    </text>
                                );
                            })}
                        </svg>
                        {revTooltip && (
                            <div style={{ position: 'absolute', left: Math.min(revTooltip.x + 10, revW - 120), top: revTooltip.y, background: 'var(--back-primary)', color: 'var(--front-primary)', border: '1px solid #ccc', padding: '4px 8px', borderRadius: '4px', pointerEvents: 'none' }}                            >
                                Revenue: ₹{revTooltip.val}
                            </div>
                        )}
                    </div>
                </div>
                <div className="p-2 sm:p-4 lg:p-6 bg-[var(--primary-very-light-color)] shadow-inner shadow-[var(--primary-color)] rounded-2xl border border-[var(--back-secondary)]">
                    <h2 className="font-semibold text-[var(--front-primary)] mb-4">Order Status</h2>
                    <div className="relative flex justify-center">
                        <svg width={300} height={300}>
                            {pieArcs.map((a, i) => (
                                <path key={i} d={a.d} fill={a.color}
                                    onMouseEnter={(e) => {
                                        const rect = (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect();
                                        setPieTooltip({
                                            label: a.label,
                                            val: a.val,
                                            x: e.clientX - rect.left,
                                            y: e.clientY - rect.top
                                        });
                                    }}
                                    onMouseMove={(e) => {
                                        const rect = (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect();
                                        setPieTooltip({
                                            label: a.label,
                                            val: a.val,
                                            x: e.clientX - rect.left,
                                            y: e.clientY - rect.top
                                        });
                                    }}

                                />
                            ))}
                            <circle cx={150} cy={150} r={40} fill="#fff" />
                        </svg>
                        {pieTooltip && (
                            <div style={{ position: 'absolute', left: pieTooltip.x, top: pieTooltip.y, background: 'var(--back-primary)', color: 'var(--front-primary)', border: '1px solid #ccc', padding: '4px 8px', borderRadius: '4px', pointerEvents: 'none' }}                            >
                                {pieTooltip.label}: {pieTooltip.val}
                            </div>
                        )}
                    </div>
                    <div className="flex justify-center gap-6 mt-4">
                        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-orange-400" /><span className="text-sm text-[var(--front-secondary)]">Pending</span></div>
                        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[var(--primary-color)]" /><span className="text-sm text-[var(--front-secondary)]">Delivered</span></div>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 p-2 sm:p-4 lg:p-6">
                <div className="bg-[var(--primary-very-light-color)] shadow-inner shadow-[var(--primary-color)] rounded-2xl border border-[var(--back-secondary)] p-5">
                    <div className="text-sm text-[var(--front-secondary)] mb-2">Attendance Today</div>
                    <div className="text-3xl font-bold text-green-600">{stats.attendance}</div>
                </div>

                <div className="bg-[var(--primary-very-light-color)] shadow-inner shadow-[var(--primary-color)] rounded-2xl border border-[var(--back-secondary)] p-5">
                    <div className="text-sm text-[var(--front-secondary)] mb-2">Active Clients</div>
                    <div className="text-3xl font-bold text-[var(--primary-color)]">{stats.clients}</div>
                </div>

                <div className="bg-[var(--primary-very-light-color)] shadow-inner shadow-[var(--primary-color)] rounded-2xl border border-[var(--back-secondary)] p-5">
                    <div className="text-sm text-[var(--front-secondary)] mb-2">Running Projects</div>
                    <div className="text-3xl font-bold text-blue-600">{stats.projects}</div>
                </div>
            </div>
        </div >
    );
};