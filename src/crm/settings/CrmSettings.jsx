import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Building, MapPin, Tags, Factory, Package, Target, ListTodo, Building2, Briefcase, Users, ListFilter, ArrowLeft, Menu, X } from 'lucide-react';
import CompanyDetails from '../components/CompanyDetails';
import LocationDetails from '../components/LocationDetails';
import CrmCompanyType from '../components/CrmCompanyType';
import CrmIndustry from '../components/CrmIndustry';
import CrmProduct from '../components/CrmProduct';
import ManageKpi from '../components/ManageKpi';
import CrmLeadStage from '../components/CrmLeadStage';
import TaskStage from '../components/TaskStage';
import Department from '../../components/base/Department';
import Designation from '../../components/base/Designation';
import HumanResourceTab from '../components/HumanResourceTab';

const API_URL = import.meta.env.VITE_API_BASE_URL;

// Placeholder component for each settings tab
const PlaceholderComponent = ({ title }) => (
    <div className="text-center py-10 border-2 border-dashed border-border rounded-lg bg-background-muted text-foreground-muted">
        <h3 className="mt-2 text-lg font-medium text-foreground">{title}</h3>
        <p className="mt-1 text-sm">This section is under development. Stay tuned for updates!</p>
    </div>
);

const crmNavLinks = [
    { name: 'Company Details', icon: Building, component: <CompanyDetails title="Company Details" />, color: 'text-cyan-500' },
    { name: 'Location Details', icon: MapPin, component: <LocationDetails title="Location Details" />, color: 'text-orange-500' },
    { name: 'Department', icon: Building2, component: <Department embedded={true} />, color: 'text-red-500' },
    { name: 'Human Resources', icon: Users, component: <HumanResourceTab />, color: 'text-indigo-500' },
    { name: 'Designation', icon: Briefcase, component: <Designation embedded={true} />, color: 'text-blue-500' },
    { name: 'Company Type', icon: Tags, component: <CrmCompanyType title="Company Type" />, color: 'text-purple-500' },
    { name: 'Industry', icon: Factory, component: <CrmIndustry title="Industry" />, color: 'text-rose-500' },
    { name: 'Product', icon: Package, component: <CrmProduct title="Product" />, color: 'text-green-500' },
    { name: 'Manage KPI', icon: Target, component: <ManageKpi title="Manage KPI" />, color: 'text-indigo-500' },
    { name: 'Lead Stage', icon: ListFilter, component: <CrmLeadStage title="Lead Stage" />, color: 'text-yellow-500' },
    { name: 'Task Stage', icon: ListTodo, component: <TaskStage title="Task Stage" />, color: 'text-teal-500' },
];

const CrmSettings = () => {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState(crmNavLinks[0].name);
    const [locations, setLocations] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLocations = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${API_URL}/locations`, { headers: { Authorization: `Bearer ${token}` } });
                setLocations(res.data);
                if (res.data.length > 0) {
                    setSelectedLocation('all'); // Default to 'all'
                }
            } catch (err) {
                console.error("Failed to fetch locations:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchLocations();
    }, []);

    const ActiveComponent = crmNavLinks.find(link => link.name === activeTab)?.component;

    const activeTabClass = 'bg-blue-50 border-l-4 border-blue-600 text-blue-700 font-semibold';
    const inactiveTabClass = 'border-l-4 border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-800';

    return (
        <div className="flex flex-col h-full bg-slate-50">
            <header className="bg-white shadow-sm p-4 border-b border-slate-200 z-20">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-slate-100">
                            <ArrowLeft className="h-5 w-5 text-slate-600" />
                        </button>
                        <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 rounded-full hover:bg-slate-100">
                            <Menu className="h-5 w-5 text-slate-600" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-slate-800">CRM Configuration</h1>
                            <p className="text-sm text-slate-500">Manage company-wide settings for the CRM module.</p>
                        </div>
                    </div>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <select value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)} className="pl-10 pr-8 py-2 text-sm border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 w-full sm:w-56" disabled={loading}>
                            <option value="all">All Locations</option>
                            {loading ? <option>Loading...</option> : locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                        </select>
                    </div>
                </div>
            </header>

            <div className="flex-grow flex">
                {/* Overlay for mobile */}
                {isSidebarOpen && (
                    <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>
                )}

                {/* Sidebar */}
                <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 p-4 md:p-6 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-2 rounded-full hover:bg-slate-100 absolute top-2 right-2">
                        <X className="h-5 w-5 text-slate-600" />
                    </button>
                    <nav className="flex flex-col space-y-2 mt-10 md:mt-0">
                        {crmNavLinks.map(link => (
                            <button
                                key={link.name}
                                onClick={() => { setActiveTab(link.name); setIsSidebarOpen(false); }}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all ${activeTab === link.name ? activeTabClass : inactiveTabClass}`}
                            >
                                <link.icon className={`h-5 w-5 ${link.color}`} />
                                <span>{link.name}</span>
                            </button>
                        ))}
                    </nav>
                </aside>

                <main className="flex-grow p-6 md:p-8 w-full md:w-auto">
                    {ActiveComponent ?
                        React.cloneElement(ActiveComponent, { locationId: selectedLocation })
                        : <p>Select a setting from the sidebar.</p>}
                </main>
            </div>
        </div>
    );
}

export default CrmSettings;
