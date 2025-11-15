import React, { useState } from 'react';
import { PlusCircle, Search, AlertCircle, Loader } from 'lucide-react';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false); // Set to true when fetching data
    const [searchTerm, setSearchTerm] = useState('');

    // TODO: Implement API call to fetch orders

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-foreground">Sales Orders</h1>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <input type="text" placeholder="Search orders..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input w-full sm:w-64 pr-10 bg-background-muted border-border" />
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-muted" />
                    </div>
                    <button className="btn-primary flex items-center gap-2"><PlusCircle size={18} /> New Order</button>
                </div>
            </div>

            <div className="bg-card text-card-foreground rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-background-muted">
                            <tr>
                                <th className="th-cell">Order #</th>
                                <th className="th-cell">Customer</th>
                                <th className="th-cell">Date</th>
                                <th className="th-cell">Status</th>
                                <th className="th-cell text-right">Amount</th>
                                <th className="th-cell">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-foreground-muted">
                            {loading ? (
                                <tr><td colSpan="6" className="text-center py-10"><Loader className="animate-spin h-8 w-8 text-primary mx-auto" /></td></tr>
                            ) : orders.length === 0 ? (
                                <tr><td colSpan="6" className="text-center py-16"><AlertCircle className="mx-auto h-12 w-12 text-foreground-muted/50" /><h3 className="mt-2 text-sm font-medium text-foreground">No Orders Found</h3><p className="mt-1 text-sm">Get started by creating a new sales order.</p></td></tr>
                            ) : (
                                <></> // TODO: Map through orders here
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Orders;