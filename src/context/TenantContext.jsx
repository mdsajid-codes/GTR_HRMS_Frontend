import React, { createContext, useContext, useMemo } from 'react';

const TenantContext = createContext(null);

/**
 * Provides information about the current tenant's subscribed modules.
 * It reads the 'plan' from localStorage, which is assumed to be a JSON array
 * of subscribed module strings (e.g., ['HRMS_CORE', 'HRMS_PAYROLL']).
 */
export const TenantProvider = ({ children }) => {
    const subscribedModules = useMemo(() => {
        try {
            // Login.jsx stores a comma-separated string of modules under the 'modules' key.
            const modulesString = localStorage.getItem('modules');
            // Split the string into an array of module names.
            return modulesString ? modulesString.split(',') : [];
        } catch (e) {
            console.error("Failed to parse tenant plan from localStorage", e);
            return [];
        }
    }, []);

    /**
     * Checks if the tenant has a specific module subscribed.
     * @param {string} moduleName - The name of the module to check (e.g., 'HRMS_PAYROLL').
     * @returns {boolean} - True if the module is subscribed, false otherwise.
     */
    const hasModule = (moduleName) => {
        return subscribedModules.includes(moduleName);
    };

    const value = { subscribedModules, hasModule };

    return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
};

/**
 * Custom hook to easily access the tenant's module information.
 */
export const useTenant = () => {
    const context = useContext(TenantContext);
    if (!context) {
        throw new Error('useTenant must be used within a TenantProvider');
    }
    return context;
};