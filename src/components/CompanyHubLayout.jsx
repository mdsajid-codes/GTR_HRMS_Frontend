import React, { useState, useMemo } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, ShoppingCart, LogOut, Sparkles, Settings, Menu, Building } from 'lucide-react';
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
        { name: 'CRM', icon: Users, href: '/crm-dashboard', module: 'CRM' },
        { name: 'Production', icon: Building, href: '/production-dashboard', module: 'PRODUCTION' },
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
                className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors group ${
                    isActive ? 'bg-primary text-primary-foreground shadow-sm' : 'text-foreground-muted hover:bg-background-muted'
                }`}
            >
                <item.icon className={`h-5 w-5 mr-3 flex-shrink-0 ${isActive ? 'text-primary-foreground' : 'text-foreground-muted group-hover:text-foreground'}`} />
                <span>{item.name}</span>
            </NavLink>
        );
    };

    return (
        <div className="flex flex-col h-full bg-card text-card-foreground">
            <div className="p-4 border-b border-border flex-shrink-0">
                <div className="flex items-center gap-3">
                    <Sparkles className="h-7 w-7 text-primary" />
                    <span className="font-bold text-xl text-foreground">Company Hub</span>
                </div>
            </div>
            <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
                {navLinks.map((item) => <NavItem key={item.name} item={item} />)}
            </nav>
            <div className="p-4 border-t border-border flex-shrink-0">
                <div className="flex items-center justify-between">
                    <p className="text-sm text-foreground-muted">Welcome, <span className="font-semibold text-foreground">{username}</span></p>
                    <button onClick={handleLogout} className="text-foreground-muted hover:text-red-600" title="Logout"><LogOut className="h-5 w-5" /></button>
                </div>
            </div>
        </div>
    );
};

const CompanyHubLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-background text-foreground">
            <div className="hidden lg:flex lg:flex-shrink-0">
                <div className="flex flex-col w-64 border-r border-border">
                    <SidebarContent />
                </div>
            </div>

            <AnimatePresence>
                {sidebarOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
                        <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="fixed top-0 left-0 h-full w-64 z-30 bg-card text-card-foreground">
                            <SidebarContent onLinkClick={() => setSidebarOpen(false)} />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="lg:hidden sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white dark:bg-slate-800 shadow-sm items-center px-4">
                    <button type="button" className="text-slate-500 dark:text-slate-400" onClick={() => setSidebarOpen(true)}><Menu className="h-6 w-6" /></button>
                    <div className="flex-1 flex justify-center items-center">
                        <span className="font-bold text-lg dark:text-slate-100">Company Hub</span>
                    </div>
                </header>
                <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50 dark:bg-slate-900/50">{children}</div>
            </main>
        </div>
    );
};

export default CompanyHubLayout;