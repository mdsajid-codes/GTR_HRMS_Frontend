import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { List, BookOpen, Calendar, BarChart2 } from 'lucide-react';
import AllLeaveRequests from '../components/leaveComponents/AllLeaveRequests';
import LeaveBalances from '../components/leaveComponents/LeaveBalances';

// Placeholder components for other tab

const TeamCalendar = () => (
    <div className="text-center text-slate-500 py-10">
        <Calendar className="mx-auto h-12 w-12 text-slate-400" />
        <h3 className="mt-2 text-sm font-semibold text-slate-900">Team Calendar</h3>
        <p className="mt-1 text-sm text-slate-500">A team-wide leave calendar will be displayed here.</p>
    </div>
);

const LeaveReports = () => (
    <div className="text-center text-slate-500 py-10">
        <BarChart2 className="mx-auto h-12 w-12 text-slate-400" />
        <h3 className="mt-2 text-sm font-semibold text-slate-900">Leave Reports</h3>
        <p className="mt-1 text-sm text-slate-500">Tools for generating and viewing leave-related reports will be here.</p>
    </div>
);

const Leave = () => {
    const [activeTab, setActiveTab] = useState('requests');

    const activeTabClass = 'border-blue-600 text-blue-600';
    const inactiveTabClass = 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300';

    const renderContent = () => {
        switch (activeTab) {
            case 'requests':
                return <AllLeaveRequests />;
            case 'balances':
                return <LeaveBalances />;
            case 'calendar':
                return <TeamCalendar />;
            case 'reports':
                return <LeaveReports />;
            default:
                return null;
        }
    };

    return (
        <DashboardLayout>
            <div className="p-6 md:p-8 h-full flex flex-col">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-slate-800">Leave Management</h1>
                    <p className="text-slate-500 mt-1">Approve requests, view balances, and manage leave policies.</p>
                </div>

                <div className="border-b border-slate-200">
                    <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                        <button onClick={() => setActiveTab('requests')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === 'requests' ? activeTabClass : inactiveTabClass}`}>
                            <List className="h-4 w-4" /> Leave Requests
                        </button>
                        <button onClick={() => setActiveTab('balances')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === 'balances' ? activeTabClass : inactiveTabClass}`}>
                            <BookOpen className="h-4 w-4" /> Leave Balances
                        </button>
                        <button onClick={() => setActiveTab('calendar')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === 'calendar' ? activeTabClass : inactiveTabClass}`}>
                            <Calendar className="h-4 w-4" /> Team Calendar
                        </button>
                        <button onClick={() => setActiveTab('reports')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === 'reports' ? activeTabClass : inactiveTabClass}`}>
                            <BarChart2 className="h-4 w-4" /> Reports
                        </button>
                    </nav>
                </div>

                <div className="mt-6 bg-white p-6 rounded-xl shadow-sm flex-grow">
                    {renderContent()}
                </div>
            </div>
        </DashboardLayout>
    );
}

export default Leave;
