import React, { useState, useEffect, useCallback } from 'react';
import { Edit, Trash2, PlusCircle, Loader, X } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error("No authentication token found.");
    return { "Authorization": `Bearer ${token}` };
};

const api = {
    getBankAccounts: async () => {
        const response = await axios.get(`${API_URL}/company-bank-accounts`, { headers: getAuthHeaders() });
        return response.data;
    },
    createBankAccount: async (data) => {
        const response = await axios.post(`${API_URL}/company-bank-accounts`, data, { headers: getAuthHeaders() });
        return response.data;
    },
    updateBankAccount: async (id, data) => {
        const response = await axios.put(`${API_URL}/company-bank-accounts/${id}`, data, { headers: getAuthHeaders() });
        return response.data;
    },
    deleteBankAccount: async (id) => {
        await axios.delete(`${API_URL}/company-bank-accounts/${id}`, { headers: getAuthHeaders() });
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

const BankAccountForm = ({ item, onSave, onCancel, saving }) => {
    const [formData, setFormData] = useState(item || { bankName: '', accountNumber: '', ifscCode: '', accountHolderName: '', branchName: '', primary: false });
    const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
    const handleSubmit = e => { e.preventDefault(); onSave(formData); };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" name="bankName" value={formData.bankName} onChange={handleChange} placeholder="Bank Name" className="input" required />
            <input type="text" name="accountHolderName" value={formData.accountHolderName} onChange={handleChange} placeholder="Account Holder Name" className="input" required />
            <input type="text" name="accountNumber" value={formData.accountNumber} onChange={handleChange} placeholder="Account Number" className="input" required />
            <input type="text" name="ifscCode" value={formData.ifscCode} onChange={handleChange} placeholder="IFSC Code" className="input" required />
            <input type="text" name="branchName" value={formData.branchName} onChange={handleChange} placeholder="Branch Name" className="input" />
            <label className="flex items-center gap-2">
                <input type="checkbox" name="primary" checked={formData.primary} onChange={handleChange} className="h-4 w-4 rounded" />
                <span>Set as primary account</span>
            </label>
            <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={onCancel} className="btn-secondary" disabled={saving}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={saving}>
                    {saving ? <Loader className="animate-spin h-5 w-5" /> : 'Save Account'}
                </button>
            </div>
        </form>
    );
};

const BankDetails = () => {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState(null);

    const fetchAccounts = useCallback(() => {
        setLoading(true);
        api.getBankAccounts()
            .then(data => setAccounts(data))
            .catch(() => setError('Failed to load bank accounts.'))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        fetchAccounts();
    }, [fetchAccounts]);

    const handleAdd = () => { setEditingAccount(null); setIsModalOpen(true); };
    const handleEdit = (account) => { setEditingAccount(account); setIsModalOpen(true); };
    const handleCloseModal = () => { setIsModalOpen(false); setEditingAccount(null); };

    const handleSave = async (data) => {
        setSaving(true);
        try {
            if (data.id) {
                await api.updateBankAccount(data.id, data);
            } else {
                await api.createBankAccount(data);
            }
            fetchAccounts();
            handleCloseModal();
        } catch (err) {
            alert(`Error: ${err.response?.data?.message || 'Failed to save account.'}`);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this bank account?')) {
            try {
                await api.deleteBankAccount(id);
                fetchAccounts();
            } catch (err) {
                alert(`Error: ${err.response?.data?.message || 'Failed to delete account.'}`);
            }
        }
    };

    if (loading) return <div className="flex justify-center p-10"><Loader className="animate-spin text-blue-600" /></div>;
    if (error) return <div className="text-center text-red-500 p-4">{error}</div>;

    return (
        <div className="p-6 bg-white rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-slate-800">Bank Accounts</h3>
                <button onClick={handleAdd} className="btn-primary flex items-center gap-2"><PlusCircle size={16} /> Add Account</button>
            </div>
            <div className="overflow-x-auto border rounded-lg">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="th-cell">Bank Name</th><th className="th-cell">Account Number</th><th className="th-cell">IFSC</th><th className="th-cell">Primary</th><th className="th-cell">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {accounts.map(acc => (
                            <tr key={acc.id} className="hover:bg-slate-50">
                                <td className="td-cell font-medium">{acc.bankName}</td><td className="td-cell">{acc.accountNumber}</td><td className="td-cell">{acc.ifscCode}</td><td className="td-cell">{acc.primary ? 'Yes' : 'No'}</td>
                                <td className="td-cell space-x-2">
                                    <button onClick={() => handleEdit(acc)} className="p-1 text-blue-600 hover:text-blue-800"><Edit size={16} /></button>
                                    <button onClick={() => handleDelete(acc.id)} className="p-1 text-red-600 hover:text-red-800"><Trash2 size={16} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingAccount ? 'Edit Bank Account' : 'Add Bank Account'}>
                <BankAccountForm item={editingAccount} onSave={handleSave} onCancel={handleCloseModal} saving={saving} />
            </Modal>
        </div>
    );
}

export default BankDetails;
