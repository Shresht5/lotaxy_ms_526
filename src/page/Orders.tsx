import { useEffect, useState } from 'react';

// ── Types ───────────────────────────────────────────────────

interface Order {
    id: number;

    product_id: number | null;
    product_name: string;
    product_price: number;

    receiver_name: string;
    phone: string;
    email: string;
    address: string;

    discount: number;
    quantity: number;
    final_amount: number;

    status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

    created_at: string;
}

interface Product {
    id: number;
    name: string;
    price: number;
}

// ── Constants ───────────────────────────────────────────────

const STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] as const;

const EMPTY_FORM = {
    product_id: null as number | null,
    product_name: '',
    product_price: 0,

    receiver_name: '',
    phone: '',
    email: '',
    address: '',

    discount: 0,
    quantity: 1,
    final_amount: 0,

    status: 'Pending',
};

const statusMeta: Record<string, { badge: string; dot: string }> = {
    Pending: {
        badge: 'bg-amber-50 text-amber-700',
        dot: 'bg-amber-500',
    },
    Processing: {
        badge: 'bg-blue-50 text-blue-700',
        dot: 'bg-blue-500',
    },
    Shipped: {
        badge: 'bg-cyan-50 text-cyan-700',
        dot: 'bg-cyan-500',
    },
    Delivered: {
        badge: 'bg-green-50 text-green-700',
        dot: 'bg-green-500',
    },
    Cancelled: {
        badge: 'bg-red-50 text-red-700',
        dot: 'bg-red-500',
    },
};

// ── Component ───────────────────────────────────────────────

export const Orders = () => {

    const [orders, setOrders] = useState<Order[]>([]);

    const [products, setProducts] = useState<Product[]>([]);

    const [search, setSearch] = useState('');

    const [filterStatus, setFilterStatus] = useState('All');

    const [showModal, setShowModal] = useState(false);

    const [editing, setEditing] = useState<Order | null>(null);

    const [form, setForm] = useState({ ...EMPTY_FORM });

    // ── Load ────────────────────────────────────────────────

    const load = async () => {
        const data = await window.api.getOrders();
        setOrders(data ?? []);
    };

    const loadProducts = async () => {
        const data = await window.api.getProducts();
        setProducts(data ?? []);
    };

    useEffect(() => {
        load();
        loadProducts();
    }, []);

    // ── Derived ─────────────────────────────────────────────

    const filtered = orders.filter(o => {

        const s = search.toLowerCase();

        const matchSearch =
            o.receiver_name?.toLowerCase().includes(s) ||
            o.product_name?.toLowerCase().includes(s) ||
            o.phone?.toLowerCase().includes(s);

        const matchStatus =
            filterStatus === 'All' || o.status === filterStatus;

        return matchSearch && matchStatus;
    });

    const totalRevenue =
        orders.reduce((s, o) => s + (o.final_amount ?? 0), 0);

    // ── Helpers ─────────────────────────────────────────────

    const setField = (
        key: keyof typeof EMPTY_FORM,
        val: unknown
    ) => setForm(f => ({ ...f, [key]: val }));

    const openAdd = () => {

        setEditing(null);

        setForm({ ...EMPTY_FORM });

        setShowModal(true);
    };

    const openEdit = (o: Order) => {

        setEditing(o);

        setForm({

            product_id: o.product_id,
            product_name: o.product_name ?? '',
            product_price: o.product_price ?? 0,

            receiver_name: o.receiver_name ?? '',
            phone: o.phone ?? '',
            email: o.email ?? '',
            address: o.address ?? '',

            discount: o.discount ?? 0,
            quantity: o.quantity ?? 1,
            final_amount: o.final_amount ?? 0,

            status: o.status ?? 'Pending',
        });

        setShowModal(true);
    };

    const handleSave = async () => {

        const finalAmount =
            (Number(form.product_price) * Number(form.quantity))
            - Number(form.discount);

        if (editing) {

            await window.api.updateOrder(

                editing.id,

                form.product_id,
                form.product_name,
                Number(form.product_price),

                form.receiver_name,
                form.phone,
                form.email,
                form.address,

                Number(form.discount),
                Number(form.quantity),
                finalAmount,

                form.status
            );

        } else {

            await window.api.addOrder(

                form.product_id,
                form.product_name,
                Number(form.product_price),

                form.receiver_name,
                form.phone,
                form.email,
                form.address,

                Number(form.discount),
                Number(form.quantity),
                finalAmount,

                form.status
            );
        }

        setShowModal(false);

        load();
    };

    const handleDelete = async (id: number) => {

        if (confirm('Delete this order?')) {

            await window.api.deleteOrder(id);

            load();
        }
    };

    const inputCls =
        'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#f3e6ff] focus:border-[#b35cff]';

    // ── Render ──────────────────────────────────────────────

    return (

        <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">

            {/* Header */}

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>

                    <h1 className="text-2xl font-bold text-slate-900">
                        Orders
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        {orders.length} total orders · ₹{totalRevenue.toFixed(2)} revenue
                    </p>
                </div>

                <button
                    onClick={openAdd}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#8800ff] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#5700a3] transition-all"
                >
                    <i className="ti ti-plus" />
                    New Order
                </button>
            </div>

            {/* Search */}

            <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center">

                <div className="relative flex-1">

                    <i className="ti ti-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />

                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search customer, product or phone..."
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#f3e6ff] focus:border-[#b35cff]"
                    />
                </div>

                <div className="flex gap-1.5 flex-wrap rounded-xl border border-slate-200 bg-white p-1">

                    {['All', ...STATUSES].map(s => (

                        <button
                            key={s}
                            onClick={() => setFilterStatus(s)}
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

            {/* Orders */}
            {filtered.length === 0 && (

                <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white py-20 px-6 text-center shadow-sm">

                    <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#f3e6ff]">

                        <i className="ti ti-shopping-cart-off text-5xl text-[#8800ff]" />

                    </div>

                    <h2 className="text-xl font-bold text-slate-800">
                        No Orders Found
                    </h2>
                </div>
            )}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

                {filtered.map(o => (

                    <div
                        key={o.id}
                        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                    >

                        <div className="flex items-start justify-between gap-3 mb-4">

                            <div>

                                <h3 className="font-bold text-slate-900">
                                    {o.receiver_name}
                                </h3>

                                <p className="text-xs text-slate-400 mt-1">
                                    {o.product_name}
                                </p>
                            </div>

                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusMeta[o.status]?.badge}`}>
                                {o.status}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm mb-4">

                            <div>
                                <p className="text-slate-400 text-xs mb-1">
                                    Quantity
                                </p>

                                <p className="font-semibold text-slate-700">
                                    {o.quantity}
                                </p>
                            </div>

                            <div>
                                <p className="text-slate-400 text-xs mb-1">
                                    Amount
                                </p>

                                <p className="font-bold text-[#8800ff]">
                                    ₹{o.final_amount}
                                </p>
                            </div>

                            <div>
                                <p className="text-slate-400 text-xs mb-1">
                                    Phone
                                </p>

                                <p className="text-slate-700">
                                    {o.phone || '—'}
                                </p>
                            </div>

                            <div>
                                <p className="text-slate-400 text-xs mb-1">
                                    Price
                                </p>

                                <p className="text-slate-700">
                                    ₹{o.product_price}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-slate-100 pt-4">

                            <div className="text-xs text-slate-400">
                                #{o.id}
                            </div>

                            <div className="flex gap-1">

                                <button
                                    onClick={() => openEdit(o)}
                                    className="p-2 rounded-lg hover:bg-[#f3e6ff] text-slate-400 hover:text-[#8800ff]"
                                >
                                    <i className="ti ti-edit" />
                                </button>

                                <button
                                    onClick={() => handleDelete(o.id)}
                                    className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500"
                                >
                                    <i className="ti ti-trash" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}

            {showModal && (

                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4">

                    <div className="w-full sm:max-w-2xl max-h-[94vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">

                        {/* Header */}

                        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4 rounded-t-2xl">

                            <div className="flex items-center gap-3">

                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f3e6ff]">
                                    <i className="ti ti-shopping-cart text-[#8800ff]" />
                                </div>

                                <h2 className="font-bold text-slate-800">
                                    {editing ? 'Edit Order' : 'New Order'}
                                </h2>
                            </div>

                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 rounded-lg hover:bg-slate-100 text-slate-400"
                            >
                                <i className="ti ti-x" />
                            </button>
                        </div>

                        {/* Body */}

                        <div className="p-6 space-y-4">

                            <div className="grid sm:grid-cols-2 gap-4">

                                {/* Product Select */}

                                <div>

                                    <label className="block mb-1.5 text-xs font-semibold text-slate-500">
                                        Product
                                    </label>

                                    <select
                                        value={form.product_id ?? ''}
                                        onChange={e => {

                                            const selectedId =
                                                Number(e.target.value);

                                            const product =
                                                products.find(
                                                    p => p.id === selectedId
                                                );

                                            setForm(f => ({

                                                ...f,

                                                product_id: selectedId,

                                                product_name:
                                                    product?.name ?? '',

                                                product_price:
                                                    product?.price ?? 0,
                                            }));
                                        }}
                                        className={inputCls}
                                    >

                                        <option value="">
                                            Select Product
                                        </option>

                                        {products.map(product => (

                                            <option
                                                key={product.id}
                                                value={product.id}
                                            >
                                                {product.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Product Price */}

                                <div>

                                    <label className="block mb-1.5 text-xs font-semibold text-slate-500">
                                        Product Price
                                    </label>

                                    <input
                                        type="number"
                                        value={form.product_price}
                                        onChange={e =>
                                            setField(
                                                'product_price',
                                                Number(e.target.value)
                                            )
                                        }
                                        className={inputCls}
                                    />
                                </div>
                            </div>

                            {/* Receiver */}

                            <div className="grid sm:grid-cols-2 gap-4">

                                <div>

                                    <label className="block mb-1.5 text-xs font-semibold text-slate-500">
                                        Receiver Name
                                    </label>

                                    <input
                                        value={form.receiver_name}
                                        onChange={e =>
                                            setField(
                                                'receiver_name',
                                                e.target.value
                                            )
                                        }
                                        className={inputCls}
                                    />
                                </div>

                                <div>

                                    <label className="block mb-1.5 text-xs font-semibold text-slate-500">
                                        Phone
                                    </label>

                                    <input
                                        value={form.phone}
                                        onChange={e =>
                                            setField('phone', e.target.value)
                                        }
                                        className={inputCls}
                                    />
                                </div>
                            </div>

                            {/* Email + Quantity */}

                            <div className="grid sm:grid-cols-2 gap-4">

                                <div>

                                    <label className="block mb-1.5 text-xs font-semibold text-slate-500">
                                        Email
                                    </label>

                                    <input
                                        value={form.email}
                                        onChange={e =>
                                            setField('email', e.target.value)
                                        }
                                        className={inputCls}
                                    />
                                </div>

                                <div>

                                    <label className="block mb-1.5 text-xs font-semibold text-slate-500">
                                        Quantity
                                    </label>

                                    <input
                                        type="number"
                                        value={form.quantity}
                                        onChange={e =>
                                            setField(
                                                'quantity',
                                                Number(e.target.value)
                                            )
                                        }
                                        className={inputCls}
                                    />
                                </div>
                            </div>

                            {/* Address */}

                            <div>

                                <label className="block mb-1.5 text-xs font-semibold text-slate-500">
                                    Address
                                </label>

                                <textarea
                                    rows={3}
                                    value={form.address}
                                    onChange={e =>
                                        setField('address', e.target.value)
                                    }
                                    className={`${inputCls} resize-none`}
                                />
                            </div>

                            {/* Bottom Row */}

                            <div className="grid sm:grid-cols-3 gap-4">

                                <div>

                                    <label className="block mb-1.5 text-xs font-semibold text-slate-500">
                                        Discount
                                    </label>

                                    <input
                                        type="number"
                                        value={form.discount}
                                        onChange={e =>
                                            setField(
                                                'discount',
                                                Number(e.target.value)
                                            )
                                        }
                                        className={inputCls}
                                    />
                                </div>

                                <div>

                                    <label className="block mb-1.5 text-xs font-semibold text-slate-500">
                                        Final Amount
                                    </label>

                                    <input
                                        disabled
                                        value={
                                            (
                                                Number(form.product_price)
                                                * Number(form.quantity)
                                            ) - Number(form.discount)
                                        }
                                        className={`${inputCls} bg-slate-50 font-bold text-[#8800ff]`}
                                    />
                                </div>

                                <div>

                                    <label className="block mb-1.5 text-xs font-semibold text-slate-500">
                                        Status
                                    </label>

                                    <select
                                        value={form.status}
                                        onChange={e =>
                                            setField('status', e.target.value)
                                        }
                                        className={inputCls}
                                    >

                                        {STATUSES.map(s => (

                                            <option
                                                key={s}
                                                value={s}
                                            >
                                                {s}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}

                        <div className="flex gap-3 px-6 pb-6">

                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleSave}
                                className="flex-1 rounded-xl bg-[#8800ff] py-2.5 text-sm font-semibold text-white hover:bg-[#5700a3]"
                            >
                                {editing ? 'Save Changes' : 'Create Order'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};