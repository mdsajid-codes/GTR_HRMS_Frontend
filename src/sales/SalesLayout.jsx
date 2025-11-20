import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Users, FileText, Settings, Menu, X, ArrowLeft, ClipboardList, Package } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const salesNavLinks = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/sales-dashboard' },
    { name: 'Quotations', icon: ClipboardList, href: '/sales/quotations' },
    { name: 'Orders', icon: ShoppingCart, href: '/sales/orders' },
    { name: 'Products', icon: Package, href: '/sales/products' },
    { name: 'Customers', icon: Users, href: '/sales/customers' },
    { name: 'Invoices', icon: FileText, href: '/sales/invoices' },
    { name: 'Settings', icon: Settings, href: '/sales/settings' },
];

const SidebarContent = ({ onLinkClick }) => {
    const location = useLocation();
    return (
        <div className="flex flex-col h-full bg-card text-card-foreground">
            <div className="p-4 border-b border-border flex-shrink-0">
                <NavLink to="/company-dashboard" className="flex items-center gap-2 text-sm text-foreground-muted hover:text-foreground">
                    <ArrowLeft size={16} /> Back to Company Hub
                </NavLink>
            </div>
            <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
                {salesNavLinks.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.href}
                        onClick={onLinkClick}
                        end={item.href === '/sales-dashboard'}
                        className={({ isActive }) =>
                            `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors group ${
                                isActive ? 'bg-primary text-primary-foreground' : 'text-foreground-muted hover:bg-background-muted'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon className={`h-5 w-5 mr-3 flex-shrink-0 ${isActive ? 'text-primary-foreground' : 'text-foreground-muted group-hover:text-foreground'}`} />
                                <span>{item.name}</span>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>
        </div>
    );
};

const SalesLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-background text-foreground">
            {/* Static sidebar for desktop */}
            <div className="hidden lg:flex lg:flex-shrink-0">
                <div className="flex flex-col w-64 border-r border-border">
                    <SidebarContent />
                </div>
            </div>

            {/* Mobile sidebar */}
            <AnimatePresence>
                {sidebarOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
                        <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="fixed top-0 left-0 h-full w-64 z-40">
                            <SidebarContent onLinkClick={() => setSidebarOpen(false)} />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="lg:hidden sticky top-0 z-10 flex-shrink-0 flex h-16 bg-card shadow-sm items-center px-4">
                    <button type="button" className="text-foreground-muted" onClick={() => setSidebarOpen(true)}><Menu className="h-6 w-6" /></button>
                    <div className="flex-1 flex justify-center items-center"><span className="font-bold text-lg text-foreground">Sales Module</span></div>
                </header>
                <div className="flex-1 overflow-y-auto p-6 md:p-8"><Outlet /></div>
            </main>
        </div>
    );
};

export default SalesLayout;