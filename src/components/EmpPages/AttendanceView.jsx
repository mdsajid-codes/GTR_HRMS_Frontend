import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { LogIn, LogOut, UserCheck, UserX, AlertTriangle, ChevronsLeft, ChevronsRight, Loader, Clock, CalendarOff, UserMinus, Plane, HelpCircle, Eye, BookOpen } from 'lucide-react';
import MissingAttendanceRequestModal from './MissingAttendanceRequestModal';
import MyMissingRequestsTab from './MyMissingRequestsTab';

// Helper to format time from "HH:mm:ss" to "HH:mm AM/PM"
const formatTime = (timeString) => {
    if (!timeString) return '-';
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10), parseInt(minutes, 10));
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
};

// Helper to calculate work duration
const calculateDuration = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return '-';
    try {
        const start = new Date(`1970-01-01T${checkIn}`);
        const end = new Date(`1970-01-01T${checkOut}`);
        if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return '-';
        
        let diff = end.getTime() - start.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        diff -= hours * (1000 * 60 * 60);
        const mins = Math.floor(diff / (1000 * 60));
        
        return `${hours}h ${mins}m`;
    } catch (e) {
        return '-';
    }
};

const StatCard = ({ icon: Icon, title, value, color }) => (
    <div className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-4">
        <div className={`p-3 rounded-lg ${color}`}>
            <Icon className="h-6 w-6 text-white" />
        </div>
        <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="text-2xl font-bold text-slate-800">{value}</p>
        </div>
    </div>
);

const StatusBadge = ({ status }) => {
    const statusStyles = {
        PRESENT: { label: 'Present', style: 'bg-green-100 text-green-700' },
        ABSENT: { label: 'Absent', style: 'bg-red-100 text-red-700' },
        ON_LEAVE: { label: 'On Leave', style: 'bg-yellow-100 text-yellow-700' },
        HALF_DAY: { label: 'Half Day', style: 'bg-orange-100 text-orange-700' },
        HOLIDAY: { label: 'Holiday', style: 'bg-purple-100 text-purple-700' },
        WEEKLY_OFF: { label: 'Weekly Off', style: 'bg-blue-100 text-blue-700' },
    };
    const { label, style } = statusStyles[status] || { label: status, style: 'bg-slate-100 text-slate-600' };
    return <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${style}`}>{label}</span>;
};

const AttendanceView = () => {
    const [attendanceData, setAttendanceData] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [todaysRecord, setTodaysRecord] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('Log');
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [employeeDetails, setEmployeeDetails] = useState(null);
    const API_URL = import.meta.env.VITE_API_BASE_URL;
    const employeeCode = localStorage.getItem('employeeCode');

    useEffect(() => {
        if (!employeeCode) {
            // This case is handled in the parent, but as a safeguard:
            setError('Employee code not found. Please log in again.');
            setLoading(false);
            return;
        }

        const fetchInitialDetails = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const headers = { "Authorization": `Bearer ${token}` };
                const [timeRes, jobRes] = await Promise.all([
                    axios.get(`${API_URL}/time-attendence/${employeeCode}`, { headers }).catch(() => ({ data: null })),
                    axios.get(`${API_URL}/job-details/${employeeCode}`, { headers }).catch(() => ({ data: null }))
                ]);
                setEmployeeDetails({
                    ...timeRes.data,
                    jobDetails: jobRes.data
                });
            } catch (err) {
                console.error("Failed to fetch employee details", err);
                setError('Could not load employee profile information.');
            } finally {
                setLoading(false);
            }
        };

        fetchInitialDetails();
    }, [employeeCode, API_URL]);

    useEffect(() => {
        const fetchAttendance = async () => {
            setLoading(true);
            setError('');
            try {
                const token = localStorage.getItem('token');
                const headers = { "Authorization": `Bearer ${token}` };
                
                const year = currentDate.getFullYear();
                const month = currentDate.getMonth();
                const startDate = new Date(year, month, 1).toISOString().slice(0, 10);
                const endDate = new Date(year, month + 1, 0).toISOString().slice(0, 10);

                const response = await axios.get(`${API_URL}/attendance-records/employee/${employeeCode}`, {
                    params: { startDate, endDate },
                    headers
                });
                
                const sortedData = response.data.sort((a, b) => new Date(b.attendanceDate) - new Date(a.attendanceDate));
                setAttendanceData(sortedData);

                // Find today's record to manage the check-in/out button state
                const todayString = new Date().toISOString().slice(0, 10);
                const todayRecord = sortedData.find(rec => rec.attendanceDate === todayString);
                setTodaysRecord(todayRecord || null);
            } catch (err) {
                console.error("Failed to fetch attendance data", err);
                setError('Could not load your attendance data.');
            } finally {
                setLoading(false);
            }
        };

        // Only fetch attendance if we have the employee details (specifically the joining date)
        if (employeeDetails?.jobDetails) {
            fetchAttendance();
        }
    }, [currentDate, employeeDetails]);

    const stats = useMemo(() => {
        return {
            present: attendanceData.filter(d => d.status === 'PRESENT').length,
            absent: attendanceData.filter(d => d.status === 'ABSENT').length,
            onLeave: attendanceData.filter(d => d.status === 'ON_LEAVE').length,
            halfDay: attendanceData.filter(d => d.status === 'HALF_DAY').length,
            late: attendanceData.filter(d => d.isLate).length,
            overtime: attendanceData.reduce((acc, curr) => acc + (curr.overtimeMinutes || 0), 0),
        };
    }, [attendanceData]);

    const overtimeFormatted = `${Math.floor(stats.overtime / 60)}h ${stats.overtime % 60}m`;

    const changeMonth = (offset) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(newDate.getMonth() + offset);
            return newDate;
        });
    };

    const handleRequestSubmit = async (formData) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/missing-attendance/request/${employeeCode}`, formData, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                }
            });
            alert('Your request has been submitted successfully.');
            setIsRequestModalOpen(false);
            // Optionally, refetch requests history here if you add it to this view
        } catch (err) {
            console.error("Failed to submit missing attendance request", err);
            alert(err.response?.data?.message || "An error occurred while submitting your request.");
        } finally {
            setLoading(false);
        }
    };

    const handleAttendanceAction = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        const headers = { "Authorization": `Bearer ${token}` };
        const now = new Date();
        const currentTime = now.toTimeString().split(' ')[0]; // "HH:mm:ss"
        const currentDateString = now.toISOString().slice(0, 10);

        try {
            if (todaysRecord && todaysRecord.checkIn && !todaysRecord.checkOut) {
                // This is a Check Out action.
                const payload = {
                    employeeCode,
                    attendanceDate: todaysRecord.attendanceDate,
                    checkIn: todaysRecord.checkIn,
                    checkOut: currentTime,
                    attendancePolicyId: employeeDetails?.attendancePolicy?.id || null,
                };
                const response = await axios.put(`${API_URL}/attendance-records/${todaysRecord.id}`, payload, { headers });
                setTodaysRecord(response.data);
            } else {
                // This is a Check In action
                const payload = {
                    employeeCode,
                    attendancePolicyId: employeeDetails?.attendancePolicy?.id || null,
                    attendanceDate: currentDateString,
                    checkIn: currentTime,
                    status: 'PRESENT'
                };
                const response = await axios.post(`${API_URL}/attendance-records`, payload, { headers });
                setTodaysRecord(response.data);
            }

            // Refresh the whole month's data
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            // To ensure correct timezone handling, construct date parts separately
            const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
            const lastDay = new Date(year, month + 1, 0).getDate();
            const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

            const updatedResponse = await axios.get(`${API_URL}/attendance-records/employee/${employeeCode}`, { params: { startDate, endDate }, headers });
            setAttendanceData(updatedResponse.data.sort((a, b) => new Date(a.attendanceDate) - new Date(b.attendanceDate)));
        } catch (err) { 
            console.error("Failed to mark attendance", err);
            setError(err.response?.data?.message || "An error occurred while marking attendance.");
        } finally {
            setLoading(false);
        }
    };

    const renderAttendanceButton = () => {
        if (loading) {
            return <button className="btn-secondary cursor-not-allowed flex items-center gap-2" disabled><Loader className="animate-spin h-4 w-4" /> Loading...</button>;
        }

        if (!todaysRecord || !todaysRecord.checkIn) {
            return <button onClick={handleAttendanceAction} className="btn-primary flex items-center gap-2"><LogIn size={18} /> Check In</button>;
        }
        if (todaysRecord.checkIn && !todaysRecord.checkOut) {
            return <button onClick={handleAttendanceAction} className="btn-danger flex items-center gap-2"><LogOut size={18} /> Check Out</button>;
        }
        return <button className="btn-secondary cursor-not-allowed flex items-center gap-2" disabled>Checked Out</button>;
    };

    if (!loading && !employeeDetails?.jobDetails) {
        return (
            <div className="p-8 text-center">
                <AlertCircle className="mx-auto h-12 w-12 text-slate-400" />
                <h3 className="mt-2 text-lg font-medium text-slate-900">Configuration Missing</h3>
                <p className="mt-1 text-sm text-slate-500">{error || "Your Time & Attendance settings have not been configured. Please contact HR."}</p>
            </div>
        );
    }

    const TABS = [
        { name: 'Log', icon: BookOpen },
        { name: 'My Requests', icon: HelpCircle },
    ];

    return (
        <div className="p-6 md:p-8 space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <h1 className="text-3xl font-bold text-slate-800">My Attendance</h1>
                <div className="flex items-center gap-4">
                    <button onClick={() => setIsRequestModalOpen(true)} className="btn-secondary flex items-center gap-2">
                        <HelpCircle size={16} /> Request Regularization
                    </button>
                    {renderAttendanceButton()}
                    <div className="flex items-center gap-2 bg-white p-1 rounded-lg shadow-sm">
                        <button onClick={() => changeMonth(-1)} className="p-2 rounded-md hover:bg-slate-100"><ChevronsLeft className="h-5 w-5" /></button>
                        <span className="font-semibold text-slate-700 w-32 text-center">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                        <button onClick={() => changeMonth(1)} className="p-2 rounded-md hover:bg-slate-100"><ChevronsRight className="h-5 w-5" /></button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={UserCheck} title="Present" value={stats.present} color="bg-green-500" />
                <StatCard icon={UserMinus} title="Half Days" value={stats.halfDay} color="bg-orange-500" />
                <StatCard icon={Plane} title="On Leave" value={stats.onLeave} color="bg-yellow-500" />
                <StatCard icon={UserX} title="Absent" value={stats.absent} color="bg-red-500" />
                <StatCard icon={AlertTriangle} title="Late Comings" value={stats.late} color="bg-orange-500" />
                <StatCard icon={Clock} title="Overtime" value={overtimeFormatted} color="bg-blue-500" />
            </div>

            <div className="bg-white rounded-xl shadow-sm">
                <div className="border-b border-slate-200">
                    <nav className="-mb-px flex space-x-6 px-6" aria-label="Tabs">
                        {TABS.map(tab => (
                            <button
                                key={tab.name}
                                onClick={() => setActiveTab(tab.name)}
                                className={`whitespace-nowrap flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                                    activeTab === tab.name
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                }`}
                            >
                                <tab.icon className="h-5 w-5" />
                                {tab.name}
                            </button>
                        ))}
                    </nav>
                </div>
                <div className="p-6">
                    {activeTab === 'Log' && (
                        <div className="overflow-x-auto">
                            {loading ? (
                                <div className="flex justify-center items-center h-64"><Loader className="animate-spin h-8 w-8 text-blue-600" /></div>
                            ) : error ? (
                                <div className="text-center py-10 text-red-500">{error}</div>
                            ) : (
                                <table className="w-full text-sm text-left text-slate-500">
                                    <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                                        <tr>
                                            <th className="th-cell">Date</th><th className="th-cell">Status</th><th className="th-cell text-center">Check In</th><th className="th-cell text-center">Check Out</th><th className="th-cell text-center">Work Hours</th><th className="th-cell">Remarks</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-slate-700">
                                        {attendanceData.map(record => (
                                            <tr key={record.id} className="border-b border-slate-200 hover:bg-slate-50">
                                                <td className="td-cell font-medium">{new Date(record.attendanceDate).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' })}</td>
                                                <td className="td-cell"><StatusBadge status={record.status} /></td>
                                                <td className="td-cell text-center font-mono">{formatTime(record.checkIn)}{record.isLate && (<span className="ml-2 text-xs font-semibold bg-red-100 text-red-700 px-1.5 py-0.5 rounded">Late</span>)}</td>
                                                <td className="td-cell text-center font-mono">{formatTime(record.checkOut)}</td>
                                                <td className="td-cell text-center font-mono">{calculateDuration(record.checkIn, record.checkOut)}</td>
                                                <td className="td-cell text-xs text-slate-500">{record.remarks}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}
                    {activeTab === 'My Requests' && (
                        <MyMissingRequestsTab employeeCode={employeeCode} />
                    )}
                </div>
            </div>
            <MissingAttendanceRequestModal
                isOpen={isRequestModalOpen}
                onClose={() => setIsRequestModalOpen(false)}
                onSubmit={handleRequestSubmit}
                loading={loading}
            />
        </div>
    );
}

export default AttendanceView;
