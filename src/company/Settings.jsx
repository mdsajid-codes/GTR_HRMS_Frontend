import React, { useEffect, useMemo } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { SlidersHorizontal, Store, Settings as SettingsIcon } from 'lucide-react';
import { useTenant } from '../context/TenantContext';

const allSettingsSections = [
    { name: 'HRMS', path: '/company-settings/hrms', icon: SlidersHorizontal, module: 'HRMS_CORE' },
    { name: 'POS', path: '/company-settings/pos', icon: Store, module: 'POS' },
];

const Settings = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { hasModule } = useTenant();

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
            <div className="flex flex-col md:flex-row gap-8 h-full">
                {/* Settings Navigation Sidebar */}
                <aside className="md:w-64 flex-shrink-0">
                    <div className="flex items-center gap-3 mb-6">
                        <SettingsIcon className="h-7 w-7 text-slate-500" />
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
                            <p className="text-slate-500 text-sm">Manage modules</p>
                        </div>
                    </div>
                    <nav className="space-y-2">
                        {settingsSections.map(section => (
                            <NavLink
                                key={section.name}
                                to={section.path}
                                className={({ isActive }) => `w-full flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors text-left ${
                                    isActive
                                        ? 'bg-slate-200 text-slate-900 font-semibold'
                                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                }`}
                            >
                                <section.icon className="h-5 w-5 mr-3" />
                                <span>{section.name} Settings</span>
                            </NavLink>
                        ))}
                    </nav>
                </aside>

                {/* Main Settings Content */}
                <div className="flex-1 bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="h-full overflow-y-auto"><Outlet /></div>
                </div>
            </div>
    );
}

export default Settings;
