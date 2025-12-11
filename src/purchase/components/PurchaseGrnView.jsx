import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Loader, ArrowLeft, Printer } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL || ''; // e.g., http://localhost:8080

const PurchaseGrnView = () => {
  const { id } = useParams(); // grn id
  const navigate = useNavigate();
  const [grn, setGrn] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        const res = await axios.get(`${API_URL}/purchase/grns/${id}`, { headers });
        setGrn(res.data);
      } catch (err) {
        console.error('Failed to load GRN', err);
        alert('Failed to load GRN.');
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  const openPrint = () => {
    const html = `
      <html><head><title>GRN ${grn?.grnNumber || ''}</title>
      <style>body{font-family:Arial;padding:20px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px}</style>
      </head><body>
      <h2>GRN: ${grn?.grnNumber || `#${grn?.id}`}</h2>
      <div><strong>Date:</strong> ${grn?.grnDate ? new Date(grn.grnDate).toLocaleDateString() : ''}</div>
      <div><strong>PO ID:</strong> ${grn?.purchaseOrderId || ''}</div>
      <table><thead><tr><th>#</th><th>Item</th><th>Received</th><th>Rate</th></tr></thead><tbody>
      ${(grn?.items || []).map((it, i) => `<tr><td>${i + 1}</td><td>${it.itemName || ''}</td><td>${it.receivedQuantity}</td><td>${(it.rate ?? 0).toFixed(2)}</td></tr>`).join('')}
      </tbody></table>
      ${grn?.remark ? `<div style="margin-top: 1rem;"><strong>Remark:</strong><p>${grn.remark}</p></div>` : ''}
      </body></html>
    `;
    const w = window.open('', '_blank');
    w.document.write(html); w.document.close();
    setTimeout(() => w.print(), 300);
  };

  if (loading) return <div className="flex justify-center items-center h-64"><Loader className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!grn) return <div className="p-6">No GRN found.</div>;

  return (
    <div className="p-6 bg-card rounded shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <button className="btn-secondary" onClick={() => navigate(-1)}><ArrowLeft size={16} /></button>
          <h3 className="text-xl font-semibold">GRN {grn.grnNumber || `#${grn.id}`}</h3>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary flex items-center gap-2" onClick={openPrint}><Printer size={16} /> Print</button>
        </div>
      </div>

      <div className="p-4 bg-white border rounded">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div><strong>Date:</strong> {grn.grnDate ? new Date(grn.grnDate).toLocaleDateString() : ''}</div>
          <div><strong>PO ID:</strong>
            <Link to={`/purchase-dashboard/purchase-orders/view/${grn.purchaseOrderId}`} className="text-primary underline ml-2">
              {grn.purchaseOrderId}
            </Link>
          </div>
        </div>

        <table className="min-w-full mt-4">
          <thead className="bg-background-muted"><tr><th className="th-cell">#</th><th className="th-cell">Item</th><th className="th-cell">Received</th><th className="th-cell">Rate</th></tr></thead>
          <tbody>
            {(grn.items || []).map((it, i) => (
              <tr key={it.id} className="border-b"><td className="td-cell">{i+1}</td><td className="td-cell">{it.itemName}</td><td className="td-cell">{it.receivedQuantity}</td><td className="td-cell">{(it.rate ?? 0).toFixed(2)}</td></tr>
            ))}
          </tbody>
        </table>

        {grn.remark && <div className="mt-4"><strong>Remark:</strong><div>{grn.remark}</div></div>}
      </div>
    </div>
  );
};

export default PurchaseGrnView;
