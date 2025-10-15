import React, { useState } from 'react';
import { SlidersHorizontal, BookCopy, UserCheck, FileClock } from 'lucide-react';
import LeaveType from '../components/base/LeaveType';
import LeavePolicies from '../components/Hrpages/LeavePolicies';
import { LeaveBalancesSection, AllLeaveRequests } from '../components/leaveComponents/AllLeaveRequests';
import DashboardLayout from '../components/DashboardLayout';

const tabs = [
    { name: 'Leave Requests', icon: FileClock, component: AllLeaveRequests, color: 'text-amber-500' },
    { name: 'Leave Balances', icon: UserCheck, component: LeaveBalancesSection, color: 'text-green-500' },
    { name: 'Leave Policies', icon: SlidersHorizontal, component: LeavePolicies, color: 'text-blue-500' },
    { name: 'Leave Types', icon: BookCopy, component: () => <LeaveType embedded />, color: 'text-purple-500' },
];

const LeaveManagement = () => {
    const [activeTab, setActiveTab] = useState('Leave Requests');

    const ActiveComponent = tabs.find(tab => tab.name === activeTab)?.component;

    return (
        <DashboardLayout>
            <div className="p-6 md:p-8 bg-slate-50 min-h-full">
                <div className="max-w-full mx-auto">
                    <h1 className="text-3xl font-bold text-slate-800 mb-6">Leave Management</h1>

                    <div className="border-b border-slate-200 bg-white rounded-t-xl shadow-sm">
                        <nav className="-mb-px flex space-x-6 px-6" aria-label="Tabs">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.name}
                                    onClick={() => setActiveTab(tab.name)}
                                    className={`whitespace-nowrap flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                    activeTab === tab.name ?
                                    'border-blue-600 text-blue-600' :
                                    'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                    }`}
                                > 
                                <tab.icon className={`mr-2 h-5 w-5 ${tab.color}`} />
                                    {tab.name}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="mt-6 bg-white p-6 rounded-b-xl shadow-sm">
                        {ActiveComponent && <ActiveComponent />}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default LeaveManagement;