import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader, Search, Edit, Trash2, PlusCircle, X, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import CrmLeadForm from '../components/CrmLeadForm';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const LeadDetails = ({ onClose }) => {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(0); // 0-indexed for Spring Pageable
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [isFormSidebarOpen, setIsFormSidebarOpen] = useState(false);
    const [editingLead, setEditingLead] = useState(null);
    const [formLoading, setFormLoading] = useState(false);
    const navigate = useNavigate();

    const authHeaders = useMemo(() => ({ "Authorization": `Bearer ${localStorage.getItem('token')}` }), []);

    const fetchLeads = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.get(`${API_URL}/crm/leads`, {
                headers: authHeaders,
                params: {
                    page: currentPage,
                    size: pageSize,
                    sort: 'createdAt,desc'
                }
            });
            setLeads(response.data.content);
            setTotalPages(response.data.totalPages);
            setTotalElements(response.data.totalElements);
        } catch (err) {
            setError('Failed to fetch leads. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, authHeaders]);

    useEffect(() => {
        fetchLeads();
    }, [fetchLeads]);

    const filteredLeads = useMemo(() => {
        if (!searchTerm) {
            return leads;
        }
        const lowercasedSearchTerm = searchTerm.toLowerCase();
        return leads.filter(lead =>
            lead.firstName.toLowerCase().includes(lowercasedSearchTerm) ||
            lead.lastName.toLowerCase().includes(lowercasedSearchTerm) ||
            lead.email.toLowerCase().includes(lowercasedSearchTerm) ||
            lead.leadNo?.toLowerCase().includes(lowercasedSearchTerm) || // Added leadNo to search
            lead.companyName?.toLowerCase().includes(lowercasedSearchTerm) ||
            lead.currentStageName?.toLowerCase().includes(lowercasedSearchTerm)
        );
    }, [leads, searchTerm]);

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handlePageSizeChange = (e) => {
        setPageSize(parseInt(e.target.value, 10));
        setCurrentPage(0); // Reset to first page when page size changes
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        // For client-side filtering on the current page, no need to reset currentPage.
        // If server-side filtering was implemented, we would reset currentPage to 0.
    };

    const handleEditLead = (lead) => {
        setEditingLead(lead);
        setIsFormSidebarOpen(true);
    };

    const handleDeleteLead = async (id) => {
        if (!window.confirm('Are you sure you want to delete this lead?')) {
            return;
        }
        try {
            setLoading(true);
            await axios.delete(`${API_URL}/crm/leads/${id}`, { headers: authHeaders });
            fetchLeads(); // Refresh the list
        } catch (err) {
            alert(`Error: ${err.response?.data?.message || 'Failed to delete lead.'}`);
            setError('Failed to delete lead.');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveLead = async (leadData) => {
        setFormLoading(true);
        try {
            if (editingLead) {
                await axios.put(`${API_URL}/crm/leads/${editingLead.id}`, leadData, { headers: authHeaders });
            } else {
                await axios.post(`${API_URL}/crm/leads`, leadData, { headers: authHeaders });
            }
            setIsFormSidebarOpen(false);
            setEditingLead(null);
            fetchLeads(); // Refresh data
        } catch (err) {
            alert(`Error: ${err.response?.data?.message || 'Failed to save lead.'}`);
        } finally {
            setFormLoading(false);
        }
    };

    const handleViewLead = (lead) => {
        navigate(`/crm-dashboard/leads/${lead.id}`);
    };

    return (
        <div className="flex flex-col h-screen bg-background text-foreground relative">
            {/* Header */}
            <header className="flex items-center justify-between p-4 border-b border-border flex-shrink-0 gap-2">
                <div className="flex items-center gap-2">
                    <button onClick={onClose} className="p-1.5 rounded-full hover:bg-background-muted"><ChevronLeft className="h-5 w-5 text-foreground" /></button>
                    <h2 className="text-xl font-bold text-foreground">All Leads</h2>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="input w-40 sm:w-48 pr-9 bg-background-muted border-border text-sm"
                        />
                        <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
                    </div>
                    <select
                        value={pageSize}
                        onChange={handlePageSizeChange}
                        className="input bg-card border-border text-sm"
                    >
                        <option value={10}>10/page</option>
                        <option value={20}>20/page</option>
                        <option value={50}>50/page</option>
                    </select>
                    <button onClick={() => { setEditingLead(null); setIsFormSidebarOpen(true); }} className="btn-primary flex items-center gap-1">
                        <PlusCircle className="h-5 w-5" /> Add
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-6">
                {loading ? (
                    <div className="flex justify-center items-center h-full">
                        <Loader className="animate-spin h-10 w-10 text-primary" />
                    </div>
                ) : error ? (
                    <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        <p>{error}</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto border border-border rounded-lg shadow-sm">
                        <table className="min-w-full border-collapse">
                            <thead className="bg-background-muted">
                                <tr>
                                    <th className="th-cell border border-border">#</th>
                                    <th className="th-cell border border-border">Name</th>
                                    <th className="th-cell border border-border">Lead No.</th>
                                    <th className="th-cell border border-border">Company</th>
                                    <th className="th-cell border border-border">Email</th>
                                    <th className="th-cell border border-border">Phone</th>
                                    <th className="th-cell border border-border">Stage</th>
                                    <th className="th-cell border border-border">Source</th>
                                    <th className="th-cell border border-border">Owner</th>
                                    <th className="th-cell border border-border">Status</th>
                                    <th className="th-cell border border-border w-32">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-card text-foreground-muted">
                                {filteredLeads.length > 0 ? (
                                    filteredLeads.map((lead, index) => (
                                        <tr key={lead.id} className="border-b border-border hover:bg-background-muted transition-colors">
                                            <td className="td-cell border border-border">{currentPage * pageSize + index + 1}</td>                                            
                                            <td className="td-cell border border-border">
                                                <button onClick={() => handleViewLead(lead)} className="text-primary hover:underline font-medium">{lead.firstName} {lead.lastName}</button>
                                            </td>
                                            <td className="td-cell border border-border">
                                                <button onClick={() => handleViewLead(lead)} className="text-primary hover:underline">{lead.leadNo || 'N/A'}</button>
                                            </td>
                                            <td className="td-cell border border-border">{lead.companyName || 'N/A'}</td>
                                            <td className="td-cell border border-border">{lead.email}</td>
                                            <td className="td-cell border border-border">{lead.phone || 'N/A'}</td>
                                            <td className="td-cell border border-border">{lead.currentStageName || 'N/A'}</td>
                                            <td className="td-cell border border-border">{lead.leadSource || 'N/A'}</td>
                                            <td className="td-cell border border-border">{lead.ownerName || 'Unassigned'}</td>
                                            <td className="td-cell border border-border capitalize">{lead.status?.toLowerCase() || 'N/A'}</td>
                                            <td className="td-cell border border-border">
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => handleEditLead(lead)} className="text-primary hover:text-primary/80 p-1" title="Edit Lead"><Edit size={16} /></button>
                                                    <button onClick={() => handleDeleteLead(lead.id)} className="text-red-500 hover:text-red-600 p-1" title="Delete Lead"><Trash2 size={16} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="11" className="text-center py-10">
                                            <AlertCircle className="mx-auto h-12 w-12 text-foreground-muted/50" />
                                            <h3 className="mt-2 text-sm font-medium text-foreground">No leads found</h3>
                                            <p className="mt-1 text-sm">Adjust your search or add a new lead.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>

            {/* Pagination */}
            {!loading && !error && totalPages > 1 && (
                <footer className="flex flex-wrap justify-between items-center p-6 border-t border-border flex-shrink-0 gap-4">
                    <p className="text-sm text-foreground-muted">Showing {Math.min(currentPage * pageSize + 1, totalElements)} - {Math.min((currentPage + 1) * pageSize, totalElements)} of {totalElements} leads</p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 0}
                            className="btn-secondary flex items-center gap-1"
                        >
                            <ChevronLeft size={16} /> Previous
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => (
                            <button
                                key={i}
                                onClick={() => handlePageChange(i)}
                                className={`px-3 py-1 rounded-md text-sm font-medium ${
                                    currentPage === i ? 'bg-primary text-primary-foreground' : 'bg-background-muted hover:bg-background-hover'
                                }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages - 1}
                            className="btn-secondary flex items-center gap-1"
                        >
                            Next <ChevronRight size={16} />
                        </button>
                    </div>
                </footer>
            )}

            {/* CrmLeadForm Sidebar for Add/Edit */}
            <AnimatePresence>
                {isFormSidebarOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsFormSidebarOpen(false)} />
                        <motion.div
                            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="fixed top-0 right-0 h-full w-full max-w-2xl bg-card text-card-foreground shadow-lg z-50"
                        >
                            <CrmLeadForm item={editingLead} onSave={handleSaveLead} onCancel={() => setIsFormSidebarOpen(false)} loading={formLoading} />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LeadDetails;