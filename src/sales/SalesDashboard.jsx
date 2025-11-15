import React from 'react';
import { DollarSign, ShoppingCart, Users, TrendingUp } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-card p-6 rounded-lg shadow-sm flex items-center justify-between">
        <div>
            <p className="text-sm font-medium text-foreground-muted">{title}</p>
            <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
            <Icon className="h-6 w-6 text-white" />
        </div>
    </div>
);

const SalesDashboard = () => {
    return (
        <div>
            <h1 className="text-3xl font-bold text-foreground mb-6">Sales Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Today's Revenue" value="$1,250" icon={DollarSign} color="bg-green-500" />
                <StatCard title="New Orders" value="32" icon={ShoppingCart} color="bg-blue-500" />
                <StatCard title="New Customers" value="8" icon={Users} color="bg-orange-500" />
                <StatCard title="Conversion Rate" value="4.2%" icon={TrendingUp} color="bg-purple-500" />
            </div>
            <div className="mt-8 bg-card p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold text-foreground">Recent Sales Activity</h2>
                <p className="text-foreground-muted mt-4">Sales activity chart will be displayed here.</p>
            </div>
        </div>
    );
};

export default SalesDashboard;