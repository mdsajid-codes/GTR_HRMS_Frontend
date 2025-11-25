import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { Edit, Trash2, PlusCircle, Loader, Search, X, AlertCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const TaxTab = ({ locationId }) => {
    const [taxes, setTaxes] = useState([]);
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formLoading, setFormLoading] = useState(false);
    const [formData, setFormData] = useState({ code: '', rate: 0, description: '', locationId: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const authHeaders = useMemo(() => ({ "Authorization": `Bearer ${localStorage.getItem('token')}` }), []);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [taxesRes, locationsRes] = await Promise.all([
                axios.get(`${API_URL}/production/taxes`, { headers: authHeaders }),
                axios.get(`${API_URL}/locations`, { headers: authHeaders }),
            ]);
            setTaxes(Array.isArray(taxesRes.data) ? taxesRes.data : []);
            setLocations(Array.isArray(locationsRes.data) ? locationsRes.data : []);
        } catch (err) {
            setError('Failed to fetch taxes. Please ensure the backend is running and the endpoint exists.');
        } finally {
            setLoading(false);
        }
    }, [authHeaders]);

    
    useEffect(() => { fetchData(); }, [fetchData]);

    useEffect(() => {
        if (editingItem) {
            setFormData({
                code: editingItem.code || '',
                rate: editingItem.rate || 0,
                description: editingItem.description || '',
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
        setFormData({ code: '', rate: 0, description: '', locationId: '' });
    };

    const handleSave = async (itemData) => {
        setFormLoading(true);
        const payload = { ...itemData, locationId: itemData.locationId || null };
        const isUpdating = Boolean(itemData.id);
        const url = isUpdating ? `${API_URL}/production/taxes/${itemData.id}` : `${API_URL}/production/taxes`;
        const method = isUpdating ? 'put' : 'post';
        try {
           await axios[method](url, itemData, { headers: authHeaders });
            await fetchData();
            handleCancel();
        } catch (err) {
            alert(`Error: ${err.response?.data?.message || 'Failed to save tax.'}`);
        } finally {
            setFormLoading(false);
        }
    };



    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this tax?')) {
            try {
                await axios.delete(`${API_URL}/production/taxes/${id}`, { headers: authHeaders });
                await fetchData();
            } catch (err) {
                alert(`Error: ${err.response?.data?.message || 'Failed to delete tax.'}`);
            }
        }
    };

    const handleSubmit = (e) => { e.preventDefault(); handleSave({ id: editingItem?.id, ...formData }); };

    const filteredData = useMemo(() => {
        let filtered = taxes;
        if (locationId === 'none') {
            filtered = taxes.filter(item => !item.locationId);
        } else if (locationId && locationId !== 'all') {
            filtered = taxes.filter(item => String(item.locationId) === String(locationId));
        }
        return filtered.filter(item => !searchTerm || item.code.toLowerCase().includes(searchTerm.toLowerCase()) || item.description?.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [taxes, searchTerm, locationId]);

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-foreground">Manage Taxes</h3>
                <div className="flex items-center gap-2">
                    <div className="relative"><input type="text" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="input w-full sm:w-64 pr-10 bg-background-muted border-border" /><Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-muted" /></div>
                    <button onClick={handleAdd} className="flex items-center gap-2 btn-secondary"><PlusCircle size={16} /> Add Tax</button>
                </div>
            </div>
            {showForm && (
                <div className="bg-card p-4 rounded-lg border border-border mb-4">
                    <h4 className="text-md font-semibold mb-3">{editingItem?.id ? 'Edit Tax' : 'Add New Tax'}</h4>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
                        <div className="col-span-1"><label htmlFor="code" className="label">Tax Code</label><input id="code" name="code" value={formData.code} onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))} required className="input" placeholder="e.g., VAT5" /></div>
                        <div className="col-span-1"><label htmlFor="rate" className="label">Rate (%)</label><input id="rate" name="rate" type="number" step="0.01" value={formData.rate} onChange={(e) => setFormData(prev => ({ ...prev, rate: e.target.value }))} required className="input" placeholder="e.g., 5" /></div>
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
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <div className="overflow-x-auto border border-border rounded-lg">
                <table className="min-w-full divide-y divide-border">
                    <thead className="bg-background-muted">
                        <tr><th className="th-cell">Code</th><th className="th-cell">Rate (%)</th><th className="th-cell">Description</th><th className="th-cell">Location</th><th className="th-cell w-32">Actions</th></tr>
                    </thead>
                    <tbody className="bg-card divide-y divide-border text-foreground-muted">
                        {loading ? (
                            <tr><td colSpan="5" className="text-center py-10"><Loader className="animate-spin h-8 w-8 text-primary mx-auto" /></td></tr>
                        ) : filteredData.length > 0 ? (
                            filteredData.map(item => (
                                <tr key={item.id}>
                                    <td className="td-cell font-medium text-foreground">{item.code}</td>
                                    <td className="td-cell">{item.rate}</td>
                                    <td className="td-cell">{item.description}</td>
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
                            <tr><td colSpan="5" className="text-center py-10"><AlertCircle className="mx-auto h-12 w-12 text-foreground-muted/50" /><h3 className="mt-2 text-sm font-medium text-foreground">No Taxes Found</h3><p className="mt-1 text-sm">Get started by adding a new tax.</p></td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TaxTab;