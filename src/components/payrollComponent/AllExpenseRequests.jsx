import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { Check, X, FileClock, Loader, AlertCircle, Search, Eye } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const statusStyles = {
    SUBMITTED: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: FileClock },
    APPROVED: { bg: 'bg-green-100', text: 'text-green-800', icon: Check },
    REJECTED: { bg: 'bg-red-100', text: 'text-red-800', icon: X },
}; 

const formatCurrency = (amount, currency = 'AED') => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
    }).format(amount || 0);
};

const AllExpenseRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('SUBMITTED');
    const [searchTerm, setSearchTerm] = useState('');
    const [viewingReceipt, setViewingReceipt] = useState(null);

    const fetchRequests = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/expenses`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            setRequests(response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        } catch (err) {
            setError('Failed to fetch expense requests.');
            console.error("Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const handleAction = async (expenseId, action) => {
        if (!window.confirm(`Are you sure you want to ${action} this expense?`)) return;
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/expenses/${expenseId}/${action}`, {}, { headers: { "Authorization": `Bearer ${token}` } });
            fetchRequests();
        } catch (err) {
            alert(`Failed to ${action} expense.`);
        }
    };

    const handleViewReceipt = async (expense) => {
        if (!expense.receiptPath) return;
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/expenses/${expense.id}/receipt`, {
                headers: { "Authorization": `Bearer ${token}` },
                responseType: 'blob'
            });
            const fileURL = URL.createObjectURL(new Blob([response.data], { type: response.headers['content-type'] }));
            setViewingReceipt(fileURL);
        } catch (err) {
            alert("Could not load the receipt.");
        }
    };

    const handleViewAttachment = (attachmentUrl) => {
        setViewingReceipt(attachmentUrl);
    };

    const filteredRequests = useMemo(() => {
        let filtered = requests.filter(req => req.status === activeTab);
        if (searchTerm) {
            const lowercasedFilter = searchTerm.toLowerCase();
            filtered = filtered.filter(req =>
                (req.employeeName?.toLowerCase() || '').includes(lowercasedFilter) ||
                (req.employeeCode?.toLowerCase() || '').includes(lowercasedFilter) ||
                (req.category?.toLowerCase() || '').includes(lowercasedFilter)
            );

        }
        return filtered;
    }, [requests, activeTab, searchTerm]);

    const TABS = ['SUBMITTED', 'APPROVED', 'REJECTED'];

    return (
        <>
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
                <div className="flex border-b border-slate-200 dark:border-slate-700">
                    {TABS.map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`px-3 py-2 text-sm font-medium whitespace-nowrap ${activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400' : 'border-b-2 border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}>
                            {tab.charAt(0) + tab.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>
                <div className="relative w-full sm:w-64">
                    <input type="text" placeholder="Search by employee..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input w-full pr-10 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                </div>
            </div>

            {error && <div className="text-center text-red-600 dark:text-red-400 p-4 bg-red-50 dark:bg-red-900/20 rounded-md mb-4">{error}</div>}

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white dark:bg-slate-800/50">
                    <thead className="bg-slate-50 dark:bg-slate-700/50">
                        <tr>
                            <th className="th-cell">Employee</th><th className="th-cell">Category</th><th className="th-cell">Amount</th><th className="th-cell">Date</th><th className="th-cell">Status</th><th className="th-cell">Receipt</th><th className="th-cell">Actions</th>
                        </tr> 
                    </thead>
                    <tbody className="dark:text-slate-300">
                        {loading ? (
                            <tr><td colSpan="7" className="text-center py-10"><Loader className="h-8 w-8 animate-spin text-blue-600 mx-auto" /></td></tr>
                        ) : filteredRequests.length > 0 ? (
                            filteredRequests.map(req => (
                                <tr key={req.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                    <td className="td-cell"><div className="font-medium text-slate-800 dark:text-slate-100">{req.employeeName}</div><div className="text-sm text-slate-500 dark:text-slate-400">{req.employeeCode}</div></td>
                                    <td className="td-cell">{req.category}</td>
                                    <td className="td-cell">{formatCurrency(req.amount)}</td>
                                    <td className="td-cell">{new Date(req.expenseDate).toLocaleDateString()}</td>
                                    <td className="td-cell">
                                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-semibold rounded-full ${statusStyles[req.status]?.bg} ${statusStyles[req.status]?.text}`}>
                                            {React.createElement(statusStyles[req.status].icon, { className: "h-3 w-3" })}
                                            {req.status.toLowerCase()}
                                        </span>
                                    </td>
                                    <td className="td-cell">
                                        {req.attachments && req.attachments.length > 0 ? (
                                            <div className="flex flex-col">
                                                {req.attachments.map((attachment) => (
                                                    <button
                                                        key={attachment.id}
                                                        onClick={() => handleViewAttachment(attachment.viewUrl)}
                                                        className="text-primary hover:underline text-xs flex items-center gap-1"
                                                    ><Eye size={14} />{attachment.originalFilename}</button>
                                                ))}
                                            </div>
                                        ) : <span>No attachments</span>}
                                    </td>
                                    <td className="td-cell">{req.status === 'SUBMITTED' && <div className="flex items-center gap-2 text-foreground-muted"><button onClick={() => handleAction(req.id, 'reject')} className="p-1.5 hover:text-red-600 rounded-full hover:bg-background-muted" title="Reject"><X className="h-4 w-4" /></button><button onClick={() => handleAction(req.id, 'approve')} className="p-1.5 hover:text-green-600 rounded-full hover:bg-background-muted" title="Approve"><Check className="h-4 w-4" /></button></div>}</td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="7" className="text-center py-10 text-foreground-muted"><FileClock className="mx-auto h-12 w-12 text-foreground-muted/50" /><h3 className="mt-2 text-sm font-semibold text-foreground">No requests found</h3><p className="mt-1 text-sm">There are no expense requests matching your criteria.</p></td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            {viewingReceipt && (
                <div className="fixed inset-0 bg-black/75 z-50 flex justify-center items-center p-4" onClick={() => setViewingReceipt(null)}> 
                    <div className="bg-card p-2 rounded-lg max-w-4xl max-h-[90vh]" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-end"><button onClick={() => setViewingReceipt(null)} className="p-2 rounded-full text-foreground-muted hover:bg-background-muted -mr-2 -mt-2 mb-2"><X size={20} /></button></div> {/* Closing button for the modal */}
                        <img src={viewingReceipt} alt="Expense Receipt" className="max-w-full max-h-[80vh] object-contain" />
                    </div> 
                </div>
            )}
        </>
    );
};

export default AllExpenseRequests;