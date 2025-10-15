import React, { useState, useEffect, useCallback } from 'react';
import { PlusCircle, Edit, Loader, X, ShieldAlert } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error("No authentication token found.");
    return { "Authorization": `Bearer ${token}` };
};

const api = {
    getLocations: async () => {
        const response = await axios.get(`${API_URL}/locations`, { headers: getAuthHeaders() });
        return response.data;
    },
    createLocation: async (data) => {
        const response = await axios.post(`${API_URL}/locations`, data, { headers: getAuthHeaders() });
        return response.data;
    },
    updateLocation: async (id, data) => {
        const response = await axios.put(`${API_URL}/locations/${id}`, data, { headers: getAuthHeaders() });
        return response.data;
    },
};

// --- Reusable Components ---

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="text-xl font-semibold">{title}</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100"><X size={20} /></button>
                </div>
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
};

const LocationForm = ({ item, onSave, onCancel, saving, error }) => {
    const [formData, setFormData] = useState(item || { name: '', address: '', city: '', state: '', postalCode: '', country: '', primary: false });
    const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
    const handleSubmit = e => { e.preventDefault(); onSave(formData); };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2"><input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Location Name" className="input" required /></div>
                <div className="md:col-span-2"><input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Address" className="input" /></div>
                <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="City" className="input" />
                <input type="text" name="state" value={formData.state} onChange={handleChange} placeholder="State" className="input" />
                <input type="text" name="postalCode" value={formData.postalCode} onChange={handleChange} placeholder="Postal Code" className="input" />
                <input type="text" name="country" value={formData.country} onChange={handleChange} placeholder="Country" className="input" />
            </div>
            <label className="flex items-center gap-2">
                <input type="checkbox" name="primary" checked={formData.primary} onChange={handleChange} className="h-4 w-4 rounded" />
                <span>Set as primary location</span>
            </label>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={onCancel} className="btn-secondary" disabled={saving}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={saving}>
                    {saving ? <Loader className="animate-spin h-5 w-5" /> : 'Save Location'}
                </button>
            </div>
        </form>
    );
};

const UpgradeModal = ({ isOpen, onClose, message }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md text-center p-6">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100"><ShieldAlert className="h-6 w-6 text-yellow-600" /></div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">Subscription Limit Reached</h3>
                <div className="mt-2 text-sm text-slate-600"><p>{message}</p><p className="mt-2">Please upgrade your plan to add more locations.</p></div>
                <button onClick={onClose} className="btn-primary mt-6 w-full">Got it</button>
            </div>
        </div>
    );
};

const Locations = () => {
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [modalError, setModalError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLocation, setEditingLocation] = useState(null);
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

    const fetchLocations = useCallback(() => {
        setLoading(true);
        api.getLocations()
            .then(data => setLocations(data))
            .catch(() => setError('Failed to load locations.'))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { fetchLocations(); }, [fetchLocations]);

    const handleAdd = () => { setEditingLocation(null); setIsModalOpen(true); };
    const handleEdit = (location) => { setEditingLocation(location); setIsModalOpen(true); };
    const handleCloseModal = () => { setIsModalOpen(false); setEditingLocation(null); setModalError(''); };

    const handleSave = async (data) => {
        setSaving(true);
        setModalError('');
        try {
            if (data.id) {
                await api.updateLocation(data.id, data);
            } else {
                await api.createLocation(data);
            }
            fetchLocations();
            handleCloseModal();
        } catch (err) {
            const errorMessage = err.response?.data || 'Failed to save location.';
            if (typeof errorMessage === 'string' && errorMessage.includes('limit')) {
                setError(errorMessage);
                setIsUpgradeModalOpen(true);
                handleCloseModal();
            } else {
                setModalError(errorMessage);
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex justify-center p-10"><Loader className="animate-spin text-blue-600" /></div>;
    if (error && !isUpgradeModalOpen) return <div className="text-center text-red-500 p-4">{error}</div>;

    return (
        <div className="p-6 bg-white rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-slate-800">Work Locations</h3>
                <button onClick={handleAdd} className="btn-primary flex items-center gap-2"><PlusCircle size={16} /> Add Location</button>
            </div>
            <div className="overflow-x-auto border rounded-lg">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50"><tr><th className="th-cell">Location Name</th><th className="th-cell">City</th><th className="th-cell">Country</th><th className="th-cell">Primary</th><th className="th-cell">Actions</th></tr></thead>
                    <tbody className="divide-y divide-slate-200">
                        {locations.map(loc => (<tr key={loc.id} className="hover:bg-slate-50"><td className="td-cell font-medium">{loc.name}</td><td className="td-cell">{loc.city}</td><td className="td-cell">{loc.country}</td><td className="td-cell">{loc.primary ? 'Yes' : 'No'}</td><td className="td-cell"><button onClick={() => handleEdit(loc)} className="p-1 text-blue-600 hover:text-blue-800"><Edit size={16} /></button></td></tr>))}
                    </tbody>
                </table>
            </div>
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingLocation ? 'Edit Location' : 'Add Location'}><LocationForm item={editingLocation} onSave={handleSave} onCancel={handleCloseModal} saving={saving} error={modalError} /></Modal>
            <UpgradeModal isOpen={isUpgradeModalOpen} onClose={() => setIsUpgradeModalOpen(false)} message={error} />
        </div>
    );
}

export default Locations;
