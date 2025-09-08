import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Calendar, Clock, ArrowRight, Loader, AlertCircle } from 'lucide-react';

// Mock data for demonstration. In a real app, this would come from an API.

const StatCard = ({ icon: Icon, title, value, onClick, linkText, iconBgColor = 'bg-blue-100', iconTextColor = 'text-blue-600' }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm flex flex-col justify-between">
        <div>
            <div className="flex justify-between items-start">
                <p className="text-sm font-medium text-slate-500">{title}</p>
                <div className={`p-2 rounded-lg ${iconBgColor} ${iconTextColor}`}>
                    <Icon className="h-5 w-5" />
                </div>
            </div>
            <p className="text-3xl font-bold text-slate-800 mt-2">{value}</p>
        </div>
        {onClick && (
            <button onClick={onClick} className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center text-left">
                {linkText} <ArrowRight className="h-4 w-4 ml-1" />
            </button>
        )}
    </div>
);

const DashboardView = ({ setActiveItem }) => {
    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const username = localStorage.getItem('username') || 'Employee';
    const API_URL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        const fetchEmployeeData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!username) {
                    setError("No user found. Please log in again.");
                    setLoading(false);
                    return;
                }
                // Step 1: Fetch the employee code using the email (username).
                const codeResponse = await axios.get(`${API_URL}/employees/email/${username}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });

                const employeeCode = codeResponse.data;
                localStorage.setItem('employeeCode', employeeCode)
                if (!employeeCode) {
                    throw new Error("Employee code not found for the user.");
                }

                // Step 2: Fetch the full employee details using the employee code.
                const response = await axios.get(`${API_URL}/employees/${employeeCode}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });

                // The backend provides core employee data. We'll merge it with
                // some placeholder/mock data for UI elements not yet supported by the backend.
                const employeeData = {
                    // Mock data for fields not yet available from backend
                    attendance: {
                        today: { checkIn: '09:30 AM', status: 'PRESENT' },
                        workHours: '4h 30m'
                    },
                    leaveBalance: { sick: 5, casual: 10, earned: 8 },
                    ...response.data,
                    // Ensure nested arrays from backend are handled gracefully
                    leaves: response.data.leaves || [],
                };
                setEmployee(employeeData);
            } catch (err) {
                console.error("Error fetching employee data:", err);
                if (err.response?.status === 404) {
                    setError('Your employee profile could not be found. Please contact HR.');
                } else {
                    setError('Could not load your dashboard data. Please try again later.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchEmployeeData();
    }, [username, API_URL]);

    if (loading) {
        return (
            <div className="p-8 flex justify-center items-center h-full bg-slate-50">
                <Loader className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 flex justify-center items-center h-full bg-slate-50">
                <div className="text-center text-red-600">
                    <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
                    <h3 className="mt-2 text-lg font-medium">Something went wrong</h3>
                    <p className="mt-1 text-sm">{error}</p>
                </div>
            </div>
        );
    }

    if (!employee) {
        return <div className="p-8 bg-slate-50">No employee data found.</div>;
    }

    const pendingLeaves = employee.leaves?.filter(l => l.status === 'PENDING').length || 0;

    return (
        <div className="p-6 md:p-8 space-y-6 bg-slate-50">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-800">Welcome, {employee.firstName}!</h1>
                <p className="mt-1 text-slate-600">Here's a summary of your day.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard 
                    icon={Calendar} 
                    title="Pending Leaves" 
                    value={pendingLeaves} 
                    onClick={() => setActiveItem('Leaves')}
                    linkText="View Leaves"
                    iconBgColor="bg-yellow-100"
                    iconTextColor="text-yellow-600"
                />
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <div className="flex justify-between items-start">
                        <p className="text-sm font-medium text-slate-500">Today's Attendance</p>
                        <div className="bg-green-100 text-green-600 p-2 rounded-lg">
                            <Clock className="h-5 w-5" />
                        </div>
                    </div>
                    <div className="mt-2">
                        <p className="text-3xl font-bold text-slate-800">{employee.attendance.today.checkIn}</p>
                        <p className="text-sm text-slate-500">Checked-in</p>
                    </div>
                    <button onClick={() => setActiveItem('Attendance')} className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                        View Attendance
                    </button>
                </div>
                 <div className="bg-white p-6 rounded-xl shadow-sm">
                    <div className="flex justify-between items-start">
                        <p className="text-sm font-medium text-slate-500">Your Profile</p>
                        <div className="bg-purple-100 text-purple-600 p-2 rounded-lg">
                            <User className="h-5 w-5" />
                        </div>
                    </div>
                    <div className="mt-2">
                        <p className="text-xl font-bold text-slate-800">{employee.firstName} {employee.lastName}</p>
                        <p className="text-sm text-slate-500">{employee.jobDetails?.[0]?.designationTitle || 'N/A'}</p>
                    </div>
                </div>
            </div>

            {/* Leave Balance and Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h2 className="text-xl font-semibold text-slate-800 mb-4">Leave Balance</h2>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center"><p className="text-slate-600">Sick Leave</p><p className="font-bold text-slate-800">{employee.leaveBalance.sick} <span className="text-sm font-normal text-slate-500">days</span></p></div>
                        <div className="flex justify-between items-center"><p className="text-slate-600">Casual Leave</p><p className="font-bold text-slate-800">{employee.leaveBalance.casual} <span className="text-sm font-normal text-slate-500">days</span></p></div>
                        <div className="flex justify-between items-center"><p className="text-slate-600">Earned Leave</p><p className="font-bold text-slate-800">{employee.leaveBalance.earned} <span className="text-sm font-normal text-slate-500">days</span></p></div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h2 className="text-xl font-semibold text-slate-800 mb-4">Quick Actions</h2>
                    <div className="space-y-3">
                        <button onClick={() => setActiveItem('Leaves')} className="w-full text-left flex justify-between items-center p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"><span>Request a Leave</span><ArrowRight className="h-5 w-5 text-slate-400" /></button>
                        <button onClick={() => setActiveItem('Payroll')} className="w-full text-left flex justify-between items-center p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"><span>View Payslips</span><ArrowRight className="h-5 w-5 text-slate-400" /></button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DashboardView;