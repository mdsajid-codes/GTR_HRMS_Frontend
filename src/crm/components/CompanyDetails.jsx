import React, { useState } from 'react';
import { User, Building } from 'lucide-react';
import TenantInfo from '../../manageCompany/TenantInfo';
import CompanyInfo from '../../manageCompany/CompanyInfo';

const tabs = [
    { name: 'Tenant', icon: User, component: <TenantInfo /> },
    { name: 'Company', icon: Building, component: <CompanyInfo /> },
];

const CompanyDetails = () => {
    const [activeTab, setActiveTab] = useState(tabs[0].name);

    const ActiveComponent = tabs.find(tab => tab.name === activeTab)?.component;

    return (
        <div className="p-6 md:p-8 h-full">
            <div className="border-b border-border mb-6">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    {tabs.map((tab) => (
                        <button
                            key={tab.name}
                            onClick={() => setActiveTab(tab.name)}
                            className={`whitespace-nowrap flex items-center py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === tab.name
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-foreground-muted hover:text-foreground hover:border-border'
                            }`}
                        >
                            <tab.icon className="mr-2 h-5 w-5" />
                            {tab.name}
                        </button>
                    ))}
                </nav>
            </div>
            <div>
                {ActiveComponent}
            </div>
        </div>
    );
}

export default CompanyDetails;
