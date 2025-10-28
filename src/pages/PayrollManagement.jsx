import React, { useState, useMemo } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Building, Users, SlidersHorizontal, HandCoins, Receipt, Hand } from 'lucide-react';
import CompanyInfo from '../components/payrollComponent/CompanyInfo';
import PayrollSettings from '../components/payrollComponent/PayrollSettings';
import EmployeePayroll from '../components/payrollComponent/EmployeePayroll';
import EmployeeDetails from '../components/payrollComponent/EmployeeDetails';
import { useTenant } from '../context/TenantContext';
import AllLoanRequests from '../components/payrollComponent/AllLoanRequests';
import AllExpenseRequests from '../components/payrollComponent/AllExpenseRequests';


const allTabs = [
    { name: 'Manage Employee Payroll', icon: HandCoins, component: EmployeePayroll, color: 'text-green-600', bgColor: 'bg-green-100', module: 'HRMS_PAYROLL' },
    { name: 'Employee Details', icon: Users, component: EmployeeDetails, color: 'text-blue-600', bgColor: 'bg-blue-100', module: 'HRMS_CORE' },
    { name: 'Loan Requests', icon: Hand, component: AllLoanRequests, color: 'text-indigo-600', bgColor: 'bg-indigo-100', module: 'HRMS_PAYROLL' },
    { name: 'Expense Requests', icon: Receipt, component: AllExpenseRequests, color: 'text-rose-600', bgColor: 'bg-rose-100', module: 'HRMS_PAYROLL' },
    { name: 'Company Info', icon: Building, component: CompanyInfo, color: 'text-orange-600', bgColor: 'bg-orange-100' },
    { name: 'Settings', icon: SlidersHorizontal, component: PayrollSettings, color: 'text-purple-600', bgColor: 'bg-purple-100' },
];

const PayrollManagement = () => {
    const { hasModule } = useTenant();

    const tabs = useMemo(() => {
        return allTabs.filter(tab => !tab.module || hasModule(tab.module));
    }, [hasModule]);

    const [activeTab, setActiveTab] = useState(tabs[0]?.name);

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
                                    className={`whitespace-nowrap flex items-center gap-3 py-3 px-4 border-b-2 font-medium text-sm transition-colors group rounded-t-lg ${
                                        activeTab === tab.name
                                            ? 'border-blue-600 text-blue-600 bg-blue-50'
                                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                    }`}
                                >
                                    <div className={`p-1.5 rounded-md ${tab.bgColor} ${activeTab === tab.name ? '' : 'opacity-80 group-hover:opacity-100'}`}>
                                        <tab.icon className={`h-4 w-4 ${tab.color}`} />
                                    </div>
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
