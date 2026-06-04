import { useEffect, useRef, useState } from 'react';

export const Analytics = () => {
    const revCanvas = useRef<HTMLCanvasElement>(null);
    const ordCanvas = useRef<HTMLCanvasElement>(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        users: 0, clients: 0, products: 0,
        orders: 0, revenue: 0, projects: 0, attendance: 0,
    });

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

            drawRevenueChart(orders);
            drawOrderChart(orders);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const drawRevenueChart = (orders: any[]) => {
        const c = revCanvas.current; if (!c) return;
        const ctx = c.getContext('2d'); if (!ctx) return;
        const w = c.width, h = c.height;
        ctx.clearRect(0, 0, w, h);

        // Collect monthly revenue
        const monthly = new Array(6).fill(0);
        orders.forEach(o => {
            if (!o.created_at) return;
            const m = new Date(o.created_at).getMonth();
            monthly[m % 6] += Number(o.final_amount || 0);
        });
        console.log("Monthly revenue:", monthly); // debug

        const max = Math.max(...monthly, 1);
        const pts: { x: number, y: number, val: number }[] = [];

        // Draw baseline axis
        ctx.strokeStyle = '#ccc';
        ctx.beginPath();
        ctx.moveTo(50, h - 50);
        ctx.lineTo(w - 50, h - 50);
        ctx.stroke();

        // Draw line
        ctx.beginPath(); ctx.moveTo(50, h - 50);
        monthly.forEach((v, i) => {
            const x = 50 + (i * (w - 100)) / 5;
            const y = h - 50 - (v / max) * (h - 100);
            ctx.lineTo(x, y); pts.push({ x, y, val: v });
        });
        ctx.strokeStyle = '#8800ff'; ctx.lineWidth = 3; ctx.stroke();

        // Draw points
        pts.forEach(p => {
            ctx.beginPath(); ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
            ctx.fillStyle = '#5700a3'; ctx.fill();
        });

        // Hover tooltip
        c.onmousemove = e => {
            const rect = c.getBoundingClientRect();
            const mx = e.clientX - rect.left, my = e.clientY - rect.top;
            const hit = pts.find(p => Math.hypot(mx - p.x, my - p.y) < 8);
            c.title = hit ? `Revenue: ₹${hit.val}` : '';
        };
    };

    const drawOrderChart = (orders: any[]) => {
        const c = ordCanvas.current; if (!c) return;
        const ctx = c.getContext('2d'); if (!ctx) return;
        const p = orders.filter(o => o.status === 'Pending').length;
        const d = orders.filter(o => o.status === 'Delivered').length;
        const total = p + d || 1, cx = 150, cy = 150, r = 80;
        ctx.clearRect(0, 0, c.width, c.height);

        let start = 0;
        const segs = [
            { val: p, color: '#ff9500', label: 'Pending' },
            { val: d, color: '#8800ff', label: 'Delivered' }
        ];
        const arcs: { start: number, end: number, label: string, val: number }[] = [];

        segs.forEach(s => {
            const ang = (s.val / total) * Math.PI * 2;
            ctx.beginPath(); ctx.moveTo(cx, cy);
            ctx.arc(cx, cy, r, start, start + ang); ctx.closePath();
            ctx.fillStyle = s.color; ctx.fill();
            arcs.push({ start, end: start + ang, label: s.label, val: s.val });
            start += ang;
        });

        ctx.beginPath(); ctx.arc(cx, cy, 40, 0, Math.PI * 2);
        ctx.fillStyle = '#fff'; ctx.fill();

        c.onmousemove = e => {
            const rect = c.getBoundingClientRect(); // renamed to rectw
            const mx = e.clientX - rect.left, my = e.clientY - rect.top;
            const dx = mx - cx, dy = my - cy;
            const dist = Math.hypot(dx, dy);

            if (dist < r && dist > 40) { // r is the radius number
                let ang = Math.atan2(dy, dx);
                if (ang < 0) ang += Math.PI * 2;
                const hit = arcs.find(a => ang >= a.start && ang <= a.end);
                c.title = hit ? `${hit.label}: ${hit.val}` : '';
            } else {
                c.title = '';
            }
        };
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
                    <canvas ref={revCanvas} width={700} height={300} className="w-full" />
                </div>
                <div className="p-2 sm:p-4 lg:p-6 bg-[var(--primary-very-light-color)] shadow-inner shadow-[var(--primary-color)] rounded-2xl border border-[var(--back-secondary)]">
                    <h2 className="font-semibold text-[var(--front-primary)] mb-4">Order Status</h2>
                    <div className="flex justify-center"><canvas ref={ordCanvas} width={300} height={300} /></div>
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
        </div>
    );
};