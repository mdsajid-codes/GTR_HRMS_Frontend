import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { Edit, Trash2, PlusCircle, Loader, Search, X, AlertCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const SubCategoryTab = ({ locationId }) => {
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [locations, setLocations] = useState([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [loading, setLoading] = useState({ cats: true, subCats: false });
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formLoading, setFormLoading] = useState(false);
    const [formData, setFormData] = useState({ name: '', code: '', locationId: '' });

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

    useEffect(() => {
        if (editingItem) {
            setFormData({
                name: editingItem.name || '',
                code: editingItem.code || '',
                locationId: editingItem.locationId || (locationId !== 'all' ? locationId : '')
            });
        }
    }, [editingItem, locationId]);

    const handleAdd = () => {
        setEditingItem({});
        setShowForm(true);
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setShowForm(true);
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingItem(null);
        setFormData({ name: '', code: '', locationId: '' });
    };

    const handleSave = async (itemData) => {
        if (!selectedCategoryId) {
            alert("Please select a category first.");
            return;
        }
        setFormLoading(true);
        const payload = { ...itemData, categoryId: selectedCategoryId, locationId: itemData.locationId || null };
        const isUpdating = Boolean(itemData.id);
        const url = isUpdating ? `${API_URL}/production/sub-categories/${itemData.id}` : `${API_URL}/production/sub-categories`;
        const method = isUpdating ? 'put' : 'post';

        try {
            await axios[method](url, payload, { headers: authHeaders });
            const response = await axios.get(`${API_URL}/production/sub-categories?categoryId=${selectedCategoryId}`, { headers: authHeaders });
            setSubCategories(response.data);
            handleCancel();
        } catch (err) {
            alert(`Error: ${err.response?.data?.message || 'Failed to save sub-category.'}`);
        } finally {
            setFormLoading(false);
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

    const handleSubmit = (e) => { e.preventDefault(); handleSave({ id: editingItem?.id, ...formData }); };

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

            {showForm && (
                <div className="bg-card p-4 rounded-lg border border-border mb-4">
                    <h4 className="text-md font-semibold mb-3">{editingItem?.id ? 'Edit Sub-Category' : 'Add New Sub-Category'}</h4>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
                        <div className="col-span-1"><label htmlFor="name" className="label">Sub-Category Name</label><input id="name" name="name" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} required className="input" /></div>
                        <div className="col-span-1"><label htmlFor="code" className="label">Sub-Category Code</label><input id="code" name="code" value={formData.code} onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))} required className="input" /></div>
                        <div className="col-span-1">
                            <label htmlFor="locationId" className="label">Location (Optional)</label>
                            <select id="locationId" name="locationId" value={formData.locationId} onChange={(e) => setFormData(prev => ({ ...prev, locationId: e.target.value }))} className="input">
                                <option value="">All Locations</option>
                                {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                            </select>
                        </div>
                        <div className="flex justify-end gap-2 col-span-1">
                            <button type="button" onClick={handleCancel} className="btn-secondary" disabled={formLoading}>Cancel</button>
                            <button type="submit" className="btn-primary flex items-center" disabled={formLoading}>{formLoading && <Loader className="animate-spin h-4 w-4 mr-2" />} Save</button>
                        </div>
                    </form>
                </div>
            )}

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

        </div>
    );
}

export default SubCategoryTab;