import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { Check, X, FileClock, Loader, AlertCircle, Search, Eye } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const statusStyles = {
    PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: FileClock },
    APPROVED: { bg: 'bg-green-100', text: 'text-green-800', icon: Check },
    REJECTED: { bg: 'bg-red-100', text: 'text-red-800', icon: X },
    CANCELLED: { bg: 'bg-slate-100', text: 'text-slate-600', icon: X },
};

const MissingAttendanceRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('PENDING');
    const [searchTerm, setSearchTerm] = useState('');
    const [viewingAttachment, setViewingAttachment] = useState(null);

    const fetchRequests = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/missing-attendance/requests`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            setRequests(response.data.sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate)));
        } catch (err) {
            setError('Failed to fetch missing attendance requests.');
            console.error("Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const handleAction = async (requestId, status) => {
        let approverRemarks = '';
        if (status === 'REJECTED') {
            approverRemarks = prompt("Please provide a reason for rejection (optional):");
            if (approverRemarks === null) return; // User cancelled prompt
        }

        if (!window.confirm(`Are you sure you want to ${status.toLowerCase()} this request?`)) return;

        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/missing-attendance/requests/${requestId}/approval`, { status, approverRemarks }, { headers: { "Authorization": `Bearer ${token}` } });
            fetchRequests();
        } catch (err) {
            alert(`Failed to ${status.toLowerCase()} request.`);
        }
    };

    const handleViewAttachment = async (request) => {
        if (!request.attachmentPath) return;
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/missing-attendance/requests/${request.id}/attachment`, {
                headers: { "Authorization": `Bearer ${token}` },
                responseType: 'blob'
            });
            const fileURL = URL.createObjectURL(new Blob([response.data], { type: response.headers['content-type'] }));
            setViewingAttachment(fileURL);
        } catch (err) {
            alert("Could not load the attachment.");
        }
    };

    const filteredRequests = useMemo(() => {
        let filtered = requests.filter(req => req.status === activeTab);
        if (searchTerm) {
            const lowercasedFilter = searchTerm.toLowerCase();
            filtered = filtered.filter(req =>
                (req.employee?.firstName?.toLowerCase() || '').includes(lowercasedFilter) ||
                (req.employee?.lastName?.toLowerCase() || '').includes(lowercasedFilter) ||
                (req.employee?.employeeCode?.toLowerCase() || '').includes(lowercasedFilter)
            );
        }
        return filtered;
    }, [requests, activeTab, searchTerm]);

    const TABS = ['PENDING', 'APPROVED', 'REJECTED'];

    return (
        <>
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
                <div className="flex border-b border-slate-200">
                    {TABS.map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`px-3 py-2 text-sm font-medium whitespace-nowrap ${activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'border-b-2 border-transparent text-slate-500 hover:text-slate-800'}`}>
                            {tab.charAt(0) + tab.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>
                <div className="relative w-full sm:w-64">
                    <input type="text" placeholder="Search by employee..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input w-full pr-10" />
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                </div>
            </div>

            {error && <div className="text-center text-red-600 p-4 bg-red-50 rounded-md mb-4">{error}</div>}

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="th-cell">Employee</th><th className="th-cell">Date</th><th className="th-cell">Requested Times</th><th className="th-cell">Reason</th><th className="th-cell">Status</th><th className="th-cell">Attachment</th><th className="th-cell">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="7" className="text-center py-10"><Loader className="h-8 w-8 animate-spin text-blue-600 mx-auto" /></td></tr>
                        ) : filteredRequests.length > 0 ? (
                            filteredRequests.map(req => (
                                <tr key={req.id} className="border-b border-slate-200 hover:bg-slate-50">
                                    <td className="td-cell"><div className="font-medium">{req.employee?.firstName} {req.employee?.lastName}</div><div className="text-sm text-slate-500">{req.employee?.employeeCode}</div></td>
                                    <td className="td-cell">{new Date(req.attendanceDate).toLocaleDateString()}</td>
                                    <td className="td-cell text-sm font-mono">{req.requestedCheckIn || '-'} to {req.requestedCheckOut || '-'}</td>
                                    <td className="td-cell text-sm max-w-xs truncate" title={req.reason}>{req.reason}</td>
                                    <td className="td-cell">
                                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-semibold rounded-full ${statusStyles[req.status]?.bg} ${statusStyles[req.status]?.text}`}>
                                            {React.createElement(statusStyles[req.status].icon, { className: "h-3 w-3" })}
                                            {req.status.toLowerCase()}
                                        </span>
                                    </td>
                                    <td className="td-cell">{req.attachmentPath && <button onClick={() => handleViewAttachment(req)} className="text-primary hover:underline text-xs flex items-center gap-1"><Eye size={14} /> View</button>}</td>
                                    <td className="td-cell">{req.status === 'PENDING' && <div className="flex items-center gap-2 text-foreground-muted"><button onClick={() => handleAction(req.id, 'REJECTED')} className="p-1.5 hover:text-red-600 rounded-full hover:bg-background-muted" title="Reject"><X className="h-4 w-4" /></button><button onClick={() => handleAction(req.id, 'APPROVED')} className="p-1.5 hover:text-green-600 rounded-full hover:bg-background-muted" title="Approve"><Check className="h-4 w-4" /></button></div>}</td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="7" className="text-center py-10 text-slate-500"><FileClock className="mx-auto h-12 w-12 text-slate-400" /><h3 className="mt-2 text-sm font-semibold text-slate-900">No requests found</h3><p className="mt-1 text-sm">There are no requests matching your criteria.</p></td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            {viewingAttachment && (
                <div className="fixed inset-0 bg-black/75 z-50 flex justify-center items-center p-4" onClick={() => setViewingAttachment(null)}>
                    <div className="bg-card p-2 rounded-lg max-w-4xl max-h-[90vh]" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-end"><button onClick={() => setViewingAttachment(null)} className="p-2 rounded-full text-foreground-muted hover:bg-background-muted -mr-2 -mt-2 mb-2"><X size={20} /></button></div>
                        <img src={viewingAttachment} alt="Attachment" className="max-w-full max-h-[80vh] object-contain" />
                    </div>
                </div>
            )}
        </>
    );
}

export default MissingAttendanceRequests;
