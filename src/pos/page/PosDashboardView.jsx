import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { DollarSign, ShoppingCart, Users, Package, ArrowRight, Loader, AlertCircle, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const formatPrice = (cents) => `AED ${(cents / 100).toFixed(2)}`;

const StatCard = ({ title, value, icon: Icon, link, linkText }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm flex flex-col justify-between">
        <div>
            <div className="flex justify-between items-start">
                <p className="text-sm font-medium text-slate-500">{title}</p>
                <Icon className="h-6 w-6 text-slate-400" />
            </div>
            <p className="text-3xl font-bold text-slate-800 mt-2">{value}</p>
        </div>
        {link && (
            <Link to={link} className="text-sm font-medium text-blue-600 hover:text-blue-800 mt-4 flex items-center gap-1">
                {linkText} <ArrowRight size={14} />
            </Link>
        )}
    </div>
);

const PosDashboardView = () => {
    const [stats, setStats] = useState({
        todayRevenue: 0,
        todaySales: 0,
        totalProducts: 0,
        totalCustomers: 0,
    });
    const [salesLast7Days, setSalesLast7Days] = useState([]);
    const [recentSales, setRecentSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError('');
            try {
                const token = localStorage.getItem('token');
                const headers = { headers: { "Authorization": `Bearer ${token}` } };

                const today = new Date();
                const todayStr = today.toISOString().split('T')[0];
                const sevenDaysAgo = new Date(today.setDate(today.getDate() - 6)).toISOString().split('T')[0];
                today.setDate(today.getDate() + 6); // Reset date

                const [salesRes, productsRes, customersRes] = await Promise.all([
                    axios.get(`${API_URL}/pos/sales?startDate=${sevenDaysAgo}&endDate=${todayStr}`, headers),
                    axios.get(`${API_URL}/pos/products`, headers),
                    axios.get(`${API_URL}/pos/customers`, headers),
                ]);

                const todaySalesData = salesRes.data.filter(s => s.invoiceDate && typeof s.invoiceDate === 'string' && s.invoiceDate.startsWith(todayStr));
                const todayRevenue = todaySalesData.reduce((sum, s) => sum + s.totalCents, 0);

                const salesByDay = salesRes.data.reduce((acc, sale) => {
                    const dateString = sale.invoiceDate && typeof sale.invoiceDate === 'string' ? sale.invoiceDate : new Date().toISOString();
                    const day = dateString.split('T')[0];
                    if (!acc[day]) {
                        acc[day] = { date: day, revenue: 0 };
                    }
                    acc[day].revenue += sale.totalCents / 100;
                    return acc;
                }, {});

                setStats({
                    todayRevenue,
                    todaySales: todaySalesData.length,
                    totalProducts: productsRes.data.length,
                    totalCustomers: customersRes.data.length,
                });

                setSalesLast7Days(Object.values(salesByDay).sort((a, b) => new Date(a.date) - new Date(b.date)));
                setRecentSales(salesRes.data.sort((a, b) => new Date(b.invoiceDate) - new Date(a.invoiceDate)).slice(0, 5));

            } catch (err) {
                console.error("Failed to load dashboard data:", err);
                setError('Could not load dashboard data. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <div className="p-8 flex justify-center items-center h-full"><Loader className="h-8 w-8 animate-spin text-blue-600" /></div>;
    }

    if (error) {
        return <div className="p-8 text-center text-red-500"><AlertCircle className="mx-auto h-12 w-12" />{error}</div>;
    }

    return (
        <div className="p-6 md:p-8 space-y-6">
            <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Today's Revenue" value={formatPrice(stats.todayRevenue)} icon={DollarSign} link="/pos-dashboard?view=Sales" linkText="View Sales" />
                <StatCard title="Today's Sales" value={stats.todaySales.toLocaleString()} icon={ShoppingCart} link="/pos-dashboard?view=Sales" linkText="View Sales" />
                <StatCard title="Total Products" value={stats.totalProducts.toLocaleString()} icon={Package} link="/pos-dashboard?view=Products" linkText="Manage Products" />
                <StatCard title="Total Customers" value={stats.totalCustomers.toLocaleString()} icon={Users} link="/pos-dashboard?view=Customers" linkText="Manage Customers" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sales Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm">
                    <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <TrendingUp size={22} /> Weekly Sales
                    </h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={salesLast7Days} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                            <XAxis dataKey="date" tick={{ fontSize: 12 }} tickFormatter={(d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
                            <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `AED ${v}`} />
                            <Tooltip
                                contentStyle={{ borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                                labelStyle={{ fontWeight: 'bold' }}
                                formatter={(value) => [formatPrice(value * 100), 'Revenue']}
                            />
                            <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Recent Sales */}
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h2 className="text-xl font-semibold text-slate-800 mb-4">Recent Sales</h2>
                    <div className="space-y-4">
                        {recentSales.length > 0 ? recentSales.map(sale => (
                            <div key={sale.id} className="flex justify-between items-center">
                                <div>
                                    <p className="font-medium text-sm">{sale.customerName || 'Walk-in Customer'}</p>
                                    <p className="text-xs text-slate-500">
                                        {new Date(sale.invoiceDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                    </p>
                                </div>
                                <p className="font-semibold text-sm text-slate-700">{formatPrice(sale.totalCents)}</p>
                            </div>
                        )) : (
                            <p className="text-sm text-slate-500 text-center py-8">No recent sales to display.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PosDashboardView;

// ```

// ### 2. Update `PosDashboard.jsx`

// Now, I'll update your main dashboard layout to correctly import and use this new `PosDashboardView` component.

// ```diff
// --- a/home/md-sajid/Desktop/Manipal University/Dummy/frontend/src/pos/page/PosDashboard.jsx
// +++ b/home/md-sajid/Desktop/Manipal University/Dummy/frontend/src/pos/page/PosDashboard.jsx
// @@ -14,7 +14,7 @@
//  import ProductsView from './ProductsView';
//  import SalesView from './SalesView';
//  import InventoryView from './InventoryView';
// -import PosDashboardView from './PosDashboardView';
// +import PosDashboardView from './PosDashboardView'; // This will now be the new enhanced dashboard
//  import ReportsView from './ReportsView';
 
 