import React, { useState, useEffect } from 'react';
import { Upload, Download, Eye, Edit, Trash2, Plus, Loader, AlertCircle, X, CheckCircle, ShieldCheck, XCircle } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;
const DOC_TYPES = ['Resume', 'Offer Letter', 'ID Proof', 'Address Proof', 'Educational Certificate', 'Experience Letter', 'Payslip', 'Other'];

const UploadDocumentModal = ({ isOpen, onClose, onSave, loading }) => {
    const [file, setFile] = useState(null);
    const [docType, setDocType] = useState(DOC_TYPES[0]);
    const [remarks, setRemarks] = useState('');
    const [modalError, setModalError] = useState('');

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!file) {
            setModalError('Please select a file to upload.');
            return;
        }
        const formData = new FormData();
        formData.append('file', file);
        formData.append('docType', docType);
        formData.append('remarks', remarks);
        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
            <div className="bg-card text-card-foreground rounded-lg shadow-xl w-full max-w-md">
                <div className="p-4 border-b border-border flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-foreground">Upload Document</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-foreground-muted hover:bg-background-muted"><X className="h-5 w-5" /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="file" className="block text-sm font-medium text-foreground-muted">File</label>
                            <input id="file" type="file" onChange={handleFileChange} required className="input bg-background-muted border-border text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
                        </div>
                        <div>
                            <label htmlFor="docType" className="block text-sm font-medium text-foreground-muted">Document Type</label>
                            <select id="docType" value={docType} onChange={(e) => setDocType(e.target.value)} className="input bg-background-muted border-border text-foreground">
                                {DOC_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="remarks" className="block text-sm font-medium text-foreground-muted">Remarks</label>
                            <textarea id="remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} rows="3" className="input bg-background-muted border-border text-foreground" />
                        </div>
                        {modalError && <p className="text-red-500 text-sm">{modalError}</p>}
                    </div>
                    <div className="p-4 border-t bg-slate-50 flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>Cancel</button>
                        <button type="submit" className="btn-primary flex items-center" disabled={loading}>
                            {loading && <Loader className="animate-spin h-4 w-4 mr-2" />} Upload
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const EditDocumentModal = ({ isOpen, onClose, onSave, document, loading }) => {
    const [formData, setFormData] = useState({ docType: '', remarks: '', verified: false });
    
    useEffect(() => {
        if (document) {
            setFormData({
                docType: document.docType,
                remarks: document.remarks || '',
                verified: document.verified || false,
            });
        }
    }, [document]);

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
            <div className="bg-card text-card-foreground rounded-lg shadow-xl w-full max-w-md">
                <div className="p-4 border-b border-border flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-foreground">Edit Document Details</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-foreground-muted hover:bg-background-muted"><X className="h-5 w-5" /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="edit-docType" className="block text-sm font-medium text-foreground-muted">Document Type</label>
                            <select id="edit-docType" name="docType" value={formData.docType} onChange={handleChange} className="input bg-background-muted border-border text-foreground">
                                {DOC_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="edit-remarks" className="block text-sm font-medium text-foreground-muted">Remarks</label>
                            <textarea id="edit-remarks" name="remarks" value={formData.remarks} onChange={handleChange} rows="3" className="input bg-background-muted border-border text-foreground" />
                        </div>
                        <div>
                            <label className="inline-flex items-center">
                                <input type="checkbox" name="verified" checked={formData.verified} onChange={handleChange} className="h-4 w-4 rounded border-border text-primary focus:ring-primary" />
                                <span className="ml-2 text-sm text-foreground-muted">Mark as Verified</span>
                            </label>
                        </div>
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

const Documents = ({ employee }) => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingDocument, setEditingDocument] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);

    const fetchDocuments = async () => {
        if (!employee?.employeeCode) return;
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/employee-documents/${employee.employeeCode}`, { headers: { "Authorization": `Bearer ${token}` } });
            setDocuments(response.data);
        } catch (err) {
            setError('Failed to fetch documents.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, [employee]);

    const handleUpload = async (formData) => {
        setModalLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/employee-documents/${employee.employeeCode}`, formData, { headers: { "Authorization": `Bearer ${token}`, "Content-Type": "multipart/form-data" } });
            setIsUploadModalOpen(false);
            fetchDocuments();
        } catch (err) {
            alert('Upload failed. Please try again.');
        } finally {
            setModalLoading(false);
        }
    };

    const handleUpdate = async (documentData) => {
        setModalLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/employee-documents/${editingDocument.id}`, documentData, { headers: { "Authorization": `Bearer ${token}` } });
            setIsEditModalOpen(false);
            fetchDocuments();
        } catch (err) {
            alert('Update failed. Please try again.');
        } finally {
            setModalLoading(false);
        }
    };

    const handleDelete = async (documentId) => {
        if (window.confirm('Are you sure you want to delete this document?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${API_URL}/employee-documents/${documentId}`, { headers: { "Authorization": `Bearer ${token}` } });
                fetchDocuments();
            } catch (err) {
                alert('Failed to delete document.');
            }
        }
    };

    const handleView = async (documentId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/employee-documents/view/${documentId}`, {
                headers: { "Authorization": `Bearer ${token}` },
                responseType: 'blob'
            });
            const file = new Blob([response.data], { type: response.headers['content-type'] });
            const fileURL = URL.createObjectURL(file);
            window.open(fileURL);
        } catch (err) {
            alert('Could not open the document for viewing.');
            console.error(err);
        }
    };

    const handleDownload = async (documentId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/employee-documents/download/${documentId}`, {
                headers: { "Authorization": `Bearer ${token}` },
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;

            const contentDisposition = response.headers['content-disposition'];
            let fileName = `document-${documentId}`;
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
                if (filenameMatch && filenameMatch.length === 2) fileName = filenameMatch[1];
            }

            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            alert('Could not download the document.');
            console.error(err);
        }
    };

    if (!employee) return <div className="text-center text-slate-500">Please select an employee to view documents.</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <button onClick={() => setIsUploadModalOpen(true)} className="btn-primary flex items-center">
                    <Plus className="h-5 w-5 mr-2" /> Upload Document
                </button>
            </div>

            {loading && <div className="flex justify-center p-8"><Loader className="animate-spin h-8 w-8 text-blue-600" /></div>}
            {error && <div className="text-center text-red-600 dark:text-red-400 p-4 bg-red-50 dark:bg-red-900/20 rounded-md">{error}</div>}

            {!loading && !error && (
                <div className="bg-white dark:bg-slate-800/50 rounded-xl shadow-sm overflow-hidden border border-slate-200 dark:border-slate-700">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-slate-50 dark:bg-slate-700/50">
                                <tr>
                                    <th className="th-cell">Document Type</th>
                                    <th className="th-cell">File Name</th>
                                    <th className="th-cell">Verified</th>
                                    <th className="th-cell">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-slate-700 dark:text-slate-300">
                                {documents.length > 0 ? (
                                    documents.map(doc => (
                                        <tr key={doc.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                            <td className="td-cell font-medium text-slate-800 dark:text-slate-100">{doc.docType}</td>
                                            <td className="td-cell text-sm">{doc.fileName}</td>
                                            <td className="td-cell">
                                                {doc.verified ? <CheckCircle className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-slate-400" />}
                                            </td>
                                            <td className="td-cell">
                                                <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                                                    <button onClick={() => handleView(doc.id)} className="p-2 hover:text-blue-600 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700" title="View"><Eye className="h-4 w-4" /></button>
                                                    <button onClick={() => handleDownload(doc.id)} className="p-2 hover:text-blue-600 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700" title="Download"><Download className="h-4 w-4" /></button>
                                                    <button onClick={() => { setEditingDocument(doc); setIsEditModalOpen(true); }} className="p-2 hover:text-blue-600 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700" title="Edit"><Edit className="h-4 w-4" /></button>
                                                    <button onClick={() => handleDelete(doc.id)} className="p-2 hover:text-red-600 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700" title="Delete"><Trash2 className="h-4 w-4" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="text-center py-10 text-slate-500">
                                            <AlertCircle className="mx-auto h-12 w-12 text-foreground-muted/50" />
                                            <h3 className="mt-2 text-sm font-medium text-foreground">No documents found</h3>
                                            <p className="mt-1 text-sm text-foreground-muted">Upload a document to get started.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <UploadDocumentModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} onSave={handleUpload} loading={modalLoading} />
            {editingDocument && <EditDocumentModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSave={handleUpdate} document={editingDocument} loading={modalLoading} />}
        </div>
    );
}

export default Documents;
