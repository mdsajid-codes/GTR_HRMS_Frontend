import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { LogIn, LogOut, UserCheck, UserX, AlertTriangle, ChevronsLeft, ChevronsRight, Loader, Clock } from 'lucide-react';

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
    const API_URL = import.meta.env.VITE_API_BASE_URL;
    const employeeCode = localStorage.getItem('employeeCode');

    useEffect(() => {
        if (!employeeCode) {
            // This case is handled in the parent, but as a safeguard:
            setError('Employee code not found. Please log in again.');
            setLoading(false);
            return;
        }

        const fetchAttendance = async () => {
            setLoading(true);
            setError('');
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            const startDate = new Date(year, month, 1).toISOString().slice(0, 10);
            const endDate = new Date(year, month + 1, 0).toISOString().slice(0, 10);

            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${API_URL}/attendance-records/employee/${employeeCode}`, {
                    params: { startDate, endDate },
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const sortedData = response.data.sort((a, b) => new Date(a.attendanceDate) - new Date(b.attendanceDate));
                setAttendanceData(sortedData);

                // Find today's record to manage the check-in/out button state
                const todayString = new Date().toISOString().slice(0, 10);
                const today = sortedData.find(rec => rec.attendanceDate === todayString);
                setTodaysRecord(today || null);
            } catch (err) {
                console.error("Failed to fetch attendance data", err);
                setError('Could not load your attendance data.');
            } finally {
                setLoading(false);
            }
        };

        fetchAttendance();
    }, [currentDate, employeeCode, API_URL]);

    const stats = useMemo(() => {
        return {
            present: attendanceData.filter(d => d.status === 'PRESENT' || d.status === 'HALF_DAY').length,
            absent: attendanceData.filter(d => d.status === 'ABSENT').length,
            late: attendanceData.filter(d => d.isLate).length,
            overtime: attendanceData.reduce((acc, curr) => acc + (curr.overtimeMinutes || 0), 0),
        };
    }, [attendanceData]);

    const changeMonth = (offset) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(newDate.getMonth() + offset);
            return newDate;
        });
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
                // This is a Check Out action
                const payload = { ...todaysRecord, checkOut: currentTime };
                const response = await axios.put(`${API_URL}/attendance-records/${todaysRecord.id}`, payload, { headers });
                setTodaysRecord(response.data);
            } else {
                // This is a Check In action
                const payload = {
                    employeeCode,
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
            const startDate = new Date(year, month, 1).toISOString().slice(0, 10);
            const endDate = new Date(year, month + 1, 0).toISOString().slice(0, 10);
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
        if (!todaysRecord || !todaysRecord.checkIn) {
            return <button onClick={handleAttendanceAction} className="btn-primary flex items-center gap-2"><LogIn size={18} /> Check In</button>;
        }
        if (todaysRecord.checkIn && !todaysRecord.checkOut) {
            return <button onClick={handleAttendanceAction} className="btn-danger flex items-center gap-2"><LogOut size={18} /> Check Out</button>;
        }
        return <button className="btn-secondary cursor-not-allowed flex items-center gap-2" disabled>Checked Out</button>;
    };

    return (
        <div className="p-6 md:p-8 space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <h1 className="text-3xl font-bold text-slate-800">My Attendance</h1>
                <div className="flex items-center gap-4">
                    {renderAttendanceButton()}
                    <div className="flex items-center gap-2 bg-white p-1 rounded-lg shadow-sm">
                        <button onClick={() => changeMonth(-1)} className="p-2 rounded-md hover:bg-slate-100"><ChevronsLeft className="h-5 w-5" /></button>
                        <span className="font-semibold text-slate-700 w-32 text-center">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                        <button onClick={() => changeMonth(1)} className="p-2 rounded-md hover:bg-slate-100"><ChevronsRight className="h-5 w-5" /></button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={UserCheck} title="Present Days" value={stats.present} color="bg-green-500" />
                <StatCard icon={UserX} title="Absent Days" value={stats.absent} color="bg-red-500" />
                <StatCard icon={AlertTriangle} title="Late Comings" value={stats.late} color="bg-orange-500" />
                <StatCard icon={Clock} title="Overtime" value={`${Math.floor(stats.overtime / 60)}h ${stats.overtime % 60}m`} color="bg-blue-500" />
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-xl font-semibold text-slate-800 mb-4">Monthly Log</h2>
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="flex justify-center items-center h-64"><Loader className="animate-spin h-8 w-8 text-blue-600" /></div>
                    ) : error ? (
                        <div className="text-center py-10 text-red-500">{error}</div>
                    ) : (
                        <table className="w-full text-sm text-left text-slate-500">
                            <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                                <tr>
                                    <th className="th-cell">Date</th>
                                    <th className="th-cell">Status</th>
                                    <th className="th-cell text-center">Check In</th>
                                    <th className="th-cell text-center">Check Out</th>
                                    <th className="th-cell text-center">Work Hours</th>
                                </tr>
                            </thead>
                            <tbody className="text-slate-700">
                                {attendanceData.map(record => (
                                    <tr key={record.id} className="border-b border-slate-200 hover:bg-slate-50">
                                        <td className="td-cell font-medium">{new Date(record.attendanceDate).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' })}</td>
                                        <td className="td-cell"><StatusBadge status={record.status} /></td>
                                        <td className="td-cell text-center font-mono">{formatTime(record.checkIn)}</td>
                                        <td className="td-cell text-center font-mono">{formatTime(record.checkOut)}</td>
                                        <td className="td-cell text-center font-mono">{calculateDuration(record.checkIn, record.checkOut)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AttendanceView;
