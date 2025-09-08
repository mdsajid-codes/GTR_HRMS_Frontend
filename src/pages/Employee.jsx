import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import {
    User,
    FileText,
    Briefcase,
    Calendar,
    Clock,
    DollarSign,
    Percent,
    Landmark,
    Receipt,
    HandCoins,
    Search,
    Loader,
} from 'lucide-react';
import axios from 'axios';
import Profile from '../components/Hrpages/Profile';
import Job from '../components/Hrpages/Job';
import Leave from '../components/Hrpages/Leave';
import Payroll from '../components/Hrpages/Payroll';

const employeeNavLinks = [
    { name: 'Summary', icon: User },
    { name: 'Profile', icon: User },
    { name: 'Job', icon: Briefcase },
    { name: 'Documents', icon: FileText },
    { name: 'Leave', icon: Calendar },
    { name: 'Attendance', icon: Clock },
    { name: 'Salary', icon: DollarSign },
    { name: 'Tax', icon: Percent },
    { name: 'Financial Info', icon: Landmark },
    { name: 'Expense', icon: Receipt },
    { name: 'Loan', icon: HandCoins },
];

const Employee = () => {
    const [activeTab, setActiveTab] = useState('Summary');
    const [employee, setEmployee] = useState(null);
    const [employeeId, setEmployeeId] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const API_URL = import.meta.env.VITE_API_BASE_URL;

    const handleSearch = async(e)=>{
        e.preventDefault();
        if (!employeeId) {
            setError("Please enter an Employee ID.");
            return;
        }
        setLoading(true);
        setError("");
        setEmployee(null);

        if (!API_URL) {
            setError("API URL is not configured. Please check your .env file.");
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get(`${API_URL}/employees/${employeeId}`,{
                headers:{
                    "Authorization" : `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = response.data;
            const name = data.firstName + " " + data.lastName
            // Assuming the API returns an object with name and role.
            // We can derive initials from the name.
            const initials = name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '?';
            setEmployee({...data, initials});
        } catch (err) {
            console.error("Error searching for employee:", err);
            if (err.response){
                if (err.response.status === 404) {
                    setError(`Employee with ID "${employeeId}" not found.`);
                } else {
                    setError(err.response.data.message || "An error occurred while searching.");
                }
            } else if (err.request) {
                setError("No response from server. Please check your network connection.");
            } else {
                setError("Failed to search for employee. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    console.log(employee)

    const renderContent = () => {
        if (!employee) {
            return <div className="text-center text-slate-500">Please search for an employee to see their details.</div>;
        }
        switch (activeTab) {
            case 'Summary':
                return <div>Summary Details for {employee.name}</div>;
            case 'Profile':
                return <Profile employee={employee}/>
            case 'Job' :
                return <Job employee={employee} />
            case 'Leave' :
                return <Leave employee={employee} />
            case 'Salary':
                return <Payroll employee={employee} />
            default:
                return <div>Details for {activeTab}</div>;
        }
    };

    return (
        <DashboardLayout>
            <div className="flex flex-col h-full">
                {/* Employee Header & Sub-Navigation */}
                <div className="bg-white shadow-sm sticky top-0 z-10">
                    <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 min-h-[104px]">
                        <div className="flex items-center gap-4 min-w-0">
                            <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold ring-4 ring-white shadow-md">
                                {employee ? employee.initials : '?'}
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-3">
                                    <h1 className="text-2xl font-bold text-slate-800 truncate">
                                        {employee ? `${employee.firstName} ${employee.lastName}` : 'Employee Details'}
                                    </h1>
                                    {employee && (
                                        <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${
                                            employee.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>{employee.status.toLowerCase()}</span>
                                    )}
                                </div>
                                <p className="text-sm text-slate-500">{employee ? employee.jobDetails?.[0]?.designationTitle : 'Search by ID to begin'}</p>
                            </div>
                        </div>
                        <form onSubmit={handleSearch} className="relative">
                            <input
                                type="text"
                                placeholder="Search by Employee Id"
                                value={employeeId}
                                onChange={(e)=>setEmployeeId(e.target.value)}
                                className="w-full sm:w-72 pl-4 pr-12 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                            />
                            <button type="submit" className="absolute right-1 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-blue-600 rounded-full" disabled={loading}>
                                {loading ? <Loader className="animate-spin h-5 w-5" /> : <Search className="h-5 w-5" />}
                            </button>
                        </form>
                    </div>
                    {employee && (
                        <nav className="flex overflow-x-auto">
                            {employeeNavLinks.map((link) => (
                                <button
                                    key={link.name}
                                    onClick={() => setActiveTab(link.name)}
                                    className={`flex-shrink-0 flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                                        activeTab === link.name
                                            ? 'border-blue-600 text-blue-600'
                                            : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                                    }`}
                                >
                                    <link.icon className="h-4 w-4" />
                                    <span>{link.name}</span>
                                </button>
                            ))}
                        </nav>
                    )}
                </div>

                {/* Main Content Area */}
                <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-slate-50">
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        {error ? (
                            <div className="text-center text-red-600">{error}</div>
                        ) : (
                            <>
                                <h2 className="text-xl font-semibold text-slate-800 mb-4">{activeTab}</h2>
                                {renderContent()}
                            </>
                        )}
                    </div>
                </main>
            </div>
        </DashboardLayout>
    );
};

export default Employee;
