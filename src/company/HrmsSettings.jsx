import React, { useState, useMemo } from 'react';
import DepartmentCreation from '../hrmsSettings/DepartmentCreation';
import { Building2, CalendarCheck, Clock, FileBadge, DollarSign, BookUser, Megaphone, Building, ShieldCheck } from 'lucide-react';
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

    const tabs = useMemo(() => {
        return allTabs.filter(tab => !tab.module || hasModule(tab.module));
    }, [hasModule]);

    const [activeTab, setActiveTab] = useState(tabs.length > 0 ? tabs[0].name : '');

    const activeTabClass = 'border-blue-600 text-blue-600 font-semibold';
    const inactiveTabClass = 'border-transparent text-slate-500 hover:text-blue-600 hover:border-blue-300';

    const ActiveComponent = tabs.find(tab => tab.name === activeTab)?.component;

    return (
        <div className="p-6 md:p-8 h-full">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800">HRMS Configuration</h1>
                <p className="text-slate-500 mt-1">Manage company-wide settings for the HRMS module.</p>
            </div>

            <div className="border-b border-slate-200">
                <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.name}
                            onClick={() => setActiveTab(tab.name)}
                            className={`whitespace-nowrap flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors group ${
                                activeTab === tab.name ? activeTabClass : inactiveTabClass
                            }`}
                        >
                            <tab.icon className={`h-5 w-5 ${tab.color} ${activeTab !== tab.name && 'opacity-70 group-hover:opacity-100'}`} />
                            <span>{tab.name}</span>
                        </button>
                    ))}
                </nav>
            </div>

            <div className="mt-6">
                {ActiveComponent || <p>Select a tab.</p>}
            </div>
        </div>
    );
}

export default HrmsSettings;
