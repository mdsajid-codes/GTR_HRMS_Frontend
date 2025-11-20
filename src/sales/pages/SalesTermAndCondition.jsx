import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { PlusCircle, Edit, Trash2, Loader, AlertCircle, Save, X, CheckCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const TermAndConditionModal = ({ isOpen, onClose, onSave, loading, term }) => {
    const [name, setName] = useState('');
    const [content, setContent] = useState('');
    const [isDefault, setIsDefault] = useState(false);

    useEffect(() => {
        if (term) {
            setName(term.name);
            setContent(term.content);
            setIsDefault(term.default);
        } else {
            setName('');
            setContent('');
            setIsDefault(false);
        }
    }, [term, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ name, content, isDefault });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
            <div className="bg-card text-card-foreground rounded-lg shadow-xl w-full max-w-2xl">
                <div className="p-4 border-b border-border flex justify-between items-center">
                    <h3 className="text-xl font-semibold">{term ? 'Edit' : 'Add'} Terms & Condition</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-background-muted"><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        <div>
                            <label className="label">Name</label>
                            <input value={name} onChange={(e) => setName(e.target.value)} className="input" required />
                        </div>
                        <div>
                            <label className="label">Content</label>
                            <textarea value={content} onChange={(e) => setContent(e.target.value)} className="input" rows="8" required />
                        </div>
                        <div className="flex items-center">
                            <input type="checkbox" id="isDefault" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} className="h-4 w-4 rounded" />
                            <label htmlFor="isDefault" className="ml-2 text-sm">Set as default for new documents</label>
                        </div>
                    </div>
                    <div className="p-4 bg-background-muted border-t border-border flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>Cancel</button>
                        <button type="submit" className="btn-primary flex items-center" disabled={loading}>
                            {loading ? <Loader className="animate-spin h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />} Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const SalesTermAndCondition = () => {
    const [terms, setTerms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTerm, setEditingTerm] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);

    const authHeaders = useMemo(() => ({ "Authorization": `Bearer ${localStorage.getItem('token')}` }), []);

    const fetchTerms = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/sales/terms-and-conditions`, { headers: authHeaders });
            setTerms(response.data || []);
        } catch (err) {
            setError('Failed to fetch terms and conditions.');
        } finally {
            setLoading(false);
        }
    }, [authHeaders]);

    useEffect(() => { fetchTerms(); }, [fetchTerms]);

    const handleAddNew = () => {
        setEditingTerm(null);
        setIsModalOpen(true);
    };

    const handleEdit = (term) => {
        setEditingTerm(term);
        setIsModalOpen(true);
    };

    const handleSave = async (data) => {
        setModalLoading(true);
        const isEditing = !!editingTerm;
        const url = isEditing ? `${API_URL}/sales/terms-and-conditions/${editingTerm.id}` : `${API_URL}/sales/terms-and-conditions`;
        const method = isEditing ? 'put' : 'post';

        try {
            await axios[method](url, data, { headers: authHeaders });
            await fetchTerms();
            setIsModalOpen(false);
        } catch (err) {
            alert(`Error: ${err.response?.data?.message || 'Failed to save.'}`);
        } finally {
            setModalLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            try {
                await axios.delete(`${API_URL}/sales/terms-and-conditions/${id}`, { headers: authHeaders });
                await fetchTerms();
            } catch (err) {
                alert(`Error: ${err.response?.data?.message || 'Failed to delete.'}`);
            }
        }
    };

    return (
        <div className="bg-card p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Manage Terms & Conditions</h2>
                <button onClick={handleAddNew} className="btn-primary flex items-center gap-2"><PlusCircle size={18} /> Add New</button>
            </div>

            {loading && <div className="flex justify-center py-10"><Loader className="animate-spin h-8 w-8 text-primary" /></div>}
            {error && <p className="text-red-500 text-center py-10">{error}</p>}

            {!loading && !error && (
                <div className="space-y-3">
                    {terms.length === 0 ? (
                        <div className="text-center py-16 border-2 border-dashed border-border rounded-lg">
                            <AlertCircle className="mx-auto h-12 w-12 text-foreground-muted/50" />
                            <h3 className="mt-2 text-sm font-medium text-foreground">No Terms & Conditions Found</h3>
                            <p className="mt-1 text-sm">Get started by creating a new one.</p>
                        </div>
                    ) : (
                        terms.map(term => (
                            <div key={term.id} className="p-4 border border-border rounded-lg flex justify-between items-center hover:bg-background-muted">
                                <div>
                                    <p className="font-medium text-foreground flex items-center">
                                        {term.name}
                                        {term.default && <span className="ml-3 flex items-center gap-1 text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full"><CheckCircle size={12}/> Default</span>}
                                    </p>
                                    <p className="text-sm text-foreground-muted mt-1 truncate">{term.content}</p>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                                    <button onClick={() => handleEdit(term)} className="p-1.5 hover:text-primary"><Edit size={16} /></button>
                                    <button onClick={() => handleDelete(term.id)} className="p-1.5 hover:text-red-500"><Trash2 size={16} /></button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            <TermAndConditionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                loading={modalLoading}
                term={editingTerm}
            />
        </div>
    );
};

export default SalesTermAndCondition;