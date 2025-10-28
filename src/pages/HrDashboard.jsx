import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, CalendarClock, Briefcase, UserPlus, HandCoins, Receipt, Search, UploadCloud, MapPin, Loader, UserCheck, UserX, Plane } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import AddEmployeeModal from './AddEmployeeModal';
import BulkAddEmployeesModal from './BulkAddEmployeesModal';
import axios from 'axios';

// A reusable card component for displaying stats
const StatCard = ({ icon: Icon, title, value, change, changeType, color = 'blue', onClick }) => (
    <div onClick={onClick} className={`bg-card text-card-foreground p-6 rounded-xl shadow-sm flex items-start justify-between ${onClick ? 'cursor-pointer hover:shadow-md hover:border-border border border-transparent' : ''}`}>
        <div>
            <p className="text-sm font-medium text-foreground-muted">{title}</p>
            <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
        </div>
        <div className={`bg-primary/10 text-primary p-3 rounded-lg`}>
            <Icon className="h-6 w-6" />
        </div>
    </div>
);

// A reusable component for activity items
const ActivityItem = ({ icon: Icon, iconColor, title, description }) => (
    <div className="flex items-start space-x-4">
        <div className={`p-2 rounded-full ${iconColor}`}>
            <Icon className="h-4 w-4 text-white " />
        </div>
        <div>
            <p className="font-semibold text-foreground">{title}</p>
            <p className="text-sm text-foreground-muted">{description}</p>
        </div>
    </div>
);
const HrDashboard = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [locations, setLocations] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState('all');
    const navigate = useNavigate();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const API_URL = import.meta.env.VITE_API_BASE_URL;

    const fetchDashboardData = async () => {
        setLoading(true);
        setError(''); 
        try {
            const token = localStorage.getItem('token');
            const headers = { "Authorization": `Bearer ${token}` };
            const today = new Date().toISOString().split('T')[0];
            const [employeesRes, leavesRes, locationsRes, attendanceRes, loansRes, expensesRes] = await Promise.all([
                axios.get(`${API_URL}/employees/all`, { headers }),
                axios.get(`${API_URL}/leave-requests`, { headers }),
                axios.get(`${API_URL}/locations`, { headers }),
                axios.get(`${API_URL}/attendance-records?date=${today}`, { headers }),
                axios.get(`${API_URL}/employee-loans`, { headers }),
                axios.get(`${API_URL}/expenses`, { headers }),
            ]);

            const activeEmployees = employeesRes.data.filter(e => e.status === 'ACTIVE');
            const pendingLeaves = leavesRes.data.filter(l => l.status === 'SUBMITTED');

            // Calculate today's on-leave count accurately
            const employeesOnLeaveToday = new Set(
                leavesRes.data
                    .filter(l => l.status === 'APPROVED' && new Date(l.fromDate) <= new Date(today) && new Date(l.toDate) >= new Date(today))
                    .map(l => l.employeeCode)
            );
            
            const presentEmployeeCodes = new Set(attendanceRes.data.map(a => a.employeeCode));
            const onLeaveCount = Array.from(employeesOnLeaveToday).filter(code => !presentEmployeeCodes.has(code)).length;

            setDashboardData({
                totalEmployees: activeEmployees.length,
                pendingLeaves: pendingLeaves.length,
                pendingLoans: loansRes.data.filter(l => l.status === 'SUBMITTED').length,
                pendingExpenses: expensesRes.data.filter(e => e.status === 'SUBMITTED').length,
                newHiresThisMonth: activeEmployees.filter(e => new Date(e.createdAt) > new Date(new Date().setDate(1))).length,
                recentLeaveRequests: leavesRes.data.slice(0, 5),
                todaysAttendance: attendanceRes.data, // Keep this for recent check-ins
                onLeaveCount: onLeaveCount, // Use the new accurate count
            });
            setLocations(locationsRes.data);
        } catch (err) {
            setError('Failed to load dashboard data.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, [API_URL]);

    const stats = dashboardData ? [
        { title: 'Total Employees', value: dashboardData.totalEmployees, icon: Users, color: 'blue', onClick: () => navigate('/employees') },
        { title: 'Pending Leaves', value: dashboardData.pendingLeaves, icon: CalendarClock, color: 'orange', onClick: () => navigate('/leave') },
        { title: 'Pending Loans', value: dashboardData.pendingLoans, icon: HandCoins, color: 'indigo', onClick: () => navigate('/payroll-management') },
        { title: 'Pending Expenses', value: dashboardData.pendingExpenses, icon: Receipt, color: 'rose', onClick: () => navigate('/payroll-management') },
        // { title: 'Open Positions', value: '12', icon: Briefcase, color: 'purple' }, // Placeholder - no onClick yet
        // { title: 'New Hires (Month)', value: dashboardData.newHiresThisMonth, icon: UserPlus, color: 'green' },
    ] : [];

    const attendanceStats = dashboardData ? {
        present: dashboardData.todaysAttendance.filter(a => a.status === 'PRESENT' || a.status === 'HALF_DAY').length,
        absent: dashboardData.todaysAttendance.filter(a => a.status === 'ABSENT').length,
        onLeave: dashboardData.onLeaveCount, // Use the new accurate count
    } : { present: 0, absent: 0, onLeave: 0 };

    const attendanceCards = [
        { title: "Present", value: attendanceStats.present, icon: UserCheck, color: 'green', onClick: () => navigate('/attendance') },
        { title: "Absent", value: attendanceStats.absent, icon: UserX, color: 'red', onClick: () => navigate('/attendance') },
        { title: "On Leave", value: attendanceStats.onLeave, icon: Plane, color: 'orange', onClick: () => navigate('/leave') },
    ];


    const handleEmployeeAdded = () => {
        fetchDashboardData(); // Refresh data after adding an employee
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="p-8 flex justify-center items-center h-full">
                    <Loader className="h-10 w-10 animate-spin text-blue-600" />
                </div>
            </DashboardLayout>
        );
    }

    if (error) {
        return (
            <DashboardLayout>
                <div className="p-8 text-center text-red-500">
                    <p>{error}</p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="p-6 md:p-8">
                <div className="flex flex-wrap justify-between items-center gap-4 mb-6 bg-background text-foreground">
                    <h1 className="text-3xl font-bold text-foreground">HR Dashboard</h1>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-muted" />
                            <select 
                                value={selectedLocation}
                                onChange={(e) => setSelectedLocation(e.target.value)}
                                className="input pl-10 appearance-none bg-background-muted border-border text-foreground-muted"
                            >
                                <option value="all">All Locations</option>
                                {locations.map((loc) => (
                                    <option key={loc.id} value={loc.id}>
                                        {loc.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button
                            onClick={() => setIsBulkModalOpen(true)}
                            className="btn-secondary flex items-center">
                            <UploadCloud className="h-5 w-5 mr-2" />
                            Bulk Add
                        </button>
                        <button 
                            onClick={() => setIsModalOpen(true)} className="btn-primary">
                            <UserPlus className="h-5 w-5 mr-2" />
                            Add Employee
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.length > 0 && stats.map((stat, index) => (
                        <StatCard key={index} {...stat} />
                    ))}
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                    {/* Today's Attendance */}
                    <div className="lg:col-span-2 bg-card text-card-foreground p-6 rounded-xl shadow-sm h-full">
                        <h2 className="text-xl font-semibold text-foreground mb-4">Today's Attendance Summary</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {attendanceCards.map((stat, index) => (
                                <StatCard key={index} {...stat} />
                            ))}
                        </div>
                        <div className="mt-6">
                            <h3 className="text-lg font-medium text-foreground-muted mb-3">Recent Check-ins</h3>
                            <div className="space-y-3 max-h-60 overflow-y-auto">
                                {dashboardData?.todaysAttendance.filter(a => a.status === 'PRESENT' || a.status === 'HALF_DAY').map(att => (
                                    <div key={att.id} className="flex justify-between items-center p-3 bg-background-muted rounded-lg">
                                        <div>
                                            <p className="font-medium text-sm">{att.employeeName}</p>
                                            <p className="text-xs text-foreground-muted">{att.employeeCode}</p>
                                        </div>
                                        <p className="text-sm font-mono bg-green-100 text-green-800 px-2 py-1 rounded">{att.checkIn}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity Feed */}
                    <div className="bg-card text-card-foreground p-6 rounded-xl shadow-sm">
                        <h2 className="text-xl font-semibold text-foreground mb-4">Recent Activity</h2>
                        <div className="space-y-5">
                            {dashboardData?.recentLeaveRequests.map(req => (<ActivityItem key={req.id} icon={CalendarClock} iconColor="bg-yellow-500" title={`${req.employeeName} requested leave`} description={`${req.leaveType} from ${new Date(req.fromDate).toLocaleDateString()}`} />))}
                        </div>
                    </div>
                </div>
            </div>
            {isBulkModalOpen && (
                <BulkAddEmployeesModal
                    isOpen={isBulkModalOpen}
                    onClose={() => setIsBulkModalOpen(false)}
                />
            )}
            <AddEmployeeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onEmployeeAdded={handleEmployeeAdded} />
        </DashboardLayout>
    );
}

export default HrDashboard;
