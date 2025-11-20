import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { PlusCircle, Search, AlertCircle, Loader, Edit, Trash2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import QuotationForm from './QuotationForm';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const Quotation = () => {
    const [quotations, setQuotations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingQuotation, setEditingQuotation] = useState(null);
    const [formLoading, setFormLoading] = useState(false);

    const authHeaders = useMemo(() => ({ "Authorization": `Bearer ${localStorage.getItem('token')}` }), []);

    const fetchQuotations = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.get(`${API_URL}/sales/quotations`, { headers: authHeaders });
            setQuotations(response.data || []);
        } catch (err) {
            setError('Failed to fetch quotations. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [authHeaders]);

    useEffect(() => {
        fetchQuotations();
    }, [fetchQuotations]);

    const handleAddNew = () => {
        setEditingQuotation(null);
        setIsFormOpen(true);
    };

    const handleEdit = (quotation) => {
        setEditingQuotation(quotation);
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingQuotation(null);
    };

    const handleSave = async (formData) => {
        setFormLoading(true);
        const isEditing = !!editingQuotation;
        const url = isEditing ? `${API_URL}/sales/quotations/${editingQuotation.id}` : `${API_URL}/sales/quotations`;
        const method = isEditing ? 'put' : 'post';

        try {
            await axiosmethod;
            await fetchQuotations();
            handleCloseForm();
        } catch (err) {
            alert(`Error: ${err.response?.data?.message || 'Failed to save quotation.'}`);
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this quotation?')) {
            try {
                await axios.delete(`${API_URL}/sales/quotations/${id}`, { headers: authHeaders });
                await fetchQuotations();
            } catch (err) {
                alert(`Error: ${err.response?.data?.message || 'Failed to delete quotation.'}`);
            }
        }
    };

    const filteredQuotations = useMemo(() =>
        quotations.filter(q =>
            q.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            q.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
        ), [quotations, searchTerm]);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-foreground">Sales Quotations</h1>
                <div className="flex items-center gap-2">
                    <div className="relative"><input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input w-full sm:w-64 pr-10 bg-background-muted border-border" /><Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-muted" /></div>
                    <button onClick={handleAddNew} className="btn-primary flex items-center gap-2"><PlusCircle size={18} /> New Quotation</button>
                </div>
            </div>

            {error && <p className="text-red-500 mb-4">{error}</p>}

            <div className="bg-card text-card-foreground rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-background-muted">
                            <tr>
                                <th className="th-cell">Quotation #</th><th className="th-cell">Customer</th><th className="th-cell">Date</th><th className="th-cell">Expiry Date</th><th className="th-cell">Status</th><th className="th-cell text-right">Amount</th><th className="th-cell">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-foreground-muted">
                            {loading ? (
                                <tr><td colSpan="6" className="text-center py-10"><Loader className="animate-spin h-8 w-8 text-primary mx-auto" /></td></tr>
                            ) : filteredQuotations.length === 0 ? (
                                <tr><td colSpan="7" className="text-center py-16"><AlertCircle className="mx-auto h-12 w-12 text-foreground-muted/50" /><h3 className="mt-2 text-sm font-medium text-foreground">No Quotations Found</h3><p className="mt-1 text-sm">Get started by creating a new quotation.</p></td></tr>
                            ) : (filteredQuotations.map(q => (
                                <tr key={q.id} className="border-b border-border last:border-b-0 hover:bg-background-muted">
                                    <td className="td-cell font-mono text-xs">{q.number}</td>
                                    <td className="td-cell font-medium text-foreground">{q.customerName}</td>
                                    <td className="td-cell">{new Date(q.date).toLocaleDateString()}</td>
                                    <td className="td-cell">{new Date(q.expiryDate).toLocaleDateString()}</td>
                                    <td className="td-cell"><span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${q.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>{q.status?.toLowerCase()}</span></td>
                                    <td className="td-cell text-right font-mono">{q.grandTotal?.toFixed(2)}</td>
                                    <td className="td-cell"><div className="flex items-center gap-2"><button onClick={() => handleEdit(q)} className="p-1.5 hover:text-primary"><Edit size={16} /></button><button onClick={() => handleDelete(q.id)} className="p-1.5 hover:text-red-500"><Trash2 size={16} /></button></div></td>
                                </tr>
                            )))}
                        </tbody>
                    </table>
                </div>
            </div>

            <AnimatePresence>
                {isFormOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-40" onClick={handleCloseForm} />
                        <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="fixed top-0 right-0 h-full w-full max-w-3xl bg-card shadow-2xl z-50 flex flex-col">
                            <QuotationForm quotation={editingQuotation} onSave={handleSave} onCancel={handleCloseForm} loading={formLoading} />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

export default Quotation;