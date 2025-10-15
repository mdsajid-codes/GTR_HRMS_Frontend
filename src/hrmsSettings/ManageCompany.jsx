import React, { useState } from 'react';
import { User, Building, Landmark, MapPin, ArrowLeft } from 'lucide-react';
import TenantInfo from '../manageCompany/TenantInfo';
import CompanyInfo from '../manageCompany/CompanyInfo';
import BankDetails from '../manageCompany/BankDetails';
import Locations from '../manageCompany/Locations';


const ManageCompany = () => {
    const [activeView, setActiveView] = useState('grid');

    const sections = [
        { key: 'tenant', label: 'Tenant', icon: User, description: 'Manage tenant-specific settings.', color: 'text-sky-600', bgColor: 'bg-sky-100', component: <TenantInfo /> },
        { key: 'companyInfo', label: 'Company Info', icon: Building, description: 'Update company profile and registration.', color: 'text-amber-600', bgColor: 'bg-amber-100', component: <CompanyInfo /> },
        { key: 'bankDetails', label: 'Bank Details', icon: Landmark, description: 'Manage company bank accounts.', color: 'text-green-600', bgColor: 'bg-green-100', component: <BankDetails /> },
        { key: 'locations', label: 'Locations', icon: MapPin, description: 'Add or edit office locations.', color: 'text-rose-600', bgColor: 'bg-rose-100', component: <Locations /> },
    ];

    const activeSection = sections.find(s => s.key === activeView);

    return (
        <div className="p-4 sm:p-6 bg-slate-50 min-h-screen">
            <div className="mx-auto">
                {activeView === 'grid' ? (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                            {sections.map(section => (
                                <button
                                    key={section.key}
                                    onClick={() => setActiveView(section.key)}
                                    className="aspect-[3/2] flex flex-col items-center justify-center bg-white p-4 rounded-full shadow-md hover:shadow-xl hover:bg-slate-50 transition-all transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                >
                                    <div className={`p-3 ${section.bgColor} ${section.color} rounded-full mb-3`}>
                                        <section.icon className="h-6 w-6" />
                                    </div>
                                    <span className="text-center text-sm font-medium text-slate-700">{section.label}</span>
                                </button>
                            ))}
                        </div>
                    </>
                ) : (
                    <div>
                        <div className="flex items-center gap-4 mb-6">
                            <button
                                onClick={() => setActiveView('grid')}
                                className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
                            >
                                <ArrowLeft className="h-5 w-5 text-slate-600" />
                            </button>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800">{activeSection.label}</h2>
                                <p className="text-sm text-slate-500">{activeSection.description}</p>
                            </div>
                        </div>
                        {activeSection.component}
                    </div>
                )}

            </div>
        </div>
    );
};

export default ManageCompany;