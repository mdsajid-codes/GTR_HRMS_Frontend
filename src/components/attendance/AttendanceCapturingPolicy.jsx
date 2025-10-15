import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2, Loader, AlertCircle, X } from 'lucide-react';

const CapturingPolicyModal = ({ isOpen, onClose, onSave, policy, loading }) => {
    const initialFormState = {
        policyName: '',
        graceTimeMinutes: 0,
        halfDayThresholdMinutes: 0,
        allowMultiplePunches: false,
        lateMarkRules: '',
    };
    const [formData, setFormData] = useState(initialFormState);
    const [modalError, setModalError] = useState('');

    useEffect(() => {
        if (policy) {
            setFormData({
                policyName: policy.policyName || '',
                graceTimeMinutes: policy.graceTimeMinutes || 0,
                halfDayThresholdMinutes: policy.halfDayThresholdMinutes || 0,
                allowMultiplePunches: policy.allowMultiplePunches || false,
                lateMarkRules: policy.lateMarkRules || '',
            });
        } else {
            setFormData(initialFormState);
        }
        setModalError('');
    }, [policy, isOpen]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.policyName.trim()) {
            setModalError('Policy Name is required.');
            return;
        }
        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-semibold">{policy ? 'Edit' : 'Add'} Capturing Policy</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100"><X className="h-5 w-5" /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
                        <div className="md:col-span-2"><label htmlFor="policyName" className="label">Policy Name</label><input id="policyName" name="policyName" value={formData.policyName} onChange={handleChange} required className="input" /></div>
                        <div><label htmlFor="graceTimeMinutes" className="label">Grace Time (Minutes)</label><input id="graceTimeMinutes" name="graceTimeMinutes" type="number" value={formData.graceTimeMinutes} onChange={handleChange} className="input" /></div>
                        <div><label htmlFor="halfDayThresholdMinutes" className="label">Half-Day Threshold (Minutes)</label><input id="halfDayThresholdMinutes" name="halfDayThresholdMinutes" type="number" value={formData.halfDayThresholdMinutes} onChange={handleChange} className="input" /></div>
                        <div className="md:col-span-2"><label htmlFor="lateMarkRules" className="label">Late Mark Rules</label><input id="lateMarkRules" name="lateMarkRules" value={formData.lateMarkRules} onChange={handleChange} className="input" placeholder="e.g., 3 lates = 1 half-day" /></div>
                        <div className="md:col-span-2 pt-2"><label className="inline-flex items-center"><input type="checkbox" name="allowMultiplePunches" checked={formData.allowMultiplePunches} onChange={handleChange} className="h-4 w-4 rounded" /><span className="ml-2 text-sm">Allow Multiple Punches</span></label></div>
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

const AttendanceCapturingPolicy = () => {
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalLoading, setModalLoading] = useState(false);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPolicy, setEditingPolicy] = useState(null);

    const API_URL = `${import.meta.env.VITE_API_BASE_URL}/attendance-capturing-policies`;

    const fetchPolicies = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(API_URL, { headers: { "Authorization": `Bearer ${token}` } });
            setPolicies(response.data);
        } catch (err) {
            setError('Failed to fetch policies.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPolicies(); }, []);

    const handleAdd = () => { setEditingPolicy(null); setIsModalOpen(true); };
    const handleEdit = (policy) => { setEditingPolicy(policy); setIsModalOpen(true); };

    const handleDelete = async (policyId, policyName) => {
        if (window.confirm(`Are you sure you want to delete the policy "${policyName}"?`)) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${API_URL}/${policyId}`, { headers: { "Authorization": `Bearer ${token}` } });
                setPolicies(policies.filter(p => p.id !== policyId));
            } catch (err) {
                setError('Failed to delete policy.');
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
                await axios.put(`${API_URL}/${editingPolicy.id}`, policyData, { headers: { "Authorization": `Bearer ${token}` } });
            } else {
                await axios.post(API_URL, policyData, { headers: { "Authorization": `Bearer ${token}` } });
            }
            setIsModalOpen(false);
            fetchPolicies();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save policy.');
            console.error(err);
        } finally {
            setModalLoading(false);
        }
    };

    return (
        <>
            <div className="p-4 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                    <button onClick={handleAdd} className="btn-primary flex items-center ml-auto"><Plus className="h-5 w-5 mr-2" /> Add Policy</button>
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
                                        <th className="th-cell">Policy Name</th>
                                        <th className="th-cell">Grace Time</th>
                                        <th className="th-cell">Multiple Punches</th>
                                        <th className="th-cell">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="text-slate-700">
                                    {policies.length > 0 ? (
                                        policies.map(p => (
                                            <tr key={p.id} className="border-b border-slate-200 hover:bg-slate-50">
                                                <td className="td-cell font-medium">{p.policyName}</td>
                                                <td className="td-cell">{p.graceTimeMinutes} min</td>
                                                <td className="td-cell">{p.allowMultiplePunches ? 'Yes' : 'No'}</td>
                                                <td className="td-cell">
                                                    <div className="flex items-center gap-2">
                                                        <button onClick={() => handleEdit(p)} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-100 rounded-full" title="Edit"><Edit className="h-4 w-4" /></button>
                                                        <button onClick={() => handleDelete(p.id, p.policyName)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-full" title="Delete"><Trash2 className="h-4 w-4" /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="4" className="text-center py-10 text-slate-500"><AlertCircle className="mx-auto h-12 w-12 text-slate-400" /><h3 className="mt-2 text-sm font-medium">No policies found</h3><p className="mt-1 text-sm">Get started by creating a new capturing policy.</p></td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
            <CapturingPolicyModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} policy={editingPolicy} loading={modalLoading} />
        </>
    );
}

export default AttendanceCapturingPolicy;