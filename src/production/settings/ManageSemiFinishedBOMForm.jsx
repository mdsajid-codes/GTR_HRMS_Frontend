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

const ManageSemiFinishedBOMForm = ({ item, onSave, onCancel, loading: isSubmitting, locationId }) => {
    const [formData, setFormData] = useState({
        itemId: '',
        bomName: '',
        isLocked: false,
        details: []
    });

    const [selectData, setSelectData] = useState({
        semiFinishedItems: [],
        rawMaterials: [],
        processes: [],
    });

    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { "Authorization": `Bearer ${token}` };
            const [sfRes, rmRes, pRes] = await Promise.all([
                axios.get(`${API_URL}/production/semi-finished`, { headers }),
                axios.get(`${API_URL}/production/raw-materials`, { headers }),
                axios.get(`${API_URL}/production/processes`, { headers }),
            ]);

            setSelectData({
                semiFinishedItems: sfRes.data.content || [],
                rawMaterials: rmRes.data.content || [],
                processes: pRes.data.content || [],
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
                itemId: item.item?.id || '',
                bomName: item.bomName || '',
                isLocked: !!item.isLocked,
                details: (item.details || []).map(d => ({
                    ...d,
                    componentType: d.rawMaterial ? 'rawMaterial' : 'semiFinished',
                    rawMaterialId: d.rawMaterial?.id || '',
                    childSemiFinishedId: d.childSemiFinished?.id || '',
                    processId: d.process?.id || ''
                }))
            });
        } else {
            setFormData({
                itemId: '', bomName: '', isLocked: false,
                details: [{ componentType: 'rawMaterial', rawMaterialId: '', childSemiFinishedId: '', processId: '', quantity: 1, notes: '', sequence: 1 }]
            });
        }
    }, [item]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleDetailChange = (index, field, value) => {
        const newDetails = [...formData.details];
        newDetails[index][field] = value;

        if (field === 'componentType') {
            newDetails[index].rawMaterialId = '';
            newDetails[index].childSemiFinishedId = '';
        }

        setFormData(prev => ({ ...prev, details: newDetails }));
    };

    const addDetail = () => {
        const nextSequence = formData.details.length > 0 ? Math.max(...formData.details.map(d => d.sequence || 0)) + 1 : 1;
        setFormData(prev => ({
            ...prev,
            details: [...prev.details, { componentType: 'rawMaterial', rawMaterialId: '', childSemiFinishedId: '', processId: '', quantity: 1, notes: '', sequence: nextSequence }]
        }));
    };

    const removeDetail = (index) => {
        setFormData(prev => ({ ...prev, details: prev.details.filter((_, i) => i !== index) }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = {
            ...formData,
            details: formData.details.map(d => ({
                processId: d.processId || null,
                rawMaterialId: d.componentType === 'rawMaterial' ? d.rawMaterialId : null,
                childSemiFinishedId: d.componentType === 'semiFinished' ? d.childSemiFinishedId : null,
                quantity: d.quantity,
                notes: d.notes,
                sequence: d.sequence,
            }))
        };
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
                    <h2 className="text-xl font-semibold text-foreground">{item ? 'Edit' : 'Create'} Bill of Materials</h2>
                </div>
                <div className="flex items-center gap-2">
                    <button type="button" onClick={onCancel} className="btn-secondary" disabled={isSubmitting}>Cancel</button>
                    <button type="submit" form="bom-form" className="btn-primary flex items-center" disabled={isSubmitting}>
                        {isSubmitting ? <Loader className="animate-spin h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />} Save BOM
                    </button>
                </div>
            </header>

            <form id="bom-form" onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 space-y-4">
                <FormSection title="BOM Header">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="label">Semi-Finished Product *</label><select name="itemId" value={formData.itemId} onChange={handleChange} required className="input"><option value="">Select Product</option>{selectData.semiFinishedItems.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}</select></div>
                        <div><label className="label">BOM Name *</label><input name="bomName" value={formData.bomName} onChange={handleChange} required className="input" /></div>
                        <div className="flex items-center gap-2 pt-6"><input type="checkbox" name="isLocked" checked={formData.isLocked} onChange={handleChange} className="h-4 w-4 rounded" /><span>Is Locked</span></div>
                    </div>
                </FormSection>

                <FormSection title="BOM Components">
                    <div className="space-y-3">
                        {formData.details.map((detail, index) => (
                            <div key={index} className="p-4 border rounded-md bg-background-muted space-y-3">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2"><ChevronsUpDown className="h-5 w-5 text-foreground-muted" /><span className="font-semibold">Component #{detail.sequence}</span></div>
                                    <button type="button" onClick={() => removeDetail(index)} className="p-1.5 text-red-500 hover:bg-red-100 rounded-full"><Trash2 size={16} /></button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div><label className="label text-xs">Sequence</label><input type="number" value={detail.sequence} onChange={(e) => handleDetailChange(index, 'sequence', e.target.value)} className="input" /></div>
                                    <div><label className="label text-xs">Component Type</label><select value={detail.componentType} onChange={(e) => handleDetailChange(index, 'componentType', e.target.value)} className="input"><option value="rawMaterial">Raw Material</option><option value="semiFinished">Semi-Finished Good</option></select></div>
                                    <div>
                                        <label className="label text-xs">Component Name</label>
                                        {detail.componentType === 'rawMaterial' ? (
                                            <select value={detail.rawMaterialId} onChange={(e) => handleDetailChange(index, 'rawMaterialId', e.target.value)} className="input"><option value="">Select Raw Material</option>{selectData.rawMaterials.map(rm => <option key={rm.id} value={rm.id}>{rm.name}</option>)}</select>
                                        ) : (
                                            <select value={detail.childSemiFinishedId} onChange={(e) => handleDetailChange(index, 'childSemiFinishedId', e.target.value)} className="input"><option value="">Select Semi-Finished</option>{selectData.semiFinishedItems.map(sf => <option key={sf.id} value={sf.id}>{sf.name}</option>)}</select>
                                        )}
                                    </div>
                                    <div><label className="label text-xs">Process</label><select value={detail.processId} onChange={(e) => handleDetailChange(index, 'processId', e.target.value)} className="input"><option value="">Select Process</option>{selectData.processes.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
                                    <div><label className="label text-xs">Quantity</label><input type="number" step="0.0001" value={detail.quantity} onChange={(e) => handleDetailChange(index, 'quantity', e.target.value)} className="input" /></div>
                                </div>
                                <div><label className="label text-xs">Notes</label><textarea value={detail.notes} onChange={(e) => handleDetailChange(index, 'notes', e.target.value)} className="input" rows="2"></textarea></div>
                            </div>
                        ))}
                        <button type="button" onClick={addDetail} className="btn-secondary w-full"><PlusCircle size={16} className="mr-2" />Add Component</button>
                    </div>
                </FormSection>
            </form>
        </>
    );
};

export default ManageSemiFinishedBOMForm;