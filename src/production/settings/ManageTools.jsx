import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { Edit, Trash2, PlusCircle, Loader, X, Search, ArrowLeft, Filter, XCircle, Eye } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const getAuthHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

// --- Form Component for Tools ---
const ToolForm = ({ item, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '', manufacturingDate: '', workGroupId: '', workstationId: '', categoryId: '', locationId: '',
        stations: [], parameters: []
    });
    const [selectOptions, setSelectOptions] = useState({ workGroups: [], workstations: [], categories: [], locations: [] });
    const [loading, setLoading] = useState(true);
    const [isAdvancedMode, setIsAdvancedMode] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [wgRes, wsRes, catRes, locRes] = await Promise.all([
                    axios.get(`${API_URL}/production/work-groups`, { headers: getAuthHeaders() }),
                    axios.get(`${API_URL}/production/work-stations`, { headers: getAuthHeaders() }),
                    axios.get(`${API_URL}/production/tool-categories`, { headers: getAuthHeaders() }),
                    axios.get(`${API_URL}/locations`, { headers: getAuthHeaders() }),
                ]);
                setSelectOptions({
                    workGroups: wgRes.data, workstations: wsRes.data,
                    categories: catRes.data, locations: locRes.data
                });
            } catch (err) {
                console.error("Failed to fetch form data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (item) {
            setFormData({
                name: item.name || '',
                manufacturingDate: item.manufacturingDate || '',
                workGroupId: item.workGroupId || '',
                workstationId: item.workstationId || '',
                categoryId: item.categoryId || '',
                locationId: item.locationId || '',
                stations: item.stations || [],
                parameters: item.parameters || [],
            });

            // Automatically enable advanced mode if the item has advanced data
            const hasAdvancedData =
                item.workstationId ||
                item.locationId ||
                (item.stations && item.stations.length > 0) ||
                (item.parameters && item.parameters.length > 0);

            setIsAdvancedMode(hasAdvancedData);
        } else {
            // Reset for new item
            setFormData({
                name: '', manufacturingDate: '', workGroupId: '', workstationId: '', categoryId: '', locationId: '',
                stations: [{ name: '', position: 1 }],
                parameters: [{ name: '', values: [{ value: '', position: 1 }] }]
            });
        }
    }, [item]);

    const handleChange = e => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleDynamicChange = (listName, index, field, value) => {
        setFormData(prev => {
            const newList = [...prev[listName]];
            newList[index] = { ...newList[index], [field]: value };
            return { ...prev, [listName]: newList };
        });
    };

    const addDynamicItem = (listName, newItem) => {
        setFormData(prev => ({ ...prev, [listName]: [...prev[listName], newItem] }));
    };

    const removeDynamicItem = (listName, index) => {
        setFormData(prev => ({ ...prev, [listName]: prev[listName].filter((_, i) => i !== index) }));
    };

    const handleParamValueChange = (paramIndex, valueIndex, field, value) => {
        setFormData(prev => {
            const newParams = [...prev.parameters];
            const newValues = [...newParams[paramIndex].values];
            newValues[valueIndex] = { ...newValues[valueIndex], [field]: value };
            newParams[paramIndex] = { ...newParams[paramIndex], values: newValues };
            return { ...prev, parameters: newParams };
        });
    };

    const addParamValue = (paramIndex) => {
        setFormData(prev => {
            const newParams = [...prev.parameters];
            newParams[paramIndex].values.push({ value: '', position: newParams[paramIndex].values.length + 1 });
            return { ...prev, parameters: newParams };
        });
    };

    const removeParamValue = (paramIndex, valueIndex) => {
        setFormData(prev => {
            const newParams = [...prev.parameters];
            newParams[paramIndex].values = newParams[paramIndex].values.filter((_, i) => i !== valueIndex);
            return { ...prev, parameters: newParams };
        });
    };

    const handleSubmit = e => {
        e.preventDefault();
        const payload = {
            ...formData,
            workstationId: formData.workstationId || null,
            locationId: formData.locationId || null,
        };
        onSave(payload);
    };

    if (loading) return <div className="flex justify-center p-8"><Loader className="animate-spin" /></div>;

    return (
        <div className="bg-card rounded-xl shadow-sm flex flex-col h-full">
            <div className="flex items-center gap-4 p-6 border-b border-border flex-shrink-0">
                <button onClick={onCancel} className="p-2 rounded-full hover:bg-background-muted"><ArrowLeft size={20} /></button>
                <h1 className="text-2xl font-bold text-foreground">{item?.id ? 'Edit Tool' : 'Add New Tool'}</h1>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col flex-grow overflow-hidden">
                <div className="flex-grow overflow-y-auto p-6 space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-4">
                        {/* Left Column: Main Details */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-foreground border-b pb-2 mb-4">Tool Information</h3>
                            <div><label className="block text-sm font-medium text-foreground-muted">Tool Name</label><input name="name" value={formData.name} onChange={handleChange} placeholder="Tool Name" className="input" required /></div>
                            <div><label className="block text-sm font-medium text-foreground-muted">Category</label><select name="categoryId" value={formData.categoryId} onChange={handleChange} className="input" required><option value="">Select Category</option>{selectOptions.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                            <div><label className="block text-sm font-medium text-foreground-muted">Work Group</label><select name="workGroupId" value={formData.workGroupId} onChange={handleChange} className="input" required><option value="">Select Work Group</option>{selectOptions.workGroups.map(wg => <option key={wg.id} value={wg.id}>{wg.name}</option>)}</select></div>
                            <div><label className="block text-sm font-medium text-foreground-muted">Manufacturing Date</label><input name="manufacturingDate" type="date" value={formData.manufacturingDate} onChange={handleChange} className="input" /></div>
                        </div>

                        {/* Right Column: Stations and Parameters */}
                        <div className="space-y-3">
                             <div className="flex items-center justify-between border-b pb-2 mb-3">
                                <h3 className="text-base font-semibold text-foreground">Advanced Options</h3>
                                <label className="flex items-center cursor-pointer">
                                    <span className="text-sm mr-2">{isAdvancedMode ? 'On' : 'Off'}</span>
                                    <div className="relative">
                                        <input type="checkbox" checked={isAdvancedMode} onChange={() => setIsAdvancedMode(prev => !prev)} className="sr-only" />
                                        <div className={`block w-10 h-6 rounded-full ${isAdvancedMode ? 'bg-primary' : 'bg-gray-300'}`}></div>
                                        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isAdvancedMode ? 'transform translate-x-full' : ''}`}></div>
                                    </div>
                                </label>
                            </div>
                            {isAdvancedMode && (
                                <div className="space-y-3">
                                    <div><label className="block text-sm font-medium text-foreground-muted">Workstation (Optional)</label><select name="workstationId" value={formData.workstationId} onChange={handleChange} className="input"><option value="">Select Workstation</option>{selectOptions.workstations.map(ws => <option key={ws.id} value={ws.id}>{ws.workstationName}</option>)}</select></div>
                                    <div><label className="block text-sm font-medium text-foreground-muted">Location (Optional)</label><select name="locationId" value={formData.locationId} onChange={handleChange} className="input"><option value="">Select Location</option>{selectOptions.locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}</select></div>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {isAdvancedMode && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6 border-t">
                             {/* Stations */}
                             <div>
                                <h3 className="font-semibold mb-2 text-foreground">Stations</h3>
                                {formData.stations.map((station, index) => (
                                    <div key={index} className="flex items-center gap-2 mb-2">
                                        <input value={station.name} onChange={e => handleDynamicChange('stations', index, 'name', e.target.value)} placeholder="Station Name" className="input w-full" />
                                        <input type="number" value={station.position} onChange={e => handleDynamicChange('stations', index, 'position', e.target.value)} placeholder="Pos" className="input w-20" />
                                        <button type="button" onClick={() => removeDynamicItem('stations', index)} className="p-2 text-red-500 hover:bg-red-100 rounded-full"><Trash2 size={16} /></button>
                                    </div>
                                ))}
                                <button type="button" onClick={() => addDynamicItem('stations', { name: '', position: formData.stations.length + 1 })} className="btn-secondary text-sm"><PlusCircle size={16} className="mr-2" />Add Station</button>
                            </div>
                             {/* Parameters */}
                             <div>
                                <h3 className="font-semibold mb-2 text-foreground">Parameters</h3>
                                {formData.parameters.map((param, pIndex) => (
                                    <div key={pIndex} className="p-3 border rounded-md mb-3 bg-background-muted">
                                        <div className="flex items-center gap-2 mb-2">
                                            <input value={param.name} onChange={e => handleDynamicChange('parameters', pIndex, 'name', e.target.value)} placeholder="Parameter Name" className="input w-full" />
                                            <button type="button" onClick={() => removeDynamicItem('parameters', pIndex)} className="p-2 text-red-500 hover:bg-red-100 rounded-full"><Trash2 size={16} /></button>
                                        </div>
                                        <div className="pl-4">
                                            {param.values.map((val, vIndex) => (
                                                <div key={vIndex} className="flex items-center gap-2 mb-1">
                                                    <input value={val.value} onChange={e => handleParamValueChange(pIndex, vIndex, 'value', e.target.value)} placeholder="Value" className="input w-full text-sm" />
                                                    <input type="number" value={val.position} onChange={e => handleParamValueChange(pIndex, vIndex, 'position', e.target.value)} placeholder="Pos" className="input w-20 text-sm" />
                                                    <button type="button" onClick={() => removeParamValue(pIndex, vIndex)} className="p-1 text-red-500 hover:bg-red-100 rounded-full"><Trash2 size={14} /></button>
                                                </div>
                                            ))}
                                            <button type="button" onClick={() => addParamValue(pIndex)} className="btn-secondary btn-sm"><PlusCircle size={14} className="mr-1" />Add Value</button>
                                        </div>
                                    </div>
                                ))}
                                <button type="button" onClick={() => addDynamicItem('parameters', { name: '', values: [{ value: '', position: 1 }] })} className="btn-secondary text-sm"><PlusCircle size={16} className="mr-2" />Add Parameter</button>
                            </div>
                        </div>)}
                </div>
                <div className="flex justify-end gap-2 p-6 border-t border-border flex-shrink-0">
                    <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
                    <button type="submit" className="btn-primary">Save Tool</button>
                </div>
            </form>
        </div>
    );
};

// --- Details Modal Component ---
const ToolDetailsModal = ({ isOpen, onClose, tool }) => {
    if (!isOpen || !tool) return null;

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
                    <h3 className="text-xl font-semibold text-foreground">Tool Details: {tool.name}</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-background-muted"><X size={20} /></button>
                </div>
                <div className="p-6 max-h-[80vh] overflow-y-auto space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 border-b pb-4">
                        <DetailItem label="Tool Name" value={tool.name} />
                        <DetailItem label="Category" value={tool.categoryName} />
                        <DetailItem label="Work Group" value={tool.workGroupName} />
                        <DetailItem label="Workstation" value={tool.workstationName} />
                        <DetailItem label="Location" value={tool.locationName} />
                        <DetailItem label="Manufacturing Date" value={tool.manufacturingDate} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-semibold mb-3 text-foreground">Stations</h4>
                            <ul className="space-y-2">{tool.stations?.map(s => <li key={s.id} className="text-sm p-2 bg-background-muted rounded">{s.name} (Pos: {s.position})</li>) || <li>No stations assigned.</li>}</ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-3 text-foreground">Parameters</h4>
                            <div className="space-y-3">
                                {tool.parameters?.map(p => (
                                    <div key={p.id} className="text-sm"><p className="font-medium">{p.name}</p><ul className="list-disc list-inside pl-2 text-foreground-muted">{p.values?.map(v => <li key={v.id}>{v.value} (Pos: {v.position})</li>)}</ul></div>
                                )) || <p>No parameters defined.</p>}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="p-4 bg-background-muted border-t flex justify-end"><button onClick={onClose} className="btn-secondary">Close</button></div>
            </div>
        </div>
    );
};

// --- Main Component for Tools Tab ---
const ManageTools = ({ locationId, workstationId }) => {
    const [tools, setTools] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('list'); // 'list' or 'form'
    const [currentItem, setCurrentItem] = useState(null);
    const [viewingItem, setViewingItem] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [searchFilters, setSearchFilters] = useState({
        workstationId: '',
        toolId: '',
        fromDate: '',
        toDate: '',
    });
    const [activeFilters, setActiveFilters] = useState({});
    const [workstations, setWorkstations] = useState([]);

    const fetchTools = useCallback(() => {
        setLoading(true);
        Promise.all([
            axios.get(`${API_URL}/production/tools`, { headers: getAuthHeaders() }),
            axios.get(`${API_URL}/production/work-stations`, { headers: getAuthHeaders() })
        ]).then(([toolsRes, workstationsRes]) => {
            setTools(Array.isArray(toolsRes.data) ? toolsRes.data : []);
            setWorkstations(Array.isArray(workstationsRes.data) ? workstationsRes.data : []);
        }).catch(err => {
            console.error("Error fetching data:", err);
            alert("Failed to fetch necessary data. Please try again.");
        }).finally(() => {
            setLoading(false);
        });
    }, []);

    useEffect(() => { fetchTools(); }, [fetchTools]);

    const filteredData = useMemo(() => {
        let filtered = tools;
        // Location filter from props
        if (locationId === 'none') {
            filtered = tools.filter(item => !item.locationId);
        } else if (locationId && locationId !== 'all') {
            filtered = tools.filter(item => String(item.locationId) === String(locationId));
        }

        // Filter by workstationId if provided
        if (workstationId) {
            filtered = filtered.filter(item => String(item.workstationId) === String(workstationId));
        }

        // Advanced filters on button click
        if (activeFilters.workstationId) filtered = filtered.filter(t => String(t.workstationId) === activeFilters.workstationId);
        if (activeFilters.toolId) filtered = filtered.filter(t => String(t.id) === activeFilters.toolId);
        if (activeFilters.fromDate) filtered = filtered.filter(t => new Date(t.manufacturingDate) >= new Date(activeFilters.fromDate));
        if (activeFilters.toDate) filtered = filtered.filter(t => new Date(t.manufacturingDate) <= new Date(activeFilters.toDate));

        return filtered;
    }, [tools, activeFilters, locationId, workstationId]);

    const handleAdd = () => {
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
        const url = isUpdating ? `${API_URL}/production/tools/${currentItem.id}` : `${API_URL}/production/tools`;
        const method = isUpdating ? 'put' : 'post';

        try {
            await axios[method](url, itemData, { headers: getAuthHeaders() });
            fetchTools();
            handleCancelForm();
        } catch (err) {
            alert(`Error saving tool: ${err.response?.data?.message || err.message}`);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this tool?')) {
            try {
                await axios.delete(`${API_URL}/production/tools/${id}`, { headers: getAuthHeaders() });
                fetchTools();
            } catch (err) {
                alert(`Error deleting tool: ${err.response?.data?.message || err.message}`);
            }
        }
    };

    const handleFilterChange = (e) => {
        setSearchFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSearch = () => {
        setActiveFilters(searchFilters);
    };

    const handleResetFilters = () => {
        setSearchFilters({ workstationId: '', toolId: '', fromDate: '', toDate: '' });
        setActiveFilters({});
    };


    if (view === 'form') {
        // The form now needs to be inside a container that can manage its height
        return (
            <div className="h-full"><ToolForm item={currentItem} onSave={handleSave} onCancel={handleCancelForm} /></div>
        );
    }

    if (loading) {
        return <div className="flex justify-center items-center p-8"><Loader className="animate-spin h-8 w-8 text-primary" /></div>;
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex flex-wrap items-end gap-4 mb-4 p-4 border rounded-lg bg-background-muted">
                <div><label className="block text-sm font-medium text-foreground-muted mb-1">Workstation</label><select name="workstationId" value={searchFilters.workstationId} onChange={handleFilterChange} className="input"><option value="">All Workstations</option>{workstations.map(ws => <option key={ws.id} value={ws.id}>{ws.workstationName}</option>)}</select></div>
                <div><label className="block text-sm font-medium text-foreground-muted mb-1">Tool</label><select name="toolId" value={searchFilters.toolId} onChange={handleFilterChange} className="input"><option value="">All Tools</option>{tools.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
                <div><label className="block text-sm font-medium text-foreground-muted mb-1">From Mfg. Date</label><input type="date" name="fromDate" value={searchFilters.fromDate} onChange={handleFilterChange} className="input" /></div>
                <div><label className="block text-sm font-medium text-foreground-muted mb-1">To Mfg. Date</label><input type="date" name="toDate" value={searchFilters.toDate} onChange={handleFilterChange} className="input" /></div>
                <div className="flex items-end gap-2">
                    <button onClick={handleSearch} className="btn-primary flex items-center justify-center gap-2"><Filter size={16} /> Search</button>
                    <button onClick={handleResetFilters} className="btn-secondary flex items-center justify-center gap-2"><XCircle size={16} /> Reset</button>
                </div>
            </div>

            <div className="flex justify-between items-center mb-4">
                 <h3 className="text-lg font-semibold text-foreground">
                    Tools List ({filteredData.length})
                </h3>
                <button onClick={handleAdd} className="flex items-center gap-2 btn-secondary"><PlusCircle size={16} /> Add Tool</button>
            </div>

            <div className="flex-grow overflow-auto border border-border rounded-lg">
                <table className="min-w-full divide-y divide-border">
                    <thead className="bg-background-muted">
                        <tr>
                            <th className="th-cell">Name</th>
                            <th className="th-cell">Category</th>
                            <th className="th-cell">Work Group</th>
                            <th className="th-cell">Workstation</th>
                            <th className="th-cell">Location</th>
                            <th className="th-cell">Mfg. Date</th>
                            <th className="th-cell">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-card divide-y divide-border text-foreground-muted">
                        {filteredData.length > 0 ? (
                            filteredData.map((item) => (
                                <tr key={item.id} className="hover:bg-background-muted transition-colors">
                                    <td className="td-cell font-medium">{item.name}</td>
                                    <td className="td-cell">{item.categoryName}</td>
                                    <td className="td-cell">{item.workGroupName}</td>
                                    <td className="td-cell">{item.workstationName || 'N/A'}</td>
                                    <td className="td-cell">{item.locationName || 'N/A'}</td>
                                    <td className="td-cell">{item.manufacturingDate}</td>
                                    <td className="td-cell">
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => handleViewDetails(item)} className="text-sky-500 hover:text-sky-600" title="View Details"><Eye size={16} /></button>
                                            <button onClick={() => handleEdit(item)} className="text-primary hover:text-primary/80" title="Edit"><Edit size={16} /></button>
                                            <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-600" title="Delete"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="px-4 py-6 text-sm text-foreground-muted text-center">No tools found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <ToolDetailsModal isOpen={isViewModalOpen} onClose={handleCloseViewModal} tool={viewingItem} />
        </div>
    );
};

export default ManageTools;