import React, { useState, useMemo, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
    Home,
    LayoutDashboard,
    Users,
    FileText,
    CreditCard,
    UserX, Palette,
    ShieldCheck,
    BarChart2,
    LogOut,
    Sparkles,
    Menu,
    Sun,
    Moon,
    CalendarClock,
    DollarSign,
} from 'lucide-react';
import { AnimatePresence, motion } from "framer-motion";
import { useTenant } from "../context/TenantContext.jsx";

const navLinks = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/hrdashboard', module: 'HRMS_CORE', color: 'text-sky-500' },
    { name: 'Employees', icon: Users, href: '/employees', module: 'HRMS_CORE', color: 'text-blue-500' },
    { name: 'Attendance', icon: CalendarClock, href: '/attendance', module: 'HRMS_ATTENDANCE', color: 'text-orange-500' },
    { name: 'Leave', icon: CalendarClock, href: '/leave', module: 'HRMS_LEAVE', color: 'text-yellow-500' },
    { name: 'Payroll Management', icon: DollarSign, href: '/payroll-management', module: 'HRMS_PAYROLL', color: 'text-green-500' },
    { name: 'Users', icon: ShieldCheck, href: '/users-details', color: 'text-purple-500' },
    { name: 'Reports', icon: BarChart2, href: '/reports', color: 'text-rose-500' },
];

const NavItem = ({ item, onClick }) => (
    <NavLink
        to={item.href}
        onClick={onClick}
    >
        {({ isActive }) => (
            <span className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors group ${
                isActive
                    ? 'bg-primary text-primary-foreground shadow-sm' // Active state
                    : 'text-foreground-muted hover:bg-background-muted' // Inactive state
            }`}>
                <item.icon className={`h-5 w-5 mr-3 flex-shrink-0 transition-colors ${isActive ? 'text-primary-foreground' : `${item.color} group-hover:text-primary`}`} />
                <span>{item.name}</span>
            </span>
        )}
    </NavLink>
);

const SidebarContent = ({ onLinkClick, theme, cycleTheme }) => {
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
        // Otherwise, filter links based on individual module subscription.
        return navLinks.filter(link => !link.module || hasModule(link.module));
    }, [hasModule]);
    return (
        <div className="flex flex-col h-full bg-card text-card-foreground">
            <div className="p-4 border-b border-border flex-shrink-0">
                <Link to="/dashboard" className="flex items-center gap-3">
                    <Sparkles className="h-7 w-7 text-primary" />
                    <span className="font-bold text-xl text-foreground">Enterprise HRMS</span>
                </Link>
            </div>
            <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
                {accessibleNavLinks.map((item) => (
                    <NavItem key={item.name} item={item} onClick={onLinkClick} />
                ))}
                {isSuperAdmin && (
                    <div className="pt-4 mt-4 border-t border-border">
                        <NavItem item={{ name: 'Company Hub', icon: Home, href: '/company-dashboard' }} onClick={onLinkClick} />
                    </div>
                )}
            </nav>
            <div className="p-4 border-t border-border flex-shrink-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center min-w-0">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary flex-shrink-0">
                            {username.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3 min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">{username}</p>
                            <p className="text-xs text-foreground-muted">Administrator</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="text-foreground-muted hover:text-red-600 ml-2 flex-shrink-0">
                        <LogOut className="h-5 w-5" />
                    </button>
                </div>
                <div className="mt-4 flex items-center justify-between capitalize">
                    <span className="text-sm text-foreground-muted">{theme} Mode</span>
                    <button
                        onClick={cycleTheme}
                        className="p-2 rounded-full hover:bg-background-muted text-foreground-muted"
                        title="Cycle Theme"
                    >
                        <Palette className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

const DashboardLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const themes = ['light', 'dark', 'greenish', 'blueish'];
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

    useEffect(() => {
        const root = document.documentElement;
        // Remove all theme classes
        themes.forEach(t => root.classList.remove(t));
        // Add the current theme class if it's not light
        if (theme !== 'light') {
            root.classList.add(theme);
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const cycleTheme = () => {
        const currentIndex = themes.indexOf(theme);
        const nextIndex = (currentIndex + 1) % themes.length;
        setTheme(themes[nextIndex]);
    };

    return (
        <div className="flex h-screen bg-background text-foreground">
            {/* Static sidebar for desktop */}
            <div className="hidden lg:flex lg:flex-shrink-0">
                <div className="flex flex-col w-64 border-r border-border">
                    <SidebarContent theme={theme} cycleTheme={cycleTheme} />
                </div>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top bar for mobile */}
                <header className="lg:hidden sticky top-0 z-10 flex-shrink-0 flex h-16 bg-card shadow-sm">
                    <button
                        type="button"
                        className="px-4 border-r border-border text-foreground-muted focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                    <div className="flex-1 px-4 flex justify-between items-center">
                        <Link to="/dashboard" className="flex items-center gap-2">
                            <Sparkles className="h-6 w-6 text-primary" />
                            <span className="font-bold text-lg text-foreground">HRMS</span>
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
                            <SidebarContent onLinkClick={() => setSidebarOpen(false)} theme={theme} cycleTheme={cycleTheme} />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DashboardLayout;