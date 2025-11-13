import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { Edit, Trash2, PlusCircle, Loader, Search, X, AlertCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const DocumentTypeModal = ({ isOpen, onClose, onSave, documentType, loading }) => {
    const [name, setName] = useState('');
    const [modalError, setModalError] = useState('');

    useEffect(() => {
        if (documentType) {
            setName(documentType.name || '');
        } else {
            setName('');
        }
        setModalError('');
    }, [documentType, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) {
            setModalError('Document type name is required.');
            return;
        }
        onSave({ id: documentType?.id, name });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-card text-card-foreground rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-border flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-foreground">{documentType ? 'Edit' : 'Add'} Document Type</h3>
                    <button onClick={onClose} className="p-1 rounded-full text-foreground-muted hover:bg-background-muted"><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="name" className="label">Document Type Name</label>
                            <input id="name" name="name" value={name} onChange={(e) => setName(e.target.value)} required className="input" />
                        </div>
                        {modalError && <p className="text-red-500 text-sm">{modalError}</p>}
                    </div>
                    <div className="p-4 border-t bg-slate-50 flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>Cancel</button>
                        <button type="submit" className="btn-primary flex items-center" disabled={loading}>
                            {loading && <Loader className="animate-spin h-4 w-4 mr-2" />} Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const DocumentType = ({ embedded = false }) => {
    const [documentTypes, setDocumentTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDocumentType, setEditingDocumentType] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const authHeaders = useMemo(() => ({ "Authorization": `Bearer ${localStorage.getItem('token')}` }), []);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.get(`${API_URL}/base/document-types`, { headers: authHeaders });
            setDocumentTypes(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            setError('Failed to fetch document types.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [authHeaders]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAdd = () => { setEditingDocumentType(null); setIsModalOpen(true); };
    const handleEdit = (item) => { setEditingDocumentType(item); setIsModalOpen(true); };
    const handleCloseModal = () => { setIsModalOpen(false); setEditingDocumentType(null); };

    const handleSave = async (itemData) => {
        setModalLoading(true);
        const isUpdating = Boolean(itemData.id);
        const url = isUpdating ? `${API_URL}/base/document-types/${itemData.id}` : `${API_URL}/base/document-types`;
        const method = isUpdating ? 'put' : 'post';

        try {
            await axios[method](url, itemData, { headers: authHeaders });
            await fetchData();
            handleCloseModal();
        } catch (err) {
            alert(`Error: ${err.response?.data?.message || 'Failed to save document type.'}`);
        } finally {
            setModalLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this document type?')) {
            try {
                await axios.delete(`${API_URL}/base/document-types/${id}`, { headers: authHeaders });
                await fetchData();
            } catch (err) {
                alert(`Error: ${err.response?.data?.message || 'Failed to delete document type.'}`);
            }
        }
    };

    const filteredData = useMemo(() => {
        return documentTypes.filter(item => !searchTerm || item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [documentTypes, searchTerm]);

    const containerClass = embedded ? "bg-transparent" : "p-6 bg-card rounded-xl shadow-sm";

    return (
        <div className={containerClass}>
            {!embedded && (
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-foreground">Manage Document Types</h3>
                </div>
            )}
             <div className="flex justify-end items-center mb-4 gap-2">
                <div className="relative">
                    <input type="text" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="input w-full sm:w-64 pr-10 bg-background-muted border-border" />
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-muted" />
                </div>
                <button onClick={handleAdd} className="flex items-center gap-2 btn-secondary"><PlusCircle size={16} /> Add Document Type</button>
            </div>

            {error && <p className="text-red-500 mb-4">{error}</p>}

            <div className="overflow-x-auto border border-border rounded-lg">
                <table className="min-w-full divide-y divide-border">
                    <thead className="bg-background-muted">
                        <tr>
                            <th className="th-cell">Document Type Name</th>
                            <th className="th-cell w-32">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-card divide-y divide-border text-foreground-muted">
                        {loading ? (
                            <tr><td colSpan="2" className="text-center py-10"><Loader className="animate-spin h-8 w-8 text-primary mx-auto" /></td></tr>
                        ) : filteredData.length > 0 ? (
                            filteredData.map((item) => (
                                <tr key={item.id} className="hover:bg-background-muted transition-colors">
                                    <td className="td-cell font-medium text-foreground">{item.name}</td>
                                    <td className="td-cell">
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => handleEdit(item)} className="text-primary hover:text-primary/80 p-1" title="Edit"><Edit size={16} /></button>
                                            <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-600 p-1" title="Delete"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="2" className="text-center py-10">
                                    <AlertCircle className="mx-auto h-12 w-12 text-foreground-muted/50" />
                                    <h3 className="mt-2 text-sm font-medium text-foreground">No document types found</h3>
                                    <p className="mt-1 text-sm">Get started by adding a new document type.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <DocumentTypeModal 
                isOpen={isModalOpen} 
                onClose={handleCloseModal} 
                onSave={handleSave} 
                documentType={editingDocumentType} 
                loading={modalLoading} 
            />
        </div>
    );
}

export default DocumentType;