import React, { useState } from 'react';
import { Building, Landmark } from 'lucide-react';
import axios from 'axios';
import CompanyInfoDetails from '../../manageCompany/CompanyInfo';
import BankDetails from '../../manageCompany/BankDetails';

const CompanyInfo = () => {
    const [activeSubTab, setActiveSubTab] = useState('Company Details');

    const subTabs = [
        { name: 'Company Details', icon: Building, component: CompanyInfoDetails },
        { name: 'Bank Accounts', icon: Landmark, component: BankDetails },
    ];

    const ActiveComponent = subTabs.find(tab => tab.name === activeSubTab)?.component;

    return (
        <div>
            <div className="border-b border-border mb-6">
                <nav className="-mb-px flex space-x-6 text-foreground" aria-label="Sub-tabs">
                    {subTabs.map((tab) => (
                        <button
                            key={tab.name}
                            onClick={() => setActiveSubTab(tab.name)}
                            className={`whitespace-nowrap flex items-center py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                                activeSubTab === tab.name
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
            {ActiveComponent && <ActiveComponent />}
        </div>
    );
}

export default CompanyInfo;
