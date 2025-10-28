import React, { useState, useEffect, useMemo } from 'react';
import * as leaveApi from '../../pages/leaveApi';
import { Plus, Loader, AlertCircle, X, Calendar, FileClock, Check, MessageSquare, ArrowRight, Trash2 } from 'lucide-react';

// Modal for requesting a new leave
const RequestLeaveModal = ({ isOpen, onClose, onSubmit, loading, leaveTypes = [] }) => {
    const [formData, setFormData] = useState({
        leaveType: '',
        fromDate: '',
        toDate: '',
        reason: ''
    });
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            // Reset form and set default leave type when modal opens
            setFormData({
                leaveType: leaveTypes[0]?.leaveType || '',
                fromDate: '',
                toDate: '',
                reason: ''
            });
            setError('');
        }
    }, [isOpen, leaveTypes]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.fromDate || !formData.toDate || !formData.reason) {
            setError('All fields are required.');
            return;
        }
        if (new Date(formData.fromDate) > new Date(formData.toDate)) {
            setError('Start date cannot be after end date.');
            return;
        }
        setError('');
        onSubmit(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
            <div className="bg-card text-card-foreground rounded-lg shadow-xl w-full max-w-md">
                <div className="p-4 border-b border-border flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-foreground">Request Leave</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-foreground-muted hover:bg-background-muted">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="leaveType" className="block text-sm font-medium text-foreground-muted">Leave Type</label>
                            <select id="leaveType" name="leaveType" value={formData.leaveType} onChange={handleChange} required className="input bg-background-muted border-border text-foreground">
                                {leaveTypes.length > 0 ? (
                                    leaveTypes.map(lt => <option key={lt.id} value={lt.leaveType}>{lt.leaveType.replace('_', ' ')}</option>)
                                ) : (
                                    <option value="" disabled>No leave types available</option>
                                )}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="startDate" className="block text-sm font-medium text-foreground-muted">Start Date</label>
                                <input type="date" id="fromDate" name="fromDate" value={formData.fromDate} onChange={handleChange} required className="input bg-background-muted border-border text-foreground" />
                            </div>
                            <div>
                                <label htmlFor="endDate" className="block text-sm font-medium text-foreground-muted">End Date</label>
                                <input type="date" id="toDate" name="toDate" value={formData.toDate} onChange={handleChange} required className="input bg-background-muted border-border text-foreground" />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="reason" className="block text-sm font-medium text-foreground-muted">Reason</label>
                            <textarea id="reason" name="reason" value={formData.reason} onChange={handleChange} rows="3" required className="input bg-background-muted border-border text-foreground" placeholder="Please provide a reason for your leave..."></textarea>
                        </div>
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                    </div>
                    <div className="p-4 border-t border-border bg-background-muted flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading && <Loader className="animate-spin h-4 w-4 mr-2" />}
                            Submit Request
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// A map for styling statuses
const statusStyles = {
    SUBMITTED: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: FileClock },
    APPROVED: { bg: 'bg-green-100', text: 'text-green-800', icon: Check },
    REJECTED: { bg: 'bg-red-100', text: 'text-red-800', icon: X },
    CANCELLED: { bg: 'bg-slate-100', text: 'text-slate-600', icon: X },
};

const LeaveHistoryCard = ({ request, onCancel }) => {
    const { id, leaveType, fromDate, toDate, reason, status, leaveApprovals } = request;
    const displayStatus = status || 'SUBMITTED';
    const StatusIcon = statusStyles[displayStatus]?.icon || FileClock;

    const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A';

    return (
        <div className="bg-card p-4 rounded-lg shadow-sm border border-border flex flex-col justify-between">
            <div>
                <div className="flex justify-between items-start">
                    <h4 className="font-semibold text-foreground">{(leaveType?.leaveType || leaveType || '').replace('_', ' ')}</h4>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${statusStyles[displayStatus]?.bg} ${statusStyles[displayStatus]?.text}`}>
                        <StatusIcon className="h-3.5 w-3.5" />
                        {displayStatus.toLowerCase()}
                    </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground-muted mt-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(fromDate)}</span>
                    <ArrowRight className="h-4 w-4" />
                    <span>{formatDate(toDate)}</span>
                </div>
                <p className="text-sm text-foreground-muted mt-3 flex items-start gap-2">
                    <MessageSquare className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>{reason || 'No reason provided.'}</span>
                </p>
                {(status === 'APPROVED' || status === 'REJECTED') && leaveApprovals && leaveApprovals.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500 space-y-2">
                        {leaveApprovals.map((approval) => (
                            <div key={approval.id}>
                                <p>
                                    <span className={`font-semibold ${approval.action === 'APPROVED' ? 'text-green-700' : 'text-red-700'}`}>
                                        {approval.action}
                                    </span>
                                    {' by '}
                                    <span className="font-semibold">{approval.approverName || 'Admin'}</span>
                                    {' on '}{formatDate(approval.actionAt)}
                                </p>
                                {approval.comment && <p className="italic mt-0.5">Note: {approval.comment}</p>}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {displayStatus === 'SUBMITTED' && canManage && ( // Assuming canManage is available in scope or passed as prop
                <div className="mt-4 pt-3 border-t border-slate-200 flex justify-end">
                    <button onClick={() => onCancel(id)} className="flex items-center px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors">
                        <Trash2 className="h-4 w-4 mr-1.5" />
                        Cancel Request
                    </button>
                </div>
            )}
        </div>
    );
};

const LeavesView = () => {
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [leaveTypes, setLeaveTypes] = useState([]);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('ALL');

    const API_URL = import.meta.env.VITE_API_BASE_URL;
    const employeeCode = localStorage.getItem('employeeCode');

    const fetchLeaves = async () => {
        if (!employeeCode) {
            setError("Employee code not found. Cannot fetch leave data.");
            setLoading(false);
            return;
        }
        setLoading(true);
        setError('');
        try {
            const response = await leaveApi.getLeaveRequestsForEmployee(employeeCode);
            // Sort leaves by most recent first.
            const sortedLeaves = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setLeaves(sortedLeaves);
        } catch (err) {
            setError('Failed to fetch leave history. Please try again later.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchLeaveTypes = async () => {
            try {
                const response = await leaveApi.getAllLeaveTypes();
                // It's good practice to only show leave types that can be requested (e.g., paid leaves)
                setLeaveTypes(response.data.filter(lt => lt.isPaid));
            } catch (err) {
                console.error("Failed to fetch leave types", err);
            }
        };

        fetchLeaves();
        fetchLeaveTypes();
    }, [API_URL, employeeCode]);

    const handleSubmitLeave = async (leaveData) => {
        setModalLoading(true);
        try {
            const startDate = new Date(leaveData.fromDate);
            const endDate = new Date(leaveData.toDate);
            const daysRequested = (endDate - startDate) / (1000 * 60 * 60 * 24) + 1;

            const payload = {
                employeeCode,
                leaveType: leaveData.leaveType,
                fromDate: leaveData.fromDate,
                toDate: leaveData.toDate,
                reason: leaveData.reason,
                daysRequested,
                partialDayInfo: null, // Or implement this field in the modal if needed
            };

            await leaveApi.createLeaveRequest(payload);
            setIsModalOpen(false);
            fetchLeaves(); // Refetch to show the new leave request
            alert('Leave request submitted successfully!');
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.response?.data || 'Failed to submit leave request. Please try again.';
            alert(`Error: ${errorMessage}`);
            console.error(err);
        } finally {
            setModalLoading(false);
        }
    };

    const handleCancelLeave = async (leaveId) => {
        if (!window.confirm("Are you sure you want to cancel this leave request?")) return;

        setLoading(true);
        setError('');
        try {
            await leaveApi.cancelLeaveRequest(leaveId);
            fetchLeaves();
            alert('Leave request cancelled successfully.');
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to cancel leave request.';
            setError(errorMessage);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filteredLeaves = useMemo(() => {
        if (activeTab === 'ALL') return leaves;
        return leaves.filter(leave => (leave.status || 'SUBMITTED') === activeTab);
    }, [leaves, activeTab]);

    const TABS = ['ALL', 'SUBMITTED', 'APPROVED', 'REJECTED', 'CANCELLED'];

    return (
        <div className="p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-foreground">My Leaves</h1>
                <button
                    onClick={() => setIsModalOpen(true)} className="btn-primary">
                    <Plus className="h-5 w-5 mr-2" />
                    Request Leave
                </button>
            </div>

            <div className="flex border-b border-border mb-6">
                {TABS.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 text-sm font-medium transition-colors ${
                            activeTab === tab
                                ? 'border-b-2 border-primary text-primary'
                                : 'border-b-2 border-transparent text-foreground-muted hover:text-foreground'
                        }`}
                    >
                        {tab.charAt(0) + tab.slice(1).toLowerCase()}
                    </button>
                ))}
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-600 px-4 py-3 rounded relative mb-4" role="alert">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center items-center h-64"><Loader className="h-8 w-8 animate-spin text-primary" /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredLeaves.length > 0 ? (
                        filteredLeaves.map(leave => (
                            <LeaveHistoryCard key={leave.id} request={leave} onCancel={handleCancelLeave} />
                        ))
                    ) : (
                        <div className="col-span-full text-center text-slate-500 py-10">
                            <FileClock className="mx-auto h-12 w-12 text-foreground-muted/50" />
                            <h3 className="mt-2 text-sm font-semibold text-foreground">No leave requests</h3>
                            <p className="mt-1 text-sm text-foreground-muted">
                                {activeTab === 'ALL' ? "You haven't requested any leaves yet." : `You have no ${activeTab.toLowerCase()} leave requests.`}
                            </p>
                        </div>
                    )}
                </div>
            )}

            <RequestLeaveModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmitLeave}
                loading={modalLoading}
                leaveTypes={leaveTypes}
            />
        </div>
    );
}

export default LeavesView;
