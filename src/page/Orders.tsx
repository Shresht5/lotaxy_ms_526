import { useEffect, useState } from 'react';
import { useToast } from '../store/ToastContext';

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
    const { addToast } = useToast();


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
        addToast('Order Saved', 'green')

    };

    const handleDelete = async (id: number) => {
        if (confirm('Delete this order?')) {
            await window.api.deleteOrder(id);
            load();
            addToast('Order Removed', 'blue')
        }
    };


    const inputCls = "w-full rounded-lg border bg-[var(--back-primary)] border-[var(--primary-color)] px-3 py-2 text-sm text-[var(--front-primary)] placeholder:text-[var(--front-secondary)] focus:border-[var(--primary-very-bold-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]";
    return (
        <div className="min-h-screen bg-[var(--back-primary)] ">
            <div className=" p-2 sm:p-4 lg:p-8 bg-[var(--primary-very-light-color)] shadow-inner shadow-[var(--primary-color)]  flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--front-primary)]">Orders</h1>
                    <p className="mt-1 text-sm text-[var(--front-secondary)]">
                        {orders.length} total orders · ₹{totalRevenue.toFixed(2)} revenue
                    </p>
                </div>
                <button onClick={openAdd}
                    className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary-color)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--primary-bold-color)] transition-all">
                    <i className="ti ti-plus" /> New Order
                </button>
            </div>

            {/* Search */}
            <div className="p-2 sm:p-4 lg:p-8  flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="relative flex-1">
                    <i className="ti ti-search absolute left-3 top-1/2 -translate-y-1/2 text-[var(--front-secondary)]" />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search customer, product or phone..."
                        className={`${inputCls}  pl-8`} />
                </div>
                <div className="flex gap-1.5 flex-wrap rounded-xl  p-1">
                    {['All', ...STATUSES].map(s => (
                        <button key={s} onClick={() => setFilterStatus(s)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filterStatus === s ? 'bg-[var(--primary-color)] text-white  shadow-md shadow-[var(--primary-very-light-color)] ' : 'bg-[var(--back-pirmary)] border border-[var(--back-secondary)] text-[var(--front-secondary)] hover:border-[var(--primary-light-color)] hover:text-[var(--primary-color)]  shadow-md shadow-[var(--primary-bold-color)] hover:shadow-none'}`}>
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Empty state */}
            {filtered.length === 0 && (
                <div className=" p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center rounded-3xl border border-dashed border-[var(--back-secondary)] bg-[var(--primary-very-light-color)] py-20 px-6 text-center">
                    <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-[var(--primary-very-light-color)]">
                        <i className="ti ti-shopping-cart-off text-5xl text-[var(--primary-color)]" />
                    </div>
                    <h2 className="text-xl font-bold text-[var(--front-primary)]">No Orders Found</h2>
                </div>
            )}

            {/* Order cards */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 p-2 sm:p-4 lg:p-8 ">
                {filtered.map(o => (
                    <div key={o.id}
                        className="rounded-2xl border border-[var(--back-secondary)] bg-[var(--primary-very-light-color)] shadow-inner shadow-[var(--primary-color)] p-5">

                        <div className="flex items-start justify-between gap-3 mb-4">
                            <div>
                                <h3 className="font-bold text-[var(--front-primary)]">{o.receiver_name}</h3>
                                <p className="text-xs text-[var(--front-secondary)] mt-1">{o.product_name}</p>
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusMeta[o.status]?.badge}`}>
                                {o.status}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                            {[
                                { label: 'Quantity', value: o.quantity, cls: 'font-semibold text-[var(--front-primary)]' },
                                { label: 'Amount', value: `₹${o.final_amount}`, cls: 'font-bold text-[var(--primary-color)]' },
                                { label: 'Phone', value: o.phone || '—', cls: 'text-[var(--front-primary)]' },
                                { label: 'Price', value: `₹${o.product_price}`, cls: 'text-[var(--front-primary)]' },
                            ].map(({ label, value, cls }) => (
                                <div key={label}>
                                    <p className="text-[var(--front-secondary)] text-xs mb-1">{label}</p>
                                    <p className={cls}>{value}</p>
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center justify-between border-t border-[var(--back-secondary)] pt-4">
                            <div className="text-xs text-[var(--front-secondary)]">#{o.id}</div>
                            <div className="flex gap-1">
                                <button onClick={() => openEdit(o)}
                                    className="p-2 rounded-lg hover:bg-[var(--primary-very-light-color)] text-[var(--front-secondary)] hover:text-[var(--primary-color)]">
                                    <i className="ti ti-edit" />
                                </button>
                                <button onClick={() => handleDelete(o.id)}
                                    className="p-2 rounded-lg hover:bg-red-50 text-[var(--front-secondary)] hover:text-red-500">
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
                    <div className="w-full sm:max-w-xl bg-[var(--back-primary)] rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className=" border-b border-[var(--back-secondary)] px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--primary-very-light-color)]">
                                    <i className="ti ti-shopping-cart text-[var(--primary-color)]" />
                                </div>
                                <h2 className="font-bold text-[var(--front-primary)]">
                                    {editing ? 'Edit Order' : 'New Order'}
                                </h2>
                            </div>
                            <button onClick={() => setShowModal(false)}
                                className="p-2 rounded-lg hover:bg-[var(--back-primary)] text-[var(--front-secondary)]">
                                <i className="ti ti-x" />
                            </button>
                        </div>

                        {/* Modal body */}
                        <div className="p-6 space-y-4">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block mb-1.5 text-xs font-semibold text-[var(--front-secondary)]">Product</label>
                                    <select value={form.product_id ?? ''}
                                        onChange={e => {
                                            const selectedId = Number(e.target.value);
                                            const product = products.find(p => p.id === selectedId);
                                            setForm(f => ({
                                                ...f,
                                                product_id: selectedId,
                                                product_name: product?.name ?? '',
                                                product_price: product?.price ?? 0,
                                            }));
                                        }}
                                        className={inputCls}>
                                        <option value="">Select Product</option>
                                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block mb-1.5 text-xs font-semibold text-[var(--front-secondary)]">Product Price</label>
                                    <input type="number" value={form.product_price}
                                        onChange={e => setField('product_price', Number(e.target.value))}
                                        className={inputCls} />
                                </div>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block mb-1.5 text-xs font-semibold text-[var(--front-secondary)]">Receiver Name</label>
                                    <input value={form.receiver_name}
                                        onChange={e => setField('receiver_name', e.target.value)}
                                        className={inputCls} />
                                </div>
                                <div>
                                    <label className="block mb-1.5 text-xs font-semibold text-[var(--front-secondary)]">Phone</label>
                                    <input value={form.phone}
                                        onChange={e => setField('phone', e.target.value)}
                                        className={inputCls} />
                                </div>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block mb-1.5 text-xs font-semibold text-[var(--front-secondary)]">Email</label>
                                    <input value={form.email}
                                        onChange={e => setField('email', e.target.value)}
                                        className={inputCls} />
                                </div>
                                <div>
                                    <label className="block mb-1.5 text-xs font-semibold text-[var(--front-secondary)]">Quantity</label>
                                    <input type="number" value={form.quantity}
                                        onChange={e => setField('quantity', Number(e.target.value))}
                                        className={inputCls} />
                                </div>
                            </div>

                            <div>
                                <label className="block mb-1.5 text-xs font-semibold text-[var(--front-secondary)]">Address</label>
                                <textarea rows={3} value={form.address}
                                    onChange={e => setField('address', e.target.value)}
                                    className={`${inputCls} resize-none`} />
                            </div>

                            <div className="grid sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block mb-1.5 text-xs font-semibold text-[var(--front-secondary)]">Discount</label>
                                    <input type="number" value={form.discount}
                                        onChange={e => setField('discount', Number(e.target.value))}
                                        className={inputCls} />
                                </div>
                                <div>
                                    <label className="block mb-1.5 text-xs font-semibold text-[var(--front-secondary)]">Final Amount</label>
                                    <input disabled
                                        value={(Number(form.product_price) * Number(form.quantity)) - Number(form.discount)}
                                        className={`${inputCls} bg-[var(--back-primary)] font-bold text-[var(--primary-color)]`} />
                                </div>
                                <div>
                                    <label className="block mb-1.5 text-xs font-semibold text-[var(--front-secondary)]">Status</label>
                                    <select value={form.status}
                                        onChange={e => setField('status', e.target.value)}
                                        className={inputCls}>
                                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Modal footer */}
                        <div className="flex gap-3 px-6 pb-6">
                            <button onClick={() => setShowModal(false)}
                                className="flex-1 rounded-xl border border-[var(--back-secondary)] py-2.5 text-sm font-medium text-[var(--front-secondary)] hover:bg-[var(--back-primary)]">
                                Cancel
                            </button>
                            <button onClick={handleSave}
                                className="flex-1 rounded-xl bg-[var(--primary-color)] py-2.5 text-sm font-semibold text-white hover:bg-[var(--primary-bold-color)]">
                                {editing ? 'Save Changes' : 'Create Order'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};