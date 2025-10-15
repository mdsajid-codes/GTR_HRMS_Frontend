import React, { useState } from 'react';
import { BookOpen, Sliders, Fingerprint, Link2, Settings } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import AttendanceLog from '../components/attendance/AttendanceLog';
import ShiftPolicies from '../components/attendance/ShiftPolicies';

// Placeholder components for sections to be built
const Placeholder = ({ title }) => (
    <div className="bg-white p-8 rounded-xl shadow-sm text-center">
        <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
        <p className="text-slate-500 mt-2">This section is under construction.</p>
    </div>
);
const BiometricDevices = () => <Placeholder title="Biometric Device Management" />;
const EmployeeMappings = () => <Placeholder title="Employee Biometric Mappings" />;
const AttendanceSettings = () => <Placeholder title="Attendance Settings" />;

const attendanceNavLinks = [
    { name: 'Attendance Log', icon: BookOpen, component: AttendanceLog },
    { name: 'Shift Policies', icon: Sliders, component: ShiftPolicies },
    { name: 'Biometric Devices', icon: Fingerprint, component: BiometricDevices },
    { name: 'Employee Mappings', icon: Link2, component: EmployeeMappings },
    { name: 'Settings', icon: Settings, component: AttendanceSettings },
];

const Attendance = () => {
    const [activeTab, setActiveTab] = useState('Attendance Log');

    const renderContent = () => {
        const activeLink = attendanceNavLinks.find(link => link.name === activeTab);
        if (activeLink) {
            const Component = activeLink.component;
            return <Component />;
        }
        return <AttendanceLog />; // Default view
    };

    return (
        <DashboardLayout>
            <div className="p-6 md:p-8">
                <h1 className="text-3xl font-bold text-slate-800 mb-4">Attendance Management</h1>
                
                <div className="bg-white rounded-xl shadow-sm mb-6">
                    <nav className="flex overflow-x-auto border-b border-slate-200">
                        {attendanceNavLinks.map((link) => (
                            <button
                                key={link.name}
                                onClick={() => setActiveTab(link.name)}
                                className={`flex-shrink-0 flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                                    activeTab === link.name
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                                }`}
                            >
                                <link.icon className="h-4 w-4" />
                                <span>{link.name}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                {renderContent()}
            </div>
        </DashboardLayout>
    );
}

export default Attendance;
