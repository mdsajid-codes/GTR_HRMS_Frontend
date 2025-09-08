import React, { useState, useMemo } from 'react';
import { Check, X, FileClock, CalendarDays, MessageSquare, ArrowRight } from 'lucide-react';
import axios from 'axios';

// A map for styling statuses
const statusStyles = {
    PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: FileClock },
    APPROVED: { bg: 'bg-green-100', text: 'text-green-800', icon: Check },
    REJECTED: { bg: 'bg-red-100', text: 'text-red-800', icon: X },
    CANCELLED: { bg: 'bg-slate-100', text: 'text-slate-600', icon: X },
};

const LeaveCard = ({ request, onUpdate }) => {
    const { id, leaveType, startDate, endDate, reason, status, createdAt } = request;
    const displayStatus = status || 'PENDING';
    const StatusIcon = statusStyles[displayStatus]?.icon || FileClock;

    const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A';

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex flex-col justify-between">
            <div>
                <div className="flex justify-between items-start">
                    <h4 className="font-semibold text-slate-800">{leaveType}</h4>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${statusStyles[displayStatus]?.bg} ${statusStyles[displayStatus]?.text}`}>
                        <StatusIcon className="h-3.5 w-3.5" />
                        {displayStatus.toLowerCase()}
                    </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500 mt-2">
                    <CalendarDays className="h-4 w-4" />
                    <span>{formatDate(startDate)}</span>
                    <ArrowRight className="h-4 w-4" />
                    <span>{formatDate(endDate)}</span>
                </div>
                <p className="text-sm text-slate-600 mt-3 flex items-start gap-2">
                    <MessageSquare className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>{reason || 'No reason provided.'}</span>
                </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200">
                {displayStatus === 'PENDING' ? (
                    <div className="flex items-center justify-end gap-2">
                        <button 
                            onClick={() => onUpdate(id, 'REJECTED')}
                            className="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                        >
                            Reject
                        </button>
                        <button 
                            onClick={() => onUpdate(id, 'APPROVED')}
                            className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                        >
                            Approve
                        </button>
                    </div>
                ) : (
                    <div className="text-xs text-slate-400 text-right">
                        Applied on {formatDate(createdAt)}
                    </div>
                )}
            </div>
        </div>
    );
};


const Leave = ({ employee }) => {
    const [activeTab, setActiveTab] = useState('PENDING');
    const [leaveRequests, setLeaveRequests] = useState(employee?.leaves || []);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const API_URL = import.meta.env.VITE_API_BASE_URL;

    // Update local state if employee prop changes
    React.useEffect(() => {
        setLeaveRequests(employee?.leaves || []);
    }, [employee]);

    const handleUpdateStatus = async (leaveId, newStatus) => {
        setLoading(true);
        setError('');
        try {
            // This is an optimistic update. We can revert if API call fails.
            const updatedRequests = leaveRequests.map(req => 
                req.id === leaveId ? { ...req, status: newStatus } : req
            );
            setLeaveRequests(updatedRequests);

            await axios.put(`${API_URL}/leaves/${employee.employeeCode}/${leaveId}`, { status: newStatus, approvedBy: localStorage.getItem('username') }, {
                headers: { "Authorization": `Bearer ${localStorage.getItem('token')}` }
            });
            // No need to set state again if API call is successful
        } catch (err) {
            // Revert the optimistic update on failure
            setLeaveRequests(employee?.leaves || []);
            const errorMessage = err.response?.data?.message || 'Failed to update leave status.';
            setError(errorMessage);
            console.error("Error updating leave status:", err);
        } finally {
            setLoading(false);
        }
    };

    const filteredRequests = useMemo(() => 
        leaveRequests.filter(request => (request.status || 'PENDING') === activeTab),
        [leaveRequests, activeTab]
    );

    const TABS = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];

    return (
        <div>
            <div className="flex border-b border-slate-200 mb-6">
                {TABS.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 text-sm font-medium transition-colors ${
                            activeTab === tab
                                ? 'border-b-2 border-blue-600 text-blue-600'
                                : 'border-b-2 border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        {tab.charAt(0) + tab.slice(1).toLowerCase()}
                    </button>
                ))}
            </div>

            {error && <div className="text-center text-red-600 p-4 bg-red-50 rounded-md mb-4">{error}</div>}

            {loading && <div className="text-center text-slate-500">Updating...</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRequests.length > 0 ? (
                    filteredRequests.map(request => (
                        <LeaveCard key={request.id} request={request} onUpdate={handleUpdateStatus} />
                    ))
                ) : (
                    <div className="col-span-full text-center text-slate-500 py-10">
                        <FileClock className="mx-auto h-12 w-12 text-slate-400" />
                        <h3 className="mt-2 text-sm font-semibold text-slate-900">No {activeTab.toLowerCase()} requests</h3>
                        <p className="mt-1 text-sm text-slate-500">There are no leave requests with this status.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Leave;
