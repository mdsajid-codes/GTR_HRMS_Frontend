import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, Users, Server, Activity, ArrowUpRight, ArrowDownRight, Loader, LogOut, Sparkles, Trash2, Check, X } from 'lucide-react';
import axios from 'axios';

// A simple header for the standalone dashboard page
const DashboardHeader = () => {
    const navigate = useNavigate();
    const username = localStorage.getItem('username') || 'Admin';

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <header className="bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-20">
            <div className="flex items-center gap-3">
                <Sparkles className="h-7 w-7 text-blue-600" />
                <h1 className="font-bold text-xl text-slate-800">Enterprise HRMS</h1>
            </div>
            <div className="flex items-center gap-4">
                <p className="text-sm text-slate-600 hidden sm:block">Welcome, <span className="font-semibold">{username}</span></p>
                <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                    <LogOut className="h-5 w-5 text-slate-500" />
                    <span className="hidden md:inline">Logout</span>
                </button>
            </div>
        </header>
    );
};

const StatCard = ({ icon: Icon, title, value, change, changeType }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm flex items-start justify-between">
        <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
            {change && (
                <div className={`mt-2 flex items-center text-sm ${changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                    {changeType === 'increase' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                    <span>{change}</span>
                </div>
            )}
        </div>
        <div className="bg-blue-100 text-blue-600 p-3 rounded-lg">
            <Icon className="h-6 w-6" />
        </div>
    </div>
);

const TenantList = ({ tenants, onDelete }) => (
    <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
            <thead className="bg-slate-50">
                <tr>
                    <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-slate-600">Tenant ID</th>
                    <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-slate-600">Company Name</th>
                    <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-slate-600">JdbC Url</th>
                    <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-slate-600">Username</th>
                    <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-slate-600">Actions</th>
                </tr>
            </thead>
            <tbody className="text-slate-700">
                {tenants.map(tenant => (
                    <tr key={tenant.id} className="border-b border-slate-200 hover:bg-slate-50">
                        <td className="py-3 px-4 font-medium">{tenant.tenantId}</td>
                        <td className="py-3 px-4">{tenant.companyName}</td>
                        <td className="py-3 px-4">{tenant.jdbcUrl}</td>
                        <td className="py-3 px-4 text-sm text-slate-500">{tenant.username}</td>
                        <td className="py-3 px-4">
                            <button 
                                onClick={() => onDelete(tenant.tenantId)}
                                className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors"
                                title={`Delete ${tenant.tenantId}`}
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const TenantRequestList = ({ requests, onApprove, onReject }) => (
    <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
            <thead className="bg-slate-50">
                <tr>
                    <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-slate-600">Requested ID</th>
                    <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-slate-600">Company Name</th>
                    <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-slate-600">Admin Email</th>
                    <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-slate-600">Admin Password</th>
                    <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-slate-600">Actions</th>
                </tr>
            </thead>
            <tbody className="text-slate-700">
                {requests.length === 0 ? (
                    <tr>
                        <td colSpan="4" className="text-center py-10 text-slate-500">No pending tenant requests.</td>
                    </tr>
                ) : (
                    requests.map(request => (
                        <tr key={request.id} className="border-b border-slate-200 hover:bg-slate-50">
                            <td className="py-3 px-4 font-medium">{request.tenantId}</td>
                            <td className="py-3 px-4">{request.companyName}</td>
                            <td className="py-3 px-4 text-sm text-slate-500">{request.adminEmail}</td>
                            <td className="py-3 px-4 text-sm text-slate-500">{request.adminPassword}</td>
                            <td className="py-3 px-4 flex items-center gap-2">
                                <button 
                                    onClick={() => onApprove(request)}
                                    className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full hover:bg-green-200 transition-colors"
                                    title={`Approve ${request.tenantId}`}
                                >
                                    <Check className="h-3 w-3" /> Approve
                                </button>
                                <button 
                                    onClick={() => onReject(request.id, request.tenantId)}
                                    className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full hover:bg-red-200 transition-colors"
                                    title={`Reject ${request.tenantId}`}
                                >
                                    <X className="h-3 w-3" /> Reject
                                </button>
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
    </div>
);

const MasterAdmin = () => {
    const [tenants, setTenants] = useState([]);
    const [tenantRequests, setTenantRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const API_URL = import.meta.env.VITE_API_BASE_URL;

    // Mock stats data
    const stats = [
        { title: 'Active Tenants', value: tenants.length, icon: Building, change: '+2 this month', changeType: 'increase' },
        { title: 'Total Users', value: '1,420', icon: Users, change: '+5.1%', changeType: 'increase' },
        { title: 'Pending Requests', value: tenantRequests.length, icon: Activity, change: 'Needs review', changeType: 'decrease' },
        { title: 'System Status', value: 'Operational', icon: Server, change: 'All systems normal', changeType: 'increase' },
    ];

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError('');
            try {
                const token = localStorage.getItem('token');
                const headers = { "Authorization": `Bearer ${token}` };

                const [tenantsRes, requestsRes] = await Promise.all([
                    axios.get(`${API_URL}/master/tenants`, { headers }),
                    axios.get(`${API_URL}/master/tenant-requests`, { headers })
                ]);

                setTenants(tenantsRes.data);
                setTenantRequests(requestsRes.data);
            } catch (err) {
                setError('Failed to fetch data. Please try again later.');
                console.error("Error fetching data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [API_URL]);

    const handleDelete = async (tenantId) => {
        if (!window.confirm(`Are you sure you want to delete tenant "${tenantId}"? This action cannot be undone.`)) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/master/tenants/${tenantId}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            setTenants(prevTenants => prevTenants.filter(tenant => tenant.tenantId !== tenantId));
        } catch (err) {
            setError(`Failed to delete tenant "${tenantId}". Please try again.`);
            console.error("Error deleting tenant:", err);
        }
    };

    const handleApprove = async (request) => {
        if (!window.confirm(`Are you sure you want to approve and create tenant "${request.tenantId}"?`)) {
            return;
        }
        
        try {
            const token = localStorage.getItem('token');
            const headers = { "Authorization": `Bearer ${token}` };

            // Step 1: Create the MasterTenant.
            // Note: We are assuming the backend can provision a database connection from just this info.
            // In a real-world scenario, you might need to provide more details.
            const newTenant = {
                tenantId: request.tenantId,
                companyName: request.companyName,
                adminEmail: request.adminEmail,
                adminPassword: request.adminPassword
            };
            const createdTenantResponse = await axios.post(`${API_URL}/master/tenants/provision`, newTenant, { headers });

            // Step 2: Delete the tenant request
            await axios.delete(`${API_URL}/master/tenant-requests/${request.id}`, { headers });

            // Step 3: Update UI state
            setTenants(prev => [...prev, createdTenantResponse.data]);
            setTenantRequests(prev => prev.filter(r => r.id !== request.id));

            alert(`Tenant ${request.tenantId} approved. IMPORTANT: The backend currently does not automatically create the admin user. You may need to do this manually using the email "${request.adminEmail}" and the password from the request.`);

        } catch (err) {
            setError(`Failed to approve tenant "${request.tenantId}". A tenant with this ID might already exist.`);
            console.error("Error approving tenant:", err);
        }
    };

    const handleReject = async (requestId, tenantId) => {
        if (!window.confirm(`Are you sure you want to reject the request for tenant "${tenantId}"?`)) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/master/tenant-requests/${requestId}`, { headers: { "Authorization": `Bearer ${token}` } });
            setTenantRequests(prev => prev.filter(r => r.id !== requestId));
        } catch (err) {
            setError(`Failed to reject tenant request for "${tenantId}". Please try again.`);
            console.error("Error rejecting tenant request:", err);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <DashboardHeader />
            <main className="p-6 md:p-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold text-slate-800 mb-6">Master Admin Dashboard</h1>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {stats.map((stat, index) => (
                            <StatCard key={index} {...stat} />
                        ))}
                    </div>

                    {/* Tenant Request List */}
                    <div className="mt-8 bg-white p-6 rounded-xl shadow-sm">
                        <h2 className="text-xl font-semibold text-slate-800 mb-4">Pending Tenant Requests</h2>
                        {loading ? <div className="flex justify-center items-center h-40"><Loader className="h-8 w-8 animate-spin text-blue-600" /></div> : error ? <p className="text-red-500 text-center">{error}</p> : <TenantRequestList requests={tenantRequests} onApprove={handleApprove} onReject={handleReject} />}
                    </div>

                    {/* Tenant List */}
                    <div className="mt-8 bg-white p-6 rounded-xl shadow-sm">
                        <h2 className="text-xl font-semibold text-slate-800 mb-4">Registered Tenants</h2>
                        {loading ? <div className="flex justify-center items-center h-40"><Loader className="h-8 w-8 animate-spin text-blue-600" /></div> : error ? <p className="text-red-500 text-center">{error}</p> : <TenantList tenants={tenants} onDelete={handleDelete} />}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default MasterAdmin;
