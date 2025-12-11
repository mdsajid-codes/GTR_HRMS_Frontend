import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Loader, Printer, Mail, MoreHorizontal, ArrowLeft, Paperclip, FileText } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const PurchasePaymentView = () => {
  const { id } = useParams();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const fetchPayment = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/purchases/payments/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPayment(res.data);
      } catch (err) {
        console.error('Failed to fetch payment', err);
        setError('Failed to load payment details.');
      } finally {
        setLoading(false);
      }
    };
    fetchPayment();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><Loader className="h-10 w-10 animate-spin text-primary" /></div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!payment) return null;

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen print:bg-white print:p-0">
      {/* Top Bar - Hidden in Print */}
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 print:hidden">
        <div className="flex items-center gap-3">
          <Link to="/purchase-dashboard/payments" className="btn-secondary p-2 rounded-full hover:bg-gray-200">
             <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
               Payment Receipt
               <span className="text-sm font-normal text-gray-500 px-2 py-0.5 bg-gray-200 rounded-full">#{payment.id}</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
              <button onClick={() => setShowMenu(!showMenu)} className="btn-secondary flex items-center gap-2">
                 <MoreHorizontal size={18} /> More
              </button>
              {showMenu && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white shadow-lg rounded-md border py-1 z-20">
                      <button className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"><Mail size={16}/> Email</button>
                  </div>
              )}
          </div>
          <button onClick={handlePrint} className="btn-secondary flex items-center gap-2">
            <Printer size={18} /> Print
          </button>
          <Link to={`/purchase-dashboard/payments/edit/${payment.id}`} className="btn-primary">
            Edit
          </Link>
        </div>
      </div>

      {/* Paper Layout */}
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg border overflow-hidden print:shadow-none print:border-none print:max-w-none print:w-full">
         {/* Green Header Strip */}
         <div className="h-2 bg-green-600 w-full print:bg-green-600"></div>
         
         <div className="p-8 md:p-12 print:p-8">
            
            {/* Payment Header */}
            <div className="flex justify-between items-start mb-12">
               <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-1">{payment.supplierName}</h2>
                  {/* Address could go here if available in DTO join */}
                  <div className="text-sm text-gray-500">Abu Dhabi, UAE</div>
               </div>
               <div className="text-right">
                   <h3 className="text-lg font-semibold text-gray-900 uppercase tracking-wider mb-2">Payment Made</h3>
                   <div className="bg-green-50 text-green-700 px-6 py-3 rounded-lg border border-green-100 inline-block text-center min-w-[200px] print:border-none print:bg-transparent print:p-0 print:text-right">
                      <div className="text-xs uppercase font-semibold opacity-75">Amount Paid</div>
                      <div className="text-2xl font-bold">AED {(payment.amountPaid || payment.amount || 0).toFixed(2)}</div>
                   </div>
               </div>
            </div>

            {/* Payment Meta */}
            <div className="grid grid-cols-2 gap-8 mb-12 border-t border-b py-6 border-slate-100">
               <div className="space-y-3">
                  <div className="flex justify-between border-b pb-1 border-dotted border-gray-200">
                      <span className="text-gray-500 text-sm">Payment Date</span>
                      <span className="font-medium">{new Date(payment.paymentDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1 border-dotted border-gray-200">
                      <span className="text-gray-500 text-sm">Reference Number</span>
                      <span className="font-medium">{payment.reference || '—'}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1 border-dotted border-gray-200">
                      <span className="text-gray-500 text-sm">Payment Mode</span>
                      <span className="font-medium">{payment.paymentMode || '—'}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1 border-dotted border-gray-200">
                      <span className="text-gray-500 text-sm">Paid Through</span>
                      <span className="font-medium">{payment.paidThrough || '—'}</span>
                  </div>
               </div>
               
               {/* Right Side Meta (if any, e.g. Created By) */}
               <div className="space-y-3">
                   {payment.chequeNumber && (
                       <div className="flex justify-between border-b pb-1 border-dotted border-gray-200">
                          <span className="text-gray-500 text-sm">Cheque Number</span>
                          <span className="font-medium">{payment.chequeNumber}</span>
                       </div>
                   )}
                   <div className="flex justify-between border-b pb-1 border-dotted border-gray-200">
                        <span className="text-gray-500 text-sm">Created By</span>
                        <span className="font-medium">{payment.createdBy}</span>
                   </div>
               </div>
            </div>

            {/* Allocations Table */}
            <div className="mb-12">
               <h4 className="font-semibold text-gray-700 mb-4 border-l-4 border-green-500 pl-3">Payment For</h4>
               <table className="w-full text-sm border-collapse">
                  <thead>
                     <tr className="bg-gray-50 text-gray-600 border-b">
                        <th className="py-3 px-4 text-left font-medium">Bill Number</th>
                        <th className="py-3 px-4 text-right font-medium">Amount</th>
                     </tr>
                  </thead>
                  <tbody>
                     {payment.allocations && payment.allocations.length > 0 ? (
                        payment.allocations.map((alloc, idx) => (
                           <tr key={idx} className="border-b text-gray-800">
                              <td className="py-3 px-4 font-medium">
                                 {alloc.invoiceNumber || `Invoice #${alloc.invoiceId}`}
                                 <div className="text-xs text-blue-600 cursor-pointer hover:underline print:hidden">
                                     <Link to={`/purchase-dashboard/invoices/view/${alloc.invoiceId}`}>View Bill</Link>
                                 </div>
                              </td>
                              <td className="py-3 px-4 text-right">{(alloc.allocatedAmount || 0).toFixed(2)}</td>
                           </tr>
                        ))
                     ) : (
                        <tr>
                            <td colSpan="2" className="py-4 text-center text-gray-400 italic">No specific bills allocated (Advance Payment)</td>
                        </tr>
                     )}
                     
                     {/* Excess Row if Applicable */}
                     {payment.amountInExcess > 0 && (
                         <tr className="border-b bg-green-50/50 text-green-800 print:bg-transparent print:text-black">
                             <td className="py-3 px-4 font-medium italic">Amount in Excess (Unallocated)</td>
                             <td className="py-3 px-4 text-right font-bold">{payment.amountInExcess.toFixed(2)}</td>
                         </tr>
                     )}
                  </tbody>
               </table>
            </div>

            {/* Attachments - Hidden in Print */}
            {payment.attachments && payment.attachments.length > 0 && (
                <div className="mb-8 mt-12 bg-slate-50 p-4 rounded border border-dashed border-gray-300 print:hidden">
                    <h5 className="flex items-center gap-2 text-sm font-semibold text-gray-600 mb-3"><Paperclip size={16}/> Attachments</h5>
                    <div className="flex flex-wrap gap-2">
                        {payment.attachments.map(att => (
                            <a key={att.id} href={att.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-2 bg-white border rounded text-xs hover:bg-blue-50 hover:border-blue-300 text-blue-600 transition-colors">
                                <FileText size={14} />
                                <span className="truncate max-w-[150px]">{att.fileName}</span>
                            </a>
                        ))}
                    </div>
                </div>
            )}
            
            {/* Notes */}
            {payment.notes && (
                <div className="mb-4 text-sm text-gray-600 italic">
                    <span className="font-semibold not-italic">Notes:</span> {payment.notes}
                </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default PurchasePaymentView;
