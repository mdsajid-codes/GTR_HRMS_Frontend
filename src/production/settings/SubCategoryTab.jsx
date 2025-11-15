import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { Edit, Trash2, PlusCircle, Loader, Search, X, AlertCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-card text-card-foreground rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-border flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-foreground">{title}</h3>
                    <button onClick={onClose} className="p-1 rounded-full text-foreground-muted hover:bg-background-muted"><X size={20} /></button>
                </div>
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
};

const SubCategoryForm = ({ item, onSave, onCancel, loading, locations, categoryId }) => {
    const [formData, setFormData] = useState({ name: '', code: '', locationId: '', categoryId });

    useEffect(() => {
        setFormData({ name: item?.name || '', code: item?.code || '', locationId: item?.locationId || '', categoryId });
    }, [item, categoryId]);

    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = (e) => { e.preventDefault(); onSave({ id: item?.id, ...formData }); };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label htmlFor="name" className="label">Sub-Category Name</label><input id="name" name="name" value={formData.name} onChange={handleChange} required className="input" /></div>
                <div><label htmlFor="code" className="label">Sub-Category Code</label><input id="code" name="code" value={formData.code} onChange={handleChange} required className="input" /></div>
            </div>
            <div>
                <label htmlFor="locationId" className="label">Location (Optional)</label>
                <select id="locationId" name="locationId" value={formData.locationId} onChange={handleChange} className="input">
                    <option value="">All Locations</option>
                    {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                </select>
            </div>
            <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={onCancel} className="btn-secondary" disabled={loading}>Cancel</button>
                <button type="submit" className="btn-primary flex items-center" disabled={loading}>
                    {loading && <Loader className="animate-spin h-4 w-4 mr-2" />} Save
                </button>
            </div>
        </form>
    );
};

const SubCategoryTab = ({ locationId }) => {
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [locations, setLocations] = useState([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [loading, setLoading] = useState({ cats: true, subCats: false });
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);

    const authHeaders = useMemo(() => ({ "Authorization": `Bearer ${localStorage.getItem('token')}` }), []);

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading({ cats: true, subCats: false });
            try {
                const [catRes, locRes] = await Promise.all([
                    axios.get(`${API_URL}/production/categories`, { headers: authHeaders }),
                    axios.get(`${API_URL}/locations`, { headers: authHeaders }),
                ]);
                setCategories(Array.isArray(catRes.data) ? catRes.data : []);
                setLocations(Array.isArray(locRes.data) ? locRes.data : []);
            } catch (err) {
                setError('Failed to fetch initial data.');
            } finally {
                setLoading(prev => ({ ...prev, cats: false }));
            }
        };
        fetchInitialData();
    }, [authHeaders]);

    useEffect(() => {
        if (!selectedCategoryId) {
            setSubCategories([]);
            return;
        }
        const fetchSubCategories = async () => {
            setLoading(prev => ({ ...prev, subCats: true }));
            try {
                const response = await axios.get(`${API_URL}/production/sub-categories?categoryId=${selectedCategoryId}`, { headers: authHeaders });
                setSubCategories(response.data);
            } catch (err) {
                setError('Failed to fetch sub-categories.');
            } finally {
                setLoading(prev => ({ ...prev, subCats: false }));
            }
        };
        fetchSubCategories();
    }, [selectedCategoryId, authHeaders]);

    const handleAdd = () => { setEditingItem(null); setIsModalOpen(true); };
    const handleEdit = (item) => { setEditingItem(item); setIsModalOpen(true); };
    const handleCloseModal = () => { setIsModalOpen(false); setEditingItem(null); };

    const handleSave = async (itemData) => {
        setModalLoading(true);
        const payload = { ...itemData, locationId: itemData.locationId || null };
        const isUpdating = Boolean(itemData.id);
        const url = isUpdating ? `${API_URL}/production/sub-categories/${itemData.id}` : `${API_URL}/production/sub-categories`;
        const method = isUpdating ? 'put' : 'post';

        try {
            await axios[method](url, itemData, { headers: authHeaders });
            const response = await axios.get(`${API_URL}/production/sub-categories?categoryId=${selectedCategoryId}`, { headers: authHeaders });
            setSubCategories(response.data);
            handleCloseModal();
        } catch (err) {
            alert(`Error: ${err.response?.data?.message || 'Failed to save sub-category.'}`);
        } finally {
            setModalLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this sub-category?')) {
            try {
                await axios.delete(`${API_URL}/production/sub-categories/${id}`, { headers: authHeaders });
                const response = await axios.get(`${API_URL}/production/sub-categories?categoryId=${selectedCategoryId}`, { headers: authHeaders });
                setSubCategories(response.data);
            } catch (err) {
                alert(`Error: ${err.response?.data?.message || 'Failed to delete sub-category.'}`);
            }
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4">
                    <label htmlFor="category-select" className="label">Filter by Category:</label>
                    <select id="category-select" value={selectedCategoryId} onChange={e => setSelectedCategoryId(e.target.value)} className="input w-64">
                        <option value="">Select a Category</option>
                        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>
                </div>
                <button onClick={handleAdd} className="flex items-center gap-2 btn-secondary" disabled={!selectedCategoryId}><PlusCircle size={16} /> Add Sub-Category</button>
            </div>

            {error && <p className="text-red-500 mb-4">{error}</p>}

            <div className="overflow-x-auto border border-border rounded-lg">
                <table className="min-w-full divide-y divide-border">
                    <thead className="bg-background-muted">
                        <tr><th className="th-cell">Name</th><th className="th-cell">Code</th><th className="th-cell">Location</th><th className="th-cell w-32">Actions</th></tr>
                    </thead>
                    <tbody className="bg-card divide-y divide-border text-foreground-muted">
                        {loading.subCats ? (
                            <tr><td colSpan="4" className="text-center py-10"><Loader className="animate-spin h-8 w-8 text-primary mx-auto" /></td></tr>
                        ) : subCategories.length > 0 ? (
                            subCategories.map(item => (
                                <tr key={item.id}>
                                    <td className="td-cell font-medium text-foreground">{item.name}</td>
                                    <td className="td-cell">{item.code}</td>
                                    <td className="td-cell">{item.locationName || 'All'}</td>
                                    <td className="td-cell">
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => handleEdit(item)} className="text-primary hover:text-primary/80" title="Edit"><Edit size={16} /></button>
                                            <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-600" title="Delete"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="4" className="text-center py-10"><AlertCircle className="mx-auto h-12 w-12 text-foreground-muted/50" /><h3 className="mt-2 text-sm font-medium text-foreground">No Sub-Categories Found</h3><p className="mt-1 text-sm">{selectedCategoryId ? 'Get started by adding a new sub-category.' : 'Please select a category first.'}</p></td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingItem ? 'Edit Sub-Category' : 'Add Sub-Category'}>
                <SubCategoryForm item={editingItem} onSave={handleSave} onCancel={handleCloseModal} loading={modalLoading} locations={locations} categoryId={selectedCategoryId} />
            </Modal>
        </div>
    );
}

export default SubCategoryTab;