import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Check, X, FileClock, Loader, AlertCircle, Search } from 'lucide-react';

// A map for styling statuses
const statusStyles = {
    SUBMITTED: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: FileClock },
    APPROVED: { bg: 'bg-green-100', text: 'text-green-800', icon: Check },
    REJECTED: { bg: 'bg-red-100', text: 'text-red-800', icon: X },
    CANCELLED: { bg: 'bg-slate-100', text: 'text-slate-600', icon: X },
};

const LeaveRequestRow = ({ request, onUpdate }) => {
    const { id, employee, leaveType, fromDate, toDate, reason, status } = request;
    const displayStatus = status || 'SUBMITTED';
    const StatusIcon = statusStyles[displayStatus]?.icon || FileClock;

    const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A';

    return (
        <tr className="border-b border-slate-200 hover:bg-slate-50">
            <td className="td-cell">
                <div className="font-medium">{`${employee.firstName} ${employee.lastName}`}</div>
                <div className="text-sm text-slate-500">{employee.employeeCode}</div>
            </td>
            <td className="td-cell">{leaveType.leaveType}</td>
            <td className="td-cell text-sm">{formatDate(fromDate)} to {formatDate(toDate)}</td>
            <td className="td-cell text-sm max-w-xs truncate" title={reason}>{reason}</td>
            <td className="td-cell">
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-semibold rounded-full ${statusStyles[displayStatus]?.bg} ${statusStyles[displayStatus]?.text}`}>
                    <StatusIcon className="h-3 w-3" />
                    {displayStatus.toLowerCase()}
                </span>
            </td>
            <td className="td-cell">
                {displayStatus === 'SUBMITTED' ? (
                    <div className="flex items-center gap-2">
                        <button onClick={() => onUpdate(id, 'REJECTED')} className="p-1.5 text-red-600 hover:bg-red-100 rounded-full" title="Reject"><X className="h-4 w-4" /></button>
                        <button onClick={() => onUpdate(id, 'APPROVED')} className="p-1.5 text-green-600 hover:bg-green-100 rounded-full" title="Approve"><Check className="h-4 w-4" /></button>
                    </div>
                ) : null}
            </td>
        </tr>
    );
};

const AllLeaveRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('SUBMITTED');
    const [searchTerm, setSearchTerm] = useState('');
    const API_URL = import.meta.env.VITE_API_BASE_URL;

    const fetchRequests = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/leave-requests`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            setRequests(response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        } catch (err) {
            setError('Failed to fetch leave requests.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [API_URL]);

    const handleUpdateStatus = async (leaveId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/leave-requests/${leaveId}/status`, { status: newStatus, approvedBy: localStorage.getItem('username') }, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            fetchRequests(); // Refetch to get the updated list
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update leave status.');
        }
    };

    const filteredRequests = useMemo(() => {
        let filtered = requests.filter(req => (req.status || 'SUBMITTED') === activeTab);
        if (searchTerm) {
            const lowercasedFilter = searchTerm.toLowerCase();
            filtered = filtered.filter(req =>
                req.employee.firstName.toLowerCase().includes(lowercasedFilter) ||
                req.employee.lastName.toLowerCase().includes(lowercasedFilter) ||
                req.employee.employeeCode.toLowerCase().includes(lowercasedFilter)
            );
        }
        return filtered;
    }, [requests, activeTab, searchTerm]);

    const TABS = ['SUBMITTED', 'APPROVED', 'REJECTED', 'CANCELLED'];

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
                <div className="flex border-b border-slate-200">
                    {TABS.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-3 py-2 text-sm font-medium whitespace-nowrap ${
                                activeTab === tab
                                    ? 'border-b-2 border-blue-600 text-blue-600'
                                    : 'border-b-2 border-transparent text-slate-500 hover:text-slate-800'
                            }`}
                        >
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
                            <th className="th-cell">Employee</th><th className="th-cell">Leave Type</th><th className="th-cell">Dates</th><th className="th-cell">Reason</th><th className="th-cell">Status</th><th className="th-cell">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" className="text-center py-10"><Loader className="h-8 w-8 animate-spin text-blue-600 mx-auto" /></td></tr>
                        ) : filteredRequests.length > 0 ? (
                            filteredRequests.map(req => (<LeaveRequestRow key={req.id} request={req} onUpdate={handleUpdateStatus} />))
                        ) : (
                            <tr><td colSpan="6" className="text-center py-10 text-slate-500"><FileClock className="mx-auto h-12 w-12 text-slate-400" /><h3 className="mt-2 text-sm font-semibold text-slate-900">No requests found</h3><p className="mt-1 text-sm text-slate-500">There are no leave requests matching your criteria.</p></td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AllLeaveRequests;