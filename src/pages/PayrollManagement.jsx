import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Building, Users, SlidersHorizontal, HandCoins } from 'lucide-react';
import CompanyInfo from '../components/payrollComponent/CompanyInfo';
import PayrollSettings from '../components/payrollComponent/PayrollSettings';
import EmployeePayroll from '../components/payrollComponent/EmployeePayroll';
import EmployeeDetails from '../components/payrollComponent/EmployeeDetails';


const tabs = [
    { name: 'Manage Employee Payroll', icon: Users, component: EmployeePayroll },
    { name: 'Employee Details', icon: Users, component: EmployeeDetails },
    { name: 'Company Info', icon: Building, component: CompanyInfo },
    { name: 'Settings', icon: SlidersHorizontal, component: PayrollSettings },
];

const PayrollManagement = () => {
    const [activeTab, setActiveTab] = useState(tabs[0].name);

    const ActiveComponent = tabs.find(tab => tab.name === activeTab)?.component;

    return (
        <DashboardLayout>
            <div className="p-6 md:p-8 h-full flex flex-col">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-slate-800">Payroll Management</h1>
                    <p className="text-slate-500 mt-1">Run payroll, manage loans, and configure settings.</p>
                </div>

                <div className="border-b border-slate-200">
                    <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
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

                <div className="mt-6 bg-white p-6 rounded-xl shadow-sm flex-grow">
                    {ActiveComponent && <ActiveComponent />}
                </div>
            </div>
        </DashboardLayout>
    );
}

export default PayrollManagement;
