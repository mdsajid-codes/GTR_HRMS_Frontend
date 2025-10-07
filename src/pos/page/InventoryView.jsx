import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { ShoppingCart, Package, PlusCircle, Loader, X, Eye, Edit, Trash2, SlidersHorizontal, History } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

// --- Auth Hook (similar to ProductsView) ---
const usePosAuth = () => {
    const roles = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem('roles') || '[]');
        } catch { return []; }
    }, []);

    const isSuperAdmin = roles.includes('SUPER_ADMIN');
    const isPosAdmin = roles.includes('POS_ADMIN') || isSuperAdmin;
    const canManage = roles.includes('POS_MANAGER') || isPosAdmin;

    return { isPosAdmin, canManage };
};

const formatPrice = (cents) => `AED ${(cents / 100).toFixed(2)}`;
const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleString() : 'N/A';

// --- Modal Component ---
const Modal = ({ isOpen, onClose, title, children, size = 'max-w-2xl' }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className={`bg-white rounded-lg shadow-xl w-full ${size} flex flex-col max-h-[90vh]`} onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b flex justify-between items-center flex-shrink-0">
                    <h3 className="text-xl font-semibold">{title}</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100"><X size={20} /></button>
                </div>
                <div className="p-6 overflow-y-auto">{children}</div>
            </div>
        </div>
    );
};

// --- Purchase Order Form ---
const PurchaseOrderForm = ({ onSave, onCancel, stores, products }) => {
    const [formData, setFormData] = useState({
        storeId: stores[0]?.id || '',
        supplierName: '',
        status: 'open',
        items: [{ productVariantId: '', quantityOrdered: 1, unitCostCents: 0 }]
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleItemChange = (index, e) => {
        const { name, value } = e.target;
        const newItems = [...formData.items];
        newItems[index][name] = value;
        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { productVariantId: '', quantityOrdered: 1, unitCostCents: 0 }]
        }));
    };

    const removeItem = (index) => {
        setFormData(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await onSave(formData);
        } catch (error) {
            // Error is handled by the parent
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="label">Store</label>
                    <select name="storeId" value={formData.storeId} onChange={handleChange} className="input" required>
                        {stores.map(store => <option key={store.id} value={store.id}>{store.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="label">Supplier Name</label>
                    <input name="supplierName" value={formData.supplierName} onChange={handleChange} className="input" required />
                </div>
            </div>
            <h4 className="font-semibold pt-4 border-t">Items</h4>
            <div className="space-y-3">
                {formData.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-end">
                        <div className="col-span-5">
                            <label className="label text-xs">Product</label>
                            <select name="productVariantId" value={item.productVariantId} onChange={e => handleItemChange(index, e)} className="input" required>
                                <option value="">Select Product</option>
                                {products.flatMap(p => p.variants.map(v => (
                                    <option key={v.id} value={v.id}>{p.name} ({v.sku})</option>
                                )))}
                            </select>
                        </div>
                        <div className="col-span-3">
                            <label className="label text-xs">Quantity</label>
                            <input name="quantityOrdered" type="number" min="1" value={item.quantityOrdered} onChange={e => handleItemChange(index, e)} className="input" />
                        </div>
                        <div className="col-span-3">
                            <label className="label text-xs">Unit Cost (cents)</label>
                            <input name="unitCostCents" type="number" min="0" value={item.unitCostCents} onChange={e => handleItemChange(index, e)} className="input" />
                        </div>
                        <div className="col-span-1">
                            <button type="button" onClick={() => removeItem(index)} className="btn-secondary p-2 h-10 w-10 text-red-500"><Trash2 size={16} /></button>
                        </div>
                    </div>
                ))}
            </div>
            <button type="button" onClick={addItem} className="btn-secondary text-sm"><PlusCircle size={16} className="mr-2" />Add Item</button>
            <div className="flex justify-end gap-2 pt-4 border-t">
                <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary" disabled={isLoading}>
                    {isLoading && <Loader className="animate-spin h-4 w-4 mr-2" />}
                    Create Purchase Order
                </button>
            </div>
        </form>
    );
};

const PurchaseOrdersTab = () => {
    const { canManage } = usePosAuth();
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [stores, setStores] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditingPO, setIsEditingPO] = useState(false);
    const [viewingPO, setViewingPO] = useState(null);
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { "Authorization": `Bearer ${token}` };
            const [poRes, storesRes, productsRes] = await Promise.all([
                axios.get(`${API_URL}/pos/purchase-orders`, { headers }),
                axios.get(`${API_URL}/pos/stores`, { headers }),
                axios.get(`${API_URL}/pos/products`, { headers }),
            ]);
            setPurchaseOrders(poRes.data);
            setStores(storesRes.data);
            setProducts(productsRes.data);
        } catch (error) {
            console.error("Failed to fetch inventory data:", error);
            alert("Could not load inventory data.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSavePO = async (poData) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/pos/purchase-orders`, poData, { headers: { "Authorization": `Bearer ${token}` } });
            alert('Purchase Order created successfully!');
            setCreateModalOpen(false);
            fetchData();
        } catch (error) {
            console.error("Failed to create PO:", error);
            alert(`Error: ${error.response?.data?.message || 'Could not create purchase order.'}`);
            throw error; // Re-throw to keep modal open on failure
        }
    };

    const handleViewDetails = (po) => {
        // The list already contains full details thanks to the DTO
        setViewingPO(po);
        setIsEditingPO(false); // Ensure we start in view mode
    };

    if (loading) {
        return <div className="flex justify-center items-center p-8"><Loader className="animate-spin h-8 w-8 text-blue-600" /></div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Purchase Orders</h3>
                {canManage && (
                    <button onClick={() => setCreateModalOpen(true)} className="btn-primary flex items-center gap-2">
                        <PlusCircle size={18} /> New Purchase Order
                    </button>
                )}
            </div>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="th-cell">PO Number</th>
                                <th className="th-cell">Store</th>
                                <th className="th-cell">Supplier</th>
                                <th className="th-cell">Status</th>
                                <th className="th-cell">Date</th>
                                <th className="th-cell">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-slate-700">
                            {purchaseOrders.map(po => (
                                <tr key={po.id} className="border-b border-slate-200 hover:bg-slate-50">
                                    <td className="td-cell font-medium">{po.poNumber}</td>
                                    <td className="td-cell">{po.store?.name}</td>
                                    <td className="td-cell">{po.supplierName}</td>
                                    <td className="td-cell"><span className={`px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800`}>{po.status}</span></td>
                                    <td className="td-cell">{formatDate(po.createdAt)}</td><td className="td-cell">
                                        <button onClick={() => handleViewDetails(po)} className="p-1.5 text-slate-500 hover:text-blue-600 rounded-full" title="View Details"><Eye size={16} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <Modal isOpen={isCreateModalOpen} onClose={() => setCreateModalOpen(false)} title="Create Purchase Order" size="max-w-4xl">
                <PurchaseOrderForm onSave={handleSavePO} onCancel={() => setCreateModalOpen(false)} stores={stores} products={products} />
            </Modal>
            <Modal isOpen={!!viewingPO} onClose={() => setViewingPO(null)} title={isEditingPO ? `Editing PO: ${viewingPO?.poNumber}` : `PO Details: ${viewingPO?.poNumber}`} size="max-w-4xl">
                {viewingPO && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div><p className="label">Supplier</p><p>{viewingPO.supplierName}</p></div>
                            <div><p className="label">Store</p><p>{viewingPO.storeName}</p></div>
                            <div><p className="label">Status</p><p className="capitalize">{viewingPO.status}</p></div>
                            <div><p className="label">Date</p><p>{formatDate(viewingPO.createdAt)}</p></div>
                            <div className="md:col-span-2"><p className="label">Total Cost</p><p className="font-semibold">{formatPrice(viewingPO.totalCostCents)}</p></div>
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t">
                            <h4 className="font-semibold">Items</h4>
                            {canManage && viewingPO.status === 'open' && !isEditingPO && (
                                <button onClick={() => setIsEditingPO(true)} className="btn-secondary flex items-center gap-2"><Edit size={16} /> Edit Items</button>
                            )}
                        </div>
                        <ul className="space-y-2">
                            {viewingPO.items.map(item => (
                                <li key={item.id} className="flex justify-between items-center p-2 bg-slate-50 rounded-md">
                                    <div>
                                        <p className="font-medium">{item.productName}</p>
                                        <p className="text-xs text-slate-500">SKU: {item.productVariantSku || 'N/A'}</p>
                                    </div>
                                    <span className="text-sm text-slate-600">Qty: {item.quantityOrdered} @ {formatPrice(item.unitCostCents)}</span>
                                </li>
                            ))}
                        </ul>
                        {isEditingPO && (
                            <div className="pt-4 border-t">
                                <p className="text-center text-sm text-slate-500">Item editing functionality can be added here.</p>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

const StockAdjustmentForm = ({ onSave, onCancel, item, stores, products }) => {
    const [formData, setFormData] = useState({
        storeId: item?.storeId || stores[0]?.id || '',
        productVariantId: item?.productVariantId || '',
        changeQuantity: 1,
        reason: 'Manual Adjustment',
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await onSave(formData);
        } catch (error) {
            // Parent handles error display
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm">Adjust stock for: <span className="font-semibold">{item?.productName} ({item?.variantSku})</span></p>
            <input type="hidden" name="productVariantId" value={formData.productVariantId} />
            <div>
                <label className="label">Store</label>
                <select name="storeId" value={formData.storeId} onChange={handleChange} className="input" required>
                    {stores.map(store => <option key={store.id} value={store.id}>{store.name}</option>)}
                </select>
            </div>
            <div>
                <label className="label">Change Quantity</label>
                <input name="changeQuantity" type="number" value={formData.changeQuantity} onChange={handleChange} className="input" placeholder="e.g., 10 or -5" required />
                <p className="text-xs text-slate-500 mt-1">Use a positive number to add stock, a negative number to remove it.</p>
            </div>
            <div>
                <label className="label">Reason</label>
                <input name="reason" value={formData.reason} onChange={handleChange} className="input" required />
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
                <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary" disabled={isLoading}>
                    {isLoading && <Loader className="animate-spin h-4 w-4 mr-2" />}
                    Adjust Stock
                </button>
            </div>
        </form>
    );
};

const AddStockItemForm = ({ onSave, onCancel, stores, products, existingVariantIds, selectedStoreId }) => {
    const [formData, setFormData] = useState({
        storeId: selectedStoreId || stores[0]?.id || '',
        productVariantId: '',
        changeQuantity: 1,
        reason: 'Initial Stock',
    });
    const [isLoading, setIsLoading] = useState(false);

    const availableVariants = useMemo(() => {
        return products.flatMap(p => p.variants.filter(v => !existingVariantIds.has(v.id)));
    }, [products, existingVariantIds]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await onSave(formData);
        } catch (error) {
            // Parent handles error display
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="label">Product Variant</label>
                <select name="productVariantId" value={formData.productVariantId} onChange={handleChange} className="input" required>
                    <option value="">Select a product to add</option>
                    {availableVariants.map(v => <option key={v.id} value={v.id}>{v.productName} ({v.sku})</option>)}
                </select>
            </div>
            <div>
                <label className="label">Initial Quantity</label>
                <input name="changeQuantity" type="number" min="0" value={formData.changeQuantity} onChange={handleChange} className="input" required />
            </div>
            <div><label className="label">Reason</label><input name="reason" value={formData.reason} onChange={handleChange} className="input" required /></div>
            <div className="flex justify-end gap-2 pt-4 border-t">
                <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary" disabled={isLoading}>{isLoading && <Loader className="animate-spin h-4 w-4 mr-2" />} Add to Stock</button>
            </div>
        </form>
    );
};

const StockLevelsTab = () => {
    const { canManage } = usePosAuth();
    const [stockLevels, setStockLevels] = useState([]);
    const [loading, setLoading] = useState({ stores: true, stock: false });
    const [error, setError] = useState('');
    const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
    const [isAddStockModalOpen, setIsAddStockModalOpen] = useState(false);
    const [adjustmentItem, setAdjustmentItem] = useState(null);
    const [stores, setStores] = useState([]);
    const [products, setProducts] = useState([]);
    const [selectedStore, setSelectedStore] = useState('');

    const fetchData = useCallback(async () => {
        setLoading({ stores: true, stock: false });
        setError('');
        try {
            const token = localStorage.getItem('token');
            const headers = { "Authorization": `Bearer ${token}` };
            const [productsRes, storesRes] = await Promise.all([
                axios.get(`${API_URL}/pos/products`, { headers }),
                axios.get(`${API_URL}/pos/stores`, { headers }),
            ]);
            // Pre-process products to include productName in each variant for easier access
            const processedProducts = productsRes.data.map(p => ({
                ...p, variants: p.variants.map(v => ({...v, productName: p.name}))
            }));
            setProducts(processedProducts);
            setStores(storesRes.data);
            if (storesRes.data.length > 0) {
                setSelectedStore(storesRes.data[0].id);
            }
        } catch (err) {
            setError('Failed to load stock levels.');
            console.error("Error fetching stock data:", err);
        } finally {
            setLoading(prev => ({ ...prev, stores: false }));
        }
    }, []);

    const fetchStockForStore = useCallback(async (storeId) => {
        if (!storeId) {
            setStockLevels([]);
            return;
        }
        setLoading(prev => ({ ...prev, stock: true }));
        setError('');
        try {
            const token = localStorage.getItem('token');
            const headers = { "Authorization": `Bearer ${token}` };
            const response = await axios.get(`${API_URL}/pos/inventory/store/${storeId}`, { headers });
            setStockLevels(response.data);
        } catch (err) {
            setError(`Failed to load stock levels for the selected store.`);
            console.error("Error fetching stock levels:", err);
        } finally {
            setLoading(prev => ({ ...prev, stock: false }));
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleOpenAdjustModal = (item) => {
        setAdjustmentItem(item);
        setIsAdjustModalOpen(true);
    };

    useEffect(() => {
        if (selectedStore) fetchStockForStore(selectedStore);
    }, [selectedStore, fetchStockForStore]);

    const handleSaveAdjustment = async (adjustmentData) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/pos/stock-movements`, adjustmentData, { headers: { "Authorization": `Bearer ${token}` } });
            setIsAdjustModalOpen(false);
            fetchStockForStore(selectedStore); // Refresh stock for the current store
        } catch (error) {
            alert(`Error: ${error.response?.data?.message || 'Could not adjust stock.'}`);
            throw error;
        }
    };

    const handleSaveNewStockItem = async (stockData) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/pos/stock-movements`, stockData, { headers: { "Authorization": `Bearer ${token}` } });
            setIsAddStockModalOpen(false);
            fetchStockForStore(selectedStore); // Refresh stock levels
        } catch (error) {
            alert(`Error: ${error.response?.data?.message || 'Could not add product to stock.'}`);
            throw error;
        }
    };

    const groupedStock = useMemo(() => {
        if (!stockLevels.length || !products.length) return {};

        const variantMap = new Map(products.flatMap(p => p.variants.map(v => [v.id, p])));

        return stockLevels.reduce((acc, item) => {
            const product = variantMap.get(item.productVariantId);
            const categoryName = product?.category?.name || 'Uncategorized';
            if (!acc[categoryName]) {
                acc[categoryName] = [];
            }
            acc[categoryName].push(item);
            return acc;
        }, {});
    }, [stockLevels, products]);

    const existingVariantIdsInStore = useMemo(() =>
        new Set(stockLevels.map(item => item.productVariantId))
    , [stockLevels]);

    if (loading.stores) return <div className="flex justify-center items-center p-8"><Loader className="animate-spin h-8 w-8 text-blue-600" /></div>;
    if (error) return <div className="text-center text-red-500 p-4 bg-red-50 rounded-md">{error}</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Current Stock Levels</h3> {canManage && selectedStore && (
                    <button onClick={() => setIsAddStockModalOpen(true)} className="btn-primary flex items-center gap-2"><PlusCircle size={18} /> Add Product to Stock</button>
                )}
                <div>
                    <label className="label text-sm">Select Store</label>
                    <select value={selectedStore} onChange={e => setSelectedStore(e.target.value)} className="input">
                        <option value="">-- Select a Store --</option>
                        {stores.map(store => <option key={store.id} value={store.id}>{store.name}</option>)}
                    </select>
                </div>
            </div>
            {loading.stock ? (
                <div className="flex justify-center items-center p-8"><Loader className="animate-spin h-8 w-8 text-blue-600" /></div>
            ) : Object.keys(groupedStock).length === 0 && selectedStore ? (
                <div className="text-center py-10 border-2 border-dashed border-slate-300 rounded-lg">
                    <p className="text-slate-500">No stock records found for this store.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {Object.entries(groupedStock).map(([category, items]) => (
                        <div key={category} className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <h4 className="px-4 py-2 bg-slate-100 text-slate-600 font-semibold text-sm border-b border-slate-200">{category}</h4>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-200">
                                    <thead className="bg-slate-50">
                                        <tr><th className="th-cell">Product</th><th className="th-cell">SKU</th><th className="th-cell text-right">Quantity</th>
                                        {canManage && <th className="th-cell">Actions</th>}
                                        </tr>
                                    </thead>
                                    <tbody className="text-slate-700">
                                        {items.map(item => (
                                            <tr key={item.inventoryId} className="border-b border-slate-200 hover:bg-slate-50 last:border-b-0">
                                                <td className="td-cell font-medium">{item.productName}</td><td className="td-cell">{item.productVariantSku}</td><td className="td-cell text-right font-semibold">{item.quantity}</td>
                                                {canManage && <td className="td-cell"><button onClick={() => handleOpenAdjustModal(item)} className="p-1.5 text-slate-500 hover:text-blue-600 rounded-full" title="Adjust Stock"><SlidersHorizontal size={16} /></button></td>}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <Modal isOpen={isAdjustModalOpen} onClose={() => setIsAdjustModalOpen(false)} title="Adjust Stock" size="max-w-lg">
                <StockAdjustmentForm onSave={handleSaveAdjustment} onCancel={() => setIsAdjustModalOpen(false)} item={adjustmentItem} stores={stores} products={products} />
            </Modal>
            <Modal isOpen={isAddStockModalOpen} onClose={() => setIsAddStockModalOpen(false)} title="Add Product to Stock" size="max-w-lg">
                <AddStockItemForm onSave={handleSaveNewStockItem} onCancel={() => setIsAddStockModalOpen(false)} stores={stores} products={products} existingVariantIds={existingVariantIdsInStore} selectedStoreId={selectedStore} />
            </Modal>
        </div>
    );
};

const StockMovementsTab = () => {
    const [movements, setMovements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const headers = { "Authorization": `Bearer ${token}` };
            const response = await axios.get(`${API_URL}/pos/stock-movements`, { headers });
            setMovements(response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        } catch (err) {
            setError('Failed to load stock movements.');
            console.error("Error fetching stock movements:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    if (loading) return <div className="flex justify-center items-center p-8"><Loader className="animate-spin h-8 w-8 text-blue-600" /></div>;
    if (error) return <div className="text-center text-red-500 p-4 bg-red-50 rounded-md">{error}</div>;

    return (
        <div>
            <h3 className="text-xl font-semibold mb-4">Stock Movement History</h3>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="th-cell">Date</th>
                                <th className="th-cell">Product</th>
                                <th className="th-cell">SKU</th>
                                <th className="th-cell">Store</th>
                                <th className="th-cell text-right">Quantity Change</th>
                                <th className="th-cell">Reason</th>
                            </tr>
                        </thead>
                        <tbody className="text-slate-700">
                            {movements.map(item => (
                                <tr key={item.id} className="border-b border-slate-200 hover:bg-slate-50">
                                    <td className="td-cell text-sm">{formatDate(item.createdAt)}</td>
                                    <td className="td-cell font-medium">{item.productName}</td>
                                    <td className="td-cell">{item.variantSku}</td>
                                    <td className="td-cell">{item.storeName}</td>
                                    <td className={`td-cell text-right font-semibold ${item.changeQuantity > 0 ? 'text-green-600' : 'text-red-600'}`}>{item.changeQuantity > 0 ? `+${item.changeQuantity}` : item.changeQuantity}</td>
                                    <td className="td-cell text-sm text-slate-500">{item.reason}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const InventoryView = () => {
    const [activeTab, setActiveTab] = useState('po');

    const tabs = [
        { id: 'po', name: 'Purchase Orders', icon: ShoppingCart },
        { id: 'stock', name: 'Stock Levels', icon: Package },
        { id: 'movements', name: 'Stock Movements', icon: History },
    ];

    return (
        <div className="p-6 md:p-8 h-full flex flex-col">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-slate-800">Inventory</h1>
                <p className="text-slate-500 mt-1">Manage purchase orders and track stock.</p>
            </div>

            <div className="border-b border-slate-200">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`whitespace-nowrap flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === tab.id
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                            }`}
                        >
                            <tab.icon className="mr-2 h-5 w-5" />
                            {tab.name}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="mt-6 flex-grow">
                {activeTab === 'po' && <PurchaseOrdersTab />}
                {activeTab === 'stock' && <StockLevelsTab />}
                {activeTab === 'movements' && <StockMovementsTab />}
            </div>
        </div>
    );
}

export default InventoryView;
