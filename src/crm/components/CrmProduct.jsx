import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { Edit, Trash2, PlusCircle, Loader, Search, X, AlertCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-card text-card-foreground rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-border flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-foreground">{title}</h3>
                    <button onClick={onClose} className="p-1 rounded-full text-foreground-muted hover:bg-background-muted"><X size={20} /></button>
                </div>
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
};

const ProductForm = ({ item, onSave, onCancel, loading, industries, locations }) => {
    const [formData, setFormData] = useState({ name: '', industryId: '', locationId: '' });

    useEffect(() => {
        setFormData({
            name: item?.name || '',
            industryId: item?.industryId || '',
            locationId: item?.locationId || '',
        });
    }, [item]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ id: item?.id, ...formData });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground-muted">Product Name</label>
                <input id="name" name="name" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} required className="input mt-1 bg-background-muted border-border text-foreground" placeholder="e.g., CRM Software Suite" />
            </div>
            <div>
                <label htmlFor="industryId" className="block text-sm font-medium text-foreground-muted">Industry</label>
                <select id="industryId" name="industryId" value={formData.industryId} onChange={(e) => setFormData(prev => ({ ...prev, industryId: e.target.value }))} required className="input mt-1 bg-background-muted border-border text-foreground">
                    <option value="">Select an Industry</option>
                    {industries.map(ind => <option key={ind.id} value={ind.id}>{ind.name}</option>)}
                </select>
            </div>
            <div>
                <label htmlFor="locationId" className="block text-sm font-medium text-foreground-muted">Location (Optional)</label>
                <select id="locationId" name="locationId" value={formData.locationId} onChange={(e) => setFormData(prev => ({ ...prev, locationId: e.target.value }))} className="input mt-1 bg-background-muted border-border text-foreground">
                    <option value="">Select Location</option>
                    {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                </select>
            </div>
            <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={onCancel} className="btn-secondary" disabled={loading}>Cancel</button>
                <button type="submit" className="btn-primary flex items-center" disabled={loading}>
                    {loading && <Loader className="animate-spin h-4 w-4 mr-2" />}
                    Save
                </button>
            </div>
        </form>
    );
};

const CrmProduct = ({ locationId }) => {
    const [products, setProducts] = useState([]);
    const [industries, setIndustries] = useState([]);
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterIndustry, setFilterIndustry] = useState('');

    const authHeaders = useMemo(() => ({ "Authorization": `Bearer ${localStorage.getItem('token')}` }), []);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const [productsRes, industriesRes, locationsRes] = await Promise.all([
                axios.get(`${API_URL}/crm/products`, { headers: authHeaders }),
                axios.get(`${API_URL}/settings/industries`, { headers: authHeaders }),
                axios.get(`${API_URL}/locations`, { headers: authHeaders }),
            ]);
            setProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
            setIndustries(Array.isArray(industriesRes.data) ? industriesRes.data : []);
            setLocations(Array.isArray(locationsRes.data) ? locationsRes.data : []);
        } catch (err) {
            setError('Failed to fetch data.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [authHeaders]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAdd = () => {
        setEditingItem({ locationId: locationId !== 'all' ? locationId : '' });
        setIsModalOpen(true);
    };
    const handleEdit = (item) => { setEditingItem(item); setIsModalOpen(true); };
    const handleCloseModal = () => { setIsModalOpen(false); setEditingItem(null); };

    const handleSave = async (itemData) => {
        setModalLoading(true);
        const payload = {
            ...itemData,
            locationId: itemData.locationId || null,
        };
        const isUpdating = Boolean(payload.id);
        const url = isUpdating ? `${API_URL}/crm/products/${itemData.id}` : `${API_URL}/crm/products`;
        const method = isUpdating ? 'put' : 'post';

        try {
            await axios[method](url, payload, { headers: authHeaders });
            await fetchData();
            handleCloseModal();
        } catch (err) {
            alert(`Error: ${err.response?.data?.message || 'Failed to save product.'}`);
        } finally {
            setModalLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await axios.delete(`${API_URL}/crm/products/${id}`, { headers: authHeaders });
                await fetchData();
            } catch (err) {
                alert(`Error: ${err.response?.data?.message || 'Failed to delete product.'}`);
            }
        }
    };

    const filteredData = useMemo(() => {
        let filtered = products;
        if (locationId === 'none') {
            filtered = products.filter(item => !item.locationId);
        } else if (locationId && locationId !== 'all') {
            filtered = products.filter(item => String(item.locationId) === String(locationId));
        }
        return filtered
            .filter(item => !filterIndustry || item.industryId == filterIndustry)
            .filter(item => !searchTerm || item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [products, searchTerm, filterIndustry, locationId]);

    return (
        <div className="p-6 bg-card rounded-xl shadow-sm">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                <h3 className="text-lg font-semibold text-foreground">Manage Products</h3>
                <div className="flex items-center gap-2">
                    <select value={filterIndustry} onChange={e => setFilterIndustry(e.target.value)} className="input bg-background-muted border-border text-foreground-muted">
                        <option value="">All Industries</option>
                        {industries.map(ind => <option key={ind.id} value={ind.id}>{ind.name}</option>)}
                    </select>
                    <div className="relative"><input type="text" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="input w-full sm:w-52 pr-10 bg-background-muted border-border" /><Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-muted" /></div>
                    <button onClick={handleAdd} className="flex items-center gap-2 btn-secondary"><PlusCircle size={16} /> Add Product</button>
                </div>
            </div>

            {error && <p className="text-red-500 mb-4">{error}</p>}

            <div className="overflow-x-auto border border-border rounded-lg">
                <table className="min-w-full divide-y divide-border">
                    <thead className="bg-background-muted">
                        <tr>
                            <th className="th-cell w-16">#</th>
                            <th className="th-cell">Product Name</th>
                            <th className="th-cell">Industry</th>
                            <th className="th-cell">Location</th>
                            <th className="th-cell w-32">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-card divide-y divide-border text-foreground-muted">
                        {loading ? (
                            <tr><td colSpan="5" className="text-center py-10"><Loader className="animate-spin h-8 w-8 text-primary mx-auto" /></td></tr>
                        ) : filteredData.length > 0 ? (
                            filteredData.map((item, index) => (
                                <tr key={item.id}>
                                    <td className="td-cell">{index + 1}</td>
                                    <td className="td-cell font-medium text-foreground">{item.name}</td>
                                    <td className="td-cell">{item.industryName || 'N/A'}</td>
                                    <td className="td-cell">{item.locationName || 'N/A'}</td>
                                    <td className="td-cell">
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => handleEdit(item)} className="text-primary hover:text-primary/80" title="Edit"><Edit size={16} /></button>
                                            <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-600" title="Delete"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="5" className="text-center py-10"><AlertCircle className="mx-auto h-12 w-12 text-foreground-muted/50" /><h3 className="mt-2 text-sm font-medium text-foreground">No products found</h3><p className="mt-1 text-sm">Get started by adding a new product.</p></td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingItem ? 'Edit Product' : 'Add Product'}>
                <ProductForm item={editingItem} onSave={handleSave} onCancel={handleCloseModal} loading={modalLoading} industries={industries} locations={locations} />
            </Modal>
        </div>
    );
}

export default CrmProduct;
