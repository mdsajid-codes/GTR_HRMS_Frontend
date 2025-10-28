import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Loader, AlertCircle, X } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;

// Modal for adding/editing devices
const DeviceModal = ({ isOpen, onClose, onSave, device, loading }) => {
    const [formData, setFormData] = useState({
        name: '',
        deviceIdentifier: '',
        location: '',
        isActive: true,
    });
    const [modalError, setModalError] = useState('');

    useEffect(() => {
        if (device) {
            setFormData({
                name: device.name || '',
                deviceIdentifier: device.deviceIdentifier || '',
                location: device.location || '',
                isActive: device.isActive ?? true,
            });
        } else {
            setFormData({ name: '', deviceIdentifier: '', location: '', isActive: true });
        }
        setModalError('');
    }, [device, isOpen]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.deviceIdentifier.trim()) {
            setModalError('Device Name and Identifier are required.');
            return;
        }
        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-semibold">{device ? 'Edit' : 'Add'} Biometric Device</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100"><X className="h-5 w-5" /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700">Device Name</label>
                            <input id="name" name="name" value={formData.name} onChange={handleChange} required className="input" />
                        </div>
                        <div>
                            <label htmlFor="deviceIdentifier" className="block text-sm font-medium text-slate-700">Device Identifier</label>
                            <input id="deviceIdentifier" name="deviceIdentifier" value={formData.deviceIdentifier} onChange={handleChange} required className="input" />
                        </div>
                        <div>
                            <label htmlFor="location" className="block text-sm font-medium text-slate-700">Location</label>
                            <input id="location" name="location" value={formData.location} onChange={handleChange} className="input" />
                        </div>
                        <div className="flex items-center gap-3">
                            <input type="checkbox" id="isActive" name="isActive" checked={formData.isActive} onChange={handleChange} className="h-4 w-4 rounded" />
                            <label htmlFor="isActive" className="text-sm font-medium text-slate-700">Device is Active</label>
                        </div>
                        {modalError && <p className="text-red-500 text-sm">{modalError}</p>}
                    </div>
                    <div className="p-4 border-t bg-slate-50 flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>Cancel</button>
                        <button type="submit" className="btn-primary flex items-center" disabled={loading}>
                            {loading && <Loader className="animate-spin h-4 w-4 mr-2" />}
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const BiometricDevices = () => {
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalLoading, setModalLoading] = useState(false);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDevice, setEditingDevice] = useState(null);

    const fetchDevices = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/biometric-devices`, { headers: { "Authorization": `Bearer ${token}` } });
            setDevices(response.data);
        } catch (err) {
            setError('Failed to fetch biometric devices.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDevices();
    }, []);

    const handleAdd = () => { setEditingDevice(null); setIsModalOpen(true); };
    const handleEdit = (device) => { setEditingDevice(device); setIsModalOpen(true); };

    const handleDelete = async (deviceId, deviceName) => {
        if (window.confirm(`Are you sure you want to delete the device "${deviceName}"?`)) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${API_URL}/biometric-devices/${deviceId}`, { headers: { "Authorization": `Bearer ${token}` } });
                setDevices(devices.filter(d => d.id !== deviceId));
            } catch (err) {
                setError('Failed to delete device.');
                console.error(err);
            }
        }
    };

    const handleSave = async (deviceData) => {
        setModalLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const headers = { "Authorization": `Bearer ${token}` };
            if (editingDevice) {
                await axios.put(`${API_URL}/biometric-devices/${editingDevice.id}`, deviceData, { headers });
            } else {
                await axios.post(`${API_URL}/biometric-devices`, deviceData, { headers });
            }
            setIsModalOpen(false);
            fetchDevices();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save device.');
            console.error(err);
        } finally {
            setModalLoading(false);
        }
    };

    return (
        <>
            <div className="p-4 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-800">Biometric Device Management</h2>
                    <button onClick={handleAdd} className="btn-primary flex items-center"><Plus className="h-5 w-5 mr-2" /> Add Device</button>
                </div>
                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">{error}</div>}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="flex justify-center items-center h-80"><Loader className="h-8 w-8 animate-spin text-blue-600" /></div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="th-cell">Device Name</th>
                                        <th className="th-cell">Identifier</th>
                                        <th className="th-cell">Location</th>
                                        <th className="th-cell">Status</th>
                                        <th className="th-cell">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="text-slate-700">
                                    {devices.length > 0 ? (
                                        devices.map(d => (
                                            <tr key={d.id} className="border-b border-slate-200 hover:bg-slate-50">
                                                <td className="td-cell font-medium">{d.name}</td>
                                                <td className="td-cell">{d.deviceIdentifier}</td>
                                                <td className="td-cell">{d.location || 'N/A'}</td>
                                                <td className="td-cell">
                                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${d.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                                        {d.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="td-cell">
                                                    <div className="flex items-center gap-2">
                                                        <button onClick={() => handleEdit(d)} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-100 rounded-full" title="Edit"><Edit className="h-4 w-4" /></button>
                                                        <button onClick={() => handleDelete(d.id, d.name)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-full" title="Delete"><Trash2 className="h-4 w-4" /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="5" className="text-center py-10 text-slate-500"><AlertCircle className="mx-auto h-12 w-12 text-slate-400" /><h3 className="mt-2 text-sm font-medium">No devices found</h3><p className="mt-1 text-sm">Get started by adding a new biometric device.</p></td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
            <DeviceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} device={editingDevice} loading={modalLoading} />
        </>
    );
}

export default BiometricDevices;