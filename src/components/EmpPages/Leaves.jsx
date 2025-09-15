import React, { useState } from 'react';
import LeavesView from './LeavesView';
import LeaveBalanceView from './LeaveBalanceView';

const Leaves = () => {
    const [activeTab, setActiveTab] = useState('Leave View');

    const activeTabClass = 'border-blue-600 text-blue-600';
    const inactiveTabClass = 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300';

    return (
        <div className="flex flex-col h-full">
            <div className="border-b border-slate-200 px-6 md:px-8">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('Leave View')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'Leave View' ? activeTabClass : inactiveTabClass}`}
                    >
                        Leave Requests
                    </button>
                    <button
                        onClick={() => setActiveTab('Leave Balance')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'Leave Balance' ? activeTabClass : inactiveTabClass}`}
                    >
                        Leave Balances
                    </button>
                </nav>
            </div>
            <div className="flex-grow">
                {activeTab === 'Leave View' && <LeavesView />}
                {activeTab === 'Leave Balance' && <LeaveBalanceView />}
            </div>
        </div>
    );
}

export default Leaves;
