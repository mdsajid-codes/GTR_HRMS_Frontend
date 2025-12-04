import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { SlidersHorizontal, Store, Users, Factory, Palette, BookUser, Landmark } from "lucide-react";
import { useTenant } from '../context/TenantContext';
import CompanyHubLayout from '../components/CompanyHubLayout';

const allSettingsSections = [
    { name: 'HRMS', path: '/hrms-settings', icon: SlidersHorizontal, module: 'HRMS_CORE', color: 'text-blue-500' },
    { name: 'Account', path: '/account-settings', icon: Landmark, color: 'text-cyan-500' },
    { name: 'POS', path: '/pos-settings', icon: Store, module: 'POS', color: 'text-orange-500' },
    { name: 'CRM', path: '/crm-settings', icon: Users, module: 'CRM', color: 'text-green-500' },
    { name: 'PartyType', path: '/company-settings/party-type', icon: BookUser, color: 'text-indigo-500' },
    { name: 'Production', path: '/production-settings', icon: Factory, module: 'PRODUCTION', color: 'text-purple-500' },
];

const Settings = () => {
    const { hasModule } = useTenant();
    const themes = ["light", "dark", "greenish", "blueish"];
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

    useEffect(() => {
        const root = document.documentElement;
        // Remove all theme classes
        themes.forEach(t => root.classList.remove(t));
        // Add the current theme class if it's not light
        if (theme !== 'light') {
            root.classList.add(theme);
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const cycleTheme = () => {
        const currentIndex = themes.indexOf(theme);
        const nextIndex = (currentIndex + 1) % themes.length;
        setTheme(themes[nextIndex]);
    };

    const settingsSections = useMemo(() => {
        return allSettingsSections.filter(section => !section.module || hasModule(section.module));
    }, [hasModule]);

    return (
        <CompanyHubLayout>
            <div className="flex flex-col h-full bg-background text-foreground">
                <header className="bg-card text-card-foreground border-b border-border p-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold">Settings</h1>
                        <div className="flex items-center gap-2 capitalize">
                            <span className="text-sm text-foreground-muted hidden sm:inline">{theme} Mode</span>
                            <button
                                onClick={cycleTheme}
                                className="p-2 rounded-full hover:bg-background-muted text-foreground-muted"
                                title="Cycle Theme"
                            >
                                <Palette className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-4 sm:p-6 md:p-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {settingsSections.map((section) => (
                            <Link
                                key={section.name}
                                to={section.path}
                                className="group bg-card border border-border rounded-xl p-6 flex flex-col items-center justify-center text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary"
                            >
                                <div className={`mb-4 p-4 rounded-full bg-primary/10`}>
                                    <section.icon className={`h-8 w-8 ${section.color}`} />
                                </div>
                                <h2 className="text-lg font-semibold text-foreground">{section.name}</h2>
                                <p className="text-sm text-foreground-muted mt-1">Manage {section.name} settings</p>
                            </Link>
                        ))}
                    </div>
                </main>
            </div>
        </CompanyHubLayout>
    );
};

export default Settings;
