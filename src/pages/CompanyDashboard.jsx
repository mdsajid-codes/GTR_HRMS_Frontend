import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, ShoppingCart, LogOut, Sparkles, Building, BarChart3 } from 'lucide-react';

const SidebarContent = () => {
    const navigate = useNavigate();
    const username = localStorage.getItem('username') || 'Admin';

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const navLinks = [
        { name: 'Dashboard', icon: LayoutDashboard, href: '/company-dashboard' },
        { name: 'HRMS', icon: Users, href: '/hrdashboard' },
        { name: 'POS', icon: ShoppingCart, href: '/pos-dashboard' },
    ];

    const NavItem = ({ item }) => (
        <NavLink
            to={item.href}
            end={item.href === '/company-dashboard'} // Use `end` for the root dashboard link
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

    return (
        <div className="flex flex-col h-full bg-white">
            <div className="p-4 border-b border-slate-200 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <Sparkles className="h-7 w-7 text-blue-600" />
                    <span className="font-bold text-xl text-slate-800">Company Hub</span>
                </div>
            </div>
            <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
                {navLinks.map((item) => (
                    <NavItem key={item.name} item={item} />
                ))}
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

const StatCard = ({ icon: Icon, title, value, description }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm flex items-start justify-between">
        <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
            {description && (
                <p className="mt-2 text-sm text-slate-500">{description}</p>
            )}
        </div>
        <div className="bg-blue-100 text-blue-600 p-3 rounded-lg">
            <Icon className="h-6 w-6" />
        </div>
    </div>
);

const CompanyDashboard = () => {
    const tenantId = localStorage.getItem('tenantId');

    const stats = [
        { title: 'Active Employees', value: '150', icon: Users, description: 'Across all departments' },
        { title: 'Total Sales Today', value: '$12,450', icon: ShoppingCart, description: 'From all POS terminals' },
        { title: 'Open Positions', value: '8', icon: Building, description: 'In HRMS' },
        { title: 'Revenue Growth', value: '+12%', icon: BarChart3, description: 'This quarter' },
    ];

    return (
        <div className="flex h-screen bg-slate-100">
            {/* Static sidebar for desktop */}
            <div className="hidden lg:flex lg:flex-shrink-0">
                <div className="flex flex-col w-64 border-r border-slate-200">
                    <SidebarContent />
                </div>
            </div>

            <main className="flex-1 p-6 md:p-8 overflow-y-auto">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold text-slate-800 mb-2">Company Overview</h1>
                    <p className="text-slate-500 mb-6">A high-level view of your HRMS and POS systems for tenant <span className="font-semibold text-slate-600">{tenantId}</span>.</p>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {stats.map((stat, index) => (
                            <StatCard key={index} {...stat} />
                        ))}
                    </div>

                    {/* More dashboard widgets can be added here */}
                </div>
            </main>
        </div>
    );
}

export default CompanyDashboard;
