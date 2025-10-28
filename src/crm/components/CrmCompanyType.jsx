import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { Edit, Trash2, PlusCircle, Loader, Search, X, AlertCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

// ---------- Reusable Modal ----------
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-card text-card-foreground rounded-lg shadow-xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-border flex justify-between items-center">
          <h3 className="text-xl font-semibold text-foreground">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-foreground-muted hover:bg-background-muted"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

// ---------- Form ----------
const CompanyTypeForm = ({ item, onSave, onCancel, loading }) => {
  const [name, setName] = useState('');

  useEffect(() => {
    setName(item?.name ?? '');
  }, [item]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Pass id if editing so backend can map it
    onSave({ id: item?.id, name: name.trim() });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-foreground-muted">
          Company Type Name
        </label>
        <input
          id="name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="input mt-1 bg-background-muted border-border text-foreground"
          placeholder="e.g., Corporation, LLC, Partnership"
        />
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <button type="button" onClick={onCancel} className="btn-secondary" disabled={loading}>
          Cancel
        </button>
        <button type="submit" className="btn-primary flex items-center" disabled={loading}>
          {loading && <Loader className="animate-spin h-4 w-4 mr-2" />}
          Save
        </button>
      </div>
    </form>
  );
};

// ---------- Main Component ----------
const CrmCompanyType = () => {
  const [companyTypes, setCompanyTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // If your token can change during the session, prefer a function that reads it fresh each call.
  const authHeaders = useMemo(
    () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` }),
    []
  );

  const fetchCompanyTypes = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_URL}/crm/company-types`, { headers: authHeaders });
      setCompanyTypes(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to fetch company types.');
    } finally {
      setLoading(false);
    }
  }, [authHeaders]);

  useEffect(() => {
    fetchCompanyTypes();
  }, [fetchCompanyTypes]);

  const handleAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSave = async (itemData) => {
    setModalLoading(true);

    const isUpdating = Boolean(itemData.id);
    const url = isUpdating
      ? `${API_URL}/crm/company-types/${itemData.id}`
      : `${API_URL}/crm/company-types`;
    const method = isUpdating ? 'put' : 'post';

    try {
      // IMPORTANT: actually call axios
      await axios[method](url, itemData, { headers: authHeaders });

      // refresh and close
      await fetchCompanyTypes();
      handleCloseModal();
    } catch (err) {
      console.error(err);
      alert(`Error: ${err.response?.data?.message || 'Failed to save company type.'}`);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!id) {
      alert('Missing id for company type.');
      return;
    }
    if (window.confirm('Are you sure you want to delete this company type?')) {
      try {
        await axios.delete(`${API_URL}/crm/company-types/${id}`, { headers: authHeaders });
        await fetchCompanyTypes();
      } catch (err) {
        console.error(err);
        alert(`Error: ${err.response?.data?.message || 'Failed to delete company type.'}`);
      }
    }
  };

  const filteredData = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return companyTypes;
    return companyTypes.filter((item) => String(item?.name ?? '').toLowerCase().includes(q));
  }, [companyTypes, searchTerm]);

  return (
    <div className="p-6 bg-card rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-foreground">Manage Company Types</h3>
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
            <PlusCircle size={16} /> Add Type
          </button>
        </div>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="overflow-x-auto border border-border rounded-lg">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-background-muted">
            <tr>
              <th className="th-cell w-16">#</th>
              <th className="th-cell">Name</th>
              <th className="th-cell w-32">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-border text-foreground-muted">
            {loading ? (
              <tr>
                <td colSpan={3} className="text-center py-10">
                  <Loader className="animate-spin h-8 w-8 text-primary mx-auto" />
                </td>
              </tr>
            ) : filteredData.length > 0 ? (
              filteredData.map((item, index) => (
                <tr key={item.id ?? index}>
                  <td className="td-cell">{index + 1}</td>
                  <td className="td-cell font-medium text-foreground">{String(item?.name ?? '')}</td>
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
                <td colSpan={3} className="text-center py-10">
                  <AlertCircle className="mx-auto h-12 w-12 text-foreground-muted/50" />
                  <h3 className="mt-2 text-sm font-medium text-foreground">No company types found</h3>
                  <p className="mt-1 text-sm">Get started by adding a new company type.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingItem ? 'Edit Company Type' : 'Add Company Type'}
      >
        <CompanyTypeForm
          item={editingItem}
          onSave={handleSave}
          onCancel={handleCloseModal}
          loading={modalLoading}
        />
      </Modal>
    </div>
  );
};

export default CrmCompanyType;
