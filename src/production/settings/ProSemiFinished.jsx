import React, { useState } from 'react';
import { Settings, Layers, List, Box } from 'lucide-react';
import ManageSemiFinished from './ManageSemiFinished';

import ManageSemiFinishedProcess from './ManageSemiFinishedProcess';
import ManageSemiFinishedBOM from './ManageSemiFinishedBOM';

const semiFinishedNavLinks = [
    { name: 'Manage SemiFinished', icon: Box, component: ManageSemiFinished, color: 'text-cyan-500' },    { name: 'Manage Processes', icon: Layers, component: ManageSemiFinishedProcess, color: 'text-green-500' },
    { name: 'Manage BOM', icon: List, component: ManageSemiFinishedBOM, color: 'text-purple-500' },
];

const ProSemiFinished = ({ locationId }) => {
    const [activeTab, setActiveTab] = useState(semiFinishedNavLinks[0].name);

    const renderContent = () => {
        const activeLink = semiFinishedNavLinks.find(link => link.name === activeTab);
        const Component = activeLink ? activeLink.component : ManageSemiFinished;
        return <Component locationId={locationId} />;
    };

    return (
        <div className="h-full flex flex-col">
            <div className="border-b border-slate-200">
                <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                    {semiFinishedNavLinks.map(link => (
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
            <div className="mt-6 flex-grow overflow-hidden">{renderContent()}</div>
        </div>
    );
};

export default ProSemiFinished;