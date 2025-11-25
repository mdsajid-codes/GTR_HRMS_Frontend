import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Settings, Factory, List, MapPin, Package, Layers, SlidersHorizontal, LayoutGrid, Box, ArrowLeft, Menu, X } from 'lucide-react';
import GeneralSettings from './GeneralSettings';
import WorkGroup from './WorkGroup';
import ManageProcess from './ManageProcess';
import ProParameter from './ProParameter';
import ProCategories from './ProCategories';
import ProRawMaterial from './ProRawMaterial';
import ProSemiFinished from './ProSemiFinished';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const BomSettings = () => (
    <div className="text-center py-10 border-2 border-dashed border-border rounded-lg bg-background-muted text-foreground-muted mt-6">
        <h3 className="mt-2 text-lg font-medium text-foreground">Bill of Materials (BOM)</h3>
        <p className="mt-1 text-sm">Manage your product BOMs here.</p>
    </div>
);

const productionNavLinks = [
    { name: 'General', icon: Settings, component: GeneralSettings, color: 'text-cyan-500' },
    { name: 'Workgroup', icon: Factory, component: WorkGroup, color: 'text-orange-500' },
    { name: 'Manage Process', icon: Layers, component: ManageProcess, color: 'text-green-500' },
    { name: 'Parameter', icon: SlidersHorizontal, component: ProParameter, color: 'text-indigo-500' },
    { name: 'Categories', icon: LayoutGrid, component: ProCategories, color: 'text-rose-500' },
    { name: 'Raw Materials', icon: Package, component: ProRawMaterial, color: 'text-amber-500' },
    { name: 'Semi Finished', icon: Box, component: ProSemiFinished, color: 'text-teal-500' },
    { name: 'BOM', icon: List, component: BomSettings, color: 'text-purple-500' },
];

const ProductionSettings = () => {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState(productionNavLinks[0].name);
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

    const renderContent = () => {
        const activeLink = productionNavLinks.find(link => link.name === activeTab);
        const Component = activeLink ? activeLink.component : GeneralSettings;
        // Pass the selectedLocation ID to the active component
        return <Component locationId={selectedLocation} />;
    };

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
                            <h1 className="text-xl font-bold text-slate-800">Production Configuration</h1>
                            <p className="text-sm text-slate-500">Manage company-wide settings for the Production module.</p>
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
                        {productionNavLinks.map(link => (
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
                    {renderContent()}
                </main>
            </div>
        </div>
    );
}

export default ProductionSettings;
