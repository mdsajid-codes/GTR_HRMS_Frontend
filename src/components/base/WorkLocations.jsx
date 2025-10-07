import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Loader, AlertCircle, X, ShieldAlert } from 'lucide-react';
import axios from 'axios';

const LocationModal = ({ isOpen, onClose, onSave, location, loading }) => {
    const [formData, setFormData] = useState({
        name: '', address: '', city: '', state: '', postalCode: '', country: '', primary: false
    });
    const [modalError, setModalError] = useState('');

    useEffect(() => {
        if (location) {
            setFormData({
                name: location.name || '',
                address: location.address || '',
                city: location.city || '',
                state: location.state || '',
                postalCode: location.postalCode || '',
                country: location.country || '',
                primary: location.primary || false,
            });
        } else {
            setFormData({
                name: '', address: '', city: '', state: '', postalCode: '', country: '', primary: false
            });
        }
        setModalError('');
    }, [location, isOpen]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            setModalError('Location Name is required.');
            return;
        }
        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-semibold">{location ? 'Edit' : 'Add'} Work Location</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100"><X className="h-5 w-5" /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
                        <div className="md:col-span-2"><label htmlFor="name" className="block text-sm font-medium text-slate-700">Location Name</label><input id="name" name="name" value={formData.name} onChange={handleChange} required className="input" /></div>
                        <div className="md:col-span-2"><label htmlFor="address" className="block text-sm font-medium text-slate-700">Address</label><input id="address" name="address" value={formData.address} onChange={handleChange} className="input" /></div>
                        <div><label htmlFor="city" className="block text-sm font-medium text-slate-700">City</label><input id="city" name="city" value={formData.city} onChange={handleChange} className="input" /></div>
                        <div><label htmlFor="state" className="block text-sm font-medium text-slate-700">State</label><input id="state" name="state" value={formData.state} onChange={handleChange} className="input" /></div>
                        <div><label htmlFor="postalCode" className="block text-sm font-medium text-slate-700">Postal Code</label><input id="postalCode" name="postalCode" value={formData.postalCode} onChange={handleChange} className="input" /></div>
                        <div><label htmlFor="country" className="block text-sm font-medium text-slate-700">Country</label><input id="country" name="country" value={formData.country} onChange={handleChange} className="input" /></div>
                        <div className="md:col-span-2"><label className="inline-flex items-center"><input type="checkbox" name="primary" checked={formData.primary} onChange={handleChange} className="h-4 w-4 rounded" /> <span className="ml-2 text-sm">Set as primary location</span></label></div>
                        {modalError && <p className="md:col-span-2 text-red-500 text-sm">{modalError}</p>}
                    </div>
                    <div className="p-4 border-t bg-slate-50 flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>Cancel</button>
                        <button type="submit" className="btn-primary flex items-center" disabled={loading}>{loading && <Loader className="animate-spin h-4 w-4 mr-2" />} Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const UpgradeModal = ({ isOpen, onClose, message }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md text-center p-6">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
                    <ShieldAlert className="h-6 w-6 text-yellow-600" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">Subscription Limit Reached</h3>
                <div className="mt-2 text-sm text-slate-600">
                    <p>{message}</p>
                    <p className="mt-2">Please upgrade your plan to add more locations.</p>
                </div>
                <button onClick={onClose} className="btn-primary mt-6 w-full">Got it</button>
            </div>
        </div>
    );
};

const WorkLocations = () => {
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalLoading, setModalLoading] = useState(false);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLocation, setEditingLocation] = useState(null);
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

    const API_URL = import.meta.env.VITE_API_BASE_URL;

    const fetchLocations = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/locations`, { headers: { "Authorization": `Bearer ${token}` } });
            setLocations(response.data);
        } catch (err) {
            setError('Failed to fetch locations.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [API_URL]);

    useEffect(() => {
        fetchLocations();
    }, [fetchLocations]);

    const handleAdd = () => { setEditingLocation(null); setIsModalOpen(true); };
    const handleEdit = (location) => { setEditingLocation(location); setIsModalOpen(true); };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this location?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${API_URL}/locations/${id}`, { headers: { "Authorization": `Bearer ${token}` } });
                fetchLocations();
            } catch (err) {
                setError('Failed to delete location.');
                console.error(err);
            }
        }
    };

    const handleSave = async (data) => {
        setModalLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const request = editingLocation
                ? axios.put(`${API_URL}/locations/${editingLocation.id}`, data, { headers: { "Authorization": `Bearer ${token}` } })
                : axios.post(`${API_URL}/locations`, data, { headers: { "Authorization": `Bearer ${token}` } });

            await request;
            setIsModalOpen(false);
            fetchLocations();
        } catch (err) {
            const errorMessage = err.response?.data || 'Failed to save location.';
            if (typeof errorMessage === 'string' && errorMessage.includes('limit has been reached')) {
                setError(errorMessage);
                setIsUpgradeModalOpen(true);
            } else {
                setError(errorMessage);
            }
        } finally {
            setModalLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Work Locations</h2>
                <button onClick={handleAdd} className="btn-primary flex items-center"><Plus className="h-5 w-5 mr-2" /> Add Location</button>
            </div>
            {error && !isUpgradeModalOpen && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
            {loading ? (
                <div className="flex justify-center items-center h-40"><Loader className="h-8 w-8 animate-spin text-blue-600" /></div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="th-cell">#</th>
                                <th className="th-cell">Location Name</th>
                                <th className="th-cell">City</th>
                                <th className="th-cell">State</th>
                                <th className="th-cell">Primary</th>
                                <th className="th-cell">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-slate-700">
                            {locations.length > 0 ? (
                                locations.map(loc => (
                                    <tr key={loc.id} className="border-b border-slate-200 hover:bg-slate-50">
                                        <td className="td-cell text-sm text-slate-500">{loc.id}</td>
                                        <td className="td-cell font-medium">{loc.name}</td>
                                        <td className="td-cell">{loc.city}</td>
                                        <td className="td-cell">{loc.state}</td>
                                        <td className="td-cell">{loc.primary ? 'Yes' : 'No'}</td>
                                        <td className="td-cell">
                                            <button onClick={() => handleEdit(loc)} className="p-2 text-slate-500 hover:text-blue-600"><Edit size={16} /></button>
                                            <button onClick={() => handleDelete(loc.id)} className="p-2 text-slate-500 hover:text-red-600"><Trash2 size={16} /></button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="6" className="text-center py-10 text-slate-500">No locations found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
            <UpgradeModal isOpen={isUpgradeModalOpen} onClose={() => setIsUpgradeModalOpen(false)} message={error} />
            <LocationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} location={editingLocation} loading={modalLoading} />
        </div>
    );
};

export default WorkLocations;