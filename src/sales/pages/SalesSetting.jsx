import React, { useState } from 'react';
import { FileText } from 'lucide-react';
import SalesTermAndCondition from './SalesTermAndCondition';

const salesSettingTabs = [
    { name: 'Terms & Conditions', icon: FileText, component: SalesTermAndCondition },
    // Add other settings tabs here in the future
];

const SalesSetting = () => {
    const [activeTab, setActiveTab] = useState(salesSettingTabs[0].name);

    const ActiveComponent = salesSettingTabs.find(tab => tab.name === activeTab)?.component;

    return (
        <div className="p-6 md:p-8 h-full flex flex-col">
            <h1 className="text-3xl font-bold text-foreground mb-6">Sales Settings</h1>
            <div className="border-b border-border">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    {salesSettingTabs.map((tab) => (
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
            <div className="mt-6 flex-grow">{ActiveComponent && <ActiveComponent />}</div>
        </div>
    );
}

export default SalesSetting;
