import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Loader, FileClock, Check, X, Eye } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const statusStyles = {
    PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: FileClock },
    APPROVED: { bg: 'bg-green-100', text: 'text-green-800', icon: Check },
    REJECTED: { bg: 'bg-red-100', text: 'text-red-800', icon: X },
    CANCELLED: { bg: 'bg-slate-100', text: 'text-slate-600', icon: X },
};

const MyMissingRequestsTab = ({ employeeCode }) => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [viewingAttachment, setViewingAttachment] = useState(null);

    const fetchRequests = useCallback(async () => {
        if (!employeeCode) return;
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            // NOTE: This endpoint fetches all requests. We filter on the client-side.
            // A dedicated backend endpoint `/api/missing-attendance/requests/employee/{employeeCode}` would be more efficient.
            const response = await axios.get(`${API_URL}/missing-attendance/requests`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const myRequests = response.data
                .filter(req => req.employee?.employeeCode === employeeCode)
                .sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate));
            setRequests(myRequests);
        } catch (err) {
            setError('Failed to fetch your requests.');
            console.error("Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    }, [employeeCode]);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

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

    if (loading) return <div className="flex justify-center items-center p-8"><Loader className="animate-spin h-8 w-8 text-blue-600" /></div>;
    if (error) return <div className="text-center text-red-500 p-4 bg-red-50 rounded-md">{error}</div>;

    return (
        <>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="th-cell">Date</th>
                            <th className="th-cell">Requested Times</th>
                            <th className="th-cell">Reason</th>
                            <th className="th-cell">Status</th>
                            <th className="th-cell">Approver Remarks</th>
                            <th className="th-cell">Attachment</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.length > 0 ? (
                            requests.map(req => (
                                <tr key={req.id} className="border-b border-slate-200 hover:bg-slate-50">
                                    <td className="td-cell">{new Date(req.attendanceDate).toLocaleDateString()}</td>
                                    <td className="td-cell text-sm font-mono">{req.requestedCheckIn || '-'} to {req.requestedCheckOut || '-'}</td>
                                    <td className="td-cell text-sm max-w-xs truncate" title={req.reason}>{req.reason}</td>
                                    <td className="td-cell">
                                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-semibold rounded-full ${statusStyles[req.status]?.bg} ${statusStyles[req.status]?.text}`}>
                                            {React.createElement(statusStyles[req.status].icon, { className: "h-3 w-3" })}
                                            {req.status.toLowerCase()}
                                        </span>
                                    </td>
                                    <td className="td-cell text-xs italic text-slate-500">{req.approverRemarks}</td>
                                    <td className="td-cell">{req.attachmentPath && <button onClick={() => handleViewAttachment(req)} className="text-primary hover:underline text-xs flex items-center gap-1"><Eye size={14} /> View</button>}</td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="6" className="text-center py-10 text-slate-500"><FileClock className="mx-auto h-12 w-12 text-slate-400" /><h3 className="mt-2 text-sm font-semibold text-slate-900">No Requests Found</h3><p className="mt-1 text-sm">You have not submitted any regularization requests.</p></td></tr>
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
};

export default MyMissingRequestsTab;