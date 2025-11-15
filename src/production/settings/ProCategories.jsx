import React, { useState } from 'react';
import { LayoutGrid, ListTree } from 'lucide-react';
import CategoryTab from './CategoryTab';
import SubCategoryTab from './SubCategoryTab';

const subTabs = [
    { name: 'Category', icon: LayoutGrid, component: CategoryTab },
    { name: 'Sub Category', icon: ListTree, component: SubCategoryTab },
];

const ProCategories = ({ locationId }) => {
    const [activeTab, setActiveTab] = useState(subTabs[0].name);

    const ActiveComponent = subTabs.find(tab => tab.name === activeTab)?.component;

    return (
        <div className="p-6 bg-card rounded-xl shadow-sm">
            <div className="border-b border-border mb-6">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    {subTabs.map((tab) => (
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
                {ActiveComponent && <ActiveComponent locationId={locationId} />}
            </div>
        </div>
    );
};

export default ProCategories;