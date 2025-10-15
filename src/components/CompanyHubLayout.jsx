import React, { useState, useMemo } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, ShoppingCart, LogOut, Sparkles, Settings, Menu } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTenant } from '../context/TenantContext';

const SidebarContent = ({ onLinkClick }) => {
    const location = useLocation();
    const username = localStorage.getItem('username') || 'Admin';
    const navigate = useNavigate();
    const { hasModule } = useTenant();

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const allNavLinks = [
        { name: 'Dashboard', icon: LayoutDashboard, href: '/company-dashboard' },
        { name: 'HRMS', icon: Users, href: '/hrdashboard', module: 'HRMS_CORE' },
        { name: 'POS', icon: ShoppingCart, href: '/pos-dashboard', module: 'POS' },
        { name: 'Settings', icon: Settings, href: '/company-settings' },
    ];

    const navLinks = useMemo(() => {
        return allNavLinks.filter(link => !link.module || hasModule(link.module));
    }, [hasModule]);

    const NavItem = ({ item }) => {
        const isActive = location.pathname.startsWith(item.href);
        return (
            <NavLink
                to={item.href}
                onClick={onLinkClick}
                className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    isActive ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
                }`}
            >
                <item.icon className="h-5 w-5 mr-3 flex-shrink-0" />
                <span>{item.name}</span>
            </NavLink>
        );
    };

    return (
        <div className="flex flex-col h-full bg-white">
            <div className="p-4 border-b border-slate-200 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <Sparkles className="h-7 w-7 text-blue-600" />
                    <span className="font-bold text-xl text-slate-800">Company Hub</span>
                </div>
            </div>
            <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
                {navLinks.map((item) => <NavItem key={item.name} item={item} />)}
            </nav>
            <div className="p-4 border-t border-slate-200 flex-shrink-0">
                <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-600">Welcome, <span className="font-semibold">{username}</span></p>
                    <button onClick={handleLogout} className="text-slate-500 hover:text-red-600" title="Logout"><LogOut className="h-5 w-5" /></button>
                </div>
            </div>
        </div>
    );
};

const CompanyHubLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-slate-100">
            <div className="hidden lg:flex lg:flex-shrink-0">
                <div className="flex flex-col w-64 border-r border-slate-200">
                    <SidebarContent />
                </div>
            </div>

            <AnimatePresence>
                {sidebarOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
                        <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="fixed top-0 left-0 h-full w-64 z-30">
                            <SidebarContent onLinkClick={() => setSidebarOpen(false)} />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="lg:hidden sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white shadow-sm items-center px-4">
                    <button type="button" className="text-slate-500" onClick={() => setSidebarOpen(true)}><Menu className="h-6 w-6" /></button>
                    <div className="flex-1 flex justify-center items-center"><span className="font-bold text-lg">Company Hub</span></div>
                </header>
                <div className="flex-1 overflow-y-auto p-6 md:p-8">{children}</div>
            </main>
        </div>
    );
};

export default CompanyHubLayout;