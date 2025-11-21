import React, { useState } from 'react';
import { Settings, FolderKanban, BookOpen, WalletCards, BadgePercent, Hash, ReceiptText } from 'lucide-react';

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
    const [activeTab, setActiveTab] = useState(accountSettingsLinks[0].name);

    const ActiveComponent = accountSettingsLinks.find(link => link.name === activeTab)?.component;

    return (
        <div className="p-6 md:p-8 h-full flex flex-col">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Account Configuration</h1>
                    <p className="text-foreground-muted mt-1">Manage company-wide settings for the Accounting module.</p>
                </div>
            </div>

            <div className="border-b border-border">
                <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                    {accountSettingsLinks.map(link => (
                        <button
                            key={link.name}
                            onClick={() => setActiveTab(link.name)}
                            className={`whitespace-nowrap flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors group ${
                                activeTab === link.name ? 'border-primary text-primary font-semibold' : 'border-transparent text-foreground-muted hover:text-primary hover:border-primary/30'
                            }`}
                        >
                            <link.icon className={`h-5 w-5 ${link.color} ${activeTab !== link.name && 'opacity-70 group-hover:opacity-100'}`} />
                            <span>{link.name}</span>
                        </button>
                    ))}
                </nav>
            </div>

            <div className="mt-6 flex-grow overflow-y-auto">
                {ActiveComponent ? ActiveComponent : <p>Select a tab.</p>}
            </div>
        </div>
    );
}

export default AccountSetting;
