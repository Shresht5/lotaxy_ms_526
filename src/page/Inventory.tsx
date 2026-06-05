import { useEffect, useRef, useState } from 'react';
import { Product } from '../types/product';
import { useToast } from '../store/ToastContext';
const EMPTY = { name: '', price: '', mrp: '', stock: '', category: '', detail: '', image_path: '' };

export const Inventory = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Product | null>(null);
    const [form, setForm] = useState(EMPTY);
    const imagePathRef = useRef('');
    const { addToast } = useToast();

    const load = () => window.api.getProducts().then(data => setProducts(data ?? []));
    useEffect(() => { load(); }, []);

    const filtered = products.filter(p =>
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.category?.toLowerCase().includes(search.toLowerCase())
    );

    const lowStock = products.filter(p => Number(p.stock) <= 5).length;

    const openAdd = () => { setEditing(null); setForm(EMPTY); imagePathRef.current = ''; setShowModal(true); };
    const openEdit = (p: Product) => {
        setEditing(p);
        imagePathRef.current = p.image_path ?? '';
        setForm({ name: p.name, price: String(p.price), mrp: String(p.mrp), stock: String(p.stock), category: p.category ?? '', detail: p.detail ?? '', image_path: p.image_path ?? '' });
        setShowModal(true);
    };

    const handleImagePick = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async () => {
            const file = input.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = async () => {
                const base64 = (reader.result as string).split(',')[1];
                const ext = file.name.split('.').pop() || 'jpg';
                const savedPath = await window.api.saveImage(base64, ext);
                console.log('savedpaths', savedPath)
                imagePathRef.current = savedPath;
                setForm(f => ({ ...f, image_path: savedPath }));
            };
            reader.readAsDataURL(file);
        };
        input.click();
    };

    const handleSave = async () => {
        const { name, price, mrp, stock, category, detail } = form;
        if (!name || !price || !mrp || !stock) return;
        const image_path = imagePathRef.current || '';
        if (editing) {
            await window.api.updateProduct(editing.id, name, +price, +mrp, +stock, category, detail, image_path);
        } else {
            await window.api.addProduct(name, +price, +mrp, +stock, category, detail, image_path);
        }
        setShowModal(false);
        load();
        addToast('Product Saved', 'green')

    };

    const handleDelete = async (id: number) => {
        if (confirm('Delete this product?')) { await window.api.deleteProduct(id); load(); addToast('Product Removed', 'blue') }
    };

    const fmt = (v: any) => `₹${Number(v ?? 0).toLocaleString('en-IN')}`;
    const discount = (mrp: any, price: any) => {
        const m = Number(mrp), p = Number(price);
        if (!m || !p) return null;
        const d = Math.round((1 - p / m) * 100);
        return d > 0 ? d : null;
    };


    const inputCls = "w-full rounded-lg border bg-[var(--back-primary)] border-[var(--primary-color)] px-3 py-2 text-sm text-[var(--front-primary)] placeholder:text-[var(--front-secondary)] focus:border-[var(--primary-very-bold-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]";
    return (
        <div className="min-h-screen bg-[var(--back-primary)] ">
            {/* Header */}
            <div className="bg-[var(--primary-very-light-color)] p-2 sm:p-4 lg:p-6 shadow-inner shadow-[var(--primary-color)]  flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-[var(--front-primary)]">Inventory</h1>
                    <p className="mt-0.5 text-sm text-[var(--front-secondary)]">
                        {products.length} products
                        {lowStock > 0 && (
                            <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                                ⚠ {lowStock} low stock
                            </span>
                        )}
                    </p>
                </div>
                <button
                    onClick={openAdd}
                    className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary-color)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[var(--primary-bold-color)] active:scale-95 transition-all self-start sm:self-auto"
                >
                    <i className="ti ti-plus text-base" /> Add Product
                </button>
            </div>

            {/* Search + stats */}
            <div className=" p-2 sm:p-4 lg:p-6 flex flex-col gap-3 sm:flex-row sm:items-center ">
                <div className="relative flex-1">
                    <i className="ti ti-search absolute left-3 top-1/2 -translate-y-1/2 text-[var(--front-secondary)]" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search products or categories..."
                        className={`${inputCls}  pl-8`}
                    />
                </div>
                <div className="flex gap-2 text-xs">
                    <div className="rounded-xl bg-[var(--primary-very-light-color)] shadow-inner shadow-[var(--primary-color)] border border-[var(--back-secondary)] px-3 py-2 text-center min-w-[72px]">
                        <div className="font-bold text-[var(--front-primary)] text-base leading-none">{products.length}</div>
                        <div className="text-[var(--front-secondary)] mt-0.5">Total</div>
                    </div>
                    <div className="rounded-xl bg-[var(--primary-very-light-color)] shadow-inner shadow-[var(--primary-color)] border border-[var(--back-secondary)] px-3 py-2 text-center min-w-[72px]">
                        <div className="font-bold text-green-600 text-base leading-none">{products.filter(p => Number(p.stock) > 5).length}</div>
                        <div className="text-[var(--front-secondary)] mt-0.5">In Stock</div>
                    </div>
                    <div className="rounded-xl bg-[var(--primary-very-light-color)] shadow-inner shadow-[var(--primary-color)] border border-[var(--back-secondary)] px-3 py-2 text-center min-w-[72px]">
                        <div className="font-bold text-red-500 text-base leading-none">{lowStock}</div>
                        <div className="text-[var(--front-secondary)] mt-0.5">Low</div>
                    </div>
                </div>
            </div>

            {/* Desktop Table */}
            <div className="  p-2 sm:p-4 lg:p-6 hidden lg:block rounded-2xl border border-[var(--back-secondary)] bg-[var(--primary-very-light-color)] shadow-inner shadow-[var(--primary-color)] overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-[var(--back-secondary)] bg-[var(--back-primary)] text-xs font-semibold uppercase tracking-wide text-[var(--front-secondary)]">
                            <th className="px-4 py-3 text-left w-16">Image</th>
                            <th className="px-4 py-3 text-left">Product</th>
                            <th className="px-4 py-3 text-left">Category</th>
                            <th className="px-4 py-3 text-right">MRP</th>
                            <th className="px-4 py-3 text-right">Price</th>
                            <th className="px-4 py-3 text-right">Stock</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--back-primary)]">
                        {filtered.length === 0 && (
                            <tr><td colSpan={7} className="py-16 text-center text-[var(--front-secondary)]">
                                <i className="ti ti-package-off text-3xl block mb-2" />
                                No products found
                            </td></tr>
                        )}
                        {filtered.map(p => (
                            <tr key={p.id} className="group hover:bg-[var(--back-primary)] transition-colors">
                                <td className="px-4 py-3">
                                    {p.image_path
                                        ? <img src={`file://${p.image_path}`} className="w-11 h-11 rounded-xl object-cover ring-1 ring-[var(--back-secondary)]" />
                                        : <div className="w-11 h-11 rounded-xl bg-[var(--back-primary)] flex items-center justify-center text-[var(--front-secondary)]">
                                            <i className="ti ti-photo text-lg" />
                                        </div>}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="font-semibold text-[var(--front-primary)]">{p.name}</div>
                                    {p.detail && <div className="text-xs text-[var(--front-secondary)] truncate max-w-[220px] mt-0.5">{p.detail}</div>}
                                </td>
                                <td className="px-4 py-3">
                                    {p.category
                                        ? <span className="rounded-lg bg-[var(--primary-very-light-color)] px-2.5 py-1 text-xs font-medium text-[var(--primary-color)]">{p.category}</span>
                                        : <span className="text-[var(--front-secondary)]">—</span>}
                                </td>
                                <td className="px-4 py-3 text-right text-xs text-[var(--front-secondary)] line-through">{fmt(p.mrp)}</td>
                                <td className="px-4 py-3 text-right">
                                    <span className="font-semibold text-[var(--front-primary)]">{fmt(p.price)}</span>
                                    {discount(p.mrp, p.price) && (
                                        <span className="ml-1.5 text-xs text-green-600 font-medium">{discount(p.mrp, p.price)}% off</span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <span className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold ${Number(p.stock) <= 5 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
                                        {Number(p.stock) <= 5 && <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse inline-block" />}
                                        {p.stock}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <button onClick={() => openEdit(p)} className="p-2 rounded-lg hover:bg-[var(--primary-very-light-color)] text-[var(--front-secondary)] hover:text-[var(--primary-color)] transition-colors mr-1">
                                        <i className="ti ti-edit text-base" />
                                    </button>
                                    <button onClick={() => handleDelete(p.id)} className="p-2 rounded-lg hover:bg-red-50 text-[var(--front-secondary)] hover:text-red-500 transition-colors">
                                        <i className="ti ti-trash text-base" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile / Tablet Cards */}
            <div className="  p-2 sm:p-4 lg:p-6 lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filtered.length === 0 && (
                    <div className="col-span-2 py-16 text-center text-[var(--front-secondary)] bg-[var(--primary-very-light-color)] rounded-2xl border border-[var(--back-secondary)]">
                        <i className="ti ti-package-off text-3xl block mb-2" />
                        No products found
                    </div>
                )}
                {filtered.map(p => (
                    <div key={p.id} className="bg-[var(--primary-very-light-color)] shadow-inner shadow-[var(--primary-color)] rounded-2xl border border-[var(--back-secondary)] p-4 flex gap-3 hover:shadow-md transition-shadow">
                        {p.image_path
                            ? <img src={`file://${p.image_path}`} className="w-16 h-16 rounded-xl object-cover ring-1 ring-[var(--back-secondary)] shrink-0" />
                            : <div className="w-16 h-16 rounded-xl bg-[var(--back-primary)] flex items-center justify-center text-[var(--front-secondary)] shrink-0">
                                <i className="ti ti-photo text-xl" />
                            </div>}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <div className="font-semibold text-[var(--front-primary)] truncate">{p.name}</div>
                                    {p.category && (
                                        <span className="text-xs bg-[var(--primary-very-light-color)] text-[var(--primary-color)] rounded-md px-1.5 py-0.5 mt-0.5 inline-block">{p.category}</span>
                                    )}
                                </div>
                                <span className={`shrink-0 text-xs font-semibold rounded-lg px-2 py-1 ${Number(p.stock) <= 5 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
                                    {p.stock} pcs
                                </span>
                            </div>
                            <div className="mt-2 flex items-center justify-between">
                                <div>
                                    <span className="font-bold text-[var(--front-primary)]">{fmt(p.price)}</span>
                                    <span className="ml-2 text-xs text-[var(--front-secondary)] line-through">{fmt(p.mrp)}</span>
                                    {discount(p.mrp, p.price) && (
                                        <span className="ml-1 text-xs text-green-600">{discount(p.mrp, p.price)}% off</span>
                                    )}
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-[var(--primary-very-light-color)] text-[var(--front-secondary)] hover:text-[var(--primary-color)] transition-colors">
                                        <i className="ti ti-edit" />
                                    </button>
                                    <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-[var(--front-secondary)] hover:text-red-500 transition-colors">
                                        <i className="ti ti-trash" />
                                    </button>
                                </div>
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
                            <h2 className="text-base font-bold text-[var(--front-primary)]">{editing ? 'Edit Product' : 'Add New Product'}</h2>
                            <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-[var(--back-primary)] text-[var(--front-secondary)] transition-colors">
                                <i className="ti ti-x text-lg" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div
                                onClick={handleImagePick}
                                className="w-full h-36 border-2 border-dashed border-[var(--back-secondary)] rounded-xl flex items-center justify-center cursor-pointer hover:border-[var(--primary-light-color)] hover:bg-[var(--primary-very-light-color)] transition-all overflow-hidden group"
                            >
                                {form.image_path
                                    ? <img src={`file://${form.image_path}`} className="h-full w-full object-cover" />
                                    : <div className="text-center text-[var(--front-secondary)] group-hover:text-[var(--primary-color)] transition-colors">
                                        <i className="ti ti-cloud-upload text-3xl block" />
                                        <p className="text-xs mt-1 font-medium">Click to upload image</p>
                                    </div>}
                            </div>

                            <input placeholder="Product name *" value={form.name}
                                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                className={inputCls} />

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-medium text-[var(--front-secondary)] mb-1 block">MRP *</label>
                                    <input type="number" placeholder="0" value={form.mrp}
                                        onChange={e => setForm(f => ({ ...f, mrp: e.target.value }))}
                                        className={inputCls} />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-[var(--front-secondary)] mb-1 block">Sale Price *</label>
                                    <input type="number" placeholder="0" value={form.price}
                                        onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                                        className={inputCls} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-medium text-[var(--front-secondary)] mb-1 block">Stock *</label>
                                    <input type="number" placeholder="0" value={form.stock}
                                        onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
                                        className={inputCls} />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-[var(--front-secondary)] mb-1 block">Category</label>
                                    <input placeholder="e.g. Furniture" value={form.category}
                                        onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                                        className={inputCls} />
                                </div>
                            </div>

                            <textarea placeholder="Description (optional)" value={form.detail}
                                onChange={e => setForm(f => ({ ...f, detail: e.target.value }))}
                                rows={2}
                                className={`${inputCls} resize-none`} />
                        </div>

                        <div className="px-6 pb-6 flex gap-3">
                            <button onClick={() => setShowModal(false)}
                                className="flex-1 rounded-xl border border-[var(--back-secondary)] py-2.5 text-sm font-medium text-[var(--front-secondary)] hover:bg-[var(--back-primary)] transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleSave}
                                className="flex-1 rounded-xl bg-[var(--primary-color)] py-2.5 text-sm font-semibold text-white hover:bg-[var(--primary-bold-color)] active:scale-95 transition-all shadow-sm">
                                {editing ? 'Save Changes' : 'Add Product'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};