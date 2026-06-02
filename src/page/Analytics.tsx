import { useEffect, useRef, useState } from 'react';

export const Analytics = () => {
    const revenueCanvas = useRef<HTMLCanvasElement>(null);
    const ordersCanvas = useRef<HTMLCanvasElement>(null);

    const [loading, setLoading] = useState(true);

    const [stats, setStats] = useState({
        users: 0,
        clients: 0,
        products: 0,
        orders: 0,
        revenue: 0,
        projects: 0,
        attendance: 0,
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [users, clients, products, orders, projects, attendance] =
                await Promise.all([
                    window.api.getUsers(),
                    window.api.getClients(),
                    window.api.getProducts(),
                    window.api.getOrders(),
                    window.api.getAllProjects(),
                    window.api.getAttendanceByDate(
                        new Date().toISOString().split('T')[0]
                    ),
                ]);

            const revenue = orders.reduce(
                (sum: number, order: any) =>
                    sum + Number(order.final_amount || 0),
                0
            );

            setStats({
                users: users.length,
                clients: clients.length,
                products: products.length,
                orders: orders.length,
                revenue,
                projects: projects.length,
                attendance: attendance.length,
            });

            drawRevenueChart(orders);
            drawOrderChart(orders);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const drawRevenueChart = (orders: any[]) => {
        const canvas = revenueCanvas.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;

        ctx.clearRect(0, 0, width, height);

        const monthlyRevenue = new Array(6).fill(0);

        orders.forEach((order) => {
            const month = new Date(order.created_at).getMonth();
            monthlyRevenue[month % 6] += Number(order.final_amount || 0);
        });

        const max = Math.max(...monthlyRevenue, 1);

        ctx.beginPath();
        ctx.moveTo(50, height - 50);

        monthlyRevenue.forEach((value, index) => {
            const x = 50 + (index * (width - 100)) / 5;
            const y =
                height -
                50 -
                (value / max) * (height - 100);

            ctx.lineTo(x, y);
        });

        ctx.strokeStyle = '#8800ff';
        ctx.lineWidth = 3;
        ctx.stroke();

        monthlyRevenue.forEach((value, index) => {
            const x = 50 + (index * (width - 100)) / 5;
            const y =
                height -
                50 -
                (value / max) * (height - 100);

            ctx.beginPath();
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.fillStyle = '#5700a3';
            ctx.fill();
        });
    };

    const drawOrderChart = (orders: any[]) => {
        const canvas = ordersCanvas.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const pending = orders.filter(
            (o) => o.status === 'Pending'
        ).length;

        const completed = orders.filter(
            (o) => o.status === 'Delivered'
        ).length;

        const total = pending + completed || 1;

        const centerX = 150;
        const centerY = 150;
        const radius = 80;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let start = 0;

        const segments = [
            {
                value: pending,
                color: '#ff9500',
            },
            {
                value: completed,
                color: '#8800ff',
            },
        ];

        segments.forEach((segment) => {
            const angle =
                (segment.value / total) * Math.PI * 2;

            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(
                centerX,
                centerY,
                radius,
                start,
                start + angle
            );
            ctx.closePath();

            ctx.fillStyle = segment.color;
            ctx.fill();

            start += angle;
        });

        ctx.beginPath();
        ctx.arc(centerX, centerY, 40, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
    };

    const cards = [
        {
            title: 'Revenue',
            value: `₹${stats.revenue.toLocaleString('en-IN')}`,
            icon: 'ti-currency-rupee',
        },
        {
            title: 'Orders',
            value: stats.orders,
            icon: 'ti-shopping-cart',
        },
        {
            title: 'Clients',
            value: stats.clients,
            icon: 'ti-building',
        },
        {
            title: 'Users',
            value: stats.users,
            icon: 'ti-users',
        },
        {
            title: 'Projects',
            value: stats.projects,
            icon: 'ti-layout-kanban',
        },
        {
            title: 'Products',
            value: stats.products,
            icon: 'ti-package',
        },
    ];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-slate-500">
                    Loading Analytics...
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">
                    Analytics
                </h1>
                <p className="text-sm text-slate-500">
                    Business overview and performance insights
                </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
                {cards.map((card) => (
                    <div
                        key={card.title}
                        className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-500">
                                {card.title}
                            </span>

                            <div className="w-8 h-8 rounded-lg bg-[--primary-very-light-color] flex items-center justify-center">
                                <i
                                    className={`ti ${card.icon} text-[--primary-color]`}
                                />
                            </div>
                        </div>

                        <div className="mt-3 text-2xl font-bold text-slate-800">
                            {card.value}
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold text-slate-800">
                            Revenue Trend
                        </h2>
                    </div>

                    <canvas
                        ref={revenueCanvas}
                        width={700}
                        height={300}
                        className="w-full"
                    />
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold text-slate-800">
                            Order Status
                        </h2>
                    </div>

                    <div className="flex justify-center">
                        <canvas
                            ref={ordersCanvas}
                            width={300}
                            height={300}
                        />
                    </div>

                    <div className="flex justify-center gap-6 mt-4">
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-orange-400" />
                            <span className="text-sm text-slate-600">
                                Pending
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-[--primary-color]" />
                            <span className="text-sm text-slate-600">
                                Delivered
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mt-6">
                <div className="bg-white rounded-2xl border border-slate-200 p-5">
                    <div className="text-sm text-slate-500 mb-2">
                        Attendance Today
                    </div>

                    <div className="text-3xl font-bold text-green-600">
                        {stats.attendance}
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-5">
                    <div className="text-sm text-slate-500 mb-2">
                        Active Clients
                    </div>

                    <div className="text-3xl font-bold text-[--primary-color]">
                        {stats.clients}
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-5">
                    <div className="text-sm text-slate-500 mb-2">
                        Running Projects
                    </div>

                    <div className="text-3xl font-bold text-blue-600">
                        {stats.projects}
                    </div>
                </div>
            </div>
        </div>
    );
};