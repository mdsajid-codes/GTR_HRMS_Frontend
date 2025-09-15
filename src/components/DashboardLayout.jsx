import React, { useState, useMemo } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    FileText,
    CreditCard,
    UserX,
    ShieldCheck,
    BarChart2,
    LogOut,
    Sparkles,
    Menu,
    CalendarClock,
    DollarSign,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const navLinks = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/hrdashboard' }, // All plans
    { name: 'Employees', icon: Users, href: '/employees' }, // All plans
    { name: 'Settings', icon: FileText, href: '/settings', requiredPlans: ['STARTER', 'STANDARD', 'PREMIUM', 'ENTERPRISE'] },
    { name: 'Attendance', icon: CalendarClock, href: '/attendance', requiredPlans: ['STANDARD', 'PREMIUM', 'ENTERPRISE'] },
    { name: 'Leave', icon: CalendarClock, href: '/leave', requiredPlans: ['STANDARD', 'PREMIUM', 'ENTERPRISE'] },
    { name: 'Payroll Management', icon: DollarSign, href: '/payroll-management', requiredPlans: ['PREMIUM', 'ENTERPRISE'] },
    { name: 'Resignation/Termination', icon: UserX, href: '/separation', requiredPlans: ['ENTERPRISE'] },
    { name: 'Users', icon: ShieldCheck, href: '/users-details' }, // All plans
    { name: 'Reports', icon: BarChart2, href: '/reports', requiredPlans: ['ENTERPRISE'] },
];

const NavItem = ({ item, onClick }) => (
    <NavLink
        to={item.href}
        onClick={onClick}
        className={({ isActive }) =>
            `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-200'
            }`
        }
    >
        <item.icon className="h-5 w-5 mr-3 flex-shrink-0" />
        <span>{item.name}</span>
    </NavLink>
);

const SidebarContent = ({ onLinkClick }) => {
    const navigate = useNavigate();
    const username = localStorage.getItem('username') || 'Admin';

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const accessibleNavLinks = useMemo(() => {
        const tenantId = localStorage.getItem('tenantId');
        if (tenantId === 'master') {
            return navLinks;
        }
        const plan = localStorage.getItem('plan'); // e.g., 'ATTENDANCE_BASIC'
        
        return navLinks.filter(link => {
            // If a link has no specific plan requirements, it's accessible to all tenants.
            if (!link.requiredPlans) {
                return true;
            }
            // If there's no plan set for the tenant, hide plan-specific links.
            if (!plan) {
                return false;
            }
            // Otherwise, check if the current plan is in the link's required plans list.
            return link.requiredPlans.includes(plan);
        });
    }, []);

    return (
        <div className="flex flex-col h-full bg-white">
            <div className="p-4 border-b border-slate-200 flex-shrink-0">
                <Link to="/dashboard" className="flex items-center gap-3">
                    <Sparkles className="h-7 w-7 text-blue-600" />
                    <span className="font-bold text-xl text-slate-800">Enterprise HRMS</span>
                </Link>
            </div>
            <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
                {accessibleNavLinks.map((item) => (
                    <NavItem key={item.name} item={item} onClick={onLinkClick} />
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
                            <p className="text-xs text-slate-500">Administrator</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="text-slate-500 hover:text-red-600 ml-2 flex-shrink-0">
                        <LogOut className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

const DashboardLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-slate-100">
            {/* Static sidebar for desktop */}
            <div className="hidden lg:flex lg:flex-shrink-0">
                <div className="flex flex-col w-64 border-r border-slate-200">
                    <SidebarContent />
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
                        <Link to="/dashboard" className="flex items-center gap-2">
                            <Sparkles className="h-6 w-6 text-blue-600" />
                            <span className="font-bold text-lg">HRMS</span>
                        </Link>
                    </div>
                </header>

                {/* Main content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto">
                    {children}
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
                            <SidebarContent onLinkClick={() => setSidebarOpen(false)} />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DashboardLayout;