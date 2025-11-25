import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, FolderKanban, BookOpen, WalletCards, BadgePercent, Hash, ReceiptText, ArrowLeft, Menu, X } from "lucide-react";

// Placeholder component for each settings tab
const PlaceholderComponent = ({ title }) => (
    <div className="text-center py-10 border-2 border-dashed border-border rounded-lg bg-background-muted text-foreground-muted">
        <h3 className="mt-2 text-lg font-medium text-foreground">{title}</h3>
        <p className="mt-1 text-sm">This section is under development. Stay tuned for updates!</p>
    </div>
);

const accountSettingsLinks = [
    { name: 'General', icon: Settings, component: <PlaceholderComponent title="General Settings" />, color: 'text-gray-500' },
    { name: 'Manage Groups', icon: FolderKanban, component: <PlaceholderComponent title="Manage Groups" />, color: 'text-blue-500' },
    { name: 'Manage Ledgers', icon: BookOpen, component: <PlaceholderComponent title="Manage Ledgers" />, color: 'text-green-500' },
    { name: 'Manage Payment modes', icon: WalletCards, component: <PlaceholderComponent title="Manage Payment Modes" />, color: 'text-purple-500' },
    { name: 'Manage Extra Charges', icon: BadgePercent, component: <PlaceholderComponent title="Manage Extra Charges" />, color: 'text-orange-500' },
    { name: 'Manage Prefix and Number', icon: Hash, component: <PlaceholderComponent title="Manage Prefix and Number" />, color: 'text-rose-500' },
    { name: 'TDS Section', icon: ReceiptText, component: <PlaceholderComponent title="TDS Section" />, color: 'text-teal-500' },
];

const AccountSetting = () => {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState(accountSettingsLinks[0].name);

    const ActiveComponent = accountSettingsLinks.find(link => link.name === activeTab)?.component;

    const activeTabClass = 'bg-blue-50 border-l-4 border-blue-600 text-blue-700 font-semibold';
    const inactiveTabClass = 'border-l-4 border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-800';

    return (
        <div className="flex flex-col h-full bg-slate-50">
            <header className="bg-white shadow-sm p-4 border-b border-slate-200 z-20">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-slate-100">
                            <ArrowLeft className="h-5 w-5 text-slate-600" />
                        </button>
                        <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 rounded-full hover:bg-slate-100">
                            <Menu className="h-5 w-5 text-slate-600" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-slate-800">Account Configuration</h1>
                            <p className="text-sm text-slate-500">Manage company-wide settings for the Accounting module.</p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex-grow flex">
                {/* Overlay for mobile */}
                {isSidebarOpen && (
                    <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>
                )}

                {/* Sidebar */}
                <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 p-4 md:p-6 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-2 rounded-full hover:bg-slate-100 absolute top-2 right-2">
                        <X className="h-5 w-5 text-slate-600" />
                    </button>
                    <nav className="flex flex-col space-y-2 mt-10 md:mt-0">
                        {accountSettingsLinks.map(link => (
                            <button
                                key={link.name}
                                onClick={() => { setActiveTab(link.name); setIsSidebarOpen(false); }}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all ${activeTab === link.name ? activeTabClass : inactiveTabClass}`}
                            >
                                <link.icon className={`h-5 w-5 ${link.color}`} />
                                <span>{link.name}</span>
                            </button>
                        ))}
                    </nav>
                </aside>

                <main className="flex-grow p-6 md:p-8 w-full md:w-auto">
                    {ActiveComponent || <p>Select a setting from the sidebar.</p>}
                </main>
            </div>
        </div>
    );
}

export default AccountSetting;
