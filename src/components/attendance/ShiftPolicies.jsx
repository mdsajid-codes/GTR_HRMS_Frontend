import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { PlusCircle, Edit, Trash2, Loader, AlertCircle, X, Check } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const ShiftPolicyModal = ({ isOpen, onClose, onSave, policy, loading }) => {
    const [formData, setFormData] = useState({
        policyName: '',
        shiftStartTime: '09:00',
        shiftEndTime: '18:00',
        gracePeriodMinutes: 15,
        graceHalfDayMinutes: 120,
        isDefault: false,
        description: ''
    });

    useEffect(() => {
        if (policy) {
            setFormData({
                policyName: policy.policyName || '',
                shiftStartTime: policy.shiftStartTime || '09:00',
                shiftEndTime: policy.shiftEndTime || '18:00',
                gracePeriodMinutes: policy.gracePeriodMinutes || 15,
                graceHalfDayMinutes: policy.graceHalfDayMinutes || 120,
                isDefault: policy.isDefault || false,
                description: policy.description || ''
            });
        } else {
            // Reset for new policy
            setFormData({ policyName: '', shiftStartTime: '09:00', shiftEndTime: '18:00', gracePeriodMinutes: 15, graceHalfDayMinutes: 120, isDefault: false, description: '' });
        }
    }, [policy, isOpen]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
            <div className="bg-card text-card-foreground rounded-lg shadow-xl w-full max-w-lg">
                <div className="p-4 border-b border-border flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-foreground">{policy ? 'Edit' : 'Add'} Shift Policy</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-foreground-muted hover:bg-background-muted"><X className="h-5 w-5" /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2"><input name="policyName" value={formData.policyName} onChange={handleChange} placeholder="Policy Name" className="input bg-background-muted border-border text-foreground" required /></div>
                        <div><label className="label text-foreground-muted">Start Time</label><input name="shiftStartTime" type="time" value={formData.shiftStartTime} onChange={handleChange} className="input bg-background-muted border-border text-foreground" required /></div>
                        <div><label className="label text-foreground-muted">End Time</label><input name="shiftEndTime" type="time" value={formData.shiftEndTime} onChange={handleChange} className="input bg-background-muted border-border text-foreground" required /></div>
                        <div><label className="label text-foreground-muted">Grace Period (mins)</label><input name="gracePeriodMinutes" type="number" value={formData.gracePeriodMinutes} onChange={handleChange} className="input bg-background-muted border-border text-foreground" required /></div>
                        <div><label className="label text-foreground-muted">Half-Day After (mins)</label><input name="graceHalfDayMinutes" type="number" value={formData.graceHalfDayMinutes} onChange={handleChange} className="input bg-background-muted border-border text-foreground" required /></div>
                        <div className="md:col-span-2"><textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" className="input bg-background-muted border-border text-foreground" /></div>
                        <div className="md:col-span-2 flex items-center gap-2">
                            <input type="checkbox" id="isDefault" name="isDefault" checked={formData.isDefault} onChange={handleChange} className="h-4 w-4 rounded border-border text-primary" />
                            <label htmlFor="isDefault" className="text-sm font-medium text-foreground-muted">Set as Default Policy</label>
                        </div>
                    </div>
                    <div className="p-4 border-t border-border bg-background-muted flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>Cancel</button>
                        <button type="submit" className="btn-primary flex items-center" disabled={loading}>
                            {loading ? <Loader className="animate-spin h-4 w-4 mr-2" /> : <Check className="h-4 w-4 mr-2" />} Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ShiftPolicies = () => {
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPolicy, setEditingPolicy] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);

    const fetchPolicies = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/shift-policies`, { headers: { "Authorization": `Bearer ${token}` } });
            setPolicies(response.data);
        } catch (err) { setError('Failed to fetch shift policies.'); } finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchPolicies(); }, [fetchPolicies]);

    const handleSave = async (policyData) => {
        setModalLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { "Authorization": `Bearer ${token}` };
            if (editingPolicy) {
                await axios.put(`${API_URL}/shift-policies/${editingPolicy.id}`, policyData, { headers });
            } else {
                await axios.post(`${API_URL}/shift-policies`, policyData, { headers });
            }
            setIsModalOpen(false);
            fetchPolicies();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to save policy.');
        } finally {
            setModalLoading(false);
        }
    };

    const handleDelete = async (policyId) => {
        if (window.confirm('Are you sure you want to delete this policy?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${API_URL}/shift-policies/${policyId}`, { headers: { "Authorization": `Bearer ${token}` } });
                fetchPolicies();
            } catch (err) { alert('Failed to delete policy.'); }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">Shift Policies</h2>
                <button onClick={() => { setEditingPolicy(null); setIsModalOpen(true); }} className="btn-primary flex items-center gap-2">
                    <PlusCircle size={18} /> Add Policy
                </button>
            </div>

            {loading ? <div className="flex justify-center"><Loader className="animate-spin" /></div> : error ? <p className="text-red-500">{error}</p> : (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="th-cell">Policy Name</th>
                                    <th className="th-cell">Shift Time</th>
                                    <th className="th-cell">Grace Period</th>
                                    <th className="th-cell">Default</th>
                                    <th className="th-cell">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-slate-700">
                                {policies.map(policy => (
                                    <tr key={policy.id} className="hover:bg-slate-50">
                                        <td className="td-cell font-medium">{policy.policyName}</td>
                                        <td className="td-cell">{policy.shiftStartTime} - {policy.shiftEndTime}</td>
                                        <td className="td-cell">{policy.gracePeriodMinutes} mins</td>
                                        <td className="td-cell">{policy.isDefault ? <Check className="text-green-600" /> : <X className="text-red-500" />}</td>
                                        <td className="td-cell">
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => { setEditingPolicy(policy); setIsModalOpen(true); }} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-full"><Edit size={16} /></button>
                                                <button onClick={() => handleDelete(policy.id)} className="p-1.5 text-red-600 hover:bg-red-100 rounded-full"><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            <ShiftPolicyModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} policy={editingPolicy} loading={modalLoading} />
        </div>
    );
};

export default ShiftPolicies;