import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DepartmentCreation from '../hrmsSettings/DepartmentCreation';
import { Building2, CalendarCheck, Clock, FileBadge, DollarSign, BookUser, Megaphone, Building, ShieldCheck, ArrowLeft, Menu, X } from 'lucide-react';
import AttendencePolicy from '../hrmsSettings/AttendencePolicy';
import LeavePolicy from '../hrmsSettings/LeavePolicy';
import ManageCompany from '../hrmsSettings/ManageCompany';
import { useTenant } from '../context/TenantContext';
import EmployeePolicy from '../hrmsSettings/EmployeePolicy';

// Placeholder components for each settings tab
const PlaceholderComponent = ({ title }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-bold text-slate-700">{title}</h2>
        <p className="mt-2 text-slate-500">Configuration for this section will be displayed here.</p>
    </div>
);

const allTabs = [
    { name: 'Department Creation', icon: Building2, color: 'text-cyan-500', component: <DepartmentCreation embedded={true} />, module: 'HRMS_CORE' },
    { name: 'Leave Policy', icon: CalendarCheck, color: 'text-purple-500', component: <LeavePolicy title="Leave Policy" />, module: 'HRMS_LEAVE' },
    { name: 'Attendance Policy', icon: Clock, color: 'text-orange-500', component: <AttendencePolicy title="Attendance Policy" />, module: 'HRMS_ATTENDANCE' },
    { name: 'Employment Policy', icon: FileBadge, color: 'text-rose-500', component: <EmployeePolicy title="Employment Policy" />, module: 'HRMS_CORE' },
    { name: 'Payroll Policy', icon: DollarSign, color: 'text-green-500', component: <PlaceholderComponent title="Payroll Policy" />, module: 'HRMS_PAYROLL' },
    { name: 'Opening Leave Balance', icon: BookUser, color: 'text-indigo-500', component: <PlaceholderComponent title="Opening Leave Balance" />, module: 'HRMS_LEAVE' },
    { name: 'Announcement', icon: Megaphone, color: 'text-yellow-500', component: <PlaceholderComponent title="Announcement" />, module: 'HRMS_CORE' },
    { name: 'Manage Company', icon: Building, color: 'text-sky-500', component: <ManageCompany title="Manage Company" /> }, // Always visible
    { name: 'License', icon: ShieldCheck, color: 'text-lime-500', component: <PlaceholderComponent title="License Details" /> }, // Always visible
];

const HrmsSettings = () => {
    const { hasModule } = useTenant();
    const navigate = useNavigate();

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const tabs = useMemo(() => {
        return allTabs.filter(tab => !tab.module || hasModule(tab.module));
    }, [hasModule]);

    const [activeTab, setActiveTab] = useState(tabs.length > 0 ? tabs[0].name : '');

    const activeTabClass = 'bg-blue-50 border-l-4 border-blue-600 text-blue-700 font-semibold';
    const inactiveTabClass = 'border-l-4 border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-800';

    const ActiveComponent = tabs.find(tab => tab.name === activeTab)?.component;

    return (
        <div className="flex flex-col h-full bg-slate-50">
            <header className="bg-white shadow-sm p-4 border-b border-slate-200 z-20">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-slate-100">
                            <ArrowLeft className="h-5 w-5 text-slate-600" />
                        </button>
                        <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 rounded-full hover:bg-slate-100">
                            <Menu className="h-5 w-5 text-slate-600" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-slate-800">HRMS Configuration</h1>
                            <p className="text-sm text-slate-500">Manage company-wide settings for the HRMS module.</p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex-grow flex">
                {/* Overlay for mobile */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-30 md:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    ></div>
                )}

                {/* Sidebar */}
                <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 p-4 md:p-6 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-2 rounded-full hover:bg-slate-100 absolute top-2 right-2">
                        <X className="h-5 w-5 text-slate-600" />
                    </button>
                    <nav className="flex flex-col space-y-2">
                        {tabs.map(tab => (
                            <button
                                key={tab.name}
                                onClick={() => { setActiveTab(tab.name); setIsSidebarOpen(false); }}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all ${activeTab === tab.name ? activeTabClass : inactiveTabClass}`}
                            >
                                <tab.icon className={`h-5 w-5 ${tab.color}`} />
                                <span>{tab.name}</span>
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-grow p-6 md:p-8 w-full md:w-auto">
                    {ActiveComponent || <p>Select a setting from the sidebar.</p>}
                </main>
            </div>
        </div>
    );
}

export default HrmsSettings;
