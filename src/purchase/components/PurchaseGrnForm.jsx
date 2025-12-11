import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Loader, Save, ArrowLeft } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL || '';

const PurchaseGrnForm = () => {
  const { id: purchaseOrderId } = useParams(); // purchase order id
  const navigate = useNavigate();

  const [po, setPo] = useState(null);
  const [items, setItems] = useState([]); // augmented with pending/received fields
  const [grnNumber, setGrnNumber] = useState('');
  const [grnDate, setGrnDate] = useState(new Date().toISOString().split('T')[0]);
  const [remark, setRemark] = useState('');
  const [createdBy, setCreatedBy] = useState(localStorage.getItem('username') || '');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        const res = await axios.get(`${API_URL}/purchase/orders/${purchaseOrderId}`, { headers });
        setPo(res.data);

        // derive items array with pending
        const lines = (res.data.items || []).map(it => {
          // ensure receivedQuantity present on PO item (backend should supply)
          const received = Number(it.receivedQuantity ?? 0);
          const ordered = Number(it.quantity ?? 0);
          const pending = Math.max(0, ordered - received);
          return {
            purchaseOrderItemId: it.id,
            itemName: it.itemName ?? it.description ?? '',
            orderedQuantity: ordered,
            receivedQuantity: received, // current total received on PO item
            pendingQuantity: pending,
            receiveNow: pending > 0 ? pending : 0, // default pre-fill with full pending
            rate: it.rate ?? 0,
            unitId: it.unitId ?? null
          };
        });
        setItems(lines);
      } catch (err) {
        console.error('Failed to load PO for GRN', err);
        setError('Failed to load purchase order. Refresh and try again.');
      } finally {
        setLoading(false);
      }
    };
    if (purchaseOrderId) load();
  }, [purchaseOrderId]);

  const updateReceiveNow = (idx, value) => {
    setItems(prev => {
      const arr = [...prev];
      let v = Number(value || 0);
      if (v < 0) v = 0;
      if (v > arr[idx].pendingQuantity) v = arr[idx].pendingQuantity;
      arr[idx] = { ...arr[idx], receiveNow: v };
      return arr;
    });
  };

  const validate = () => {
    if (!purchaseOrderId) return 'Invalid purchase order.';
    if (!grnDate) return 'GRN date required.';
    // at least one line > 0
    const any = items.some(i => Number(i.receiveNow) > 0);
    if (!any) return 'Enter at least one received quantity.';
    // check per-line not exceeding pending (should be enforced in updateReceiveNow too)
    for (const it of items) {
      if (Number(it.receiveNow) > Number(it.pendingQuantity)) return `Received quantity for ${it.itemName} exceeds pending.`;
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const v = validate();
    if (v) { setError(v); return; }

    const payload = {
      purchaseOrderId: Number(purchaseOrderId),
      grnNumber: grnNumber || null,
      grnDate,
      remark: remark || null,
      createdBy: createdBy || null,
      items: items
        .filter(i => Number(i.receiveNow) > 0)
        .map(i => ({
          purchaseOrderItemId: i.purchaseOrderItemId,
          receivedQuantity: Number(i.receiveNow),
          rate: Number(i.rate) || 0,
          unitId: i.unitId || null
        }))
    };

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      await axios.post(`${API_URL}/purchase/grns`, payload, { headers });
      // navigate back to PO view and optionally refresh
      navigate(`/purchase-dashboard/purchase-orders/view/${purchaseOrderId}`);
    } catch (err) {
      console.error('Failed to save GRN', err);
      setError(err?.response?.data?.message || 'Failed to save GRN.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><Loader className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!po) return <div className="p-6">{error ? <div className="text-red-600">{error}</div> : <div>Purchase order not found.</div>}</div>;

  return (
    <div className="bg-card p-6 rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Add GRN for PO {po.poNumber || `#${po.id}`}</h1>
        <Link to={`/purchase-dashboard/purchase-orders/view/${purchaseOrderId}`} className="btn-secondary flex items-center gap-2"><ArrowLeft size={16} /> Back</Link>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground-muted">GRN Number (optional)</label>
            <input className="input mt-1" value={grnNumber} onChange={(e) => setGrnNumber(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground-muted">GRN Date</label>
            <input type="date" className="input mt-1" value={grnDate} onChange={(e) => setGrnDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground-muted">Created By</label>
            <input className="input mt-1" value={createdBy} onChange={(e) => setCreatedBy(e.target.value)} />
          </div>
        </div>

        <div className="p-4 border rounded">
          <h3 className="font-semibold mb-3">Items to Receive</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-background-muted">
                <tr>
                  <th className="th-cell">Item</th>
                  <th className="th-cell">Ordered</th>
                  <th className="th-cell">Already Received</th>
                  <th className="th-cell">Pending</th>
                  <th className="th-cell">Receive Now</th>
                  <th className="th-cell">Rate</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, idx) => (
                  <tr key={it.purchaseOrderItemId} className="border-b">
                    <td className="td-cell">{it.itemName}</td>
                    <td className="td-cell">{it.orderedQuantity}</td>
                    <td className="td-cell">{it.receivedQuantity}</td>
                    <td className="td-cell">{it.pendingQuantity}</td>
                    <td className="td-cell">
                      <input
                        type="number"
                        min="0"
                        step="0.0001"
                        value={it.receiveNow}
                        onChange={(e) => updateReceiveNow(idx, e.target.value)}
                        className="input text-right"
                        style={{ width: '120px' }}
                      />
                    </td>
                    <td className="td-cell">
                      <input type="number" step="0.0001" value={it.rate} onChange={(e) => {
                        const v = e.target.value;
                        setItems(prev => {
                          const a = [...prev]; a[idx] = { ...a[idx], rate: v }; return a;
                        });
                      }} className="input text-right" style={{ width: '120px' }} />
                    </td>
                  </tr>
                ))}
                {items.length === 0 && <tr><td colSpan="6" className="text-center py-6 text-foreground-muted">No items to receive</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground-muted">Remark</label>
          <textarea value={remark} onChange={(e) => setRemark(e.target.value)} rows={3} className="input mt-1" />
        </div>

        <div className="flex justify-end gap-4">
          <button type="button" onClick={() => navigate(`/purchase-dashboard/purchase-orders/view/${purchaseOrderId}`)} className="btn-secondary">Cancel</button>
          <button type="submit" className="btn-primary flex items-center gap-2" disabled={submitting}>
            {submitting ? <Loader className="h-4 w-4 animate-spin" /> : <Save size={16} />} Save GRN
          </button>
        </div>
      </form>
    </div>
  );
};

export default PurchaseGrnForm;
