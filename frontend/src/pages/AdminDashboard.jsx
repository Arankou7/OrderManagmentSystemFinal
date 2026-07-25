import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { fetchProducts } from '../api/productApi';
import { fetchInventory } from '../api/inventoryApi';
import { getAllOrders, updateOrderStatus } from '../api/orderApi';
import { categoryApi } from '../api/categoryApi';
import CategoryManager from '../components/admin/CategoryManager';
import OrderWorkflow from '../components/admin/OrderWorkflow';

const PRODUCT_STATUSES = ['ACTIVE', 'INACTIVE', 'OUT_OF_STOCK'];

const blankForm = () => ({
    name: '', description: '', category: '', price: '', status: 'ACTIVE', initialStock: '0',
    attributes: [], imageUrls: ''
});

const money = (value) => `$${Number(value || 0).toFixed(2)}`;
const AdminDashboard = () => {
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [categories, setCategories] = useState([]);
    const [inventory, setInventory] = useState({});
    const [form, setForm] = useState(blankForm);
    const [editingProduct, setEditingProduct] = useState(null);
    const [stockInputs, setStockInputs] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');

    const loadData = useCallback(async () => {
        setLoading(true);
        const [productsResult, ordersResult, categoriesResult] = await Promise.allSettled([
            fetchProducts.getAllProducts({ force: true }),
            getAllOrders(),
            categoryApi.getAll()
        ]);

        try {
            if (productsResult.status === 'fulfilled') {
                const productData = productsResult.value;
                setProducts(productData);
            const inventoryEntries = await Promise.all(productData.map(async (product) => {
                try {
                    return [product.skuCode, await fetchInventory.getInventory(product.skuCode)];
                } catch {
                    return [product.skuCode, null];
                }
            }));
            setInventory(Object.fromEntries(inventoryEntries));
            } else {
                console.error('Could not load products:', productsResult.reason);
                toast.error('Products could not be loaded.');
            }

            if (ordersResult.status === 'fulfilled') {
                setOrders(ordersResult.value);
            } else {
                console.error('Could not load orders:', ordersResult.reason);
                toast.error('Orders could not be loaded. Confirm the ADMIN role is present in your new login token.');
            }

            if (categoriesResult.status === 'fulfilled') {
                setCategories(categoriesResult.value);
            } else {
                console.error('Could not load categories:', categoriesResult.reason);
                toast.error('Category templates could not be loaded. Restart the API gateway after the category route update.');
            }
        } catch (error) {
            console.error(error);
            toast.error('Inventory data could not be loaded completely.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const stats = useMemo(() => ({
        products: products.length,
        lowStock: products.filter((p) => (inventory[p.skuCode]?.availableQuantity ?? 0) < 10).length,
        pending: orders.filter((order) => order.status === 'PENDING').length,
        revenue: orders.filter((order) => !['CANCELLED', 'FAILED'].includes(order.status))
            .reduce((total, order) => total + Number(order.total || 0), 0)
    }), [products, orders, inventory]);

    const setField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

    const setTemplateAttribute = (name, value) => {
        setForm((current) => ({
            ...current,
            attributes: current.attributes.some((attribute) => attribute.key.toLowerCase() === name.toLowerCase())
                ? current.attributes.map((attribute) => attribute.key.toLowerCase() === name.toLowerCase() ? { ...attribute, value } : attribute)
                : [...current.attributes, { key: name, value }]
        }));
    };

    const selectedCategory = useMemo(
        () => categories.find((category) => category.name === form.category),
        [categories, form.category]
    );

    const changeCategory = (categoryName) => {
        const template = categories.find((category) => category.name === categoryName);
        setForm((current) => ({
            ...current,
            category: categoryName,
            attributes: template?.attributeDefinitions.map((definition) => ({
                key: definition.name,
                value: current.attributes.find((attribute) => attribute.key.toLowerCase() === definition.name.toLowerCase())?.value || ''
            })) || []
        }));
    };

    const startEdit = (product) => {
        setEditingProduct(product);
        setForm({
            name: product.name || '', description: product.description || '', category: product.category || '',
            price: product.price ?? '', status: product.status || 'ACTIVE', initialStock: '',
            attributes: product.attributes?.length ? product.attributes.map(({ key, value }) => ({ key, value })) : [],
            imageUrls: product.imageUrls?.join('\n') || ''
        });
        setActiveTab('catalogue');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setEditingProduct(null);
        setForm(blankForm());
    };

    const submitProduct = async (event) => {
        event.preventDefault();
        if (!form.name.trim() || !form.category.trim() || Number(form.price) < 0) {
            toast.error('Name, category, and a valid price are required.');
            return;
        }

        const payload = {
            name: form.name.trim(), description: form.description.trim(), category: form.category.trim(),
            price: Number(form.price), status: form.status,
            attributes: form.attributes.filter(({ key, value }) => key.trim() && value.trim()),
            imageUrls: form.imageUrls.split('\n').map((url) => url.trim()).filter(Boolean)
        };

        setSaving(true);
        try {
            if (editingProduct) {
                await fetchProducts.updateProduct(editingProduct.id, payload);
                toast.success('Product updated.');
            } else {
                const created = await fetchProducts.createProduct(payload);
                const initialStock = Number(form.initialStock || 0);
                if (initialStock > 0) {
                    await fetchInventory.createInventory(created.skuCode, initialStock);
                }
                toast.success('Product and initial inventory created.');
            }
            resetForm();
            await loadData();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Product could not be saved.');
        } finally {
            setSaving(false);
        }
    };

    const removeProduct = async (product) => {
        if (!window.confirm(`Delete “${product.name}”? This cannot be undone.`)) return;
        try {
            await fetchProducts.deleteProduct(product.id);
            toast.success('Product deleted.');
            await loadData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Product could not be deleted. It may be referenced by existing orders.');
        }
    };

    const restock = async (product) => {
        const quantity = Number(stockInputs[product.skuCode]);
        if (!Number.isInteger(quantity) || quantity <= 0) {
            toast.error('Enter a whole restock quantity greater than zero.');
            return;
        }
        try {
            await fetchInventory.restock(product.skuCode, quantity);
            setStockInputs((current) => ({ ...current, [product.skuCode]: '' }));
            toast.success(`${product.name} restocked by ${quantity}.`);
            await loadData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Stock could not be updated.');
        }
    };

    const changeOrderStatus = async (orderNumber, status) => {
        try {
            await updateOrderStatus(orderNumber, status);
            toast.success('Order status updated.');
            await loadData();
            return true;
        } catch (error) {
            const responseData = error.response?.data;
            const message = responseData?.message || responseData?.error || error.message || 'Unknown error';
            const status = error.response?.status ? ` (${error.response.status})` : '';
            console.error('Order status update failed:', error.response || error);
            toast.error(`Order status could not be updated${status}: ${message}`);
            return false;
        }
    };

    const tabButton = (id, label) => (
        <button onClick={() => setActiveTab(id)} className={`btn ${activeTab === id ? 'btn-dark' : 'btn-outline-dark'}`}>{label}</button>
    );

    if (loading) return <div className="text-center p-5">Loading admin workspace…</div>;

    return (
        <section style={{ padding: '1rem 0 3rem' }}>
            <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
                <div>
                    <p className="text-uppercase small fw-bold mb-1" style={{ color: 'var(--color-action)' }}>Restricted workspace</p>
                    <h1 className="mb-1" style={{ color: 'var(--color-primary)', fontWeight: 800 }}>Store administration</h1>
                    <p className="mb-0 text-secondary">Manage the catalogue, stock levels, and customer orders from one place.</p>
                </div>
                <button className="btn btn-outline-secondary" onClick={loadData}>Refresh data</button>
            </div>

            <div className="d-flex gap-2 flex-wrap mb-4">
                {tabButton('overview', 'Overview')}
                {tabButton('catalogue', 'Catalogue & stock')}
                {tabButton('categories', 'Category templates')}
                {tabButton('orders', 'Order workflow')}
            </div>

            {activeTab === 'overview' && <>
                <div className="row g-3 mb-4">
                    {[
                        ['Products', stats.products, 'Active catalogue records'],
                        ['Low stock', stats.lowStock, 'Items below 10 units'],
                        ['Pending orders', stats.pending, 'Orders awaiting processing'],
                        ['Revenue', money(stats.revenue), 'Non-cancelled order total']
                    ].map(([label, value, hint]) => (
                        <div className="col-md-6 col-xl-3" key={label}><div className="card h-100 shadow-sm border-0"><div className="card-body">
                            <div className="text-secondary small fw-semibold text-uppercase">{label}</div>
                            <div className="fs-2 fw-bold" style={{ color: 'var(--color-primary)' }}>{value}</div>
                            <div className="small text-secondary">{hint}</div>
                        </div></div></div>
                    ))}
                </div>
                <div className="card shadow-sm border-0"><div className="card-body p-4">
                    <h2 className="h4">Operational queue</h2>
                    {orders.filter((order) => order.status === 'PENDING').slice(0, 5).length === 0 ? <p className="mb-0 text-secondary">No pending orders right now.</p> : (
                        <div className="table-responsive"><table className="table align-middle mb-0"><thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Created</th><th></th></tr></thead><tbody>
                            {orders.filter((order) => order.status === 'PENDING').slice(0, 5).map((order) => <tr key={order.orderNumber}>
                                <td className="font-monospace small">{order.orderNumber.slice(0, 8)}…</td><td>{order.customerEmail}</td><td>{money(order.total)}</td><td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                <td><button className="btn btn-sm btn-outline-primary" onClick={() => setActiveTab('orders')}>Process</button></td>
                            </tr>)}
                        </tbody></table></div>
                    )}
                </div></div>
            </>}

            {activeTab === 'catalogue' && <div className="row g-4">
                <div className="col-xl-4"><div className="card shadow-sm border-0"><div className="card-body p-4">
                    <div className="d-flex justify-content-between gap-2"><h2 className="h4">{editingProduct ? 'Edit product' : 'New product'}</h2>{editingProduct && <button className="btn btn-sm btn-link" onClick={resetForm}>Cancel edit</button>}</div>
                    <form onSubmit={submitProduct}>
                        <label className="form-label mt-2">Product name</label><input required className="form-control" value={form.name} onChange={(e) => setField('name', e.target.value)} />
                        <label className="form-label mt-3">Description</label><textarea className="form-control" rows="3" value={form.description} onChange={(e) => setField('description', e.target.value)} />
                        <div className="row g-2 mt-1"><div className="col-7"><label className="form-label">Category</label><select required className="form-select" value={form.category} onChange={(e) => changeCategory(e.target.value)}><option value="">Select category</option>{categories.map((category) => <option key={category.id} value={category.name}>{category.name}</option>)}</select>{categories.length === 0 && <div className="form-text text-danger">Create a category template first.</div>}</div><div className="col-5"><label className="form-label">Price ($)</label><input required min="0" step="0.01" type="number" className="form-control" value={form.price} onChange={(e) => setField('price', e.target.value)} /></div></div>
                        <label className="form-label mt-3">Visibility</label><select className="form-select" value={form.status} onChange={(e) => setField('status', e.target.value)}>{PRODUCT_STATUSES.map((status) => <option key={status}>{status}</option>)}</select>
                        {!editingProduct && <><label className="form-label mt-3">Initial stock</label><input min="0" step="1" type="number" className="form-control" value={form.initialStock} onChange={(e) => setField('initialStock', e.target.value)} /></>}
                        <label className="form-label mt-3">Image URLs</label><textarea className="form-control" rows="3" placeholder="One public image URL per line" value={form.imageUrls} onChange={(e) => setField('imageUrls', e.target.value)} /><div className="form-text">URLs are stored in the product database; image files can live in cloud storage or a local static folder.</div>
                        <div className="mt-3"><label className="form-label mb-0">Characteristics</label>{!selectedCategory ? <div className="form-text">Select a category to load its controlled characteristics.</div> : selectedCategory.attributeDefinitions.length === 0 ? <div className="form-text">This category has no characteristic rules.</div> : selectedCategory.attributeDefinitions.map((definition) => { const attribute = form.attributes.find((item) => item.key.toLowerCase() === definition.name.toLowerCase()) || { key: definition.name, value: '' }; return <div className="mt-2" key={definition.id || definition.name}><label className="form-label small">{definition.name}{definition.required ? ' *' : ''}</label>{definition.inputType === 'SELECT' ? <select required={definition.required} className="form-select" value={attribute.value} onChange={(e) => setTemplateAttribute(definition.name, e.target.value)}><option value="">Select value</option>{definition.allowedValues.map((value) => <option key={value}>{value}</option>)}</select> : <input required={definition.required} type={definition.inputType === 'NUMBER' ? 'number' : 'text'} step={definition.inputType === 'NUMBER' ? 'any' : undefined} className="form-control" value={attribute.value} onChange={(e) => setTemplateAttribute(definition.name, e.target.value)} />}</div>; })}</div>
                        <button disabled={saving || categories.length === 0} className="btn btn-warning w-100 mt-4 fw-bold" type="submit">{saving ? 'Saving…' : editingProduct ? 'Save product' : 'Create product'}</button>
                    </form>
                </div></div></div>
                <div className="col-xl-8"><div className="card shadow-sm border-0"><div className="card-body p-0"><div className="p-4 pb-2"><h2 className="h4">Catalogue and inventory</h2></div><div className="table-responsive"><table className="table table-hover align-middle mb-0"><thead><tr><th>Product</th><th>SKU</th><th>Stock</th><th>Restock</th><th></th></tr></thead><tbody>
                    {products.map((product) => { const item = inventory[product.skuCode]; const available = item?.availableQuantity; return <tr key={product.id}>
                        <td><div className="d-flex align-items-center gap-2">{product.imageUrls?.[0] ? <img src={product.imageUrls[0]} alt="" style={{ width: 38, height: 38, objectFit: 'cover', borderRadius: 6 }} /> : <span className="badge text-bg-light">No image</span>}<div><div className="fw-semibold">{product.name}</div><small className="text-secondary">{product.category} · {product.status}</small></div></div></td>
                        <td className="font-monospace small">{product.skuCode}</td><td><span className={`fw-bold ${available !== undefined && available < 10 ? 'text-danger' : 'text-success'}`}>{available ?? 'Not created'}</span>{item && <small className="d-block text-secondary">of {item.totalQuantity} total</small>}</td>
                        <td><div className="input-group input-group-sm" style={{ minWidth: 130 }}><input aria-label="Restock quantity" type="number" min="1" className="form-control" placeholder="Qty" value={stockInputs[product.skuCode] || ''} onChange={(e) => setStockInputs((current) => ({ ...current, [product.skuCode]: e.target.value }))} /><button className="btn btn-outline-success" onClick={() => restock(product)}>+</button></div></td>
                        <td><div className="btn-group"><button className="btn btn-sm btn-outline-primary" onClick={() => startEdit(product)}>Edit</button><button className="btn btn-sm btn-outline-danger" onClick={() => removeProduct(product)}>Delete</button></div></td>
                    </tr>; })}
                </tbody></table></div></div></div></div>
            </div>}

            {activeTab === 'categories' && <CategoryManager categories={categories} onChanged={loadData} />}

            {activeTab === 'orders' && <OrderWorkflow orders={orders} onUpdateStatus={changeOrderStatus} />}
            {/* Previous inline order table retained below during component extraction.
                {orders.map((order) => <tr key={order.orderNumber}><td className="font-monospace small">{order.orderNumber.slice(0, 8)}…</td><td>{order.customerEmail}</td><td>{order.orderLineItems?.reduce((total, item) => total + item.quantity, 0) || 0}</td><td>{money(order.total)}</td><td><select className="form-select form-select-sm fw-semibold" style={{ color: statusColor(order.status), minWidth: 130 }} value={order.status} onChange={(e) => changeOrderStatus(order.orderNumber, e.target.value)}>{ORDER_STATUSES.map((status) => <option key={status}>{status}</option>)}</select></td><td>{new Date(order.createdAt).toLocaleString()}</td></tr>)}
                {orders.length === 0 && <tr><td colSpan="6" className="text-center p-4 text-secondary">No orders have been placed yet.</td></tr>}
            </tbody></table></div></div></div>}
            */}
        </section>
    );
};

export default AdminDashboard;
