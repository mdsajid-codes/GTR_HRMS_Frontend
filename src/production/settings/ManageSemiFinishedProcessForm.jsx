import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { ArrowLeft, Loader, Save, PlusCircle, Trash2, ChevronsUpDown } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const FormSection = ({ title, children }) => (
    <div className="pt-4">
        <h4 className="text-md font-semibold text-foreground-muted border-b border-border pb-2 mb-4">{title}</h4>
        {children}
    </div>
);

const ManageSemiFinishedProcessForm = ({ item, onSave, onCancel, loading: isSubmitting, locationId }) => {
    const [formData, setFormData] = useState({
        itemId: '',
        processFlowName: '',
        otherFixedCost: 0,
        otherVariableCost: 0,
        isLocked: false,
        locationId: locationId !== 'all' ? locationId : '',
        details: []
    });

    const [selectData, setSelectData] = useState({
        items: [],
        processes: [],
        workGroups: [],
        locations: []
    });

    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { "Authorization": `Bearer ${token}` };
            const [itemRes, processRes, wgRes, locRes] = await Promise.all([
                axios.get(`${API_URL}/production/semi-finished`, { headers }),
                axios.get(`${API_URL}/production/processes`, { headers }),
                axios.get(`${API_URL}/production/work-groups`, { headers }),
                axios.get(`${API_URL}/locations`, { headers }),
            ]);

            setSelectData({
                items: itemRes.data.content || [],
                processes: processRes.data.content || [],
                workGroups: wgRes.data || [],
                locations: locRes.data || [],
            });
        } catch (err) {
            console.error("Failed to fetch form dependencies", err);
            alert("Failed to load required data for the form.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        if (item) {
            setFormData({
                itemId: item.itemId || '',
                processFlowName: item.processFlowName || '',
                otherFixedCost: item.otherFixedCost || 0,
                otherVariableCost: item.otherVariableCost || 0,
                isLocked: !!item.isLocked,
                locationId: item.locationId != null ? String(item.locationId) : (locationId !== 'all' ? locationId : ''),
                details: item.details || []
            });
        } else {
            // Reset for new item
            setFormData({
                itemId: '', processFlowName: '', otherFixedCost: 0, otherVariableCost: 0, isLocked: false,
                locationId: locationId !== 'all' ? locationId : '',
                details: [{ processId: '', workGroupId: '', setupTime: 0, cycleTime: 0, fixedCost: 0, variableCost: 0, isOutsource: false, isTesting: false, notes: '', sequence: 1 }]
            });
        }
    }, [item, locationId]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleDetailChange = (index, field, value, type = 'text') => {
        const newDetails = [...formData.details];
        newDetails[index][field] = type === 'checkbox' ? value.target.checked : value;
        setFormData(prev => ({ ...prev, details: newDetails }));
    };

    const addDetail = () => {
        const nextSequence = formData.details.length > 0 ? Math.max(...formData.details.map(d => d.sequence || 0)) + 1 : 1;
        setFormData(prev => ({
            ...prev,
            details: [...prev.details, { processId: '', workGroupId: '', setupTime: 0, cycleTime: 0, fixedCost: 0, variableCost: 0, isOutsource: false, isTesting: false, notes: '', sequence: nextSequence }]
        }));
    };

    const removeDetail = (index) => {
        setFormData(prev => ({ ...prev, details: prev.details.filter((_, i) => i !== index) }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = { ...formData, locationId: formData.locationId || null };
        onSave(payload);
    };

    if (loading) {
        return <div className="flex justify-center items-center h-full"><Loader className="animate-spin h-8 w-8 text-primary" /></div>;
    }

    return (
        <>
            <header className="p-4 border-b flex-shrink-0 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={onCancel} className="p-1.5 rounded-full hover:bg-background-muted"><ArrowLeft size={20} /></button>
                    <h2 className="text-xl font-semibold text-foreground">{item ? 'Edit' : 'Add New'} Process Flow</h2>
                </div>
                <div className="flex items-center gap-2">
                    <button type="button" onClick={onCancel} className="btn-secondary" disabled={isSubmitting}>Cancel</button>
                    <button type="submit" form="process-flow-form" className="btn-primary flex items-center" disabled={isSubmitting}>
                        {isSubmitting ? <Loader className="animate-spin h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />} Save
                    </button>
                </div>
            </header>

            <form id="process-flow-form" onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 space-y-4">
                <FormSection title="Process Flow Header">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="label">Semi-Finished Item *</label><select name="itemId" value={formData.itemId} onChange={handleChange} required className="input"><option value="">Select Item</option>{selectData.items.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}</select></div>
                        <div><label className="label">Process Flow Name *</label><input name="processFlowName" value={formData.processFlowName} onChange={handleChange} required className="input" /></div>
                        <div><label className="label">Location</label><select name="locationId" value={formData.locationId} onChange={handleChange} className="input"><option value="">All Locations</option>{selectData.locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}</select></div>
                        <div className="flex items-center gap-2 pt-6"><input type="checkbox" name="isLocked" checked={formData.isLocked} onChange={handleChange} className="h-4 w-4 rounded" /><span>Is Locked</span></div>
                    </div>
                </FormSection>

                <FormSection title="Process Details">
                    <div className="space-y-3">
                        {formData.details.map((detail, index) => (
                            <div key={index} className="p-4 border rounded-md bg-background-muted space-y-3">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <ChevronsUpDown className="h-5 w-5 text-foreground-muted" />
                                        <span className="font-semibold">Step {detail.sequence}</span>
                                    </div>
                                    <button type="button" onClick={() => removeDetail(index)} className="p-1.5 text-red-500 hover:bg-red-100 rounded-full"><Trash2 size={16} /></button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div><label className="label text-xs">Sequence</label><input type="number" value={detail.sequence} onChange={(e) => handleDetailChange(index, 'sequence', e.target.value)} className="input" /></div>
                                    <div><label className="label text-xs">Process</label><select value={detail.processId} onChange={(e) => handleDetailChange(index, 'processId', e.target.value)} className="input"><option value="">Select Process</option>{selectData.processes.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
                                    <div><label className="label text-xs">Work Group</label><select value={detail.workGroupId} onChange={(e) => handleDetailChange(index, 'workGroupId', e.target.value)} className="input"><option value="">Select Work Group</option>{selectData.workGroups.map(wg => <option key={wg.id} value={wg.id}>{wg.name}</option>)}</select></div>
                                    <div><label className="label text-xs">Setup Time (min)</label><input type="number" value={detail.setupTime} onChange={(e) => handleDetailChange(index, 'setupTime', e.target.value)} className="input" /></div>
                                    <div><label className="label text-xs">Cycle Time (min)</label><input type="number" value={detail.cycleTime} onChange={(e) => handleDetailChange(index, 'cycleTime', e.target.value)} className="input" /></div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div><label className="label text-xs">Fixed Cost</label><input type="number" step="0.01" value={detail.fixedCost} onChange={(e) => handleDetailChange(index, 'fixedCost', e.target.value)} className="input" /></div>
                                    <div><label className="label text-xs">Variable Cost</label><input type="number" step="0.01" value={detail.variableCost} onChange={(e) => handleDetailChange(index, 'variableCost', e.target.value)} className="input" /></div>
                                </div>
                                <div><label className="label text-xs">Notes</label><textarea value={detail.notes} onChange={(e) => handleDetailChange(index, 'notes', e.target.value)} className="input" rows="2"></textarea></div>
                                <div className="flex items-center gap-4 pt-2">
                                    <label className="flex items-center gap-2"><input type="checkbox" checked={detail.isOutsource} onChange={(e) => handleDetailChange(index, 'isOutsource', e, 'checkbox')} className="h-4 w-4 rounded" /><span>Is Outsource</span></label>
                                    <label className="flex items-center gap-2"><input type="checkbox" checked={detail.isTesting} onChange={(e) => handleDetailChange(index, 'isTesting', e, 'checkbox')} className="h-4 w-4 rounded" /><span>Is Testing</span></label>
                                </div>
                            </div>
                        ))}
                        <button type="button" onClick={addDetail} className="btn-secondary w-full"><PlusCircle size={16} className="mr-2" />Add Process Step</button>
                    </div>
                </FormSection>

                <FormSection title="Additional Costs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="label">Other Fixed Cost</label><input name="otherFixedCost" type="number" step="0.01" value={formData.otherFixedCost} onChange={handleChange} className="input" /></div>
                        <div><label className="label">Other Variable Cost</label><input name="otherVariableCost" type="number" step="0.01" value={formData.otherVariableCost} onChange={handleChange} className="input" /></div>
                    </div>
                </FormSection>
            </form>
        </>
    );
};

export default ManageSemiFinishedProcessForm;