import React, { useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { SlidersHorizontal, Store, Settings as SettingsIcon, Users, Factory, Palette, BookUser } from 'lucide-react';
import { useTenant } from '../context/TenantContext';
import CompanyHubLayout from '../components/CompanyHubLayout';

const allSettingsSections = [
    { name: 'HRMS', path: '/company-settings/hrms', icon: SlidersHorizontal, module: 'HRMS_CORE', color: 'text-blue-500' },
    { name: 'POS', path: '/company-settings/pos', icon: Store, module: 'POS', color: 'text-orange-500' },
    { name: 'CRM', path: '/company-settings/crm', icon: Users, module: 'CRM', color: 'text-green-500' },
    { name: 'PartyType', path: '/company-settings/party-type', icon: BookUser, color: 'text-indigo-500' },
    { name: 'Production', path: '/company-settings/production', icon: Factory, module: 'PRODUCTION', color: 'text-purple-500' },
];

const Settings = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { hasModule } = useTenant();
    const themes = ['light', 'dark', 'greenish', 'blueish'];
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

    // Redirect to the first settings section if the base URL is hit
    useEffect(() => {
        if ((location.pathname === '/company-settings' || location.pathname === '/company-settings/') && settingsSections.length > 0) {
            navigate(settingsSections[0].path, { replace: true });
        }
    }, [location.pathname, navigate]);

    return (
        <CompanyHubLayout>
            <div className="flex flex-col h-full"> {/* Added h-full to ensure the flex column takes full height */}
                <nav className="bg-card text-card-foreground border-b border-border">
                    <div className="flex items-center justify-between p-4">
                        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
                        <div className="flex items-center justify-between capitalize">
                            <span className="text-sm text-foreground-muted">{theme} Mode</span>
                            <button
                                onClick={cycleTheme}
                                className="p-2 rounded-full hover:bg-background-muted text-foreground-muted"
                                title="Cycle Theme"
                            >
                                <Palette className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                    <div className="flex space-x-6 overflow-x-auto px-4" aria-label="Tabs">
                        {settingsSections.map(section => (
                            <NavLink
                                key={section.name}
                                to={section.path}
                                className={({ isActive }) =>
                                    `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors text-left whitespace-nowrap ${
                                        isActive
                                            ? 'bg-primary text-primary-foreground shadow-sm'
                                            : 'text-foreground-muted hover:bg-background-muted'
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                    <><section.icon className={`h-5 w-5 mr-3 transition-colors ${isActive ? '' : section.color}`} /><span>{section.name} Settings</span></>
                                )}
                            </NavLink>
                        ))}
                    </div>
                </nav>

                {/* Main Settings Content */}
                <div className="flex-1 bg-card rounded-xl shadow-sm overflow-hidden"> {/* Removed duplicate padding here */}
                    <Outlet />
                </div>
            </div>
        </CompanyHubLayout>
    );
}

export default Settings;
