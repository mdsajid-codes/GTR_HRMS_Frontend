import React, { useState, useEffect } from 'react';
import { BookOpen, Target, Fingerprint, Link2, Settings, RefreshCw, Loader, Save, AlertCircle } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import AttendanceLog from '../components/attendance/AttendanceLog';
import AttendencePolicy from '../hrmsSettings/AttendencePolicy';
import BiometricDevices from '../components/attendance/BiometricDevices';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const AttendanceSettings = () => {
    const attendanceMethods = ['MANUAL', 'BIOMETRIC', 'APP', 'GPS', 'RFID'];

    const [setting, setSetting] = useState(null);
    const [formData, setFormData] = useState({
        method: '',
        defaultGraceMinutes: 0,
        autoMarkAbsentAfter: false,
        absentAfterMinutes: 0,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchSettings = async () => {
            setLoading(true);
            setError('');
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${API_URL}/attendance-settings`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (response.data && response.data.length > 0) {
                    const fetchedSetting = response.data[0];
                    setSetting(fetchedSetting);
                    setFormData({
                        method: fetchedSetting.method || '',
                        defaultGraceMinutes: fetchedSetting.defaultGraceMinutes || 0,
                        autoMarkAbsentAfter: fetchedSetting.autoMarkAbsentAfter || false,
                        absentAfterMinutes: fetchedSetting.absentAfterMinutes || 0,
                    });
                }
            } catch (err) {
                console.error("Failed to fetch attendance settings:", err);
                setError('Could not load attendance settings.');
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const headers = { "Authorization": `Bearer ${token}` };
            let response;
            if (setting && setting.id) {
                // Update existing setting
                response = await axios.put(`${API_URL}/attendance-settings/${setting.id}`, formData, { headers });
            } else {
                // Create new setting
                response = await axios.post(`${API_URL}/attendance-settings`, formData, { headers });
            }
            const savedSetting = response.data;
            setSetting(savedSetting);
            setFormData({
                method: savedSetting.method || '',
                defaultGraceMinutes: savedSetting.defaultGraceMinutes || 0,
                autoMarkAbsentAfter: savedSetting.autoMarkAbsentAfter || false,
                absentAfterMinutes: savedSetting.absentAfterMinutes || 0,
            });
            alert('Settings saved successfully!');
        } catch (err) {
            console.error("Failed to save settings:", err);
            setError(err.response?.data?.message || 'Failed to save settings.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center p-8"><Loader className="animate-spin h-8 w-8 text-blue-600" /></div>;
    }

    if (error) {
        return <div className="p-8 text-center text-red-500"><AlertCircle className="mx-auto h-12 w-12" /><p className="mt-2">{error}</p></div>;
    }

    return (
        <div className="bg-card p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-bold text-foreground mb-6">Attendance Settings</h2>
            <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
                <div>
                    <label htmlFor="method" className="block text-sm font-medium text-foreground-muted">Attendance Method</label>
                    <select id="method" name="method" value={formData.method} onChange={handleChange} className="input mt-1 bg-background-muted border-border text-foreground">
                        <option value="">Select Method</option>
                        {attendanceMethods.map(m => (
                            <option key={m} value={m}>{m}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="defaultGraceMinutes" className="block text-sm font-medium text-foreground-muted">Default Grace Period (minutes)</label>
                    <input type="number" id="defaultGraceMinutes" name="defaultGraceMinutes" value={formData.defaultGraceMinutes} onChange={handleChange} className="input mt-1 bg-background-muted border-border text-foreground" />
                </div>
                <div className="flex items-center gap-3">
                    <input type="checkbox" id="autoMarkAbsentAfter" name="autoMarkAbsentAfter" checked={formData.autoMarkAbsentAfter} onChange={handleChange} className="h-4 w-4 rounded border-border text-primary focus:ring-primary" />
                    <label htmlFor="autoMarkAbsentAfter" className="text-sm font-medium text-foreground-muted">Automatically mark absent</label>
                </div>
                {formData.autoMarkAbsentAfter && (
                    <div>
                        <label htmlFor="absentAfterMinutes" className="block text-sm font-medium text-foreground-muted">Mark Absent After (minutes past shift start)</label>
                        <input type="number" id="absentAfterMinutes" name="absentAfterMinutes" value={formData.absentAfterMinutes} onChange={handleChange} className="input mt-1" />
                    </div>
                )}
                <div className="flex justify-end">
                    <button type="submit" className="btn-primary flex items-center" disabled={saving}>
                        {saving ? <Loader className="animate-spin h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                        {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            </form>
        </div>
    );
};

const Placeholder = ({ title }) => (
    <div className="bg-card p-8 rounded-xl shadow-sm text-center">
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        <p className="text-foreground-muted mt-2">This section is under construction.</p>
    </div>
);
const EmployeeMappings = () => <Placeholder title="Employee Biometric Mappings" />;

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

    const handleRunAutoAbsentTask = async () => {
        if (!window.confirm("Are you sure you want to manually run the 'Auto-Mark Absent' task? This will check all employees and mark those as absent who haven't checked in and are past their shift time.")) {
            return;
        }
        setIsSyncing(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_URL}/time-attendence/auto-mark-absent`, {}, {
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
            <div className="p-6 md:p-8 bg-background text-foreground">
                <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                    <h1 className="text-3xl font-bold text-foreground">Attendance Management</h1>
                    <button onClick={handleRunAutoAbsentTask} className="btn-secondary flex items-center gap-2" disabled={isSyncing}>
                        {isSyncing ? <Loader className="animate-spin h-4 w-4" /> : <RefreshCw className="h-4 w-4" />}
                        {isSyncing ? 'Running...' : 'Run Auto-Absent Task'}
                    </button>
                </div>

                <div className="bg-card rounded-xl shadow-sm mb-6">
                    <nav className="flex overflow-x-auto border-b border-border">
                        {attendanceNavLinks.map((link) => (
                            <button
                                key={link.name}
                                onClick={() => setActiveTab(link.name)}
                                className={`flex-shrink-0 flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === link.name
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-foreground-muted hover:text-foreground hover:border-border'
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
