import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { Search, PlusCircle, Edit, Trash2, Loader, AlertCircle, X, UserPlus } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

import Modal from '../components/Modal';

// --- Customer Form Component ---
const CustomerForm = ({ customer, onSave, onCancel, isSubmitting }) => {
    const [formData, setFormData] = useState(customer || { name: '', email: '', phone: '' });

    useEffect(() => {
        setFormData(customer || { name: '', email: '', phone: '' });
    }, [customer]);

    const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = e => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700">Name</label>
                <input id="name" name="name" value={formData.name} onChange={handleChange} required className="input mt-1" />
            </div>
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email</label>
                <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} className="input mt-1" />
            </div>
            <div>
                <label htmlFor="phone" className="block text-sm font-medium text-slate-700">Phone</label>
                <input id="phone" name="phone" value={formData.phone} onChange={handleChange} className="input mt-1" />
            </div>
            <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={onCancel} className="btn-secondary" disabled={isSubmitting}>Cancel</button>
                <button type="submit" className="btn-primary flex items-center" disabled={isSubmitting}>
                    {isSubmitting && <Loader className="animate-spin h-4 w-4 mr-2" />}
                    Save Customer
                </button>
            </div>
        </form>
    );
};

// --- Auth Hook for POS Roles ---
const usePosAuth = () => {
    const roles = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem('roles') || '[]');
        } catch { return []; }
    }, []);

    const isSuperAdmin = roles.includes('SUPER_ADMIN');
    const isPosAdmin = roles.includes('POS_ADMIN') || isSuperAdmin;
    const canManage = roles.includes('POS_MANAGER') || roles.includes('POS_CASHIER') || isPosAdmin;

    return { isPosAdmin, canManage };
};

const CustomersView = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { isPosAdmin, canManage } = usePosAuth();

    const fetchCustomers = useCallback(() => {
        setLoading(true);
        const token = localStorage.getItem('token');
        axios.get(`${API_URL}/pos/customers`, { headers: { "Authorization": `Bearer ${token}` } })
            .then(res => setCustomers(res.data))
            .catch(() => setError('Failed to fetch customers.'))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

    const handleAdd = () => { setEditingCustomer(null); setIsModalOpen(true); };
    const handleEdit = (customer) => { setEditingCustomer(customer); setIsModalOpen(true); };
    const handleCloseModal = () => { setIsModalOpen(false); setEditingCustomer(null); };

    const handleSave = async (customerData) => {
        setIsSubmitting(true);
        const token = localStorage.getItem('token');
        const method = customerData.id ? 'put' : 'post';
        const url = customerData.id ? `${API_URL}/pos/customers/${customerData.id}` : `${API_URL}/pos/customers`;

        try {
            await axios[method](url, customerData, {
                headers: { Authorization: `Bearer ${token}` }
                });
            fetchCustomers();
            handleCloseModal();
        } catch (err) {
            alert(`Error: ${err.response?.data?.message || 'Could not save customer.'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (customerId) => {
        if (window.confirm('Are you sure you want to delete this customer?')) {
            const token = localStorage.getItem('token');
            try {
                await axios.delete(`${API_URL}/pos/customers/${customerId}`, { headers: { "Authorization": `Bearer ${token}` } });
                fetchCustomers();
            } catch (err) {
                alert('Failed to delete customer.');
            }
        }
    };

    const filteredCustomers = useMemo(() =>
        customers.filter(c =>
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.phone || '').includes(searchTerm)
        ), [customers, searchTerm]);

    return (
        <div className="p-6 md:p-8">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Customers</h1>
                    <p className="text-slate-500 mt-1">Manage your customer database.</p>
                </div>
                {canManage && (
                    <button onClick={handleAdd} className="btn-primary flex items-center gap-2">
                        <UserPlus size={18} /> Add Customer
                    </button>
                )}
            </div>

            <div className="relative mb-4">
                <input type="text" placeholder="Search by name, email, or phone..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="input w-full max-w-sm pl-10" />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="th-cell">Name</th><th className="th-cell">Email</th><th className="th-cell">Phone</th><th className="th-cell text-right">Loyalty Points</th>
                                {canManage && <th className="th-cell">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="text-slate-700">
                            {loading ? (
                                <tr><td colSpan={canManage ? 5 : 4} className="text-center py-10"><Loader className="h-8 w-8 animate-spin text-blue-600 mx-auto" /></td></tr>
                            ) : error ? (
                                <tr><td colSpan={canManage ? 5 : 4} className="text-center py-10 text-red-500">{error}</td></tr>
                            ) : filteredCustomers.length > 0 ? (
                                filteredCustomers.map(customer => (
                                    <tr key={customer.id} className="border-b border-slate-200 hover:bg-slate-50">
                                        <td className="td-cell font-medium">{customer.name}</td><td className="td-cell">{customer.email || '-'}</td><td className="td-cell">{customer.phone || '-'}</td><td className="td-cell text-right">{customer.loyaltyPoints}</td>
                                        {canManage && (
                                            <td className="td-cell">
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => handleEdit(customer)} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-full" title="Edit"><Edit size={16} /></button>
                                                    {isPosAdmin && <button onClick={() => handleDelete(customer.id)} className="p-1.5 text-red-600 hover:bg-red-100 rounded-full" title="Delete"><Trash2 size={16} /></button>}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={canManage ? 5 : 4} className="text-center py-10 text-slate-500">No customers found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingCustomer ? 'Edit Customer' : 'Add New Customer'}>
                <CustomerForm customer={editingCustomer} onSave={handleSave} onCancel={handleCloseModal} isSubmitting={isSubmitting} />
            </Modal>
        </div>
    );
}

export default CustomersView;
