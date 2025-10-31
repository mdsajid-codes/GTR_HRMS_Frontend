import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { Factory, Users, Edit, Trash2, PlusCircle, Loader, Search, X, Wrench, ClipboardCheck, ListChecks, Eye, ToolCaseIcon } from 'lucide-react';
import WorkstationTab from './WorkstationTab';
import WorkgroupFormPage from './WorkgroupFormPage';
import ToolCategory from './ToolCategory';
import Task from './Task';
import ManageTask from './ManageTask';
import ManageTools from './ManageTools';

const API_URL = import.meta.env.VITE_API_BASE_URL;

// --- Details Modal for Workgroup ---
const WorkgroupDetailsModal = ({ isOpen, onClose, item }) => {
    if (!isOpen || !item) return null;

    const DetailItem = ({ label, value }) => (
        <div>
            <p className="text-xs text-foreground-muted">{label}</p>
            <p className="font-medium text-foreground">{value || 'N/A'}</p>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-card text-card-foreground rounded-lg shadow-xl w-full max-w-3xl" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-foreground">Workgroup Details: {item.name}</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-background-muted"><X size={20} /></button>
                </div>
                <div className="p-6 max-h-[80vh] overflow-y-auto space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 border-b pb-4">
                        <DetailItem label="Workgroup Name" value={item.name} />
                        <DetailItem label="Designation" value={item.designation} />
                        <DetailItem label="Number of Employees" value={item.numberOfEmployees} />
                        <DetailItem label="Instance Count" value={item.instanceCount} />
                        <DetailItem label="Hourly Rate" value={item.hourlyRate} />
                        <DetailItem label="Location" value={item.locationName} />
                        <DetailItem label="Working Minutes" value={item.customWorkingHours ? 'Custom' : item.fixedWorkingMinutes} />
                    </div>
                    <div>
                        <h4 className="font-semibold mb-3 text-foreground">Day Schedules</h4>
                        <ul className="space-y-2">
                            {item.daySchedules?.length > 0 ? (
                                item.daySchedules.map(s => <li key={s.dayOfWeek} className="text-sm p-2 bg-background-muted rounded">{s.dayOfWeek}: {s.startTime} - {s.endTime}</li>)
                            ) : (
                                <li>No custom schedules defined. Using fixed working minutes.</li>
                            )}
                        </ul>
                    </div>
                </div>
                <div className="p-4 bg-background-muted border-t flex justify-end"><button onClick={onClose} className="btn-secondary">Close</button></div>
            </div>
        </div>
    );
};

const WorkgroupTab = ({ locationId }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list'); // 'list' or 'form'
  const [currentItem, setCurrentItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingItem, setViewingItem] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

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
    let filtered = data;
    if (locationId === 'none') {
      filtered = data.filter(item => !item.locationId);
    } else if (locationId && locationId !== 'all') {
      filtered = data.filter(item => String(item.locationId) === String(locationId));
    }

    if (!searchTerm) return filtered;

    const q = searchTerm.toLowerCase();
    return filtered.filter(
      (item) =>
        String(item.name ?? '').toLowerCase().includes(q) ||
        String(item.number ?? '').toLowerCase().includes(q)
    );
  }, [data, searchTerm, locationId]);

  const handleAdd = () => {
    // Pre-fill locationId when adding a new item
    setCurrentItem({ locationId: locationId !== 'all' ? locationId : '' });
    setView('form');
  };

  const handleEdit = (item) => {
    setCurrentItem(item);
    setView('form');
  };

  const handleViewDetails = (item) => {
    setViewingItem(item);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setViewingItem(null);
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
    { header: 'Location', key: 'locationName' },
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
    <>
      <div className="flex justify-between items-center">
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
              <tr key={item.id ?? index} className="hover:bg-background-muted">
                <td className="td-cell">{index + 1}</td>
                {columns.map((col) => (
                  <td key={col.key} className="td-cell">
                    {String(item[col.key] ?? '')}
                  </td>
                ))}
                <td className="td-cell">
                  <div className="flex items-center gap-4">
                    <button onClick={() => handleViewDetails(item)} className="text-sky-500 hover:text-sky-600" title="View Details">
                      <Eye size={16} />
                    </button>
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

      <WorkgroupDetailsModal isOpen={isViewModalOpen} onClose={handleCloseViewModal} item={viewingItem} />
    </>
  );
};


const tabs = [
  { name: 'Workgroup', icon: Users, component: WorkgroupTab, color: 'text-blue-500' },
  { name: 'Workstation', icon: Factory, component: WorkstationTab, color: 'text-indigo-500' },
  { name: 'Tool Category', icon: Wrench, component: ToolCategory, color: 'text-amber-500' },
  { name: 'Manage Tools', icon: ToolCaseIcon, component: ManageTools, color: 'text-green-500' },
  { name: 'Tasks', icon: ClipboardCheck, component: Task, color: 'text-rose-500' },
  { name: 'Manage Tasks', icon: ListChecks, component: ManageTask, color: 'text-purple-500' },
];


const WorkGroup = ({ locationId }) => {
  const [activeTab, setActiveTab] = useState(tabs[0].name);
  const [workstationFilter, setWorkstationFilter] = useState(null);

  const handleSwitchTab = (tabName, filter) => {
    setActiveTab(tabName);
    setWorkstationFilter(filter);
  };

  const ActiveComponent = useMemo(() => tabs.find((tab) => tab.name === activeTab)?.component, [activeTab]);
  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-border flex-shrink-0 mb-6">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`whitespace-nowrap flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors group ${
                activeTab === tab.name
                  ? 'border-primary text-primary font-semibold'
                  : 'border-transparent text-foreground-muted hover:text-foreground hover:border-border group-hover:text-primary'
              }`}
            >
              <tab.icon className="mr-2 h-5 w-5" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>
      <div className="flex-grow overflow-y-auto">
        {ActiveComponent && (
          <ActiveComponent 
            locationId={locationId} 
            workstationId={workstationFilter}
            onSwitchTab={handleSwitchTab} 
          />
        )}
      </div>
    </div>
  );
};


export default WorkGroup;
