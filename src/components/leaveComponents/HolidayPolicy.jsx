import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { PlusCircle, Edit, Trash2, Loader, AlertCircle, X, Check, Calendar, ChevronDown, ChevronUp } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const HolidayPolicyModal = ({ isOpen, onClose, onSave, policy, loading }) => {
    const [formData, setFormData] = useState({ name: '', year: new Date().getFullYear(), holidays: [] });
    const [modalError, setModalError] = useState('');

    useEffect(() => {
        if (policy) {
            setFormData({ ...policy, holidays: policy.holidays || [] });
        } else {
            setFormData({ name: '', year: new Date().getFullYear(), holidays: [{ name: '', date: '', isOptional: false, isPaid: true }] });
        }
        setModalError('');
    }, [policy, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleHolidayChange = (index, e) => {
        const { name, value, type, checked } = e.target;
        const newHolidays = [...formData.holidays];
        newHolidays[index] = { ...newHolidays[index], [name]: type === 'checkbox' ? checked : value };
        setFormData(prev => ({ ...prev, holidays: newHolidays }));
    };

    const addHoliday = () => {
        setFormData(prev => ({ ...prev, holidays: [...prev.holidays, { name: '', date: '', isOptional: false, isPaid: true }] }));
    };

    const removeHoliday = (index) => {
        setFormData(prev => ({ ...prev, holidays: prev.holidays.filter((_, i) => i !== index) }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.year) {
            setModalError('Policy Name and Year are required.');
            return;
        }
        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-semibold">{policy ? 'Edit' : 'Create'} Holiday Policy</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100"><X className="h-5 w-5" /></button>
                </div>
                <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto">
                    <div className="p-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input name="name" value={formData.name} onChange={handleChange} placeholder="Policy Name (e.g., UAE Holidays 2024)" className="input" required />
                            <input name="year" type="number" value={formData.year} onChange={handleChange} placeholder="Year" className="input" required />
                        </div>
                        <div className="pt-4 border-t">
                            <h3 className="font-semibold mb-2">Holidays</h3>
                            <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                                {formData.holidays.map((holiday, index) => (
                                    <div key={index} className="grid grid-cols-12 gap-2 items-center">
                                        <input name="name" value={holiday.name ?? ''} onChange={(e) => handleHolidayChange(index, e)} placeholder="Holiday Name" className="input col-span-4" />
                                        <input name="date" type="date" value={holiday.date ?? ''} onChange={(e) => handleHolidayChange(index, e)} className="input col-span-3" />
                                        <label className="col-span-2 flex items-center gap-1 text-sm"><input type="checkbox" name="isOptional" checked={!!holiday.isOptional} onChange={(e) => handleHolidayChange(index, e)} /> Optional</label>
                                        <label className="col-span-2 flex items-center gap-1 text-sm"><input type="checkbox" name="isPaid" checked={!!holiday.isPaid} onChange={(e) => handleHolidayChange(index, e)} /> Paid</label>
                                        <button type="button" onClick={() => removeHoliday(index)} className="p-2 text-red-500 hover:bg-red-100 rounded-full col-span-1"><Trash2 size={16} /></button>
                                    </div>
                                ))}
                            </div>
                            <button type="button" onClick={addHoliday} className="btn-secondary text-sm mt-2"><PlusCircle size={16} className="mr-2" />Add Holiday</button>
                        </div>
                        {modalError && <p className="text-red-500 text-sm">{modalError}</p>}
                    </div>
                    <div className="p-4 border-t bg-slate-50 flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>Cancel</button>
                        <button type="submit" className="btn-primary flex items-center" disabled={loading}>
                            {loading && <Loader className="animate-spin h-4 w-4 mr-2" />} Save Policy
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const PolicyCard = ({ policy, onEdit, onDelete }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="bg-white border border-slate-200 rounded-lg">
            <div className="p-4 flex justify-between items-center cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
                <div>
                    <h3 className="text-lg font-semibold text-slate-800">{policy.name}</h3>
                    <p className="text-sm text-slate-500">{policy.year} - {policy.holidays.length} holidays</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={(e) => { e.stopPropagation(); onEdit(policy); }} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-full"><Edit size={16} /></button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(policy.id); }} className="p-1.5 text-red-600 hover:bg-red-100 rounded-full"><Trash2 size={16} /></button>
                    {isOpen ? <ChevronUp className="h-5 w-5 text-slate-500" /> : <ChevronDown className="h-5 w-5 text-slate-500" />}
                </div>
            </div>
            {isOpen && (
                <div className="border-t border-slate-200 p-4">
                    <ul className="space-y-2">
                        {policy.holidays.map(holiday => (
                            <li key={holiday.id} className="flex justify-between items-center p-2 bg-slate-50 rounded-md text-sm">
                                <div>
                                    <span className="font-medium text-slate-700">{holiday.name}</span>
                                    <span className="text-slate-500 ml-2">({new Date(holiday.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })})</span>
                                </div>
                                <div className="flex gap-3">
                                    <span className={`px-2 py-0.5 text-xs rounded-full ${holiday.isOptional === true ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>{holiday.isOptional === true ? 'Optional' : 'Mandatory'}</span>
                                    <span className={`px-2 py-0.5 text-xs rounded-full ${holiday.isPaid === true ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{holiday.isPaid === true ? 'Paid' : 'Unpaid'}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

const HolidayPolicy = () => {
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
            const response = await axios.get(`${API_URL}/holiday-policies`, { headers: { "Authorization": `Bearer ${token}` } });
            setPolicies(response.data.sort((a, b) => b.year - a.year));
        } catch (err) {
            setError('Failed to fetch holiday policies.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPolicies();
    }, [fetchPolicies]);

    const handleSave = async (policyData) => {
        setModalLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { "Authorization": `Bearer ${token}` };

            if (editingPolicy) {
                // --- Complex Update Logic ---
                // 1. Update policy name and year
                await axios.put(`${API_URL}/holiday-policies/${editingPolicy.id}`, { name: policyData.name, year: policyData.year }, { headers });

                const originalHolidays = editingPolicy.holidays || [];
                const updatedHolidays = policyData.holidays || [];

                const originalHolidayIds = new Set(originalHolidays.map(h => h.id));
                const updatedHolidayIds = new Set(updatedHolidays.filter(h => h.id).map(h => h.id));

                // 2. Find and delete removed holidays
                const holidaysToDelete = originalHolidays.filter(h => !updatedHolidayIds.has(h.id));
                for (const holiday of holidaysToDelete) {
                    await axios.delete(`${API_URL}/holidays/${holiday.id}`, { headers });
                }

                // 3. Find and update existing holidays or add new ones
                for (const holiday of updatedHolidays) {
                    const holidayPayload = { name: holiday.name, date: holiday.date, isOptional: holiday.isOptional, isPaid: holiday.isPaid };
                    if (holiday.id) { // Existing holiday, so update it
                        // Check if it has actually changed to avoid unnecessary API calls
                        const originalHoliday = originalHolidays.find(h => h.id === holiday.id);
                        if (JSON.stringify(originalHoliday) !== JSON.stringify({ ...originalHoliday, ...holidayPayload })) {
                             await axios.put(`${API_URL}/holidays/${holiday.id}`, holidayPayload, { headers });
                        }
                    } else { // New holiday, so add it to the policy
                        await axios.post(`${API_URL}/holiday-policies/${editingPolicy.id}/holidays`, holidayPayload, { headers });
                    }
                }

            } else {
                // --- Create Logic (remains the same) ---
                await axios.post(`${API_URL}/holiday-policies`, policyData, { headers });
            }

            setIsModalOpen(false);
            fetchPolicies();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to save policy. Please check the data and try again.');
            console.error("Save Error:", err);
        } finally {
            setModalLoading(false);
        }
    };

    const handleDelete = async (policyId) => {
        if (window.confirm('Are you sure you want to delete this holiday policy?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${API_URL}/holiday-policies/${policyId}`, { headers: { "Authorization": `Bearer ${token}` } });
                fetchPolicies();
            } catch (err) {
                alert('Failed to delete policy.');
            }
        }
    };

    const handleAdd = () => {
        setEditingPolicy(null);
        setIsModalOpen(true);
    };

    const handleEdit = (policy) => {
        setEditingPolicy(policy);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">Holiday Policies</h2>
                <button onClick={handleAdd} className="btn-primary flex items-center gap-2">
                    <PlusCircle size={18} /> Create Policy
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center"><Loader className="animate-spin" /></div>
            ) : error ? (
                <p className="text-red-500">{error}</p>
            ) : policies.length === 0 ? (
                <div className="text-center py-10 text-slate-500 border-2 border-dashed rounded-lg">
                    <Calendar className="mx-auto h-12 w-12 text-slate-400" />
                    <h3 className="mt-2 text-sm font-medium text-slate-900">No Holiday Policies Found</h3>
                    <p className="mt-1 text-sm">Get started by creating a new holiday policy.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {policies.map(policy => (
                        <PolicyCard key={policy.id} policy={policy} onEdit={handleEdit} onDelete={handleDelete} />
                    ))}
                </div>
            )}

            <HolidayPolicyModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                policy={editingPolicy}
                loading={modalLoading}
            />
        </div>
    );
}

export default HolidayPolicy;
