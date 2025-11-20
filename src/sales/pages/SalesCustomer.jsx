import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { PlusCircle, Search, AlertCircle, Loader, Edit, Trash2 } from 'lucide-react';
import CustomerForm from './CustomerFormModal';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const SalesCustomer = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);

    const authHeaders = useMemo(() => ({ "Authorization": `Bearer ${localStorage.getItem('token')}` }), []);

    const fetchCustomers = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.get(`${API_URL}/sales/customers`, { headers: authHeaders });
            setCustomers(response.data || []);
        } catch (err) {
            setError('Failed to fetch customers. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [authHeaders]);

    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    const handleAddNew = () => {
        setEditingCustomer(null);
        setIsFormOpen(true);
    };

    const handleEdit = (customer) => {
        setEditingCustomer(customer);
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingCustomer(null);
    };

    const handleSave = async (customerData) => {
        setModalLoading(true);
        const isEditing = !!editingCustomer;
        const url = isEditing ? `${API_URL}/sales/customers/${editingCustomer.id}` : `${API_URL}/sales/customers`;
        const method = isEditing ? 'put' : 'post';

        try {
            await axiosmethod;
            await fetchCustomers();
            handleCloseForm();
        } catch (err) {
            alert(`Error: ${err.response?.data?.message || 'Failed to save customer.'}`);
        } finally {
            setModalLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this customer?')) {
            try {
                await axios.delete(`${API_URL}/sales/customers/${id}`, { headers: authHeaders });
                await fetchCustomers();
            } catch (err) {
                alert(`Error: ${err.response?.data?.message || 'Failed to delete customer.'}`);
            }
        }
    };

    const filteredCustomers = useMemo(() =>
        customers.filter(c =>
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
        ), [customers, searchTerm]);

    if (isFormOpen) {
        return (
            <CustomerForm
                onSave={handleSave}
                onCancel={handleCloseForm}
                loading={modalLoading}
                customer={editingCustomer}
            />
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-foreground">Customers</h1>
                <div className="flex items-center gap-2">
                    <div className="relative"><input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input w-full sm:w-64 pr-10 bg-background-muted border-border" /><Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-muted" /></div>
                    <button onClick={handleAddNew} className="btn-primary flex items-center gap-2"><PlusCircle size={18} /> New Customer</button>
                </div>
            </div>

            {error && <p className="text-red-500 mb-4">{error}</p>}

            <div className="bg-card text-card-foreground rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-background-muted">
                            <tr>
                                <th className="th-cell">Code</th><th className="th-cell">Name</th><th className="th-cell">Email</th><th className="th-cell">Phone</th><th className="th-cell">Status</th><th className="th-cell">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-foreground-muted">
                            {loading ? (
                                <tr><td colSpan="6" className="text-center py-10"><Loader className="animate-spin h-8 w-8 text-primary mx-auto" /></td></tr>
                            ) : filteredCustomers.length === 0 ? (
                                <tr><td colSpan="6" className="text-center py-16"><AlertCircle className="mx-auto h-12 w-12 text-foreground-muted/50" /><h3 className="mt-2 text-sm font-medium text-foreground">No Customers Found</h3><p className="mt-1 text-sm">Get started by creating a new customer.</p></td></tr>
                            ) : (filteredCustomers.map(c => (
                                <tr key={c.id} className="border-b border-border last:border-b-0 hover:bg-background-muted">
                                    <td className="td-cell font-mono text-xs">{c.code}</td>
                                    <td className="td-cell font-medium text-foreground">{c.name}</td>
                                    <td className="td-cell">{c.email || 'N/A'}</td>
                                    <td className="td-cell">{c.phone || 'N/A'}</td>
                                    <td className="td-cell"><span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${c.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{c.status?.toLowerCase()}</span></td>
                                    <td className="td-cell"><div className="flex items-center gap-2"><button onClick={() => handleEdit(c)} className="p-1.5 hover:text-primary"><Edit size={16} /></button><button onClick={() => handleDelete(c.id)} className="p-1.5 hover:text-red-500"><Trash2 size={16} /></button></div></td>
                                </tr>
                            )))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}

export default SalesCustomer;
