import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import { Filter, UserCircle, Plus, TrendingUp, Users, UserCheck, UserX, Briefcase, Clock, PhoneOff, UserCog, GitPullRequest, Copy, Palette, Loader, X, AlertCircle } from 'lucide-react';

import LeadDetails from './LeadDetails'; // Import the new component
import CrmLeadForm from '../components/CrmLeadForm';
const API_URL = import.meta.env.VITE_API_BASE_URL;

const initialKpiData = [
    { id: 'total', title: 'Total Lead', value: 0, icon: <Users className="h-6 w-6 text-primary" />, color: 'text-primary' },
    { id: 'active', title: 'Active Lead', value: 0, icon: <UserCheck className="h-6 w-6 text-green-500" />, color: 'text-green-500' },
    { id: 'new', title: 'New Lead', value: 0, icon: <TrendingUp className="h-6 w-6 text-blue-500" />, color: 'text-blue-500' },
    { id: 'lost', title: 'Lost Lead', value: 0, icon: <UserX className="h-6 w-6 text-red-500" />, color: 'text-red-500' },
    { id: 'converted', title: 'Lead to Operation', value: 0, icon: <Briefcase className="h-6 w-6 text-indigo-500" />, color: 'text-indigo-500' },
    { id: 'taskPending', title: 'Lead Task Pending', value: 0, icon: <Clock className="h-6 w-6 text-yellow-500" />, color: 'text-yellow-500' },
    { id: 'notResponded', title: 'Not Respond Leads', value: 0, icon: <PhoneOff className="h-6 w-6 text-gray-500" />, color: 'text-gray-500' },
    { id: 'notAssigned', title: 'Not Assigned Lead', value: 0, icon: <UserCog className="h-6 w-6 text-orange-500" />, color: 'text-orange-500' },
    { id: 'transferred', title: 'Transfer Leads', value: 0, icon: <GitPullRequest className="h-6 w-6 text-purple-500" />, color: 'text-purple-500' },
    { id: 'duplicate', title: 'Duplicate Lead', value: 0, icon: <Copy className="h-6 w-6 text-pink-500" />, color: 'text-pink-500' },
];

const KpiCard = ({ item }) => (
    <div className="bg-card p-4 rounded-lg shadow-sm flex items-center space-x-4">
        <div className="flex-shrink-0">{item.icon}</div>
        <div>
            <p className="text-sm text-foreground-muted">{item.title}</p>
            <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
        </div>
    </div>
);

const ChartCard = ({ title, children, className = '' }) => (
    <div className={`bg-card p-6 rounded-lg shadow-sm ${className}`}>
        <h3 className="text-lg font-semibold text-foreground mb-4">{title}</h3>
        <div className="h-64 flex items-center justify-center bg-background-muted rounded">
            <p className="text-foreground-muted">{children || 'Chart Placeholder'}</p>
        </div>
    </div>
);

const CrmLead = () => {
    const [kpiData, setKpiData] = useState(initialKpiData);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [showLeadDetails, setShowLeadDetails] = useState(false); // New state for LeadDetails view

    const themes = ['light', 'dark', 'greenish', 'blueish'];
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

    useEffect(() => {
        const root = window.document.documentElement;
        themes.forEach(t => root.classList.remove(t));
        root.classList.add(theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const cycleTheme = () => {
        const currentIndex = themes.indexOf(theme);
        const nextIndex = (currentIndex + 1) % themes.length;
        setTheme(themes[nextIndex]);
    };

    const fetchLeads = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/crm/leads?size=1000`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const leads = response.data.content;
            calculateKpis(leads);
        } catch (err) {
            setError('Failed to fetch lead data. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeads();
    }, []);

    const calculateKpis = (leads) => {
        const statusCounts = leads.reduce((acc, lead) => {
            const status = lead.status || 'UNKNOWN';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {});

        const notAssignedCount = leads.filter(lead => !lead.ownerId).length;

        setKpiData(prevKpi => prevKpi.map(kpi => {
            switch (kpi.id) {
                case 'total': return { ...kpi, value: leads.length };
                case 'active': return { ...kpi, value: statusCounts['ACTIVE'] || 0 };
                case 'new': return { ...kpi, value: statusCounts['NEW'] || 0 };
                case 'lost': return { ...kpi, value: statusCounts['LOST'] || 0 };
                case 'converted': return { ...kpi, value: statusCounts['CONVERTED'] || 0 };
                case 'notAssigned': return { ...kpi, value: notAssignedCount };
                // Placeholder values for KPIs that can't be calculated from CrmLeadResponse
                case 'taskPending': return { ...kpi, value: 45 };
                case 'notResponded': return { ...kpi, value: 32 };
                case 'transferred': return { ...kpi, value: 27 };
                case 'duplicate': return { ...kpi, value: 12 };
                default: return kpi;
            }
        }));
    };

    const handleSaveLead = async (leadData) => {
        setFormLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/crm/leads`, leadData, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            setSidebarOpen(false);
            fetchLeads(); // Refresh data
        } catch (err) {
            alert(`Error: ${err.response?.data?.message || 'Failed to save lead.'}`);
        } finally {
            setFormLoading(false);
        }
    };

    if (showLeadDetails) {
        return <LeadDetails onClose={() => setShowLeadDetails(false)} />;
    }

    return (
        <div className="space-y-6 relative">
            {/* Header */}
            <header className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-foreground">Lead Dashboard</h2>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground bg-card border border-border rounded-lg shadow-sm hover:bg-background-muted">
                            <Filter className="h-4 w-4" />
                            <span>Monthly</span>
                        </button>
                        {/* Dropdown content can be added here */}
                    </div>
                    <button onClick={() => setShowLeadDetails(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground bg-card border border-border rounded-lg shadow-sm hover:bg-background-muted">
                        <Users className="h-4 w-4" /> <span>View All Leads</span>
                    </button>
                    <button onClick={() => setSidebarOpen(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-lg shadow-sm hover:bg-primary/90">
                        <Plus className="h-4 w-4" />
                        <span>Add New Lead</span>
                    </button>
                    <button onClick={cycleTheme} className="p-2 rounded-full hover:bg-background-muted" title="Cycle Theme">
                        <Palette className="h-6 w-6 text-foreground-muted" />
                    </button>
                    <button className="p-2 rounded-full hover:bg-background-muted">
                        <UserCircle className="h-6 w-6 text-foreground-muted" />
                    </button>
                </div>
            </header>

            {/* Body */}
            <main className="space-y-8">
                {/* KPI Grids */}
                {loading ? (
                    <div className="flex justify-center items-center h-24">
                        <Loader className="animate-spin h-8 w-8 text-primary" />
                    </div>
                ) : error ? (
                    <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        <p>{error}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {kpiData.map(item => <KpiCard key={item.id} item={item} />)}
                    </div>
                )}


                {/* Chart Grids */}
                <div className="space-y-6">
                    {/* Row 1 */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <ChartCard title="Lead Pipeline" className="lg:col-span-1" />
                        <ChartCard title="Lead vs Sale" className="lg:col-span-1" />
                        <ChartCard title="Lead by Stage" className="lg:col-span-1" />
                    </div>

                    {/* Row 2 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                        <ChartCard title="Lead by Source" />
                        <ChartCard title="Lead Lost by Stage" />
                        <ChartCard title="Lead Lost by Reason" />
                        <ChartCard title="Lead by Industry" />
                    </div>
                </div>
            </main>

            {/* Add Lead Sidebar */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="fixed inset-0 bg-black/50 z-40" onClick={() => setSidebarOpen(false)} />
                        <motion.div
                            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} // Slide in from right
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="fixed top-0 right-0 h-full w-full max-w-2xl bg-card text-card-foreground shadow-lg z-50" // Increased width
                        >
                            <CrmLeadForm onSave={handleSaveLead} onCancel={() => setSidebarOpen(false)} loading={formLoading} />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

export default CrmLead;
