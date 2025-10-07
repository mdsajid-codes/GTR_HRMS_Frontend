import React, { useState, useMemo } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
    Home,
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
import { AnimatePresence, motion } from "framer-motion";
import { useTenant } from "../context/TenantContext.jsx";

const navLinks = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/hrdashboard', module: 'HRMS_CORE' },
    { name: 'Employees', icon: Users, href: '/employees', module: 'HRMS_CORE' },
    { name: 'Settings', icon: FileText, href: '/settings', module: 'HRMS_CORE' }, // Or a specific settings module
    { name: 'Attendance', icon: CalendarClock, href: '/attendance', module: 'HRMS_ATTENDANCE' },
    { name: 'Leave', icon: CalendarClock, href: '/leave', module: 'HRMS_LEAVE' },
    { name: 'Payroll Management', icon: DollarSign, href: '/payroll-management', module: 'HRMS_PAYROLL' },
    { name: 'Users', icon: ShieldCheck, href: '/users-details' },
    { name: 'Reports', icon: BarChart2, href: '/reports' },
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
    const roles = useMemo(() => JSON.parse(localStorage.getItem('roles') || '[]'), []);
    const isSuperAdmin = useMemo(() => roles.includes('SUPER_ADMIN'), [roles]);

    const { hasModule } = useTenant();

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const accessibleNavLinks = useMemo(() => {
        // A user has full access if their plan includes all core HRMS modules.
        const hasAllAccessPlan =
            hasModule('HRMS_CORE') &&
            hasModule('HRMS_ATTENDANCE') &&
            hasModule('HRMS_LEAVE') &&
            hasModule('HRMS_PAYROLL');

        if (hasAllAccessPlan) {
            return navLinks; // Return all links for the all-access plan.
        }

        // Otherwise, filter links based on individual module subscription.
        return navLinks.filter(link => !link.module || hasModule(link.module));
    }, [hasModule]);
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
                {isSuperAdmin && (
                    <div className="pt-4 mt-4 border-t border-slate-200">
                        <NavItem item={{ name: 'Company Hub', icon: Home, href: '/company-dashboard' }} onClick={onLinkClick} />
                    </div>
                )}
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