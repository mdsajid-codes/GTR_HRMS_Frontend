import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { Wrench, Edit, Trash2, PlusCircle, Loader, X, Search } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

// Reusable Modal Component
const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-card text-card-foreground rounded-lg shadow-xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
                <div className="p-4 border-b border-border flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-foreground">{title}</h3>
                    <button onClick={onClose} className="p-1 rounded-full text-foreground-muted hover:bg-background-muted"><X size={20} /></button>
                </div>
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
};

// Reusable FormField Component
const FormField = ({ label, name, value, onChange, required = false, ...props }) => (
    <div className="space-y-1">
        <label htmlFor={name} className="block text-sm font-medium text-foreground-muted">{label}</label>
        <input id={name} name={name} value={value ?? ''} onChange={onChange} required={required} className="input mt-1 bg-background-muted border-border text-foreground" {...props} />
    </div>
);

// Form for creating/editing a Tool Category
const ToolCategoryForm = ({ item, onSave, onCancel, locations }) => {
    const [formData, setFormData] = useState(item || { id: undefined, name: '', description: '', locationId: '' });

    useEffect(() => {
        if (item) {
            setFormData({ ...item, locationId: item.locationId || '' });
        } else {
            setFormData({ id: undefined, name: '', description: '', locationId: '' });
        }
    }, [item]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <FormField label="Tool Category Name" name="name" value={formData.name} onChange={handleChange} required placeholder="e.g., Hand Tools, Power Tools" />
            <FormField label="Description" name="description" value={formData.description} onChange={handleChange} placeholder="Brief description of this tool category" />
            <div className="space-y-1">
                <label htmlFor="locationId" className="block text-sm font-medium text-foreground-muted">Location (Optional)</label>
                <select id="locationId" name="locationId" value={formData.locationId} onChange={handleChange} className="input mt-1 bg-background-muted border-border text-foreground">
                    <option value="">Select Location</option>
                    {locations.map(loc => (<option key={loc.id} value={loc.id}>{loc.name}</option>))}
                </select>
            </div>
            <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Save</button>
            </div>
        </form>
    );
};

// Main component for Tool Category CRUD
const ToolCategory = ({ locationId }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [locations, setLocations] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const authHeaders = useMemo(() => ({ Authorization: `Bearer ${localStorage.getItem('token')}` }), []);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [itemsRes, locationsRes] = await Promise.all([
                axios.get(`${API_URL}/production/tool-categories`, { headers: authHeaders }),
                axios.get(`${API_URL}/locations`, { headers: authHeaders }),
            ]);
            setData(Array.isArray(itemsRes.data) ? itemsRes.data : []);
            setLocations(Array.isArray(locationsRes.data) ? locationsRes.data : []);
        } catch (err) {
            console.error("Error fetching tool categories:", err);
            alert(`Error fetching data: ${err.response?.data?.message || err.message}`);
        } finally {
            setLoading(false);
        }
    }, [authHeaders]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const filteredData = useMemo(() => {
        let filtered = data;
        if (locationId === 'none') {
            filtered = data.filter(item => !item.locationId);
        } else if (locationId && locationId !== 'all') {
            filtered = data.filter(item => String(item.locationId) === String(locationId));
        }
        if (!searchTerm) return filtered;
        const lowercasedFilter = searchTerm.toLowerCase();
        return filtered.filter(item =>
            (item.name?.toLowerCase().includes(lowercasedFilter)) ||
            (item.description?.toLowerCase().includes(lowercasedFilter))
        );
    }, [data, searchTerm, locationId]);

    const handleAdd = () => {
        setCurrentItem({ locationId: locationId !== 'all' ? locationId : '' });
        setIsModalOpen(true);
    };

    const handleEdit = (item) => {
        setCurrentItem(item);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentItem(null);
    };

    const handleSave = async (itemData) => {
        const payload = { ...itemData, locationId: itemData.locationId || null };
        const isUpdating = Boolean(itemData.id);
        const url = isUpdating ? `${API_URL}/production/tool-categories/${itemData.id}` : `${API_URL}/production/tool-categories`;
        const method = isUpdating ? 'put' : 'post';

        try {
            await axios[method](url, payload, { headers: authHeaders });
            fetchData();
            handleCloseModal();
        } catch (err) {
            alert(`Error saving Tool Category: ${err.response?.data?.message || err.message}`);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this tool category?')) {
            try {
                await axios.delete(`${API_URL}/production/tool-categories/${id}`, { headers: authHeaders });
                fetchData();
            } catch (err) {
                alert(`Error deleting Tool Category: ${err.response?.data?.message || err.message}`);
            }
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center p-8"><Loader className="animate-spin h-8 w-8 text-primary" /></div>;
    }

    return (
        <>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-foreground">Manage Tool Categories</h3>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input w-full sm:w-64 pr-10 bg-background-muted border-border" />
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-muted" />
                    </div>
                    <button onClick={handleAdd} className="flex items-center gap-2 btn-secondary"><PlusCircle size={16} /> Add Category</button>
                </div>
            </div>

            <div className="overflow-x-auto border border-border rounded-lg">
                <table className="min-w-full divide-y divide-border">
                    <thead className="bg-background-muted">
                        <tr>
                            <th className="th-cell">#</th>
                            <th className="th-cell">Name</th>
                            <th className="th-cell">Description</th>
                            <th className="th-cell">Location</th>
                            <th className="th-cell">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-card divide-y divide-border text-foreground-muted">
                        {filteredData.length > 0 ? (
                            filteredData.map((item, index) => (
                                <tr key={item.id} className="hover:bg-background-muted transition-colors">
                                    <td className="td-cell">{index + 1}</td>
                                    <td className="td-cell">{item.name}</td>
                                    <td className="td-cell">{item.description}</td>
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
                            <tr>
                                <td colSpan="5" className="px-4 py-6 text-sm text-foreground-muted text-center">No records found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={currentItem?.id ? 'Edit Tool Category' : 'Add Tool Category'}>
                <ToolCategoryForm item={currentItem} onSave={handleSave} onCancel={handleCloseModal} locations={locations} />
            </Modal>
        </>
    );
};

export default ToolCategory;