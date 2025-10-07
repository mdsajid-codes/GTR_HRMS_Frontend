import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building, Users, Server, Activity, ArrowUpRight, ArrowDownRight, Loader, LogOut, Sparkles, Trash2, Check, X, PlusCircle, Edit, LayoutDashboard, Menu, AlertCircle, Calendar, Hash, MapPin, Store, Eye } from 'lucide-react';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import DashboardLayout from '../components/DashboardLayout';

const serviceModulesOptions = [
    { value: 'HRMS_CORE', label: 'HRMS Core' },
    { value: 'HRMS_ATTENDANCE', label: 'HRMS Attendance' },
    { value: 'HRMS_LEAVE', label: 'HRMS Leave' },
    { value: 'HRMS_PAYROLL', label: 'HRMS Payroll' },
    { value: 'HRMS_RECRUITMENT', label: 'HRMS Recruitment' },
    { value: 'POS', label: 'Point of Sale (POS)' },
];

const adminRoleOptions = [
    { value: 'SUPER_ADMIN', label: 'Super Admin' },
    { value: 'HRMS_ADMIN', label: 'HRMS Admin' },
    { value: 'HR', label: 'HR' },
    { value: 'MANAGER', label: 'Manager' },
    { value: 'EMPLOYEE', label: 'Employee' },
    { value: 'POS_ADMIN', label: 'POS Admin' },
    { value: 'POS_MANAGER', label: 'POS Manager' },
    { value: 'POS_CASHIER', label: 'POS Cashier' },
];

const masterRoleOptions = [
    { value: 'MASTER_ADMIN', label: 'Master Admin' },
];

const masterNavLinks = [
    { name: 'Dashboard', view: 'dashboard', icon: LayoutDashboard },
    { name: 'Tenants', view: 'tenants', icon: Building },
    { name: 'Requests', view: 'requests', icon: Activity },
];

const ProvisionTenantModal = ({ isOpen, onClose, onProvision }) => {
    const [formData, setFormData] = useState({
        tenantId: '',
        companyName: '',
        adminEmail: '',
        adminPassword: '',
        numberOfLocations: 1,
        numberOfUsers: 5,
        numberOfStore: 1,
        hrmsAccessCount: 5,
        subscriptionStartDate: new Date().toISOString().split('T')[0],
        subscriptionEndDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    });
    const [selectedModules, setSelectedModules] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedRoles, setSelectedRoles] = useState([]);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleModuleChange = (e) => {
        const { value, checked } = e.target;
        if (checked) {
            setSelectedModules(prev => [...prev, value]);
        } else {
            setSelectedModules(prev => prev.filter(m => m !== value));
        }
    };

    const handleRoleChange = (e) => {
        setSelectedRoles(Array.from(e.target.selectedOptions, option => option.value));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic validation
        if (selectedRoles.length === 0) {
            setError('You must select at least one admin role.');
            return;
        }

        setIsLoading(true);
        setError('');

        const payload = {
            ...formData,
            serviceModules: selectedModules,
            adminRoles: selectedRoles
        };

        try {
            await onProvision(payload);
            // Reset form on success before closing
            setFormData({ tenantId: '', companyName: '', adminEmail: '', adminPassword: '' });
            setSelectedModules([]);
            setSelectedRoles([]);
            setError('');
            onClose();
        } catch (err) {
            setError(err.message || 'An error occurred during provisioning.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="text-xl font-semibold">Provision New Tenant & Subscription</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100"><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit}>
                <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                    <h4 className="text-md font-semibold text-slate-600 border-b pb-2">Tenant & Admin Details</h4>
                    <InputField label="Tenant ID" name="tenantId" value={formData.tenantId} onChange={handleChange} placeholder="e.g., my-company" required />
                    <InputField label="Company Name" name="companyName" value={formData.companyName} onChange={handleChange} placeholder="e.g., My Awesome Company" required />
                    <InputField label="Admin Email" name="adminEmail" type="email" value={formData.adminEmail} onChange={handleChange} placeholder="e.g., admin@mycompany.com" required />
                    <InputField label="Admin Password" name="adminPassword" type="password" value={formData.adminPassword} onChange={handleChange} placeholder="A secure password for the tenant admin" required />
                    
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Service Modules</label>
                        <div className="mt-2 space-y-2">
                            {serviceModulesOptions.map(module => (
                                <label key={module.value} className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        value={module.value}
                                        onChange={handleModuleChange}
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span>{module.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label htmlFor="adminRoles" className="block text-sm font-medium text-slate-700">Admin Roles</label>
                        <select
                            id="adminRoles"
                            multiple
                            value={selectedRoles}
                            onChange={handleRoleChange}
                            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-600 focus:ring-blue-600 sm:text-sm"
                            size={5} // Show 5 roles at a time
                        >
                            {adminRoleOptions.map(role => (
                                <option key={role.value} value={role.value}>{role.label}</option>
                            ))}
                        </select>
                        <p className="mt-1 text-xs text-slate-500">Hold Ctrl (or Cmd on Mac) to select multiple roles.</p>
                    </div>

                    <h4 className="text-md font-semibold text-slate-600 border-b pb-2 pt-4">Subscription Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField label="Number of Locations" name="numberOfLocations" type="number" value={formData.numberOfLocations} onChange={handleChange} required min="1" />
                        <InputField label="Number of Users" name="numberOfUsers" type="number" value={formData.numberOfUsers} onChange={handleChange} required min="1" />
                        <InputField label="Number of Stores" name="numberOfStore" type="number" value={formData.numberOfStore} onChange={handleChange} required min="1" />
                        <InputField label="HRMS Access Count" name="hrmsAccessCount" type="number" value={formData.hrmsAccessCount} onChange={handleChange} required min="1" />
                        <InputField label="Subscription Start Date" name="subscriptionStartDate" type="date" value={formData.subscriptionStartDate} onChange={handleChange} required />
                        <InputField label="Subscription End Date" name="subscriptionEndDate" type="date" value={formData.subscriptionEndDate} onChange={handleChange} required />
                    </div>

                    {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <button type="button" onClick={onClose} className="btn-secondary" disabled={isLoading}>Cancel</button>
                        <button type="submit" className="btn-primary flex items-center" disabled={isLoading}>
                            {isLoading ? <Loader className="animate-spin h-4 w-4 mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                            Provision Tenant
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const InputField = ({ label, ...props }) => (
    <div>
        <label htmlFor={props.name} className="block text-sm font-medium text-slate-700">{label}</label>
        <input id={props.name} {...props} className="mt-1 appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-600 focus:border-blue-600 sm:text-sm" />
    </div>
);

const UpdateTenantModal = ({ isOpen, onClose, onUpdate, tenant, isLoading }) => {
    const [selectedModules, setSelectedModules] = useState([]);
    const [formData, setFormData] = useState({});
    const [error, setError] = useState('');

    useEffect(() => {
        if (tenant) {
            setSelectedModules(tenant.serviceModules || []);
            setFormData({
                companyName: tenant.companyName || '',
                numberOfLocations: tenant.numberOfLocations || 1,
                numberOfUsers: tenant.numberOfUsers || 5,
                numberOfStore: tenant.numberOfStore || 1,
                hrmsAccessCount: tenant.hrmsAccessCount || 5,
                subscriptionStartDate: tenant.subscriptionStartDate ? new Date(tenant.subscriptionStartDate).toISOString().split('T')[0] : '',
                subscriptionEndDate: tenant.subscriptionEndDate ? new Date(tenant.subscriptionEndDate).toISOString().split('T')[0] : '',
            });
        }
    }, [tenant]);

    const handleModuleChange = (e) => {
        const { value, checked } = e.target;
        setSelectedModules(prev => checked ? [...prev, value] : prev.filter(m => m !== value));
    };

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const payload = {
            ...formData,
            serviceModules: selectedModules,
        };

        try {
            await onUpdate(tenant.tenantId, payload);
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'An error occurred during the update.');
        }
    };

    if (!isOpen || !tenant) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="text-xl font-semibold">Update Tenant: {tenant.tenantId}</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100"><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                        <h4 className="text-md font-semibold text-slate-600 border-b pb-2">Tenant Details</h4>
                        <InputField label="Company Name" name="companyName" value={formData.companyName} onChange={handleChange} required />

                        <h4 className="text-md font-semibold text-slate-600 border-b pb-2 pt-4">Subscription Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="Number of Locations" name="numberOfLocations" type="number" value={formData.numberOfLocations} onChange={handleChange} required min="1" />
                            <InputField label="Number of Users" name="numberOfUsers" type="number" value={formData.numberOfUsers} onChange={handleChange} required min="1" />
                            <InputField label="Number of Stores" name="numberOfStore" type="number" value={formData.numberOfStore} onChange={handleChange} required min="1" />
                            <InputField label="HRMS Access Count" name="hrmsAccessCount" type="number" value={formData.hrmsAccessCount} onChange={handleChange} required min="1" />
                            <InputField label="Subscription Start Date" name="subscriptionStartDate" type="date" value={formData.subscriptionStartDate} onChange={handleChange} required />
                            <InputField label="Subscription End Date" name="subscriptionEndDate" type="date" value={formData.subscriptionEndDate} onChange={handleChange} required />
                        </div>

                        <h4 className="text-md font-semibold text-slate-600 border-b pb-2 pt-4">Service Modules</h4>
                        <label className="block text-sm font-medium text-slate-700">Service Modules</label>
                        <div className="mt-2 space-y-2">
                            {serviceModulesOptions.map(module => (
                                <label key={module.value} className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        value={module.value}
                                        checked={selectedModules.includes(module.value)}
                                        onChange={handleModuleChange}
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span>{module.label}</span>
                                </label>
                            ))}
                        </div>

                        {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                    </div>

                    <div className="p-4 bg-slate-50 border-t flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="btn-secondary" disabled={isLoading}>Cancel</button>
                        <button type="submit" className="btn-primary flex items-center" disabled={isLoading}>
                            {isLoading ? <Loader className="animate-spin h-4 w-4 mr-2" /> : <Check className="h-4 w-4 mr-2" />} Update Tenant
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const TenantDetailsModal = ({ isOpen, onClose, tenant, onEditClick }) => {
    if (!isOpen || !tenant) return null;

    const DetailItem = ({ icon: Icon, label, value, isDate = false }) => (
        <div className="flex items-start gap-3">
            <Icon className="h-5 w-5 text-slate-500 mt-0.5" />
            <div>
                <p className="text-sm text-slate-500">{label}</p>
                <p className="font-medium text-slate-800">
                    {isDate && value ? new Date(value).toLocaleDateString() : (value ?? 'N/A')}
                </p>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
                <div className="p-4 border-b flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-semibold">{tenant.companyName}</h3>
                        <p className="text-sm text-slate-500">{tenant.tenantId}</p>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100"><X size={20} /></button>
                </div>
                <div className="p-6 max-h-[75vh] overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <DetailItem icon={Building} label="Company Name" value={tenant.companyName} />
                        <DetailItem icon={Hash} label="Tenant ID" value={tenant.tenantId} />
                        <DetailItem icon={MapPin} label="Locations Allowed" value={tenant.numberOfLocations} />
                        <DetailItem icon={Users} label="Users Allowed" value={tenant.numberOfUsers} />
                        <DetailItem icon={Store} label="Stores Allowed" value={tenant.numberOfStore} />
                        <DetailItem icon={Users} label="HRMS Access Count" value={tenant.hrmsAccessCount} />
                        <DetailItem icon={Calendar} label="Subscription Start" value={tenant.subscriptionStartDate} isDate />
                        <DetailItem icon={Calendar} label="Subscription End" value={tenant.subscriptionEndDate} isDate />
                        <div className="md:col-span-2">
                            <DetailItem icon={Activity} label="Status" value={tenant.status} />
                        </div>
                        <div className="md:col-span-2">
                            <DetailItem icon={Server} label="JDBC URL" value={tenant.jdbcUrl} />
                        </div>
                    </div>
                </div>
                <div className="p-4 border-t bg-slate-50 flex justify-end">
                    <button onClick={() => onEditClick(tenant)} className="btn-secondary flex items-center gap-2">
                        <Edit size={16} />
                        Edit Tenant
                    </button>
                </div>
            </div>
        </div>
    );
};

const MasterUserModal = ({ isOpen, onClose, onSave, user, loading }) => {
    const [formData, setFormData] = useState({ username: '', password: '', confirmPassword: '', roles: new Set(['MASTER_ADMIN']) });
    const [modalError, setModalError] = useState('');

    useEffect(() => {
        if (user) {
            setFormData({ username: user.username, password: '', confirmPassword: '', roles: new Set(user.roles || ['MASTER_ADMIN']) });
        } else {
            setFormData({ username: '', password: '', confirmPassword: '', roles: new Set(['MASTER_ADMIN']) });
        }
        setModalError('');
    }, [user, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRoleChange = (role) => {
        setFormData(prev => {
            const newRoles = new Set(prev.roles);
            if (newRoles.has(role)) newRoles.delete(role);
            else newRoles.add(role);
            return { ...prev, roles: newRoles };
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setModalError('Passwords do not match.');
            return;
        }
        if (!user && !formData.password) {
            setModalError('Password is required for new users.');
            return;
        }
        onSave({ ...formData, roles: Array.from(formData.roles) });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-semibold">{user ? 'Edit' : 'Add'} Master User</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100"><X className="h-5 w-5" /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2"><InputField label="Username" name="username" value={formData.username} onChange={handleChange} required /></div>
                        <div><InputField label="Password" name="password" type="password" value={formData.password} onChange={handleChange} required={!user} placeholder={user ? 'Leave blank to keep current' : ''} /></div>
                        <div><InputField label="Confirm Password" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} required={!user || !!formData.password} /></div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700">Roles</label>
                            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
                                {masterRoleOptions.map(role => (
                                    <label key={role.value} className="inline-flex items-center">
                                        <input type="checkbox" checked={formData.roles.has(role.value)} onChange={() => handleRoleChange(role.value)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                        <span className="ml-2 text-sm text-slate-600">{role.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        {modalError && <p className="md:col-span-2 text-red-500 text-sm">{modalError}</p>}
                    </div>
                    <div className="p-4 border-t bg-slate-50 flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>Cancel</button>
                        <button type="submit" className="btn-primary flex items-center" disabled={loading}>{loading && <Loader className="animate-spin h-4 w-4 mr-2" />} Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const MasterUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);
    const API_URL = import.meta.env.VITE_API_BASE_URL;

    const fetchUsers = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/master/users`, { headers: { "Authorization": `Bearer ${token}` } });
            setUsers(response.data);
        } catch (err) {
            setError('Failed to fetch master users.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, [API_URL]);

    const handleAdd = () => { setEditingUser(null); setIsModalOpen(true); };
    const handleEdit = (user) => { setEditingUser(user); setIsModalOpen(true); };

    const handleSave = async (userData) => {
        setModalLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const { confirmPassword, ...payload } = userData;
            if (editingUser) {
                await axios.put(`${API_URL}/master/users/${editingUser.id}`, payload, { headers: { "Authorization": `Bearer ${token}` } });
            } else {
                await axios.post(`${API_URL}/master/users`, payload, { headers: { "Authorization": `Bearer ${token}` } });
            }
            setIsModalOpen(false);
            fetchUsers();
        } catch (err) {
            setError(err.response?.data || 'Failed to save user.');
            console.error(err);
        } finally {
            setModalLoading(false);
        }
    };

    const handleDelete = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this master user?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/master/users/${userId}`, { headers: { "Authorization": `Bearer ${token}` } });
            fetchUsers();
        } catch (err) {
            setError(err.response?.data || 'Failed to delete user.');
            console.error(err);
        }
    };

    return (
        <div className="p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-800">Master Users</h1>
                <button onClick={handleAdd} className="btn-primary flex items-center"><PlusCircle className="h-5 w-5 mr-2" /> Add Master User</button>
            </div>

            {error && (<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert"><strong className="font-bold">Error: </strong><span className="block sm:inline">{error}</span></div>)}

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex justify-center items-center h-80"><Loader className="h-8 w-8 animate-spin text-blue-600" /></div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="th-cell">Username</th>
                                    <th className="th-cell">Roles</th>
                                    <th className="th-cell">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-slate-700">
                                {users.length > 0 ? (
                                    users.map(user => (
                                        <tr key={user.id} className="border-b border-slate-200 hover:bg-slate-50">
                                            <td className="td-cell font-medium">{user.username}</td>
                                            <td className="td-cell"><div className="flex flex-wrap gap-1">{user.roles.map(role => (<span key={role} className="px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-700">{role}</span>))}</div></td>
                                            <td className="td-cell">
                                                <button onClick={() => handleEdit(user)} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-100 rounded-full transition-colors" title="Edit"><Edit className="h-4 w-4" /></button>
                                                <button onClick={() => handleDelete(user.id)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors" title="Delete"><Trash2 className="h-4 w-4" /></button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="3" className="text-center py-10 text-slate-500"><AlertCircle className="mx-auto h-12 w-12 text-slate-400" /><h3 className="mt-2 text-sm font-medium text-slate-900">No master users found</h3><p className="mt-1 text-sm text-slate-500">Get started by creating a new master user.</p></td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            <MasterUserModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} user={editingUser} loading={modalLoading} />
        </div>
    );
};

const MasterSidebar = ({ activeView, setActiveView, onLinkClick }) => {
    const navigate = useNavigate();
    const username = localStorage.getItem('username') || 'Master Admin';

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const NavItem = ({ item }) => (
        <button
            onClick={() => {
                setActiveView(item.view);
                onLinkClick && onLinkClick();
            }}
            className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors w-full text-left ${
                activeView === item.view
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-200'
            }`}
        >
            <item.icon className="h-5 w-5 mr-3 flex-shrink-0" />
            <span>{item.name}</span>
        </button>
    );

    return (
        <div className="flex flex-col h-full bg-white">
            <div className="p-4 border-b border-slate-200 flex-shrink-0">
                <Link to="/master-admin" className="flex items-center gap-3">
                    <Sparkles className="h-7 w-7 text-blue-600" />
                    <span className="font-bold text-xl text-slate-800">Master Panel</span>
                </Link>
            </div>
            <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
                {masterNavLinks.map((item) => (
                    <NavItem key={item.name} item={item} />
                ))}
                 <div className="pt-4 mt-4 border-t border-slate-200">
                     <NavItem item={{ name: 'Users', view: 'users', icon: Users }} />
                 </div>
            </nav>
            <div className="p-4 border-t border-slate-200 flex-shrink-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center min-w-0">
                        <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center font-bold text-blue-700 flex-shrink-0">
                            {username.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">{username}</p>
                            <p className="text-xs text-slate-500">Master Admin</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="text-slate-500 hover:text-red-600 ml-2 flex-shrink-0" title="Logout">
                        <LogOut className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

const DashboardView = ({ stats, loading, error }) => (
    <>
        <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
            {stats.map((stat, index) => (
                <StatCard key={index} {...stat} />
            ))}
        </div>
    </>
);

const TenantsView = ({ tenants, loading, error, onDelete, onEdit, onProvisionClick, onViewDetails }) => (
    <>
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
            <h1 className="text-3xl font-bold text-slate-800">Registered Tenants</h1>
            <button onClick={onProvisionClick} className="btn-primary flex items-center gap-2">
                <PlusCircle size={18} /> New Tenant
            </button>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
            {loading ? <div className="flex justify-center items-center h-40"><Loader className="h-8 w-8 animate-spin text-blue-600" /></div> : error ? <p className="text-red-500 text-center">{error}</p> : <TenantList tenants={tenants} onDelete={onDelete} onEdit={onEdit} onViewDetails={onViewDetails} />}
        </div>
    </>
);

const RequestsView = ({ requests, loading, error, onApprove, onReject }) => (
    <>
        <h1 className="text-3xl font-bold text-slate-800">Pending Tenant Requests</h1>
        <div className="mt-6 bg-white p-6 rounded-xl shadow-sm">
            {loading ? <div className="flex justify-center items-center h-40"><Loader className="h-8 w-8 animate-spin text-blue-600" /></div> : error ? <p className="text-red-500 text-center">{error}</p> : <TenantRequestList requests={requests} onApprove={onApprove} onReject={onReject} />}
        </div>
    </>
);

export const MasterAdminHeader = () => {
    const navigate = useNavigate();
    const username = localStorage.getItem('username') || 'Master Admin';

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-3">
                    <Sparkles className="h-7 w-7 text-blue-600" />
                    <span className="font-bold text-xl text-slate-800">Master Panel</span>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <p className="text-sm text-slate-600">Welcome, <span className="font-semibold">{username}</span></p>
                <button onClick={handleLogout} className="text-slate-500 hover:text-red-600" title="Logout"><LogOut className="h-5 w-5" /></button>
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

const TenantList = ({ tenants, onDelete, onEdit, onViewDetails }) => (
    <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
            <thead className="bg-slate-50">
                <tr>
                    <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-slate-600">Tenant ID</th>
                    <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-slate-600">Status</th>
                    <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-slate-600">Company Name</th>
                    <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-slate-600">JdbC Url</th>
                    <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-slate-600">Username</th>
                    <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-slate-600">Actions</th>
                </tr>
            </thead>
            <tbody className="text-slate-700">
                {tenants.map(tenant => (
                    <tr key={tenant.id} className="border-b border-slate-200 hover:bg-slate-50" >
                        <td className="py-3 px-4 font-medium">{tenant.tenantId}</td>
                        <td className="py-3 px-4">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                tenant.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>{tenant.status}</span>
                        </td>
                        <td className="py-3 px-4">{tenant.companyName}</td>
                        <td className="py-3 px-4">{tenant.jdbcUrl}</td>
                        <td className="py-3 px-4 text-sm text-slate-500">{tenant.username}</td>
                        <td className="py-3 px-4 flex items-center gap-1">
                            <button
                                onClick={(e) => { e.stopPropagation(); onViewDetails(tenant); }}
                                className="p-2 text-slate-500 hover:text-green-600 hover:bg-green-100 rounded-full transition-colors"
                                title={`View ${tenant.tenantId}`}
                            >
                                <Eye className="h-4 w-4" />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit(tenant);
                                }}
                                className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                                title={`Edit ${tenant.tenantId}`}
                            >
                                <Edit className="h-4 w-4" />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(tenant.tenantId);
                                }}
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
    const [activeView, setActiveView] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [tenants, setTenants] = useState([]);
    const [tenantRequests, setTenantRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalLoading, setModalLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [viewingTenant, setViewingTenant] = useState(null);
    const [editingTenant, setEditingTenant] = useState(null);
    const [error, setError] = useState('');
    const API_URL = import.meta.env.VITE_API_BASE_URL;

    // Stats data
    const stats = useMemo(() => [
        { title: 'Active Tenants', value: tenants.length, icon: Building, change: '+2 this month', changeType: 'increase' },
        { title: 'Total Users', value: '1,420', icon: Users, change: '+5.1%', changeType: 'increase' },
        { title: 'Pending Requests', value: tenantRequests.length, icon: Activity, change: 'Needs review', changeType: 'decrease' },
        { title: 'System Status', value: 'Operational', icon: Server, change: 'All systems normal', changeType: 'increase' },
    ], [tenants.length, tenantRequests.length]);

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

    useEffect(() => {
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
        // For approving, we just open the provisioning modal pre-filled with the request data.
        setFormDataForProvision(request);
        setIsModalOpen(true);
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
    
    const setFormDataForProvision = (request) => {
        setFormData({
            tenantId: request.tenantId,
            companyName: request.companyName,
            adminEmail: request.adminEmail,
            adminPassword: request.adminPassword,
            numberOfLocations: 1,
            numberOfUsers: 5,
            numberOfStore: 1,
            hrmsAccessCount: 5,
            subscriptionStartDate: new Date().toISOString().split('T')[0],
            subscriptionEndDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        });
    };

    const handleProvision = async (payload) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/master/tenants/provision`, payload, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            alert(`Tenant "${payload.tenantId}" has been provisioned successfully!`);
            // If this provision came from a request, find and delete the request
            const approvedRequest = tenantRequests.find(r => r.tenantId === payload.tenantId);
            if (approvedRequest) {
                await axios.delete(`${API_URL}/master/tenant-requests/${approvedRequest.id}`, { headers: { "Authorization": `Bearer ${token}` } });
            }
            fetchData(); // Refresh data after provisioning
        } catch (err) {
            console.error('Tenant provisioning failed:', err);
            const errorMessage = err.response?.data?.message || `Failed to provision tenant. The ID "${payload.tenantId}" might already be taken.`;
            throw new Error(errorMessage);
        }
    };

    const handleOpenUpdateModal = (tenant) => {
        setEditingTenant(tenant);
        setIsUpdateModalOpen(true);
    };

    const handleUpdate = async (tenantId, payload) => {
        setModalLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/master/tenants/${tenantId}`, payload, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            alert(`Tenant "${tenantId}" has been updated successfully!`);
            fetchData(); // Refresh data
        } catch (err) {
            console.error('Tenant update failed:', err);
            const errorMessage = err.response?.data?.message || `Failed to update tenant.`;
            throw new Error(errorMessage);
        } finally {
            setModalLoading(false);
        }
    };

    const handleViewDetails = (tenant) => {
        setViewingTenant(tenant);
        setIsDetailsModalOpen(true);
    };

    const handleEditFromDetails = (tenant) => {
        setIsDetailsModalOpen(false);
        handleOpenUpdateModal(tenant);
    };

    const renderContent = () => {
        switch (activeView) {
            case 'dashboard':
                return <DashboardView stats={stats} loading={loading} error={error} />;
            case 'tenants':
                return <TenantsView tenants={tenants} loading={loading} error={error} onDelete={handleDelete} onEdit={handleOpenUpdateModal} onProvisionClick={() => setIsModalOpen(true)} onViewDetails={handleViewDetails} />;
            case 'requests':
                return <RequestsView requests={tenantRequests} loading={loading} error={error} onApprove={handleApprove} onReject={handleReject} />;
            case 'users':
                return <MasterUsers />;
            default:
                return <DashboardView stats={stats} loading={loading} error={error} />;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="flex h-screen bg-slate-100">
                {/* Static sidebar for desktop */}
                <div className="hidden lg:flex lg:flex-shrink-0">
                    <div className="flex flex-col w-64 border-r border-slate-200">
                        <MasterSidebar activeView={activeView} setActiveView={setActiveView} />
                    </div>
                </div>

                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Top bar for mobile */}
                    <header className="lg:hidden sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white shadow-sm">
                        <button type="button" className="px-4 border-r border-slate-200 text-slate-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500" onClick={() => setSidebarOpen(true)}>
                            <Menu className="h-6 w-6" />
                        </button>
                        <div className="flex-1 px-4 flex justify-between items-center">
                            <Link to="/master-admin" className="flex items-center gap-2">
                                <Sparkles className="h-6 w-6 text-blue-600" />
                                <span className="font-bold text-lg">Master Panel</span>
                            </Link>
                        </div>
                    </header>

                    {/* Main content */}
                    <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 md:p-8">
                        <div className="max-w-7xl mx-auto">
                            {renderContent()}
                        </div>
                    </main>
                </div>

                {/* Mobile menu overlay */}
                <AnimatePresence>
                    {sidebarOpen && (
                        <>
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
                            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="fixed top-0 left-0 h-full w-64 z-30">
                                <MasterSidebar activeView={activeView} setActiveView={setActiveView} onLinkClick={() => setSidebarOpen(false)} />
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                <ProvisionTenantModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onProvision={handleProvision} />
                <UpdateTenantModal isOpen={isUpdateModalOpen} onClose={() => setIsUpdateModalOpen(false)} onUpdate={handleUpdate} tenant={editingTenant} isLoading={modalLoading} />
                <TenantDetailsModal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} tenant={viewingTenant} onEditClick={handleEditFromDetails} />
            </div>
        </div>
    );
}

export default MasterAdmin;
