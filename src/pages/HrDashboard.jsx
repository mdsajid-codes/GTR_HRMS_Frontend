import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, CalendarClock, Briefcase, UserPlus, ArrowUpRight, ArrowDownRight, CheckCircle, XCircle, PartyPopper, Eye, Search, UploadCloud, MapPin } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import AddEmployeeModal from './AddEmployeeModal';
import ViewEmployeeModal from './ViewEmployeeModal';
import BulkAddEmployeesModal from './BulkAddEmployeesModal';
import axios from 'axios';

// A reusable card component for displaying stats
const StatCard = ({ icon: Icon, title, value, change, changeType }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm flex items-start justify-between">
        <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
            {change && (
                <div className={`mt-2 flex items-center text-sm ${changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                    {changeType === 'increase' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                    <span>{change} vs last month</span>
                </div>
            )}
        </div>
        <div className="bg-blue-100 text-blue-600 p-3 rounded-lg">
            <Icon className="h-6 w-6" />
        </div>
    </div>
);

// A reusable component for activity items
const ActivityItem = ({ icon: Icon, iconColor, title, description }) => (
    <div className="flex items-start space-x-4">
        <div className={`p-2 rounded-full ${iconColor}`}>
            <Icon className="h-5 w-5 text-white" />
        </div>
        <div>
            <p className="font-semibold text-slate-800">{title}</p>
            <p className="text-sm text-slate-500">{description}</p>
        </div>
    </div>
);


const HrDashboard = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [locations, setLocations] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState('all');
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${API_URL}/locations`, {
                    headers: { "Authorization": `Bearer ${token}` },
                });
                setLocations(response.data);
            } catch (error) {
                console.error("Failed to fetch locations", error);
            }
        };
        fetchLocations();
    }, [API_URL]);

    const stats = [
        {
            title: 'Total Employees',
            value: '1,254',
            change: '+2.5%',
            changeType: 'increase',
            icon: Users,
        },
        {
            title: 'Pending Leave Requests',
            value: '18',
            change: '-5.2%',
            changeType: 'decrease',
            icon: CalendarClock,
        },
        {
            title: 'Open Positions',
            value: '12',
            change: '+10%',
            changeType: 'increase',
            icon: Briefcase,
        },
        {
            title: 'New Hires (Month)',
            value: '8',
            change: '+1.8%',
            changeType: 'increase',
            icon: UserPlus,
        },
    ];

    const recentActivities = [
        {
            icon: CheckCircle,
            iconColor: 'bg-green-500',
            title: 'Leave request approved',
            description: 'John Doe\'s vacation leave from 24th to 28th Dec was approved.',
        },
        {
            icon: UserPlus,
            iconColor: 'bg-blue-500',
            title: 'New hire onboarded',
            description: 'Jane Smith has joined the Engineering team as a Frontend Developer.',
        },
        {
            icon: XCircle,
            iconColor: 'bg-red-500',
            title: 'Leave request rejected',
            description: 'Peter Jones\'s sick leave request for today was rejected.',
        },
        {
            icon: PartyPopper,
            iconColor: 'bg-purple-500',
            title: 'Upcoming Work Anniversary',
            description: 'Alice Johnson will be celebrating 5 years with us tomorrow!',
        },
    ];

    return (
        <DashboardLayout>
            <div className="p-6 md:p-8">
                <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                    <h1 className="text-3xl font-bold text-slate-800">HR Dashboard</h1>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <select 
                                value={selectedLocation}
                                onChange={(e) => setSelectedLocation(e.target.value)}
                                className="input pl-10 appearance-none"
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
                            onClick={() => setIsViewModalOpen(true)}
                            className="btn-secondary">
                            <Search className="h-5 w-5 mr-2" />
                            All Employee
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
                    {stats.map((stat, index) => (
                        <StatCard key={index} {...stat} />
                    ))}
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                    {/* Department Distribution Chart */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm">
                        <h2 className="text-xl font-semibold text-slate-800 mb-4">Employee Distribution by Department</h2>
                        <div className="h-80 flex items-center justify-center bg-slate-100 rounded-lg">
                            <p className="text-slate-500">[Chart Placeholder]</p>
                            {/* In a real app, you would render a chart here using a library like Chart.js or Recharts */}
                        </div>
                    </div>

                    {/* Recent Activity Feed */}
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        <h2 className="text-xl font-semibold text-slate-800 mb-4">Recent Activity</h2>
                        <div className="space-y-6">
                            {recentActivities.map((activity, index) => (
                                <ActivityItem key={index} {...activity} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            {isModalOpen && (
                <AddEmployeeModal 
                    isOpen={isModalOpen} 
                    onClose={() => setIsModalOpen(false)} 
                />
            )}
            {isViewModalOpen && (
                <ViewEmployeeModal
                    isOpen={isViewModalOpen}
                    onClose={() => setIsViewModalOpen(false)}
                    selectedLocation={selectedLocation}
                />
            )}
            {isBulkModalOpen && (
                <BulkAddEmployeesModal
                    isOpen={isBulkModalOpen}
                    onClose={() => setIsBulkModalOpen(false)}
                />
            )}
        </DashboardLayout>
    );
}

export default HrDashboard;
