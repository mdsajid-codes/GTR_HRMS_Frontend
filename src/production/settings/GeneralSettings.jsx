// GeneralSettings.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { Layers, DollarSign, Edit, Trash2, PlusCircle, Loader, X, Search, MapPin } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

// --- Reusable Components ---

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-card text-card-foreground rounded-lg shadow-xl w-full max-w-lg"
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

const FormField = ({ label, name, value, onChange, required = false, ...props }) => (
  <div className="space-y-1">
    <label htmlFor={name} className="block text-sm font-medium text-foreground-muted">
      {label}
    </label>
    <input
      id={name}
      name={name}
      value={value ?? ''}
      onChange={onChange}
      required={required}
      className="input mt-1 bg-background-muted border-border text-foreground"
      {...props}
    />
  </div>
);

const CrudTable = ({ columns, data, onEdit, onDelete }) => (
  <div>
    <div className="overflow-x-auto border border-border rounded-lg">
      <table className="min-w-full divide-y divide-border">
        <thead className="bg-background-muted">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              #
            </th>
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
              >
                {col.header}
              </th>
            ))}
            <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-card divide-y divide-border text-foreground-muted">
          {data.map((item, index) => (
            <tr key={item.id ?? index}>
              <td className="px-4 py-3 whitespace-nowrap text-sm">{index + 1}</td>
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 whitespace-nowrap text-sm">
                  {String(item[col.key] ?? '')}
                </td>
              ))}
              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-foreground-muted">
                <button
                  onClick={() => onEdit(item)}
                  className="text-primary hover:text-primary/80 mr-3"
                  title="Edit"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => onDelete(item.id)}
                  className="text-red-500 hover:text-red-600"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td
                className="px-4 py-6 text-sm text-foreground-muted text-center"
                colSpan={columns.length + 2}
              >
                No records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

// --- Form Components ---

const InventoryTypeForm = ({ item, onSave, onCancel, locations }) => {
  const [formData, setFormData] = useState(
    item || { id: undefined, name: '', description: '', locationId: '' }
  );

  useEffect(() => {
    if (item) {
      setFormData({
        ...item,
        locationId: item.locationId || '', // Ensure locationId is set if editing
      });
    } else {
      // When creating a new item, default to the selected locationId from props
      const newLocationId = onSave.locationId || '';
      setFormData({ id: undefined, name: '', description: '', locationId: newLocationId });
    }
  }, [item]);
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <FormField
        label="Inventory Type Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        required
        placeholder="e.g., Raw Materials, Finished Goods"
      />
      <FormField
        label="Description"
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Brief description of this inventory type"
      />
      <div className="space-y-1">
        <label htmlFor="locationId" className="block text-sm font-medium text-foreground-muted">
          Location (Optional)
        </label>
        <select id="locationId" name="locationId" value={formData.locationId} onChange={handleChange} className="input mt-1 bg-background-muted border-border text-foreground">
          <option value="">Select Location</option>
          {locations.map(loc => (
            <option key={loc.id} value={loc.id}>{loc.name}</option>
          ))}
        </select>
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" className="btn-primary">
          Save
        </button>
      </div>
    </form>
  );
};

const PriceCategoryForm = ({ item, onSave, onCancel, locations }) => {
  const [formData, setFormData] = useState(
    item || { id: undefined, name: '', description: '', locationId: '' }
  );

  useEffect(() => {
    if (item) {
      setFormData({
        ...item,
        locationId: item.locationId || '', // Ensure locationId is set if editing
      });
    } else {
      // When creating a new item, default to the selected locationId from props
      const newLocationId = onSave.locationId || '';
      setFormData({ id: undefined, name: '', description: '', locationId: newLocationId });
    }
  }, [item]);
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <FormField
        label="Price Category Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        required
        placeholder="e.g., Wholesale, Retail, Export"
      />
      <FormField
        label="Description"
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Details about this price category"
      />
      <div className="space-y-1">
        <label htmlFor="locationId" className="block text-sm font-medium text-foreground-muted">
          Location (Optional)
        </label>
        <select id="locationId" name="locationId" value={formData.locationId} onChange={handleChange} className="input mt-1 bg-background-muted border-border text-foreground">
          <option value="">Select Location</option>
          {locations.map(loc => (
            <option key={loc.id} value={loc.id}>{loc.name}</option>
          ))}
        </select>
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" className="btn-primary">
          Save
        </button>
      </div>
    </form>
  );
};

// --- CRUD Factory ---

const createCrudTab = (config) => ({ locationId }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [locations, setLocations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const authHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [itemsRes, locationsRes] = await Promise.all([
        axios.get(`${API_URL}${config.endpoints.getAll}`, { headers }),
        axios.get(`${API_URL}/locations`, { headers }), // Fetch locations
      ]);

      setData(Array.isArray(itemsRes.data) ? itemsRes.data : []);
      setLocations(Array.isArray(locationsRes.data) ? locationsRes.data : []);
    } catch (err) {
      console.error(`Error fetching data for ${config.name}:`, err);
      alert(
        `Error fetching data for ${config.name}: ${
          err.response?.data?.message || err.message
        }`
      );
    } finally {
      setLoading(false);
    }
  }, [config.endpoints.getAll, config.name]);


  const filteredAndSearchedData = useMemo(() => {
    let filtered = data;
    if (locationId === 'none') {
      filtered = data.filter(item => !item.locationId);
    } else if (locationId && locationId !== 'all') {
      filtered = data.filter(item => String(item.locationId) === String(locationId));
    }
    if (!searchTerm) return filtered;
    const lowercasedFilter = searchTerm.toLowerCase();
    return filtered.filter((item) =>
      config.columns.some(
        (col) =>
          item[col.key] &&
          String(item[col.key]).toLowerCase().includes(lowercasedFilter)
      )
    );
  }, [data, searchTerm, config.columns, locationId]);
  
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleAdd = () => {
    // Pass the current locationId when creating a new item
    setCurrentItem({
      id: undefined,
      locationId: locationId !== 'all' ? locationId : ''
    });
    setIsModalOpen(true);
  };
  const handleEdit = (item) => {
    setCurrentItem(item);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentItem(null);
  };

  const handleSave = async (itemData) => {
    // If locationId is an empty string, convert it to null for the backend
    const payload = {
      ...itemData,
      locationId: itemData.locationId || null,
    };

    const isUpdating = Boolean(itemData.id);
    const url = isUpdating
      ? `${API_URL}${config.endpoints.update}/${itemData.id}`
      : `${API_URL}${config.endpoints.create}`;
    const method = isUpdating ? 'put' : 'post';

    try {
      await axios[method](url, payload, { headers: authHeaders() });
      fetchAllData();
      handleCloseModal();
    } catch (err) {
      alert(
        `Error saving ${config.singularName}: ${
          err.response?.data?.message || err.message
        }`
      );
    }
  };

  const handleDelete = (id) => {
    if (!id) {
      alert(`Missing id for ${config.singularName}.`);
      return;
    }
    if (window.confirm(`Are you sure you want to delete this ${config.singularName}?`)) {
      axios
        .delete(`${API_URL}${config.endpoints.delete}/${id}`, { headers: authHeaders() }) // Use id directly
        .then(() => fetchAllData())
        .catch((err) =>
          alert(
            `Error deleting ${config.singularName}: ${
              err.response?.data?.message || err.message
            }`
          )
        );
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center p-8">
        <Loader className="animate-spin h-8 w-8 text-primary" />
      </div>
    );

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-foreground">{config.title}</h3>
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
            <PlusCircle size={16} /> {config.addLabel}
          </button>
        </div>
      </div>
      <CrudTable columns={config.columns} data={filteredAndSearchedData} onEdit={handleEdit} onDelete={handleDelete} />
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={currentItem ? `Edit ${config.singularName}` : `Add ${config.singularName}`}
      >
        <config.FormComponent item={currentItem} onSave={handleSave} onCancel={handleCloseModal} locations={locations} />
      </Modal>
    </>
  );
};

// --- Tab Definitions ---

const InventoryTypesTab = createCrudTab({
  name: 'inventory types',
  singularName: 'Inventory Type',
  title: 'Manage Inventory Types',
  addLabel: 'Add Type',
  columns: [
    { header: 'Name', key: 'name' },
    { header: 'Description', key: 'description' },
    { header: 'Location', key: 'locationName' }, // Display location name
  ],
  endpoints: {
    getAll: '/production/inventory-types',
    create: '/production/inventory-types',
    update: '/production/inventory-types',
    delete: '/production/inventory-types',
  },
  FormComponent: InventoryTypeForm,
});

const PriceCategoriesTab = createCrudTab({
  name: 'price categories',
  singularName: 'Price Category',
  title: 'Manage Price Categories',
  addLabel: 'Add Category',
  columns: [
    { header: 'Name', key: 'name' },
    { header: 'Description', key: 'description' },
    { header: 'Location', key: 'locationName' }, // Display location name
  ],
  endpoints: {
    getAll: '/production/price-categories',
    create: '/production/price-categories',
    update: '/production/price-categories',
    delete: '/production/price-categories',
  },
  FormComponent: PriceCategoryForm,
});

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
