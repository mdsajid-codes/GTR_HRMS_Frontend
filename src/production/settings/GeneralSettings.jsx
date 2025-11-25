// GeneralSettings.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { Layers, DollarSign, Edit, Trash2, PlusCircle, Loader, Search, AlertCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const InventoryTypesTab = ({ locationId }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', locationId: '' });
  const [locations, setLocations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const authHeaders = useMemo(() => ({ "Authorization": `Bearer ${localStorage.getItem('token')}` }), []);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [itemsRes, locationsRes] = await Promise.all([
        axios.get(`${API_URL}/production/inventory-types`, { headers: authHeaders }),
        axios.get(`${API_URL}/locations`, { headers: authHeaders }),
      ]);

      setData(Array.isArray(itemsRes.data) ? itemsRes.data : []);
      setLocations(Array.isArray(locationsRes.data) ? locationsRes.data : []);
    } catch (err) {
      console.error(`Error fetching data for inventory types:`, err);
      alert(`Error fetching data for inventory types: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  }, [authHeaders]);

  const filteredAndSearchedData = useMemo(() => {
    let filtered = data;
    if (locationId === 'none') {
      filtered = data.filter(item => !item.locationId);
    } else if (locationId && locationId !== 'all') {
      filtered = data.filter(item => String(item.locationId) === String(locationId));
    }
    if (!searchTerm) return filtered;
    const lowercasedFilter = searchTerm.toLowerCase();
    return filtered.filter(item =>
      (item.name && item.name.toLowerCase().includes(lowercasedFilter)) ||
      (item.description && item.description.toLowerCase().includes(lowercasedFilter))
    );
  }, [data, searchTerm, locationId]);
  
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  useEffect(() => {
    if (editingItem) {
      setFormData({
        name: editingItem.name || '',
        description: editingItem.description || '',
        locationId: editingItem.locationId || (locationId !== 'all' ? locationId : '')
      });
    }
  }, [editingItem, locationId]);

  const handleAdd = () => {
    setEditingItem({});
    setShowForm(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingItem(null);
    setFormData({ name: '', description: '', locationId: '' });
  };

  const handleSave = async (itemData) => {
    setFormLoading(true);
    const payload = { ...itemData, locationId: itemData.locationId || null };
    const isUpdating = Boolean(itemData.id);
    const url = isUpdating ? `${API_URL}/production/inventory-types/${itemData.id}` : `${API_URL}/production/inventory-types`;
    const method = isUpdating ? 'put' : 'post';

    try {
      await axiosmethod;
      fetchAllData();
      handleCancel();
    } catch (err) {
      alert(`Error saving Inventory Type: ${err.response?.data?.message || err.message}`);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this inventory type?')) {
      try {
        await axios.delete(`${API_URL}/production/inventory-types/${id}`, { headers: authHeaders });
        await fetchAllData();
      } catch (err) {
        alert(`Error deleting inventory type: ${err.response?.data?.message || err.message}`);
      }
    }
  };

  const handleSubmit = (e) => { e.preventDefault(); handleSave({ id: editingItem?.id, ...formData }); };

  if (loading)
    return (
      <div className="flex justify-center items-center p-8">
        <Loader className="animate-spin h-8 w-8 text-primary" />
      </div>
    );

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-foreground">Manage Inventory Types</h3>
        <div className="flex items-center gap-2">
          <div className="relative"><input type="text" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="input w-full sm:w-64 pr-10 bg-background-muted border-border" /><Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-muted" /></div>
          <button onClick={handleAdd} className="flex items-center gap-2 btn-secondary"><PlusCircle size={16} /> Add Type
          </button>
        </div>
      </div>
      {showForm && (
        <div className="bg-card p-4 rounded-lg border border-border mb-4">
          <h4 className="text-md font-semibold mb-3">{editingItem?.id ? 'Edit Inventory Type' : 'Add New Inventory Type'}</h4>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
            <div className="col-span-1"><label htmlFor="name" className="label">Type Name</label><input id="name" name="name" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} required className="input" placeholder="e.g., Raw Materials" /></div>
            <div className="col-span-1"><label htmlFor="description" className="label">Description</label><input id="description" name="description" value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} className="input" placeholder="Brief description" /></div>
            <div className="col-span-1">
              <label htmlFor="locationId" className="label">Location (Optional)</label>
              <select id="locationId" name="locationId" value={formData.locationId} onChange={(e) => setFormData(prev => ({ ...prev, locationId: e.target.value }))} className="input">
                <option value="">All Locations</option>
                {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
              </select>
            </div>
            <div className="flex justify-end gap-2 col-span-1">
              <button type="button" onClick={handleCancel} className="btn-secondary" disabled={formLoading}>Cancel</button>
              <button type="submit" className="btn-primary flex items-center" disabled={formLoading}>{formLoading && <Loader className="animate-spin h-4 w-4 mr-2" />} Save</button>
            </div>
          </form>
        </div>
      )}
      <div className="overflow-x-auto border border-border rounded-lg">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-background-muted">
            <tr><th className="th-cell">Name</th><th className="th-cell">Description</th><th className="th-cell">Location</th><th className="th-cell w-32">Actions</th></tr>
          </thead>
          <tbody className="bg-card divide-y divide-border text-foreground-muted">
            {loading ? (
              <tr><td colSpan="4" className="text-center py-10"><Loader className="animate-spin h-8 w-8 text-primary mx-auto" /></td></tr>
            ) : filteredAndSearchedData.length > 0 ? (
              filteredAndSearchedData.map(item => (
                <tr key={item.id}>
                  <td className="td-cell font-medium text-foreground">{item.name}</td>
                  <td className="td-cell">{item.description}</td>
                  <td className="td-cell">{item.locationName || 'All'}</td>
                  <td className="td-cell">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEdit(item)} className="text-primary hover:text-primary/80" title="Edit"><Edit size={16} /></button>
                      <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-600" title="Delete"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="4" className="text-center py-10"><AlertCircle className="mx-auto h-12 w-12 text-foreground-muted/50" /><h3 className="mt-2 text-sm font-medium text-foreground">No Inventory Types Found</h3><p className="mt-1 text-sm">Get started by adding a new type.</p></td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const PriceCategoriesTab = ({ locationId }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', locationId: '' });
  const [locations, setLocations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const authHeaders = useMemo(() => ({ "Authorization": `Bearer ${localStorage.getItem('token')}` }), []);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [itemsRes, locationsRes] = await Promise.all([
        axios.get(`${API_URL}/production/price-categories`, { headers: authHeaders }),
        axios.get(`${API_URL}/locations`, { headers: authHeaders }),
      ]);
      setData(Array.isArray(itemsRes.data) ? itemsRes.data : []);
      setLocations(Array.isArray(locationsRes.data) ? locationsRes.data : []);
    } catch (err) {
      console.error(`Error fetching data for price categories:`, err);
      alert(`Error fetching data for price categories: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  }, [authHeaders]);

  useEffect(() => { fetchAllData(); }, [fetchAllData]);

  useEffect(() => {
    if (editingItem) {
      setFormData({
        name: editingItem.name || '',
        description: editingItem.description || '',
        locationId: editingItem.locationId || (locationId !== 'all' ? locationId : '')
      });
    }
  }, [editingItem, locationId]);

  const handleAdd = () => { setEditingItem({}); setShowForm(true); };
  const handleEdit = (item) => { setEditingItem(item); setShowForm(true); };
  const handleCancel = () => { setShowForm(false); setEditingItem(null); setFormData({ name: '', description: '', locationId: '' }); };

  const handleSave = async (itemData) => {
    setFormLoading(true);
    const payload = { ...itemData, locationId: itemData.locationId || null };
    const isUpdating = Boolean(itemData.id);
    const url = isUpdating ? `${API_URL}/production/price-categories/${itemData.id}` : `${API_URL}/production/price-categories`;
    const method = isUpdating ? 'put' : 'post';
    try {
      await axiosmethod;
      await fetchAllData();
      handleCancel();
    } catch (err) {
      alert(`Error saving Price Category: ${err.response?.data?.message || err.message}`);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this price category?')) {
      try {
        await axios.delete(`${API_URL}/production/price-categories/${id}`, { headers: authHeaders });
        await fetchAllData();
      } catch (err) {
        alert(`Error deleting price category: ${err.response?.data?.message || err.message}`);
      }
    }
  };

  const handleSubmit = (e) => { e.preventDefault(); handleSave({ id: editingItem?.id, ...formData }); };

  const filteredData = useMemo(() => {
    let filtered = data;
    if (locationId === 'none') {
      filtered = data.filter(item => !item.locationId);
    } else if (locationId && locationId !== 'all') {
      filtered = data.filter(item => String(item.locationId) === String(locationId));
    }
    return filtered.filter(item => !searchTerm || (item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase())) || (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())));
  }, [data, searchTerm, locationId]);

  if (loading) return <div className="flex justify-center items-center p-8"><Loader className="animate-spin h-8 w-8 text-primary" /></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-foreground">Manage Price Categories</h3>
        <div className="flex items-center gap-2">
          <div className="relative"><input type="text" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="input w-full sm:w-64 pr-10 bg-background-muted border-border" /><Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-muted" /></div>
          <button onClick={handleAdd} className="flex items-center gap-2 btn-secondary"><PlusCircle size={16} /> Add Category</button>
        </div>
      </div>
      {showForm && (
        <div className="bg-card p-4 rounded-lg border border-border mb-4">
          <h4 className="text-md font-semibold mb-3">{editingItem?.id ? 'Edit Price Category' : 'Add New Price Category'}</h4>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
            <div className="col-span-1"><label htmlFor="name" className="label">Category Name</label><input id="name" name="name" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} required className="input" placeholder="e.g., Wholesale" /></div>
            <div className="col-span-1"><label htmlFor="description" className="label">Description</label><input id="description" name="description" value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} className="input" placeholder="Details" /></div>
            <div className="col-span-1">
              <label htmlFor="locationId" className="label">Location (Optional)</label>
              <select id="locationId" name="locationId" value={formData.locationId} onChange={(e) => setFormData(prev => ({ ...prev, locationId: e.target.value }))} className="input">
                <option value="">All Locations</option>
                {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
              </select>
            </div>
            <div className="flex justify-end gap-2 col-span-1">
              <button type="button" onClick={handleCancel} className="btn-secondary" disabled={formLoading}>Cancel</button>
              <button type="submit" className="btn-primary flex items-center" disabled={formLoading}>{formLoading && <Loader className="animate-spin h-4 w-4 mr-2" />} Save</button>
            </div>
          </form>
        </div>
      )}
      <div className="overflow-x-auto border border-border rounded-lg">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-background-muted">
            <tr><th className="th-cell">Name</th><th className="th-cell">Description</th><th className="th-cell">Location</th><th className="th-cell w-32">Actions</th></tr>
          </thead>
          <tbody className="bg-card divide-y divide-border text-foreground-muted">
            {loading ? (
              <tr><td colSpan="4" className="text-center py-10"><Loader className="animate-spin h-8 w-8 text-primary mx-auto" /></td></tr>
            ) : filteredData.length > 0 ? (
              filteredData.map(item => (
                <tr key={item.id}>
                  <td className="td-cell font-medium text-foreground">{item.name}</td>
                  <td className="td-cell">{item.description}</td>
                  <td className="td-cell">{item.locationName || 'All'}</td>
                  <td className="td-cell">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEdit(item)} className="text-primary hover:text-primary/80" title="Edit"><Edit size={16} /></button>
                      <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-600" title="Delete"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="4" className="text-center py-10"><AlertCircle className="mx-auto h-12 w-12 text-foreground-muted/50" /><h3 className="mt-2 text-sm font-medium text-foreground">No Price Categories Found</h3><p className="mt-1 text-sm">Get started by adding a new category.</p></td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const tabs = [
  { name: 'Inventory Types', icon: Layers, component: InventoryTypesTab },
  { name: 'Price Categories', icon: DollarSign, component: PriceCategoriesTab },
];

const GeneralSettings = ({ locationId }) => {
  const [activeTab, setActiveTab] = useState(tabs[0].name);
  const ActiveComponent = tabs.find((tab) => tab.name === activeTab)?.component;

  return (
    <div className="bg-card p-6 rounded-xl shadow-sm">
      <div className="border-b border-border mb-6">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`whitespace-nowrap flex items-center py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.name
                  ? 'border-primary text-primary'
                  : 'border-transparent text-foreground-muted hover:text-foreground hover:border-border'
              }`}
            >
              <tab.icon className="mr-2 h-5 w-5" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>
      <div>{ActiveComponent && <ActiveComponent locationId={locationId} />}</div>
    </div>
  );
};

export default GeneralSettings;
