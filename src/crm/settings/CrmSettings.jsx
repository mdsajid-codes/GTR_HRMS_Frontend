import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Building, MapPin, Tags, Factory, Package, Target, Loader, ListTodo, Building2, Briefcase, Users, ListFilter } from 'lucide-react';
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

    return (
        <div className="p-6 md:p-8 h-full flex flex-col">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">CRM Configuration</h1>
                    <p className="text-slate-500 mt-1">Manage company-wide settings for the CRM module.</p>
                </div>
                <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-muted" />
                    <select value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)} className="input pl-10 pr-8 appearance-none w-full sm:w-56 bg-background-muted border-border text-foreground-muted hover:border-primary" disabled={loading}>
                        <option value="all">All Locations</option>
                        {loading ? <option>Loading...</option> : locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                    </select>
                </div>
            </div>

            <div className="border-b border-slate-200">
                <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                    {crmNavLinks.map(link => (
                        <button
                            key={link.name}
                            onClick={() => setActiveTab(link.name)}
                            className={`whitespace-nowrap flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors group ${
                                activeTab === link.name ? 'border-blue-600 text-blue-600 font-semibold' : 'border-transparent text-slate-500 hover:text-blue-600 hover:border-blue-300'
                            }`}
                        >
                            <link.icon className={`h-5 w-5 ${link.color} ${activeTab !== link.name && 'opacity-70 group-hover:opacity-100'}`} />
                            <span>{link.name}</span>
                        </button>
                    ))}
                </nav>
            </div>

            <div className="mt-6 flex-grow overflow-hidden">
                {ActiveComponent ? 
                    React.cloneElement(ActiveComponent, { locationId: selectedLocation }) 
                    : <p>Select a tab.</p>}
            </div>
        </div>
    );
}

export default CrmSettings;
