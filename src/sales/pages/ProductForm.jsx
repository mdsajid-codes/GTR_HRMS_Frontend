import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { ArrowLeft, Save, Loader, Package } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const Input = ({ label, ...props }) => (
    <div>
        <label className="label text-sm">{label}</label>
        <input {...props} className="input" />
    </div>
);

const initialFormData = {
    sku: '', name: '', description: '', uom: '',
    taxRate: 0, unitPrice: 0, status: 'ACTIVE',
    categoryId: '', subCategoryId: ''
};

const ProductForm = ({ onSave, onCancel, loading, product }) => {
    const [formData, setFormData] = useState(initialFormData);
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [loadingDeps, setLoadingDeps] = useState(true);

    const authHeaders = useMemo(() => ({ "Authorization": `Bearer ${localStorage.getItem('token')}` }), []);

    const fetchCategories = useCallback(async () => {
        setLoadingDeps(true);
        try {
            const response = await axios.get(`${API_URL}/production/categories`, { headers: authHeaders });
            setCategories(response.data || []);
        } catch (error) {
            console.error("Failed to fetch categories", error);
        } finally {
            setLoadingDeps(false);
        }
    }, [authHeaders]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    useEffect(() => {
        const fetchSubCategories = async () => {
            if (!formData.categoryId) {
                setSubCategories([]);
                return;
            }
            try {
                const response = await axios.get(`${API_URL}/production/sub-categories?categoryId=${formData.categoryId}`, { headers: authHeaders });
                setSubCategories(response.data || []);
            } catch (err) {
                console.error("Failed to fetch sub-categories", err);
                setSubCategories([]);
            }
        };
        fetchSubCategories();
    }, [formData.categoryId, authHeaders]);

    useEffect(() => {
        if (product) {
            setFormData({
                sku: product.sku || '', name: product.name || '', description: product.description || '',
                uom: product.uom || '', taxRate: product.taxRate || 0, unitPrice: product.unitPrice || 0,
                status: product.status || 'ACTIVE', categoryId: product.categoryId || '', subCategoryId: product.subCategoryId || ''
            });
        } else {
            setFormData(initialFormData);
        }
    }, [product]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="h-full flex flex-col">
            <header className="p-4 border-b flex-shrink-0 flex items-center justify-between bg-card">
                <div className="flex items-center gap-4">
                    <button onClick={onCancel} className="p-1.5 rounded-full hover:bg-background-muted"><ArrowLeft size={20} /></button>
                    <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                        <Package size={20} />
                        {product ? 'Edit Product' : 'Create Product'}
                    </h2>
                </div>
                <div className="flex items-center gap-2">
                    <button type="button" onClick={onCancel} className="btn-secondary" disabled={loading}>Cancel</button>
                    <button type="submit" form="product-form" className="btn-primary flex items-center" disabled={loading}>
                        {loading ? <Loader className="animate-spin h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />} Save Product
                    </button>
                </div>
            </header>
            <form id="product-form" onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 space-y-6 bg-background">
                <div className="p-6 bg-card rounded-lg shadow-sm">
                    <h3 className="text-lg font-semibold border-b pb-2 mb-4">Product Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="SKU (Stock Keeping Unit)" name="sku" value={formData.sku} onChange={handleChange} required />
                        <Input label="Product Name" name="name" value={formData.name} onChange={handleChange} required />
                        <div className="md:col-span-2"><label className="label text-sm">Description</label><textarea name="description" value={formData.description} onChange={handleChange} className="input" rows="2" /></div>
                        <Input label="UOM (Unit of Measure)" name="uom" value={formData.uom} onChange={handleChange} placeholder="e.g., pcs, kg, box" />
                        <Input label="Unit Price" name="unitPrice" type="number" step="0.01" value={formData.unitPrice} onChange={handleChange} required />
                        <Input label="Tax Rate (%)" name="taxRate" type="number" step="0.01" value={formData.taxRate} onChange={handleChange} />
                        <div>
                            <label className="label text-sm">Status</label>
                            <select name="status" value={formData.status} onChange={handleChange} className="input">
                                <option value="ACTIVE">Active</option>
                                <option value="INACTIVE">Inactive</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div className="p-6 bg-card rounded-lg shadow-sm">
                    <h3 className="text-lg font-semibold border-b pb-2 mb-4">Classification</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="label text-sm">Category</label>
                            <select name="categoryId" value={formData.categoryId} onChange={handleChange} className="input" disabled={loadingDeps}>
                                <option value="">{loadingDeps ? 'Loading...' : 'Select Category'}</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="label text-sm">Sub-Category</label>
                            <select name="subCategoryId" value={formData.subCategoryId} onChange={handleChange} className="input" disabled={!formData.categoryId || subCategories.length === 0}>
                                <option value="">Select Sub-Category</option>
                                {subCategories.map(sc => <option key={sc.id} value={sc.id}>{sc.name}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default ProductForm;