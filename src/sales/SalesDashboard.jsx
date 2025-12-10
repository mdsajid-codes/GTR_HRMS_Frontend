import React from 'react';
import {
    DollarSign,
    ShoppingCart,
    Users,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    Package,
    Activity,
    CreditCard
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell,
    PieChart,
    Pie,
    Legend
} from 'recharts';

// Dummy Data
const revenueData = [
    { name: 'Jan', revenue: 4000, expenses: 2400 },
    { name: 'Feb', revenue: 3000, expenses: 1398 },
    { name: 'Mar', revenue: 2000, expenses: 9800 },
    { name: 'Apr', revenue: 2780, expenses: 3908 },
    { name: 'May', revenue: 1890, expenses: 4800 },
    { name: 'Jun', revenue: 2390, expenses: 3800 },
    { name: 'Jul', revenue: 3490, expenses: 4300 },
];

const topProductsData = [
    { name: 'Rental Service', sales: 4000 },
    { name: 'Spare Parts', sales: 3000 },
    { name: 'Maintenance', sales: 2000 },
    { name: 'Consulting', sales: 2780 },
    { name: 'Logistics', sales: 1890 },
];

const categoryData = [
    { name: 'Services', value: 400 },
    { name: 'Products', value: 300 },
    { name: 'Rentals', value: 300 },
    { name: 'Others', value: 200 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const recentInvoices = [
    { id: 'INV-001', customer: 'Acme Corp', amount: 1200, status: 'Paid', date: '2023-10-25' },
    { id: 'INV-002', customer: 'Global Tech', amount: 850, status: 'Pending', date: '2023-10-26' },
    { id: 'INV-003', customer: 'Stark Ind', amount: 2300, status: 'Paid', date: '2023-10-27' },
    { id: 'INV-004', customer: 'Wayne Ent', amount: 500, status: 'Overdue', date: '2023-10-24' },
    { id: 'INV-005', customer: 'Cyberdyne', amount: 1500, status: 'Paid', date: '2023-10-28' },
];

const StatCard = ({ title, value, icon: Icon, color, trend, trendValue, trendColor }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
            </div>
            <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
                <Icon className={`h-6 w-6 ${color.replace('bg-', 'text-')}`} />
            </div>
        </div>
        <div className="mt-4 flex items-center text-sm">
            <span className={`flex items-center font-medium ${trendColor === 'green' ? 'text-emerald-500' : 'text-rose-500'}`}>
                {trend === 'up' ? <ArrowUpRight className="h-4 w-4 mr-1" /> : <ArrowDownRight className="h-4 w-4 mr-1" />}
                {trendValue}
            </span>
            <span className="text-gray-400 ml-2">vs last month</span>
        </div>
    </div>
);

const SalesDashboard = () => {
    return (
        <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Sales Dashboard</h1>
                    <p className="text-sm text-gray-500">Welcome back, here's what's happening today.</p>
                </div>
                <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90 transition-colors shadow-sm">
                    Download Report
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Revenue"
                    value="$54,230"
                    icon={DollarSign}
                    color="text-emerald-600"
                    trend="up"
                    trendValue="12.5%"
                    trendColor="green"
                />
                <StatCard
                    title="New Orders"
                    value="1,250"
                    icon={ShoppingCart}
                    color="text-blue-600"
                    trend="up"
                    trendValue="8.2%"
                    trendColor="green"
                />
                <StatCard
                    title="New Customers"
                    value="340"
                    icon={Users}
                    color="text-violet-600"
                    trend="down"
                    trendValue="2.4%"
                    trendColor="red"
                />
                <StatCard
                    title="Conversion Rate"
                    value="3.8%"
                    icon={Activity}
                    color="text-orange-600"
                    trend="up"
                    trendValue="4.1%"
                    trendColor="green"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Revenue Overview</h2>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                <CartesianGrid vertical={false} stroke="#f3f4f6" />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ stroke: '#e5e7eb', strokeWidth: 1 }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#0ea5e9" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                                <Area type="monotone" dataKey="expenses" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorExpenses)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Sales by Category Pie Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Sales by Category</h2>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Top Products Bar Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Top Selling Products</h2>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topProductsData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey="sales" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Invoices List */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-gray-800">Recent Invoices</h2>
                        <button className="text-sm text-primary hover:underline">View All</button>
                    </div>
                    <div className="space-y-4">
                        {recentInvoices.map((invoice) => (
                            <div key={invoice.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-50 rounded-full">
                                        <CreditCard className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-800 bg-transparent">{invoice.customer}</p>
                                        <p className="text-xs text-gray-500">{invoice.date}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-gray-800">${invoice.amount}</p>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${invoice.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' :
                                            invoice.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                                                'bg-rose-100 text-rose-700'
                                        }`}>
                                        {invoice.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SalesDashboard;