import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Clock,
    Calendar,
    DollarSign,
    LogOut,
    Sparkles,
    Menu,
    Loader,
    AlertCircle,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import DashboardView from '../components/EmpPages/DashboardView';
import LeavesView from '../components/EmpPages/LeavesView';
import PayrollView from '../components/EmpPages/PayrollView';
import axios from 'axios';
import RecruitmentView from '../components/EmpPages/RecruitmentView';
import Leaves from '../components/EmpPages/Leaves';

// Placeholder components for different sections
const AttendanceView = () => <div className="p-8"><h1 className="text-3xl font-bold text-slate-800">Attendance</h1><p className="mt-2 text-slate-600">Your attendance records, check-in/out times, and work hours will be displayed here.</p></div>;


const navLinks = [
    { name: 'Dashboard', icon: LayoutDashboard, Component: DashboardView }, // All plans
    { name: 'Attendance', icon: Clock, Component: AttendanceView, requiredPlans: ['STANDARD', 'PREMIUM', 'ENTERPRISE'] },
    { name: 'Leaves', icon: Calendar, Component: Leaves, requiredPlans: ['STANDARD', 'PREMIUM', 'ENTERPRISE'] },
    { name: 'Payroll', icon: DollarSign, Component: PayrollView, requiredPlans: ['PREMIUM', 'ENTERPRISE'] },
    { name: 'Recruitment', icon: DollarSign, Component: RecruitmentView, requiredPlans: ['ENTERPRISE'] }
];

const NavItem = ({ item, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors w-full text-left ${
            isActive
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200'
        }`}
    >
        <item.icon className="h-5 w-5 mr-3 flex-shrink-0" />
        <span>{item.name}</span>
    </button>
);

const SidebarContent = ({ activeItem, setActiveItem, onLinkClick, accessibleNavLinks }) => {
    const navigate = useNavigate();
    const username = localStorage.getItem('username') || 'Employee';

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <div className="flex flex-col h-full bg-white">
            <div className="p-4 border-b border-slate-200 flex-shrink-0">
                <Link to="/employee-dashboard" className="flex items-center gap-3">
                    <Sparkles className="h-7 w-7 text-blue-600" />
                    <span className="font-bold text-xl text-slate-800">Enterprise HRMS</span>
                </Link>
            </div>
            <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
                {accessibleNavLinks.map((item) => (
                    <NavItem 
                        key={item.name} 
                        item={item} 
                        isActive={activeItem === item.name}
                        onClick={() => {
                            setActiveItem(item.name);
                            if (onLinkClick) onLinkClick();
                        }} 
                    />
                ))}
            </nav>
            <div className="p-4 border-t border-slate-200 flex-shrink-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center min-w-0">
                        <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center font-bold text-blue-700 flex-shrink-0">
                            {username.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">{username}</p>
                            <p className="text-xs text-slate-500">Employee</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="text-slate-500 hover:text-red-600 ml-2 flex-shrink-0" title="Logout">
                        <LogOut className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

const EmployeeDashboard = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const username = localStorage.getItem('username') || 'Employee';
    const API_URL = import.meta.env.VITE_API_BASE_URL;

    const accessibleNavLinks = useMemo(() => {
        const plan = localStorage.getItem('plan');
        if (!plan || plan === 'ENTERPRISE') {
            return navLinks;
        }
        return navLinks.filter(link => {
            if (!link.requiredPlans) {
                return true;
            }
            return link.requiredPlans.includes(plan);
        });
    }, []);

    const [activeItem, setActiveItem] = useState('Dashboard');

    useEffect(() => {
        // If the current active tab is no longer accessible (e.g., due to a plan change),
        // reset to the default 'Dashboard' tab.
        const isCurrentActiveItemAccessible = accessibleNavLinks.some(link => link.name === activeItem);
        if (!isCurrentActiveItemAccessible) setActiveItem('Dashboard');
    }, [accessibleNavLinks, activeItem]);

    useEffect(() => {
        const fetchEmployeeData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!username) {
                    setError("No user found. Please log in again.");
                    setLoading(false);
                    return;
                }
                // Fetch the full employee details using the user's email.
                const response = await axios.get(`${API_URL}/employees/by-user-email/${username}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });

                localStorage.setItem('employeeCode', response.data.employeeCode);

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

    const renderContent = () => {
        const activeLink = accessibleNavLinks.find(link => link.name === activeItem) || accessibleNavLinks[0];
        const Component = activeLink.Component;
        // Pass employee data to the active component.
        return <Component setActiveItem={setActiveItem} employee={employee} />;
    };

    return (
        <div className="flex h-screen bg-slate-100">
            {/* Static sidebar for desktop */}
            <div className="hidden lg:flex lg:flex-shrink-0">
                <div className="flex flex-col w-64 border-r border-slate-200">
                    <SidebarContent activeItem={activeItem} setActiveItem={setActiveItem} accessibleNavLinks={accessibleNavLinks} />
                </div>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top bar for mobile */}
                <header className="lg:hidden sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white shadow-sm">
                    <button
                        type="button"
                        className="px-4 border-r border-slate-200 text-slate-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                    <div className="flex-1 px-4 flex justify-between items-center">
                        <Link to="/employee-dashboard" className="flex items-center gap-2">
                            <Sparkles className="h-6 w-6 text-blue-600" />
                            <span className="font-bold text-lg">HRMS</span>
                        </Link>
                    </div>
                </header>

                {/* Main content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50">
                    {loading ? (
                        <div className="p-8 flex justify-center items-center h-full">
                            <Loader className="h-8 w-8 animate-spin text-blue-600" />
                        </div>
                    ) : error ? (
                        <div className="p-8 flex justify-center items-center h-full">
                            <div className="text-center text-red-600">
                                <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
                                <h3 className="mt-2 text-lg font-medium">Something went wrong</h3>
                                <p className="mt-1 text-sm">{error}</p>
                            </div>
                        </div>
                    ) : employee ? (
                        renderContent()
                    ) : (
                        <div className="p-8 bg-slate-50">No employee data found.</div>
                    )}
                </main>
            </div>

            {/* Mobile menu overlay */}
            <AnimatePresence>
                {sidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
                            onClick={() => setSidebarOpen(false)}
                        />
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="fixed top-0 left-0 h-full w-64 z-30"
                        >
                            <SidebarContent 
                                activeItem={activeItem} 
                                setActiveItem={setActiveItem} 
                                accessibleNavLinks={accessibleNavLinks}
                                onLinkClick={() => setSidebarOpen(false)} 
                            />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

export default EmployeeDashboard;
