import React, { useState } from 'react';
import { BookOpen, Target, Fingerprint, Link2, Settings, RefreshCw, Loader } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import AttendanceLog from '../components/attendance/AttendanceLog';
import AttendencePolicy from '../hrmsSettings/AttendencePolicy';
import axios from 'axios';

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
    { name: 'Log', icon: BookOpen, component: AttendanceLog },
    { name: 'Policies', icon: Target, component: AttendencePolicy },
    { name: 'Biometric Devices', icon: Fingerprint, component: BiometricDevices },
    { name: 'Employee Mappings', icon: Link2, component: EmployeeMappings },
    { name: 'Settings', icon: Settings, component: AttendanceSettings },
];

const Attendance = () => {
    const [activeTab, setActiveTab] = useState('Log');
    const [isSyncing, setIsSyncing] = useState(false);
    const API_URL = import.meta.env.VITE_API_BASE_URL;

    const handleRunAutoAbsentTask = async () => {
        if (!window.confirm("Are you sure you want to manually run the 'Auto-Mark Absent' task? This will check all employees and mark those as absent who haven't checked in and are past their shift time.")) {
            return;
        }
        setIsSyncing(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_URL}/admin/tasks/run-auto-absent`, {}, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            alert(response.data || 'Task executed successfully.');
        } catch (err) {
            console.error("Error running auto-absent task:", err);
            alert(err.response?.data?.message || 'Failed to execute the task.');
        } finally {
            setIsSyncing(false);
        }
    };

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
                <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                    <h1 className="text-3xl font-bold text-slate-800">Attendance Management</h1>
                    <button onClick={handleRunAutoAbsentTask} className="btn-secondary flex items-center gap-2" disabled={isSyncing}>
                        {isSyncing ? <Loader className="animate-spin h-4 w-4" /> : <RefreshCw className="h-4 w-4" />}
                        {isSyncing ? 'Running...' : 'Run Auto-Absent Task'}
                    </button>
                </div>

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
