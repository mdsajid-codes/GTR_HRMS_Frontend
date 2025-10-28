import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { Edit, Trash2, PlusCircle, Loader, Search, AlertCircle } from 'lucide-react';
import KpiFormPage from './KpiFormPage';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const KpiList = () => {
  const [kpis, setKpis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState('list');
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // If your token rotates, prefer a function that reads localStorage each call.
  const authHeaders = useMemo(
    () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` }),
    []
  );

  const fetchKpis = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_URL}/crm/kpis`, { headers: authHeaders });
      setKpis(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to fetch KPIs.');
    } finally {
      setLoading(false);
    }
  }, [authHeaders]);

  useEffect(() => {
    fetchKpis();
  }, [fetchKpis]);

  const handleAdd = () => { setEditingItem(null); setView('form'); };
  const handleEdit = (item) => { setEditingItem(item); setView('form'); };
  const handleCancelForm = () => { setView('list'); setEditingItem(null); };

  const handleSave = async (itemData) => {
    const isUpdating = Boolean(editingItem?.id);
    const url = isUpdating
      ? `${API_URL}/crm/kpis/${editingItem.id}`
      : `${API_URL}/crm/kpis`;
    const method = isUpdating ? 'put' : 'post';

    try {
      await axios[method](url, itemData, { headers: authHeaders });
      await fetchKpis();
      handleCancelForm();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || err.message || 'Failed to save KPI.';
      alert(`Error: ${msg}`);
    }
  };

  const handleDelete = async (id) => {
    if (!id) {
      alert('Missing KPI id.');
      return;
    }
    if (window.confirm('Are you sure you want to delete this KPI and all its assignments?')) {
      try {
        await axios.delete(`${API_URL}/crm/kpis/${id}`, { headers: authHeaders });
        await fetchKpis();
      } catch (err) {
        console.error(err);
        const msg = err.response?.data?.message || err.message || 'Failed to delete KPI.';
        alert(`Error: ${msg}`);
      }
    }
  };

  const filteredData = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return kpis;
    return kpis.filter((item) => String(item?.name ?? '').toLowerCase().includes(q));
  }, [kpis, searchTerm]);

  if (view === 'form') {
    return <KpiFormPage item={editingItem} onSave={handleSave} onCancel={handleCancelForm} />;
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-foreground">Manage KPIs</h3>
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input w-full sm:w-64 pr-10 bg-background-muted border-border"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-muted" />
          </div>
          <button onClick={handleAdd} className="flex items-center gap-2 btn-secondary">
            <PlusCircle size={16} /> Add KPI
          </button>
        </div>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="overflow-x-auto border border-border rounded-lg">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-background-muted">
            <tr>
              <th className="th-cell">KPI Name</th>
              <th className="th-cell">Type</th>
              <th className="th-cell">Data Type</th>
              <th className="th-cell">Assigned Employees</th>
              <th className="th-cell w-32">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-border text-foreground-muted">
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-10">
                  <Loader className="animate-spin h-8 w-8 text-primary mx-auto" />
                </td>
              </tr>
            ) : filteredData.length > 0 ? (
              filteredData.map((item) => (
                <tr key={item.id}>
                  <td className="td-cell font-medium text-foreground">{String(item?.name ?? '')}</td>
                  <td className="td-cell">{String(item?.type ?? '')}</td>
                  <td className="td-cell">{String(item?.dataType ?? '')}</td>
                  <td className="td-cell max-w-xs truncate" title={Array.isArray(item?.assignedEmployees) && item.assignedEmployees.length > 0 ? item.assignedEmployees.map(e => e.employeeName).join(', ') : 'None'}>
                    {Array.isArray(item?.assignedEmployees) && item.assignedEmployees.length > 0 ? 
                      item.assignedEmployees.map(e => e.employeeName).join(', ')
                      : <span className="text-foreground-muted/70">None</span>
                    }
                  </td>
                  <td className="td-cell">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-primary hover:text-primary/80"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-500 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-10">
                  <AlertCircle className="mx-auto h-12 w-12 text-foreground-muted/50" />
                  <h3 className="mt-2 text-sm font-medium text-foreground">No KPIs found</h3>
                  <p className="mt-1 text-sm">Get started by adding a new KPI.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default KpiList;
