import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, ChevronLeft, Menu } from 'lucide-react';

const PosReportsLayout = () => {
    const navigate = useNavigate();
    const [isSidebarOpen, setSidebarOpen] = useState(true);

    const reports = [
        { name: 'Business Summary', path: 'business-summary' },
        { name: 'Abstract Report', path: 'abstract' },
        { name: 'Weekly Sales Analysis', path: 'weekly-sales' },
        { name: 'Daily Sales Report', path: 'daily-sales' },
        { name: 'Total Daily Sales Report', path: 'total-daily-sales' },
        { name: 'Closing Report', path: 'closing' },
    ];

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            {/* Sidebar */}
            <div className={`bg-white border-r border-slate-200 flex-shrink-0 transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-0 overflow-hidden'} print:hidden`}>
                <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                    <span className="font-bold text-lg text-slate-800">Reports</span>
                </div>
                <nav className="p-2 space-y-1 overflow-y-auto h-[calc(100vh-60px)]">
                    {reports.map((report) => (
                        <NavLink
                            key={report.path}
                            to={report.path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-colors ${isActive
                                    ? 'bg-blue-50 text-blue-600 font-medium'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <FileText size={20} className={isActive ? 'text-blue-600' : 'text-slate-400'} />
                                    <span className="truncate">{report.name}</span>
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <button
                        onClick={() => navigate('/pos-dashboard')}
                        className={`w-full flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors p-2 rounded-lg hover:bg-slate-50`}
                    >
                        <ChevronLeft size={20} />
                        <span>Back to POS</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full overflow-hidden print:w-full print:h-auto print:overflow-visible">
                {/* Header */}
                <header className="bg-white border-b border-slate-200 p-4 flex items-center justify-between flex-shrink-0 print:hidden">
                    <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-100 rounded-lg">
                        <Menu size={20} className="text-slate-600" />
                    </button>
                    <div className="font-medium text-slate-800">GTR Series</div>
                    <div className="font-medium text-slate-800">Reports</div>
                </header>

                {/* Report Content */}
                <main className="flex-1 overflow-auto bg-slate-50 p-6 print:bg-white print:p-0 print:overflow-visible">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default PosReportsLayout;
