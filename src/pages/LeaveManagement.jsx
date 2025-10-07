import React, { useState } from 'react';
import { SlidersHorizontal, BookCopy, UserCheck, CheckSquare } from 'lucide-react';
import LeaveTypes from '../components/Hrpages/LeaveTypes';
import LeavePolicies from '../components/Hrpages/LeavePolicies';
import LeaveAllocations from '../components/Hrpages/LeaveAllocations';
import PendingApprovals from '../components/Hrpages/PendingApprovals';

const tabs = [
    { name: 'Leave Types', icon: BookCopy, component: LeaveTypes },
    { name: 'Leave Policies', icon: SlidersHorizontal, component: LeavePolicies },
    { name: 'Employee Allocations', icon: UserCheck, component: LeaveAllocations },
    { name: 'Pending Approvals', icon: CheckSquare, component: PendingApprovals },
];

const LeaveManagement = () => {
    const [activeTab, setActiveTab] = useState(tabs[0].name);

    const ActiveComponent = tabs.find(tab => tab.name === activeTab)?.component;

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-slate-800 mb-6">Leave Management</h1>

                <div className="border-b border-slate-200">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                        {tabs.map((tab) => (
                            <button
                                key={tab.name}
                                onClick={() => setActiveTab(tab.name)}
                                className={`whitespace-nowrap flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                    activeTab === tab.name
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                }`}
                            >
                                <tab.icon className="mr-2 h-5 w-5" />
                                {tab.name}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="mt-8">
                    {ActiveComponent && <ActiveComponent />}
                </div>
            </div>
        </div>
    );
};

export default LeaveManagement;