import React, { useState, useMemo, useEffect } from 'react';
import { Calendar, Search, ChevronDown, UserCheck, UserX, Plane, Briefcase, Loader } from 'lucide-react';
import axios from 'axios';

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
    return (
        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${style}`}>
            {label}
        </span>
    );
};

const AttendanceLog = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
    const [attendanceData, setAttendanceData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const API_URL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        const fetchAttendance = async () => {
            if (!date) return;
            setLoading(true);
            setError('');
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${API_URL}/attendance-records`, {
                    params: { date },
                    headers: { "Authorization": `Bearer ${token}` }
                });
                setAttendanceData(response.data);
            } catch (err) {
                console.error("Failed to fetch attendance data", err);
                setError('Failed to load attendance data. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchAttendance();
    }, [date, API_URL]);

    const filteredData = useMemo(() => {
        return attendanceData.filter(item => {
            const employeeName = item.employee?.name || '';
            const employeeCode = item.employee?.employeeCode || '';
            const matchesSearch = employeeName.toLowerCase().includes(searchTerm.toLowerCase()) || employeeCode.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [searchTerm, statusFilter, attendanceData]);

    const stats = useMemo(() => ({
        present: attendanceData.filter(e => e.status === 'PRESENT').length,
        absent: attendanceData.filter(e => e.status === 'ABSENT').length,
        onLeave: attendanceData.filter(e => e.status === 'ON_LEAVE').length,
        halfDay: attendanceData.filter(e => e.status === 'HALF_DAY').length,
    }), [attendanceData]);

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <h2 className="text-2xl font-bold text-slate-800">Daily Attendance Log</h2>
                <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input pl-10" />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={UserCheck} title="Present" value={stats.present} color="bg-green-500" />
                <StatCard icon={UserX} title="Absent" value={stats.absent} color="bg-red-500" />
                <StatCard icon={Plane} title="On Leave / Half Day" value={stats.onLeave + stats.halfDay} color="bg-yellow-500" />
                <StatCard icon={Briefcase} title="Total Records" value={attendanceData.length} color="bg-blue-500" />
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input type="text" placeholder="Search employee..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input pl-10" />
                    </div>
                    <div className="relative">
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input appearance-none pr-8">
                            <option value="All">All Statuses</option>
                            <option value="PRESENT">Present</option>
                            <option value="ABSENT">Absent</option>
                            <option value="ON_LEAVE">On Leave</option>
                            <option value="HALF_DAY">Half Day</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="flex justify-center items-center h-64"><Loader className="animate-spin h-8 w-8 text-blue-600" /></div>
                    ) : error ? (
                        <div className="text-center py-10 text-red-500">{error}</div>
                    ) : (
                        <table className="w-full text-sm text-left text-slate-500">
                            <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Employee</th>
                                    <th scope="col" className="px-6 py-3">Department</th>
                                    <th scope="col" className="px-6 py-3">Status</th>
                                    <th scope="col" className="px-6 py-3 text-center">Check In</th>
                                    <th scope="col" className="px-6 py-3 text-center">Check Out</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.map((item) => (
                                    <tr key={item.id} className="bg-white border-b hover:bg-slate-50">
                                        <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                                            <div className="font-bold">{item.employee?.firstName || 'Unknown'}</div>
                                            <div className="text-xs text-slate-500">{item.employee?.employeeCode || 'N/A'}</div>
                                        </td>
                                        <td className="px-6 py-4">{item.employee?.department?.name || 'N/A'}</td>
                                        <td className="px-6 py-4"><StatusBadge status={item.status} /></td>
                                        <td className="px-6 py-4 text-center">{item.checkIn || '-'}</td>
                                        <td className="px-6 py-4 text-center">{item.checkOut || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AttendanceLog;