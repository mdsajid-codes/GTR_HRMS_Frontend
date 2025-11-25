import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { ArrowLeft, Loader, Save } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const FormSection = ({ title, children }) => (
  <div className="pt-4">
    <h4 className="text-md font-semibold text-foreground-muted border-b border-border pb-2 mb-4">{title}</h4>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
  </div>
);

const SemiFinishedFormPage = ({ item, onSave, onCancel, loading: isSubmitting, locationId }) => {
  const [formData, setFormData] = useState({
    itemCode: '', name: '', description: '',
    categoryId: '', subCategoryId: '', issueUnitId: '', purchaseUnitId: '', taxId: '',
    locationId: locationId !== 'all' ? locationId : '',
    inventoryType: 'SEMI_FINISHED_GOOD', itemType: 'PRODUCT',
    forPurchase: true, forSales: true, isRoll: false, isScrapItem: false, isTaxInclusive: false,
    purchasePrice: 0, salesPrice: 0, reorderLimit: 0, unitRelation: 1, wastagePercentage: 0,
    picturePath: '',
  });

  const [selectData, setSelectData] = useState({
    categories: [], subCategories: [], units: [], taxes: [], locations: []
  });

  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { "Authorization": `Bearer ${token}` };
      const [catRes, unitRes, taxRes, locRes] = await Promise.all([
        axios.get(`${API_URL}/production/categories`, { headers }),
        axios.get(`${API_URL}/production/units`, { headers }),
        axios.get(`${API_URL}/production/taxes`, { headers }),
        axios.get(`${API_URL}/locations`, { headers }),
      ]);

      setSelectData(prev => ({
        ...prev,
        categories: catRes.data || [],
        units: unitRes.data || [],
        taxes: taxRes.data || [],
        locations: locRes.data || [],
        subCategories: prev.subCategories || []
      }));
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
    const fetchSubCategories = async () => {
      if (!formData.categoryId) {
        setSelectData(prev => ({ ...prev, subCategories: [] }));
        return;
      }
      try {
        const token = localStorage.getItem('token');
        const headers = { "Authorization": `Bearer ${token}` };
        const response = await axios.get(`${API_URL}/production/sub-categories?categoryId=${formData.categoryId}`, { headers });
        setSelectData(prev => ({ ...prev, subCategories: response.data || [] }));
      } catch (err) {
        console.error("Failed to fetch sub-categories", err);
        setSelectData(prev => ({ ...prev, subCategories: [] }));
      }
    };
    fetchSubCategories();
  }, [formData.categoryId]);

  useEffect(() => {
    if (item) {
      setFormData({
        itemCode: item.itemCode ?? '',
        name: item.name ?? '',
        description: item.description ?? '',
        categoryId: item.categoryId != null ? String(item.categoryId) : '',
        subCategoryId: item.subCategoryId != null ? String(item.subCategoryId) : '',
        issueUnitId: item.issueUnitId != null ? String(item.issueUnitId) : '',
        purchaseUnitId: item.purchaseUnitId != null ? String(item.purchaseUnitId) : '',
        taxId: item.taxId != null ? String(item.taxId) : '',
        locationId: item.locationId != null ? String(item.locationId) : (locationId !== 'all' ? locationId : ''),
        inventoryType: item.inventoryType ?? 'SEMI_FINISHED_GOOD',
        itemType: item.itemType ?? 'PRODUCT',
        forPurchase: !!item.forPurchase,
        forSales: !!item.forSales,
        isRoll: !!item.isRoll,
        isScrapItem: !!item.isScrapItem,
        isTaxInclusive: !!item.isTaxInclusive,
        purchasePrice: item.purchasePrice ?? 0,
        salesPrice: item.salesPrice ?? 0,
        reorderLimit: item.reorderLimit ?? 0,
        unitRelation: item.unitRelation ?? 1,
        wastagePercentage: item.wastagePercentage ?? 0,
        picturePath: item.picturePath ?? '',
      });
    }
  }, [item, locationId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      locationId: formData.locationId || null,
      categoryId: formData.categoryId || null,
      subCategoryId: formData.subCategoryId || null,
      taxId: formData.taxId || null,
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
          <h2 className="text-xl font-semibold text-foreground">{item ? 'Edit' : 'Add New'} Semi-Finished Product</h2>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={onCancel} className="btn-secondary" disabled={isSubmitting}>Cancel</button>
          <button type="submit" form="semi-finished-form" className="btn-primary flex items-center" disabled={isSubmitting}>
            {isSubmitting ? <Loader className="animate-spin h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />} Save
          </button>
        </div>
      </header>

      <form id="semi-finished-form" onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 space-y-4">
        <FormSection title="Basic Information">
          <div><label className="label">Item Code *</label><input name="itemCode" value={formData.itemCode} onChange={handleChange} required className="input" /></div>
          <div><label className="label">Name *</label><input name="name" value={formData.name} onChange={handleChange} required className="input" /></div>
          <div className="md:col-span-2"><label className="label">Description</label><textarea name="description" value={formData.description} onChange={handleChange} className="input" rows="2"></textarea></div>
        </FormSection>

        <FormSection title="Classification">
          <div>
            <label className="label">Category</label>
            <select name="categoryId" value={formData.categoryId} onChange={handleChange} className="input">
              <option value="">Select Category</option>
              {(selectData.categories || []).map(c => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Sub-Category</label>
            <select name="subCategoryId" value={formData.subCategoryId} onChange={handleChange} className="input" disabled={!formData.categoryId}>
              <option value="">Select Sub-Category</option>
              {(selectData.subCategories || []).map(sc => <option key={sc.id} value={String(sc.id)}>{sc.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Inventory Type</label>
            <select name="inventoryType" value={formData.inventoryType} onChange={handleChange} className="input">
              <option value="SEMI_FINISHED_GOOD">Semi-Finished Good</option>
              <option value="RAW_MATERIAL">Raw Material</option>
              <option value="FINISHED_GOOD">Finished Good</option>
              <option value="SERVICE">Service</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div>
            <label className="label">Item Type</label>
            <select name="itemType" value={formData.itemType} onChange={handleChange} className="input">
              <option value="PRODUCT">Product</option>
              <option value="SERVICE">Service</option>
            </select>
          </div>
          <div>
            <label className="label">Location</label>
            <select name="locationId" value={formData.locationId} onChange={handleChange} className="input">
              <option value="">All Locations</option>
              {(selectData.locations || []).map(l => <option key={l.id} value={String(l.id)}>{l.name}</option>)}
            </select>
          </div>
        </FormSection>

        <FormSection title="Units & Pricing">
          <div>
            <label className="label">Issue Unit</label>
            <select name="issueUnitId" value={formData.issueUnitId} onChange={handleChange} className="input">
              <option value="">Select Unit</option>
              {(selectData.units || []).map(u => <option key={u.id} value={String(u.id)}>{u.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Purchase Unit</label>
            <select name="purchaseUnitId" value={formData.purchaseUnitId} onChange={handleChange} className="input">
              <option value="">Select Unit</option>
              {(selectData.units || []).map(u => <option key={u.id} value={String(u.id)}>{u.name}</option>)}
            </select>
          </div>
          <div><label className="label">Unit Relation</label><input name="unitRelation" type="number" value={formData.unitRelation} onChange={handleChange} className="input" /></div>
          <div><label className="label">Purchase Price</label><input name="purchasePrice" type="number" step="0.01" value={formData.purchasePrice} onChange={handleChange} className="input" /></div>
          <div><label className="label">Sales Price</label><input name="salesPrice" type="number" step="0.01" value={formData.salesPrice} onChange={handleChange} className="input" /></div>
          <div>
            <label className="label">Tax</label>
            <select name="taxId" value={formData.taxId} onChange={handleChange} className="input">
              <option value="">No Tax</option>
              {(selectData.taxes || []).map(t => <option key={t.id} value={String(t.id)}>{t.code} ({t.rate}%)</option>)}
            </select>
          </div>
        </FormSection>

        <FormSection title="Inventory & Flags">
          <div><label className="label">Wastage %</label><input name="wastagePercentage" type="number" value={formData.wastagePercentage} onChange={handleChange} className="input" /></div>
          <div><label className="label">Reorder Limit</label><input name="reorderLimit" type="number" value={formData.reorderLimit} onChange={handleChange} className="input" /></div>
          <div className="md:col-span-2 flex items-center flex-wrap gap-x-6 gap-y-2 pt-4">
            <label className="flex items-center gap-2"><input type="checkbox" name="forPurchase" checked={formData.forPurchase} onChange={handleChange} className="h-4 w-4 rounded" /><span>For Purchase</span></label>
            <label className="flex items-center gap-2"><input type="checkbox" name="forSales" checked={formData.forSales} onChange={handleChange} className="h-4 w-4 rounded" /><span>For Sales</span></label>
            <label className="flex items-center gap-2"><input type="checkbox" name="isRoll" checked={formData.isRoll} onChange={handleChange} className="h-4 w-4 rounded" /><span>Is Roll</span></label>
            <label className="flex items-center gap-2"><input type="checkbox" name="isScrapItem" checked={formData.isScrapItem} onChange={handleChange} className="h-4 w-4 rounded" /><span>Is Scrap Item</span></label>
            <label className="flex items-center gap-2"><input type="checkbox" name="isTaxInclusive" checked={formData.isTaxInclusive} onChange={handleChange} className="h-4 w-4 rounded" /><span>Tax Inclusive</span></label>
          </div>
        </FormSection>
      </form>
    </>
  );
};

export default SemiFinishedFormPage;