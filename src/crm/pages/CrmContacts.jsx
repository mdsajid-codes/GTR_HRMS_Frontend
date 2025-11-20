import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import axios from 'axios';
import { Edit, Trash2, PlusCircle, Loader, Search, X, AlertCircle, Contact as ContactIcon, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

// NOTE: You will need to create this form component similar to CrmCompanyForm.jsx
// import CrmContactForm from '../components/CrmContactForm'; 

const API_URL = import.meta.env.VITE_API_BASE_URL || '';

// A placeholder for the Add/Edit Contact Form.
const CrmContactForm = ({ item, onSave, onCancel, loading }) => (
    <div className="flex flex-col h-full">
        <div className="p-4 border-b flex justify-between items-center">
            <h3 className="text-xl font-semibold">{item ? 'Edit Contact' : 'Add New Contact'}</h3>
            <button onClick={onCancel} className="p-1 rounded-full text-foreground-muted hover:bg-background-muted"><X size={20} /></button>
        </div>
        <div className="p-6 flex-grow">
            <p className="text-center text-foreground-muted">Contact form fields will go here.</p>
            <p className="text-center text-foreground-muted text-sm mt-2">Create a `CrmContactForm.jsx` component to implement the form logic.</p>
        </div>
        <div className="p-4 bg-background-muted border-t flex justify-end gap-2">
            <button onClick={onCancel} className="btn-secondary">Cancel</button>
            <button onClick={() => onSave({})} className="btn-primary" disabled={loading}>
                {loading ? 'Saving...' : 'Save'}
            </button>
        </div>
    </div>
);

// Reusable Modal for Viewing Contact Details
const ContactDetailsModal = ({ isOpen, onClose, contact }) => {
    if (!isOpen || !contact) return null;

    const DetailItem = ({ label, value }) => (
        <div>
            <p className="text-sm text-foreground-muted">{label}</p>
            <p className="font-medium text-foreground">{value || 'N/A'}</p>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-card text-card-foreground rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-border flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-foreground">Contact Details</h3>
                    <button onClick={onClose} className="p-1 rounded-full text-foreground-muted hover:bg-background-muted"><X size={20} /></button>
                </div>
                <div className="p-6 max-h-[70vh] overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                    <DetailItem label="First Name" value={contact.firstName} />
                    <DetailItem label="Last Name" value={contact.lastName} />
                    <DetailItem label="Email" value={contact.email} />
                    <DetailItem label="Phone" value={contact.phone} />
                    <DetailItem label="Associated Lead ID" value={contact.leadId} />
                    <DetailItem label="Created At" value={new Date(contact.createdAt).toLocaleString()} />
                    <DetailItem label="Last Updated" value={new Date(contact.updatedAt).toLocaleString()} />
                </div>
                <div className="p-4 bg-background-muted border-t flex justify-end">
                    <button onClick={onClose} className="btn-secondary">Close</button>
                </div>
            </div>
        </div>
    );
};

const CrmContacts = () => {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);

    // Modal/Sidebar state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [viewingItem, setViewingItem] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    const authHeaders = useMemo(() => ({ "Authorization": `Bearer ${localStorage.getItem('token')}` }), []);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                page: currentPage,
                size: pageSize,
                sort: 'firstName,asc',
                // The backend doesn't support search, so we filter client-side
            };
            const response = await axios.get(`${API_URL}/contacts`, { params, headers: authHeaders });
            setContacts(response.data.content);
            setTotalPages(response.data.totalPages);
        } catch (err) {
            setError('Failed to fetch contacts. Please try again later.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, authHeaders]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAdd = () => { setEditingItem(null); setIsModalOpen(true); };
    const handleEdit = (item) => { setEditingItem(item); setIsModalOpen(true); };
    const handleCloseModal = () => { setIsModalOpen(false); setEditingItem(null); };

    const handleViewDetails = (item) => { setViewingItem(item); setIsViewModalOpen(true); };
    const handleCloseViewModal = () => { setIsViewModalOpen(false); setViewingItem(null); };

    const handleSave = async (itemData) => {
        setModalLoading(true);
        const isUpdating = Boolean(itemData.id);
        const url = isUpdating ? `${API_URL}/contacts/${itemData.id}` : `${API_URL}/api/contacts`;
        const method = isUpdating ? 'put' : 'post';

        try {
            await axiosmethod;
            await fetchData();
            handleCloseModal();
        } catch (err) {
            alert(`Error: ${err.response?.data?.message || 'Failed to save contact.'}`);
        } finally {
            setModalLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this contact?')) {
            try {
                await axios.delete(`${API_URL}/contacts/${id}`, { headers: authHeaders });
                await fetchData();
            } catch (err) {
                alert(`Error: ${err.response?.data?.message || 'Failed to delete contact.'}`);
            }
        }
    };

    const filteredData = useMemo(() => {
        const q = searchTerm.trim().toLowerCase();
        if (!q) return contacts;
        return contacts.filter(item =>
            item.firstName.toLowerCase().includes(q) ||
            item.lastName?.toLowerCase().includes(q) ||
            item.email?.toLowerCase().includes(q)
        );
    }, [contacts, searchTerm]);

    return (
        <div className="p-6 bg-card rounded-xl shadow-sm h-full flex flex-col">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                <h3 className="text-2xl font-bold text-foreground">Contacts</h3>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search by name, email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input w-full sm:w-64 pr-10 bg-background-muted border-border"
                        />
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-muted" />
                    </div>
                    <button onClick={handleAdd} className="btn-primary flex items-center gap-2">
                        <PlusCircle size={16} /> Add Contact
                    </button>
                </div>
            </div>

            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}

            <div className="flex-grow overflow-auto">
                <table className="min-w-full border-collapse border border-border">
                    <thead className="bg-background-muted sticky top-0">
                        <tr>
                            <th className="th-cell border border-border w-16">S.No.</th>
                            <th className="th-cell border border-border">Name</th>
                            <th className="th-cell border border-border">Email</th>
                            <th className="th-cell border border-border">Phone</th>
                            <th className="th-cell border border-border">Created At</th>
                            <th className="th-cell border border-border w-32">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-card text-foreground-muted">
                        {loading ? (
                            <tr><td colSpan="6" className="text-center py-10"><Loader className="animate-spin h-8 w-8 text-primary mx-auto" /></td></tr>
                        ) : filteredData.length > 0 ? (
                            filteredData.map((item, index) => (
                                <tr key={item.id} className="hover:bg-background-muted transition-colors border-t border-border">
                                    <td className="td-cell border border-border text-center">{currentPage * pageSize + index + 1}</td>
                                    <td className="td-cell border border-border font-medium text-foreground">{item.firstName} {item.lastName}</td>
                                    <td className="td-cell border border-border">{item.email || 'N/A'}</td>
                                    <td className="td-cell border border-border">{item.phone || 'N/A'}</td>
                                    <td className="td-cell border border-border">{new Date(item.createdAt).toLocaleDateString()}</td>
                                    <td className="td-cell border border-border">
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => handleViewDetails(item)} className="text-sky-500 hover:text-sky-600" title="View Details"><Eye size={16} /></button>
                                            <button onClick={() => handleEdit(item)} className="text-primary hover:text-primary/80" title="Edit"><Edit size={16} /></button>
                                            <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-600" title="Delete"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="text-center py-10">
                                    <ContactIcon className="mx-auto h-12 w-12 text-foreground-muted/50" />
                                    <h3 className="mt-2 text-sm font-medium text-foreground">No contacts found</h3>
                                    <p className="mt-1 text-sm">Get started by adding a new contact.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Footer */}
            {!loading && totalPages > 1 && (
                 <footer className="flex flex-col sm:flex-row justify-between items-center pt-4 mt-4 border-t border-border">
                    <div className="flex items-center gap-2 text-sm text-foreground-muted mb-4 sm:mb-0">
                        <span>Rows per page:</span>
                        <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(0); }} className="input-sm bg-background-muted border-border">
                            {[10, 20, 50, 100].map(size => <option key={size} value={size}>{size}</option>)}
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-foreground-muted">Page {totalPages > 0 ? currentPage + 1 : 0} of {totalPages}</span>
                        <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 0} className="btn-secondary p-2"><ChevronLeft className="h-4 w-4" /></button>
                        <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage >= totalPages - 1} className="btn-secondary p-2"><ChevronRight className="h-4 w-4" /></button>
                    </div>
                </footer>
            )}

            {/* Side Panel for Add/Edit */}
            <AnimatePresence>
                {isModalOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="fixed inset-0 bg-black/60 z-40" onClick={handleCloseModal} />
                        <motion.div
                            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="fixed top-0 right-0 h-full w-full max-w-md bg-card shadow-2xl z-50 flex flex-col"
                        >
                            <CrmContactForm item={editingItem} onSave={handleSave} onCancel={handleCloseModal} loading={modalLoading} />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <ContactDetailsModal isOpen={isViewModalOpen} onClose={handleCloseViewModal} contact={viewingItem} />
        </div>
    );
}

export default CrmContacts;
