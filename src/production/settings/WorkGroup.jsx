import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { Factory, Users, Edit, Trash2, PlusCircle, Loader, Search, X } from 'lucide-react';
import WorkstationTab from './WorkstationTab';
import WorkgroupFormPage from './WorkgroupFormPage';

const API_URL = import.meta.env.VITE_API_BASE_URL;


const WorkgroupTab = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list'); // 'list' or 'form'
  const [currentItem, setCurrentItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Pull token once; if your app rotates tokens, prefer a function that reads localStorage each call.
  const authHeaders = useMemo(
    () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` }),
    []
  );

  const fetchItems = useCallback(() => {
    setLoading(true);
    axios
      .get(`${API_URL}/production/work-groups`, { headers: authHeaders })
      .then((res) => setData(Array.isArray(res.data) ? res.data : []))
      .catch((err) => {
        console.error('Error fetching work groups:', err);
        alert(`Error fetching work groups: ${err.response?.data?.message || err.message}`);
      })
      .finally(() => setLoading(false));
  }, [authHeaders]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    const q = searchTerm.toLowerCase();
    return data.filter(
      (item) =>
        String(item.name ?? '').toLowerCase().includes(q) ||
        String(item.number ?? '').toLowerCase().includes(q)
    );
  }, [data, searchTerm]);

  const handleAdd = () => {
    setCurrentItem(null);
    setView('form');
  };

  const handleEdit = (item) => {
    setCurrentItem(item);
    setView('form');
  };

  const handleCancelForm = () => {
    setView('list');
    setCurrentItem(null);
  };

  const handleSave = async (itemData) => {
    const isUpdating = Boolean(currentItem?.id);
    const url = isUpdating
      ? `${API_URL}/production/work-groups/${currentItem.id}`
      : `${API_URL}/production/work-groups`;
    const method = isUpdating ? 'put' : 'post';

    try {
      await axios[method](url, itemData, { headers: authHeaders });
      fetchItems();
      handleCancelForm();
    } catch (err) {
      alert(`Error saving work group: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleDelete = (id) => {
    if (!id) {
      alert('Missing id for work group.');
      return;
    }
    if (window.confirm('Are you sure you want to delete this work group?')) {
      axios
        .delete(`${API_URL}/production/work-groups/${id}`, { headers: authHeaders })
        .then(() => fetchItems())
        .catch((err) =>
          alert(`Error deleting work group: ${err.response?.data?.message || err.message}`)
        );
    }
  };

  const columns = [
    { header: 'Number', key: 'number' },
    { header: 'Name', key: 'name' },
    { header: 'Designation', key: 'designation' },
    { header: 'Employees', key: 'numberOfEmployees' },
    { header: 'Instances', key: 'instanceCount' },
    { header: 'Hourly Rate', key: 'hourlyRate' },
  ];

  if (view === 'form') {
    return <WorkgroupFormPage item={currentItem} onSave={handleSave} onCancel={handleCancelForm} />;
  }

  if (loading)
    return (
      <div className="flex justify-center items-center p-8">
        <Loader className="animate-spin h-8 w-8 text-primary" />
      </div>
    );

  return (
    <div className="bg-card p-6 rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-foreground">Manage Work Groups</h3>
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
            <PlusCircle size={16} /> Add Work Group
          </button>
        </div>
      </div>

      <div className="overflow-x-auto border border-border rounded-lg">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-background-muted">
            <tr>
              <th className="th-cell">#</th>
              {columns.map((col) => (
                <th key={col.key} className="th-cell">
                  {col.header}
                </th>
              ))}
              <th className="th-cell">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-border text-foreground-muted">
            {filteredData.map((item, index) => (
              <tr key={item.id ?? index}>
                <td className="td-cell">{index + 1}</td>
                {columns.map((col) => (
                  <td key={col.key} className="td-cell">
                    {String(item[col.key] ?? '')}
                  </td>
                ))}
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
            ))}
            {filteredData.length === 0 && (
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
};


const tabs = [
  { name: 'Workgroup', icon: Users, component: WorkgroupTab },
  { name: 'Workstation', icon: Factory, component: WorkstationTab },
];


const WorkGroup = () => {
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
      <div>{ActiveComponent && <ActiveComponent />}</div>
    </div>
  );
};


export default WorkGroup;
