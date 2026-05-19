import { useEffect, useState } from 'react';
import { Product } from '../types/product';

const EMPTY = { name: '', price: '', mrp: '', stock: '', category: '', detail: '', image_path: '' };

export const Inventory = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Product | null>(null);
    const [form, setForm] = useState(EMPTY);

    const load = () => window.api.getProducts().then(data => {
        console.log('products from db:', JSON.stringify(data[0]));
        setProducts(data);
    });

    useEffect(() => { load(); }, []);
    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category?.toLowerCase().includes(search.toLowerCase())
    );

    const openAdd = () => { setEditing(null); setForm(EMPTY); setShowModal(true); };

    const openEdit = (p: Product) => {
        setEditing(p);
        setForm({
            name: p.name,
            price: String(p.price),
            mrp: String(p.mrp),
            stock: String(p.stock),
            category: p.category ?? '',
            detail: p.detail ?? '',
            image_path: p.image_path ?? '',
        });
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
                const ext = file.name.split('.').pop() || 'png';
                const savedPath = await window.api.saveImage(base64, ext);
                setForm(f => ({ ...f, image_path: savedPath }));
            };
            reader.readAsDataURL(file);
        };
        input.click();
    };

    const handleSave = async () => {
        const { name, price, mrp, stock, category, detail, image_path } = form;
        if (!name || !price || !mrp || !stock) return;
        if (editing) {
            await window.api.updateProduct(editing.id, name, +price, +mrp, +stock, category, detail, image_path || null);
        } else {
            await window.api.addProduct(name, +price, +mrp, +stock, category, detail, image_path || null);
        }
        setShowModal(false);
        load();
    };

    const handleDelete = async (id: number) => {
        if (confirm('Delete this product?')) {
            await window.api.deleteProduct(id);
            load();
        }
    };

    const fmt = (v: any) => `₹${Number(v ?? 0).toLocaleString('en-IN')}`;

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-medium text-gray-900">Inventory</h1>
                    <p className="text-sm text-gray-500">{products.length} products</p>
                </div>
                <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                    <i className="ti ti-plus" aria-hidden="true" /> Add Product
                </button>
            </div>

            {/* Search */}
            <div className="relative mb-4">
                <i className="ti ti-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by name or category..."
                    className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Table */}
            <div className="border border-gray-100 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                        <tr>
                            <th className="text-left px-4 py-3">Image</th>
                            <th className="text-left px-4 py-3">Product</th>
                            <th className="text-left px-4 py-3">Category</th>
                            <th className="text-right px-4 py-3">MRP</th>
                            <th className="text-right px-4 py-3">Price</th>
                            <th className="text-right px-4 py-3">Stock</th>
                            <th className="text-right px-4 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={7} className="text-center py-12 text-gray-400">No products found</td>
                            </tr>
                        )}
                        {filtered.map(p => (
                            <tr key={p.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3">
                                    {p.image_path
                                        ? <img src={`file://${p.image_path}`} className="w-10 h-10 rounded-lg object-cover" />
                                        : <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                            <i className="ti ti-photo text-gray-400" aria-hidden="true" />
                                        </div>
                                    }
                                </td>
                                <td className="px-4 py-3">
                                    <div className="font-medium text-gray-900">{p.name}</div>
                                    {p.detail && <div className="text-xs text-gray-400 truncate max-w-[200px]">{p.detail}</div>}
                                </td>
                                <td className="px-4 py-3">
                                    {p.category
                                        ? <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-xs">{p.category}</span>
                                        : <span className="text-gray-300">—</span>}
                                </td>
                                <td className="px-4 py-3 text-right text-gray-400 line-through">{fmt(p.mrp ?? 0)}</td>
                                <td className="px-4 py-3 text-right font-medium text-gray-900">{fmt(p.price ?? 0)}</td>
                                <td className="px-4 py-3 text-right">
                                    <span className={`font-medium ${p.stock <= 5 ? 'text-red-600' : 'text-gray-900'}`}>
                                        {p.stock}
                                        {p.stock <= 5 && <span className="ml-1 text-xs text-red-400">low</span>}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <button onClick={() => openEdit(p)} className="p-1.5 hover:bg-gray-100 rounded-md text-gray-500 hover:text-blue-600 mr-1">
                                        <i className="ti ti-edit" aria-hidden="true" />
                                    </button>
                                    <button onClick={() => handleDelete(p.id)} className="p-1.5 hover:bg-red-50 rounded-md text-gray-500 hover:text-red-600">
                                        <i className="ti ti-trash" aria-hidden="true" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-base font-medium">{editing ? 'Edit product' : 'Add product'}</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <i className="ti ti-x" aria-hidden="true" />
                            </button>
                        </div>

                        <div className="space-y-3">
                            <input
                                placeholder="Product name *"
                                value={form.name}
                                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />

                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    placeholder="MRP *"
                                    type="number"
                                    value={form.mrp}
                                    onChange={e => setForm(f => ({ ...f, mrp: e.target.value }))}
                                    className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <input
                                    placeholder="Sale price *"
                                    type="number"
                                    value={form.price}
                                    onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                                    className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    placeholder="Stock *"
                                    type="number"
                                    value={form.stock}
                                    onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
                                    className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <input
                                    placeholder="Category"
                                    value={form.category}
                                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                                    className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <textarea
                                placeholder="Detail / description"
                                value={form.detail}
                                onChange={e => setForm(f => ({ ...f, detail: e.target.value }))}
                                rows={3}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            />

                            <div
                                onClick={handleImagePick}
                                className="w-full h-32 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-400 overflow-hidden"
                            >
                                {form.image_path
                                    ? <img src={`file://${form.image_path}`} className="h-full w-full object-cover" />
                                    : <div className="text-center text-gray-400">
                                        <i className="ti ti-photo text-2xl" aria-hidden="true" />
                                        <p className="text-xs mt-1">Click to add image</p>
                                    </div>
                                }
                            </div>
                        </div>

                        <div className="flex gap-2 mt-5">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex-1 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                {editing ? 'Save changes' : 'Add product'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};