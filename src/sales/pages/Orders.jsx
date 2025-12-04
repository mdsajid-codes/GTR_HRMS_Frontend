import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, Edit, Trash2, Loader2, Search, ChevronLeft, ChevronRight, Eye, X, FileText, Truck } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const getStatusColor = (status) => {
    switch (status) {
        case 'DRAFT': return 'bg-gray-100 text-gray-800';
        case 'OPEN': return 'bg-blue-100 text-blue-800';
        case 'PARTIALLY_INVOICED': return 'bg-yellow-100 text-yellow-800';
        case 'INVOICED': return 'bg-green-100 text-green-800';
        case 'CANCELLED': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const Orders = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [viewingOrder, setViewingOrder] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);

    const authHeaders = useMemo(() => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }), []);

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                size: pageSize,
                // search: searchTerm, // Backend might not support search yet
            };
            const response = await axios.get(`${API_URL}/sales/orders`, { params, ...authHeaders });
            setOrders(response.data.content || []);
            setTotalPages(response.data.totalPages);
            setError(null);
        } catch (err) {
            setError('Failed to fetch sales orders. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, authHeaders]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this sales order?')) {
            try {
                await axios.delete(`${API_URL}/sales/orders/${id}`, authHeaders);
                fetchOrders();
            } catch (err) {
                alert(`Error: ${err.response?.data?.message || 'Failed to delete sales order.'}`);
            }
        }
    };

    const handleView = async (id) => {
        setIsViewModalOpen(true);
        setModalLoading(true);
        try {
            const response = await axios.get(`${API_URL}/sales/orders/${id}`, authHeaders);
            setViewingOrder(response.data);
        } catch (err) {
            console.error("Failed to fetch order details", err);
            setIsViewModalOpen(false);
        } finally {
            setModalLoading(false);
        }
    };

    const handleCloseModal = () => {
        setIsViewModalOpen(false);
        setViewingOrder(null);
    };

    const OrderViewModal = () => {
        if (!isViewModalOpen) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center" onClick={handleCloseModal}>
                <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                    <header className="flex items-center justify-between p-4 border-b">
                        <h2 className="text-xl font-bold text-slate-800">Sales Order Details</h2>
                        <button onClick={handleCloseModal} className="p-2 rounded-full hover:bg-gray-100"><X className="h-5 w-5" /></button>
                    </header>
                    <main className="p-6 overflow-y-auto">
                        {modalLoading ? (
                            <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>
                        ) : viewingOrder ? (
                            <div className="space-y-6">
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                    <div><p className="text-gray-500">Sales Order #</p><p className="font-semibold">{viewingOrder.salesOrderNumber}</p></div>
                                    <div><p className="text-gray-500">Date</p><p className="font-semibold">{new Date(viewingOrder.salesOrderDate).toLocaleDateString()}</p></div>
                                    <div><p className="text-gray-500">Customer PO No.</p><p className="font-semibold">{viewingOrder.customerPoNo || 'N/A'}</p></div>
                                    <div className="col-span-3"><p className="text-gray-500">Customer Name</p><p className="font-semibold">{viewingOrder.customerName || 'N/A'}</p></div>
                                    <div><p className="text-gray-500">Status</p><p><span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(viewingOrder.status)}`}>{viewingOrder.status}</span></p></div>
                                    <div><p className="text-gray-500">Reference</p><p className="font-semibold">{viewingOrder.reference || 'N/A'}</p></div>
                                    <div><p className="text-gray-500">Salesperson</p><p className="font-semibold">{viewingOrder.salespersonName || 'N/A'}</p></div>
                                </div>

                                <div className="border-t pt-4">
                                    <h3 className="font-semibold mb-2">Items</h3>
                                    <table className="w-full text-sm border border-gray-200">
                                        <thead className="bg-gray-50"><tr><th className="px-4 py-2 text-left border-b border-r">Item</th><th className="px-4 py-2 text-right border-b border-r">Qty</th><th className="px-4 py-2 text-right border-b border-r">Rate</th><th className="px-4 py-2 text-right border-b">Amount</th></tr></thead>
                                        <tbody>
                                            {viewingOrder.items.map(item => (
                                                <tr key={item.id} className="border-b"><td className="px-4 py-2 border-r">{item.itemName}</td><td className="px-4 py-2 text-right border-r">{item.quantity}</td><td className="px-4 py-2 text-right border-r">AED {item.rate.toLocaleString('en-AE')}</td><td className="px-4 py-2 text-right">AED {item.amount.toLocaleString('en-AE')}</td></tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        {viewingOrder.notes && <div><h4 className="font-semibold">Notes</h4><p className="text-gray-600 text-sm whitespace-pre-wrap">{viewingOrder.notes}</p></div>}
                                        {viewingOrder.termsAndConditions && <div><h4 className="font-semibold">Terms & Conditions</h4><p className="text-gray-600 text-sm whitespace-pre-wrap">{viewingOrder.termsAndConditions}</p></div>}
                                        {viewingOrder.attachments?.length > 0 && <div><h4 className="font-semibold">Attachments</h4><ul className="list-disc list-inside">{viewingOrder.attachments.map((att, i) => <li key={i}><a href={`${API_URL}/sales/attachments/${att}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{att.split('/').pop()}</a></li>)}</ul></div>}
                                    </div>
                                    <div className="space-y-2 text-sm border-l pl-6">
                                        <div className="flex justify-between"><span>Sub Total</span><span>AED {viewingOrder.subTotal.toLocaleString('en-AE')}</span></div>
                                        <div className="flex justify-between"><span>Discount</span><span>- AED {viewingOrder.totalDiscount.toLocaleString('en-AE')}</span></div>
                                        <div className="flex justify-between"><span>Tax</span><span>+ AED {viewingOrder.totalTax.toLocaleString('en-AE')}</span></div>
                                        <div className="flex justify-between"><span>Other Charges</span><span>+ AED {viewingOrder.otherCharges.toLocaleString('en-AE')}</span></div>
                                        <div className="flex justify-between font-bold text-base border-t mt-2 pt-2"><span>Net Total</span><span>AED {viewingOrder.netTotal.toLocaleString('en-AE')}</span></div>
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </main>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 p-6">
            <header className="mb-6">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Manage Sales Order</h1>
                        <p className="text-sm text-slate-500">View and manage your sales orders.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg" />
                        </div>
                        <button onClick={() => navigate('/sales/orders/new')} className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700">
                            <Plus className="mr-2 h-4 w-4" /> New Sales Order
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-grow overflow-auto bg-white rounded-lg border border-gray-200">
                {loading ? (
                    <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>
                ) : error ? (
                    <div className="text-center py-10 text-red-500">{error}</div>
                ) : orders.length > 0 ? (
                    <table className="w-full text-sm text-left border-collapse">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 ">
                            <tr>
                                <th className="px-6 py-3 border">S.No.</th>
                                <th className="px-6 py-3 border">Date</th>
                                <th className="px-6 py-3 border">Sales Order</th>
                                <th className="px-6 py-3 border">Reference#</th>
                                <th className="px-6 py-3 border">Customer Name</th>
                                <th className="px-6 py-3 border">Customer PO No.</th>
                                <th className="px-6 py-3 border">Status</th>
                                <th className="px-6 py-3 border">Sales Order Amount</th>
                                <th className="px-6 py-3 text-right border">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order, index) => (
                                <tr key={order.id} className="bg-white hover:bg-gray-50">
                                    <td className="px-6 py-4 border">{currentPage * pageSize + index + 1}</td>
                                    <td className="px-6 py-4 border">{new Date(order.salesOrderDate).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 border font-medium text-blue-600 hover:underline cursor-pointer" onClick={() => handleView(order.id)}>{order.salesOrderNumber}</td>
                                    <td className="px-6 py-4 border">{order.reference || '-'}</td>
                                    <td className="px-6 py-4 border">{order.customerName || 'N/A'}</td>
                                    <td className="px-6 py-4 border">{order.customerPoNo || '-'}</td>
                                    <td className="px-6 py-4 border"><span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>{order.status}</span></td>
                                    <td className="px-6 py-4 border">AED {order.netTotal.toLocaleString('en-AE')}</td>
                                    <td className="px-6 py-4 text-right border">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => handleView(order.id)} className="p-1 rounded-md hover:bg-gray-100 text-gray-600" title="View"><Eye size={16} /></button>
                                            <button onClick={() => navigate(`/sales/orders/edit/${order.id}`)} className="p-1 rounded-md hover:bg-gray-100 text-blue-600" title="Edit"><Edit size={16} /></button>
                                            <button onClick={() => handleDelete(order.id)} className="p-1 rounded-md hover:bg-gray-100 text-red-500" title="Delete"><Trash2 size={16} /></button>
                                            {/* Placeholder buttons for image actions */}
                                            <button className="p-1 rounded-md hover:bg-gray-100 text-green-600" title="Add DO"><Truck size={16} /></button>
                                            <button className="p-1 rounded-md hover:bg-gray-100 text-purple-600" title="Invoice"><FileText size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="text-center py-16"><h3 className="text-lg font-semibold">No Sales Orders Found</h3></div>
                )}
            </main>

            {!loading && totalPages > 1 && (
                <footer className="flex justify-between items-center pt-4 mt-4 border-t">
                    <span className="text-sm text-gray-600">Page {currentPage + 1} of {totalPages}</span>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={currentPage === 0} className="p-2 rounded-md border disabled:opacity-50"><ChevronLeft className="h-5 w-5" /></button>
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))} disabled={currentPage >= totalPages - 1} className="p-2 rounded-md border disabled:opacity-50"><ChevronRight className="h-5 w-5" /></button>
                    </div>
                </footer>
            )}

            <OrderViewModal />
        </div>
    );
};

export default Orders;
