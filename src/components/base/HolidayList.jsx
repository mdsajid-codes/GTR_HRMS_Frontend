import React, { useState, useEffect } from 'react';
import DashboardLayout from '../DashboardLayout';
import { Plus, Edit, Trash2, Loader, AlertCircle, X, RefreshCw } from 'lucide-react';
import axios from 'axios';
import SyncPolicyModal from '../attendance/SyncPolicyModal';

// Modal for adding/editing Holiday Policies
const HolidayListModal = ({ isOpen, onClose, onSave, policy, loading }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        holidays: []
    });
    const [modalError, setModalError] = useState('');

    useEffect(() => {
        if (policy) {
            setFormData({
                name: policy.name || '',
                description: policy.description || '',
                holidays: policy.holidays || []
            });
        } else {
            setFormData({ name: '', description: '', holidays: [] });
        }
        setModalError('');
    }, [policy, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleHolidayChange = (index, field, value) => {
        const newHolidays = [...formData.holidays];
        newHolidays[index] = { ...newHolidays[index], [field]: value };
        setFormData(prev => ({ ...prev, holidays: newHolidays }));
    };

    const addHoliday = () => {
        setFormData(prev => ({
            ...prev,
            holidays: [...prev.holidays, { date: '', name: '', isOptional: false }]
        }));
    };

    const removeHoliday = (index) => {
        setFormData(prev => ({
            ...prev,
            holidays: prev.holidays.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            setModalError('Policy Name is required.');
            return;
        }
        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-semibold">{policy ? 'Edit' : 'Add'} Holiday List</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100"><X className="h-5 w-5" /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700">List Name</label>
                            <input id="name" name="name" value={formData.name} onChange={handleChange} required className="input" />
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-slate-700">Description</label>
                            <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows="2" className="input" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-md font-medium text-slate-700">Holidays</h3>
                            {formData.holidays.map((holiday, index) => (
                                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center p-2 border rounded-md">
                                    <input type="date" value={holiday.date} onChange={(e) => handleHolidayChange(index, 'date', e.target.value)} className="input" />
                                    <input type="text" placeholder="Holiday Name" value={holiday.name} onChange={(e) => handleHolidayChange(index, 'name', e.target.value)} className="input" />
                                    <div className="flex items-center justify-between">
                                        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={holiday.isOptional} onChange={(e) => handleHolidayChange(index, 'isOptional', e.target.checked)} className="h-4 w-4 rounded" /> Optional</label>
                                        <button type="button" onClick={() => removeHoliday(index)} className="p-1 text-red-500 hover:bg-red-100 rounded-full"><Trash2 size={16} /></button>
                                    </div>
                                </div>
                            ))}
                            <button type="button" onClick={addHoliday} className="btn-secondary text-sm"><Plus size={16} className="mr-1" /> Add Holiday</button>
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

const HolidayList = ({ embedded = false }) => {
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalLoading, setModalLoading] = useState(false);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPolicy, setEditingPolicy] = useState(null);
    const [syncingPolicy, setSyncingPolicy] = useState(null);

    const API_URL = import.meta.env.VITE_API_BASE_URL;

    const fetchPolicies = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/holiday-policies`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            setPolicies(response.data);
        } catch (err) {
            setError('Failed to fetch holiday lists. Please try again later.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPolicies();
    }, [API_URL]);

    const handleAdd = () => {
        setEditingPolicy(null);
        setIsModalOpen(true);
    };

    const handleEdit = (policy) => {
        setEditingPolicy(policy);
        setIsModalOpen(true);
    };

    const handleDelete = async (policyId, policyName) => {
        if (window.confirm(`Are you sure you want to delete the holiday list "${policyName}"?`)) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${API_URL}/holiday-policies/${policyId}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                setPolicies(policies.filter(p => p.id !== policyId));
            } catch (err) {
                setError('Failed to delete holiday list.');
                console.error(err);
            }
        }
    };

    const handleSave = async (policyData) => {
        setModalLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            if (editingPolicy) {
                await axios.put(`${API_URL}/holiday-policies/${editingPolicy.id}`, policyData, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
            } else {
                await axios.post(`${API_URL}/holiday-policies`, policyData, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
            }
            setIsModalOpen(false);
            fetchPolicies();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save holiday list. The name might already exist.');
            console.error(err);
        } finally {
            setModalLoading(false);
        }
    };

    const handleOpenSyncModal = (policy) => {
        setSyncingPolicy(policy);
    };

    const handleConfirmSync = async (policy, selectedEmployeeCodes) => {
        if (selectedEmployeeCodes.length === 0) {
            alert("No employees selected.");
            return;
        }

        setError('');
        let successCount = 0;
        let errorCount = 0;

        try {
            const token = localStorage.getItem('token');
            const BASE_URL = import.meta.env.VITE_API_BASE_URL;

            for (const employeeCode of selectedEmployeeCodes) {
                try {
                    const payload = { holidayList: policy.name };
                    await axios.put(`${BASE_URL}/time-attendence/${employeeCode}`, payload, { headers: { "Authorization": `Bearer ${token}` } });
                    successCount++;
                } catch (updateErr) {
                    console.error(`Failed to update holiday list for ${employeeCode}:`, updateErr);
                    errorCount++;
                }
            }

            alert(`Sync complete!\n- ${successCount} employees updated successfully.\n- ${errorCount} updates failed.`);

        } catch (err) {
            setError('An unexpected error occurred during the sync process.');
            console.error(err);
        }
    };

    const content = (
        <>
            <div className="p-6 md:p-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-slate-800">Holiday Lists</h1>
                    <button onClick={handleAdd} className="btn-primary flex items-center">
                        <Plus className="h-5 w-5 mr-2" />
                        Add List
                    </button>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                        <strong className="font-bold">Error: </strong>
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="flex justify-center items-center h-80"><Loader className="h-8 w-8 animate-spin text-blue-600" /></div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="th-cell">List Name</th>
                                        <th className="th-cell">Description</th>
                                        <th className="th-cell">Holiday Count</th>
                                        <th className="th-cell">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="text-slate-700">
                                    {policies.length > 0 ? (
                                        policies.map(p => (
                                            <tr key={p.id} className="border-b border-slate-200 hover:bg-slate-50">
                                                <td className="td-cell font-medium">{p.name}</td>
                                                <td className="td-cell text-sm text-slate-500 max-w-sm truncate" title={p.description}>{p.description}</td>
                                                <td className="td-cell text-sm text-slate-500">{p.holidays?.length || 0}</td>
                                                <td className="td-cell">
                                                    <div className="flex items-center gap-2">
                                                        <button onClick={() => handleOpenSyncModal(p)} className="p-2 text-slate-500 hover:text-green-600 hover:bg-green-100 rounded-full" title="Sync to employees" disabled={!!syncingPolicy}>
                                                            {syncingPolicy?.id === p.id ? <Loader className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                                                        </button>
                                                        <button onClick={() => handleEdit(p)} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-100 rounded-full" title="Edit" disabled={!!syncingPolicy}>
                                                            <Edit className="h-4 w-4" />
                                                        </button>
                                                        <button onClick={() => handleDelete(p.id, p.name)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-full" title="Delete" disabled={!!syncingPolicy}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="text-center py-10 text-slate-500">
                                                <AlertCircle className="mx-auto h-12 w-12 text-slate-400" />
                                                <h3 className="mt-2 text-sm font-medium text-slate-900">No holiday lists found</h3>
                                                <p className="mt-1 text-sm text-slate-500">Get started by creating a new holiday list.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
            <HolidayListModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} policy={editingPolicy} loading={modalLoading} />
            <SyncPolicyModal isOpen={!!syncingPolicy} onClose={() => setSyncingPolicy(null)} policy={syncingPolicy} onSync={handleConfirmSync} />
        </>
    );

    if (embedded) {
        return content;
    }

    return <DashboardLayout>{content}</DashboardLayout>;
}

export default HolidayList;