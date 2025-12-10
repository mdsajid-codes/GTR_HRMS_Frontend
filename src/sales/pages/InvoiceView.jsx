import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Printer, Loader2, FileText } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const InvoiceView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchInvoice = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${API_URL}/sales/sales-invoices/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setInvoice(response.data);
            } catch (err) {
                console.error("Error fetching invoice", err);
                setError("Failed to load invoice details");
            } finally {
                setLoading(false);
            }
        };
        fetchInvoice();
    }, [id]);

    const handlePrint = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/sales/sales-invoices/pdf/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `sales_invoice_${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error("Error downloading PDF", err);
            alert("Failed to download PDF");
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin text-primary" /></div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
    if (!invoice) return <div className="p-8 text-center">Invoice not found</div>;

    return (
        <div className="flex flex-col h-screen bg-slate-50">
            <header className="bg-primary text-white shadow-sm p-4 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/sales/invoices')} className="text-gray-300 hover:text-white"><ArrowLeft /></button>
                    <h1 className="text-xl font-bold">Sales Invoice {invoice.invoiceNumber}</h1>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(`/sales/invoices/edit/${id}`)} className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-700 font-medium text-sm">Edit</button>
                    <button onClick={handlePrint} className="px-4 py-2 bg-white text-primary rounded hover:bg-gray-100 flex items-center gap-2 font-bold text-sm shadow-sm">
                        <Printer size={16} /> Print PDF
                    </button>
                </div>
            </header>

            <main className="flex-grow overflow-y-auto p-6">
                <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
                    {/* Invoice Header */}
                    <div className="p-8 border-b border-gray-200 bg-gray-50 flex justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">INVOICE</h2>
                            <p className="text-sm text-gray-500 mt-1">#{invoice.invoiceNumber}</p>
                            <div className="mt-4">
                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wide bg-primary bg-opacity-10 text-primary`}>
                                    {invoice.status}
                                </span>
                            </div>
                        </div>
                        <div className="text-right">
                            <h3 className="text-lg font-bold text-gray-700">Balance Due</h3>
                            <p className="text-3xl font-bold text-gray-800">AED {invoice.balanceDue?.toFixed(2)}</p>
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="p-8 grid grid-cols-2 gap-12">
                        <div>
                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Bill To</h4>
                            <p className="text-lg font-semibold text-gray-800">{invoice.customerName}</p>
                            {/* Address would ideally come from invoice.billingAddress if it was stored or fetched separately, currently using formatted if available or simplied */}
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-gray-500">Invoice Date</p>
                                <p className="font-semibold">{invoice.invoiceDate}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Due Date</p>
                                <p className="font-semibold">{invoice.dueDate}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Reference#</p>
                                <p className="font-semibold">{invoice.reference || '-'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Order#</p>
                                <p className="font-semibold">{invoice.orderNumber || '-'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Salesperson</p>
                                <p className="font-semibold">{invoice.salespersonName || '-'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="px-8 pb-8">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-100 text-gray-700 border-b border-gray-200">
                                    <th className="py-3 px-4 text-left font-bold rounded-tl-lg">Item</th>
                                    <th className="py-3 px-4 text-left font-bold">Qty</th>
                                    <th className="py-3 px-4 text-right font-bold transition-colors">Rate</th>
                                    <th className="py-3 px-4 text-right font-bold transition-colors">Tax</th>
                                    <th className="py-3 px-4 text-right font-bold transition-colors rounded-tr-lg">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {invoice.items?.map((item, index) => (
                                    <tr key={index}>
                                        <td className="py-3 px-4">
                                            <p className="font-semibold text-gray-800">{item.itemName}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                                        </td>
                                        <td className="py-3 px-4">{item.invoiceQuantity}</td>
                                        <td className="py-3 px-4 text-right">{item.rate?.toFixed(2)}</td>
                                        <td className="py-3 px-4 text-right">{item.taxValue?.toFixed(2)} ({item.taxPercentage || 0}%)</td>
                                        <td className="py-3 px-4 text-right font-medium">{item.amount?.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Totals */}
                    <div className="px-8 pb-8 flex justify-end">
                        <div className="w-1/2 space-y-3">
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Sub Total</span>
                                <span>AED {invoice.subTotal?.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Total Discount</span>
                                <span>(-) AED {invoice.totalDiscount?.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Gross Total</span>
                                <span>AED {invoice.grossTotal?.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Total Tax</span>
                                <span>(+) AED {invoice.totalTax?.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Other Charges</span>
                                <span>(+) AED {invoice.otherCharges?.toFixed(2)}</span>
                            </div>
                            <div className="border-t pt-3 flex justify-between font-bold text-lg text-gray-800">
                                <span>Total</span>
                                <span>AED {invoice.netTotal?.toFixed(2)}</span>
                            </div>
                            <div className="border-t pt-3 flex justify-between font-semibold text-gray-700">
                                <span>Amount Received</span>
                                <span>(-) AED {invoice.amountReceived?.toFixed(2)}</span>
                            </div>
                            <div className="bg-gray-100 p-2 rounded flex justify-between font-bold text-red-600">
                                <span>Balance Due</span>
                                <span>AED {invoice.balanceDue?.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer Notes */}
                    {(invoice.notes || invoice.termsAndConditions) && (
                        <div className="bg-gray-50 p-8 border-t border-gray-200">
                            {invoice.notes && (
                                <div className="mb-4">
                                    <h5 className="font-bold text-xs text-gray-500 uppercase mb-1">Notes</h5>
                                    <p className="text-sm text-gray-600">{invoice.notes}</p>
                                </div>
                            )}
                            {invoice.termsAndConditions && (
                                <div>
                                    <h5 className="font-bold text-xs text-gray-500 uppercase mb-1">Terms & Conditions</h5>
                                    <p className="text-sm text-gray-600">{invoice.termsAndConditions}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default InvoiceView;
