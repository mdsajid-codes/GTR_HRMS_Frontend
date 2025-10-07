import React, { useState, useMemo } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import Department from '../components/base/Department';
import Designation from '../components/base/Designation';
import JobBand from '../components/base/JobBand';
import Nationality from '../components/base/Nationality';
import TimeType from '../components/base/TimeType';
import WorkType from '../components/base/WorkType';
import ShiftType from '../components/base/ShiftType';
import LeaveGroup from '../components/base/LeaveGroup';
import WeekOffPolicy from '../components/base/WeekOffPolicy';
import LeaveType from '../components/base/LeaveType';
import ShiftPolicy from '../components/base/ShiftPolicy';
import WorkLocations from '../components/base/WorkLocations';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('departments');

    const activeTabClass = 'border-blue-600 text-blue-600';
    const inactiveTabClass = 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300';

    const canSeeLeaveTypes = useMemo(() => {
        const plan = localStorage.getItem('plan');
        const allowedPlans = ['STANDARD', 'PREMIUM', 'ENTERPRISE'];
        // Also allow master admin to see everything
        return allowedPlans.includes(plan) || localStorage.getItem('tenantId') === 'master';
    }, []);

    const canSeeAdvancedAttendance = useMemo(() => {
        const plan = localStorage.getItem('plan');
        const allowedPlans = ['STANDARD', 'PREMIUM', 'ENTERPRISE'];
        return allowedPlans.includes(plan) || localStorage.getItem('tenantId') === 'master';
    }, []);

    return (
        <DashboardLayout>
            <div className="p-6 md:p-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-slate-800">Settings</h1>
                    <p className="text-slate-500 mt-1">Manage company-wide settings for departments, designations, and more.</p>
                </div>

                <div className="border-b border-slate-200">
                    <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                        <button
                            onClick={() => setActiveTab('departments')}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'departments' ? activeTabClass : inactiveTabClass}`}
                        >
                            Departments
                        </button>
                        <button
                            onClick={() => setActiveTab('designations')}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'designations' ? activeTabClass : inactiveTabClass}`}
                        >
                            Designations
                        </button>
                        <button
                            onClick={() => setActiveTab('jobBands')}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'jobBands' ? activeTabClass : inactiveTabClass}`}
                        >
                            Job Bands
                        </button>
                        <button
                            onClick={() => setActiveTab('nationalities')}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'nationalities' ? activeTabClass : inactiveTabClass}`}
                        >
                            Nationalities
                        </button>
                        <button
                            onClick={() => setActiveTab('workLocations')}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'workLocations' ? activeTabClass : inactiveTabClass}`}
                        >
                            Work Locations
                        </button>
                        <button
                            onClick={() => setActiveTab('timeTypes')}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'timeTypes' ? activeTabClass : inactiveTabClass}`}
                        >
                            Time Types
                        </button>
                        <button
                            onClick={() => setActiveTab('workTypes')}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'workTypes' ? activeTabClass : inactiveTabClass}`}
                        >
                            Work Types
                        </button>
                        <button
                            onClick={() => setActiveTab('shiftTypes')}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'shiftTypes' ? activeTabClass : inactiveTabClass}`}
                        >
                            Shift Types
                        </button>
                        <button
                            onClick={() => setActiveTab('leaveGroups')}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'leaveGroups' ? activeTabClass : inactiveTabClass}`}
                        >
                            Leave Groups
                        </button>
                        <button
                            onClick={() => setActiveTab('weekOffPolicies')}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'weekOffPolicies' ? activeTabClass : inactiveTabClass}`}
                        >
                            Weekly Off Policies
                        </button>
                        {canSeeAdvancedAttendance && (
                            <button
                                onClick={() => setActiveTab('shiftPolicies')}
                                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'shiftPolicies' ? activeTabClass : inactiveTabClass}`}
                            >
                                Shift Policies
                            </button>
                        )}
                        {canSeeLeaveTypes && (
                            <button
                                onClick={() => setActiveTab('leaveTypes')}
                                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'leaveTypes' ? activeTabClass : inactiveTabClass}`}
                            >
                                Leave Types
                            </button>
                        )}
                    </nav>
                </div>

                <div className="mt-6">
                    {activeTab === 'departments' && (
                        <Department embedded={true} />
                    )}
                    {activeTab === 'designations' && (
                        <Designation embedded={true} />
                    )}
                    {activeTab === 'jobBands' && (
                        <JobBand embedded={true} />
                    )}
                    {activeTab === 'nationalities' && (
                        <Nationality embedded={true} />
                    )}
                    {activeTab === 'workLocations' && (
                        <WorkLocations />
                    )}
                    {activeTab === 'timeTypes' && (
                        <TimeType embedded={true} />
                    )}
                    {activeTab === 'workTypes' && (
                        <WorkType embedded={true} />
                    )}
                    {activeTab === 'shiftTypes' && (
                        <ShiftType embedded={true} />
                    )}
                    {activeTab === 'leaveGroups' && (
                        <LeaveGroup embedded={true} />
                    )}
                    {activeTab === 'weekOffPolicies' && (
                        <WeekOffPolicy embedded={true} />
                    )}
                    {canSeeLeaveTypes && activeTab === 'leaveTypes' && (
                        <LeaveType embedded={true} />
                    )}
                    {canSeeAdvancedAttendance && activeTab === 'shiftPolicies' && (
                        <ShiftPolicy embedded={true} />
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Settings;