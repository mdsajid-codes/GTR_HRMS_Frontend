import React, { useState } from 'react';
import { Settings, Factory, List } from 'lucide-react';
import GeneralSettings from './GeneralSettings';
import WorkGroup from './WorkGroup';

const BomSettings = () => (
    <div className="text-center py-10 border-2 border-dashed border-border rounded-lg bg-background-muted text-foreground-muted">
        <h3 className="mt-2 text-lg font-medium text-foreground">Bill of Materials (BOM)</h3>
        <p className="mt-1 text-sm">Manage your product BOMs here.</p>
    </div>
);

const productionNavLinks = [
    { name: 'General', icon: Settings, component: GeneralSettings, color: 'text-cyan-500' },
    { name: 'Workgroup', icon: Factory, component: WorkGroup, color: 'text-orange-500' },
    { name: 'BOM', icon: List, component: BomSettings, color: 'text-purple-500' },
];

const ProductionSettings = () => {
    const [activeTab, setActiveTab] = useState('General');

    const renderContent = () => {
        const activeLink = productionNavLinks.find(link => link.name === activeTab);
        const Component = activeLink ? activeLink.component : GeneralSettings;
        return <Component />;
    };

    return (
        <div className="p-6 md:p-8 h-full">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Production Configuration</h1>
                <p className="text-slate-500 mt-1">Manage company-wide settings for the Production module.</p>
            </div>

            <div className="border-b border-slate-200">
                <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                    {productionNavLinks.map(link => (
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
            <div className="mt-6">{renderContent()}</div>
        </div>
    );
}

export default ProductionSettings;
