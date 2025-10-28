import React from 'react';
import { Users, ShoppingCart, Building, BarChart3 } from 'lucide-react';
import CompanyHubLayout from '../components/CompanyHubLayout';
import { useTenant } from '../context/TenantContext';

const StatCard = ({ icon: Icon, title, value, description }) => (
    <div className="bg-card p-6 rounded-xl shadow-sm flex items-start justify-between">
        <div>
            <p className="text-sm font-medium text-foreground-muted">{title}</p>
            <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
            {description && (
                <p className="mt-2 text-sm text-foreground-muted">{description}</p>
            )}
        </div>
        <div className="bg-primary/10 text-primary p-3 rounded-lg">
            <Icon className="h-6 w-6" />
        </div>
    </div>
);

const CompanyDashboard = () => {
    const tenantId = localStorage.getItem('tenantId');
    const { hasModule } = useTenant();

    const allStats = [
        { title: 'Active Employees', value: '150', icon: Users, description: 'Across all departments', module: 'HRMS_CORE' },
        { title: 'Total Sales Today', value: '$12,450', icon: ShoppingCart, description: 'From all POS terminals', module: 'POS' },
        { title: 'Open Positions', value: '8', icon: Building, description: 'In HRMS', module: 'HRMS_RECRUITMENT' },
        { title: 'Revenue Growth', value: '+12%', icon: BarChart3, description: 'This quarter', module: 'POS' },
    ];

    const stats = allStats.filter(stat => hasModule(stat.module));

    return (
        <CompanyHubLayout>
            <div className="max-w-7xl mx-auto bg-background text-foreground">
                <h1 className="text-3xl font-bold text-foreground mb-2">Company Overview</h1>
                <p className="text-foreground-muted mb-6">A high-level view of your HRMS and POS systems for tenant <span className="font-semibold text-foreground">{tenantId}</span>.</p>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, index) => (
                        <StatCard key={index} {...stat} />
                    ))}
                </div>

                {/* More dashboard widgets can be added here */}
            </div>
        </CompanyHubLayout>
    );
}

export default CompanyDashboard;
