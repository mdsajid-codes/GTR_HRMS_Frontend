import React, { useState } from 'react';
import LeavesView from './LeavesView';
import LeaveBalanceView from './LeaveBalanceView';
import LeavePolicyView from './LeavePolicyView';
import { FileClock, Wallet, BookOpen } from 'lucide-react';

const Leaves = () => {
    const [activeTab, setActiveTab] = useState('Leave Requests');

    const tabs = [
        { name: 'Leave Requests', icon: FileClock, component: <LeavesView />, color: 'text-amber-500' },
        { name: 'Leave Balances', icon: Wallet, component: <LeaveBalanceView />, color: 'text-green-500' },
        { name: 'Leave Policy', icon: BookOpen, component: <LeavePolicyView />, color: 'text-purple-500' },
    ];

    const activeTabClass = 'border-blue-600 text-blue-600 font-semibold';
    const inactiveTabClass = 'border-transparent text-slate-500 hover:text-blue-600 hover:border-blue-300';

    return (
        <div className="flex flex-col h-full">
            <div className="border-b border-slate-200 px-6 md:px-8 bg-white">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.name}
                            onClick={() => setActiveTab(tab.name)}
                            className={`whitespace-nowrap flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors group ${
                                activeTab === tab.name ? activeTabClass : inactiveTabClass
                            }`}
                        >
                            <tab.icon className={`h-5 w-5 ${tab.color} ${activeTab !== tab.name && 'opacity-70 group-hover:opacity-100'}`} />
                            {tab.name}
                        </button>
                    ))}
                </nav>
            </div>
            <div className="flex-grow bg-slate-50">
                {tabs.find(tab => tab.name === activeTab)?.component}
            </div>
        </div>
    );
}

export default Leaves;
