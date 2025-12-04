import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Save, Loader2, Image as ImageIcon } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const CrmSalesProductForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = !!id;

    const [product, setProduct] = useState({
        itemType: 'PRODUCT',
        isPurchase: false,
        isSales: true,
        itemCode: '',
        name: '',
        description: '',
        unitOfMeasure: '',
        reorderLimit: '',
        vatClassificationCode: '',
        purchasePrice: '',
        salesPrice: '',
        tax: '',
        taxRate: '',
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const getImageUrl = (path) => {
        if (!path) return null;
        return `${API_URL}/crm/sales-products/images/${path}`;
    };

    const fetchProduct = useCallback(async () => {
        if (!isEditing) return;
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/crm/sales-products/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            const data = response.data;
            // Set form state, ensuring nulls become empty strings for controlled inputs
            setProduct({
                itemType: data.itemType || 'PRODUCT',
                isPurchase: data.purchase || false,
                isSales: data.sales || true,
                itemCode: data.itemCode || '',
                name: data.name || '',
                description: data.description || '',
                unitOfMeasure: data.unitOfMeasure || '',
                reorderLimit: data.reorderLimit || '',
                vatClassificationCode: data.vatClassificationCode || '',
                purchasePrice: data.purchasePrice || '',
                salesPrice: data.salesPrice || '',
                tax: data.tax || '',
                taxRate: data.taxRate || '',
            });
            if (data.imageUrl) {
                setImagePreview(getImageUrl(data.imageUrl));
            }
        } catch (err) {
            setError('Failed to fetch product details.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [id, isEditing]);

    useEffect(() => {
        fetchProduct();
    }, [fetchProduct]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setProduct(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    // Function to handle cancel/close action
    const handleCancel = () => {
        navigate('/crm-dashboard/products'); // Navigate back to the product list
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData();

        // Create a copy of the product data to send
        const productData = { ...product };
        // Ensure empty strings for prices are sent as null so the backend can handle them
        if (productData.purchasePrice === '') productData.purchasePrice = null;
        if (productData.salesPrice === '') productData.salesPrice = null;

        formData.append('product', new Blob([JSON.stringify(productData)], { type: 'application/json' }));

        if (imageFile) {
            formData.append('image', imageFile);
        }

        try {
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            };

            if (isEditing) {
                await axios.put(`${API_URL}/crm/sales-products/${id}`, formData, config);
            } else {
                await axios.post(`${API_URL}/crm/sales-products`, formData, config);
            }
            navigate('/crm-dashboard/products'); // Navigate back to list on success
        } catch (err) {
            setError(err.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} product.`);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-slate-50">
            <header className="bg-white shadow-sm p-4 border-b border-slate-200 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <button onClick={handleCancel} className="p-2 rounded-full hover:bg-slate-100">
                        <ArrowLeft className="h-5 w-5 text-slate-600" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">
                            {isEditing ? 'Edit Product' : 'Add New Product'}
                        </h1>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button type="button" onClick={handleCancel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">
                        Cancel
                    </button>
                    <button type="submit" form="product-form" disabled={loading} className="ml-3 inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 disabled:bg-blue-300">
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        {isEditing ? 'Save Changes' : 'Create Product'}
                    </button>
                </div>
            </header>

            <main className="flex-grow overflow-y-auto">
                <form id="product-form" onSubmit={handleSubmit} className="p-6 space-y-6">
                    {loading && !product.name && isEditing && (
                        <div className="flex justify-center items-center py-16"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>
                    )}

                    {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md">{error}</div>}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Image Upload */}
                        <div className="md:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                <div className="space-y-1 text-center">
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Product Preview" className="mx-auto h-24 w-24 object-cover rounded-md" />
                                    ) : (
                                        <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                                    )}
                                    <div className="flex text-sm text-gray-600">
                                        <label htmlFor="image-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                                            <span>Upload a file</span>
                                            <input id="image-upload" name="image" type="file" className="sr-only" onChange={handleImageChange} accept="image/*" />
                                        </label>
                                        <p className="pl-1">or drag and drop</p>
                                    </div>
                                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                                </div>
                            </div>
                        </div>

                        {/* Basic Info */}
                        <div className="md:col-span-2 space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Product Name *</label>
                                <input type="text" name="name" id="name" value={product.name} onChange={handleChange} required className="mt-1 block w-full rounded-lg border border-slate-300 bg-slate-50 py-2 px-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1" />
                            </div>
                            <div>
                                <label htmlFor="itemCode" className="block text-sm font-medium text-gray-700">Item Code</label>
                                <input type="text" name="itemCode" id="itemCode" value={product.itemCode} onChange={handleChange} className="mt-1 block w-full rounded-lg border border-slate-300 bg-slate-50 py-2 px-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1" />
                            </div>
                             <div>
                                <label htmlFor="itemType" className="block text-sm font-medium text-gray-700">Item Type</label>
                                <select id="itemType" name="itemType" value={product.itemType} onChange={handleChange} className="mt-1 block w-full rounded-lg border border-slate-300 bg-slate-50 py-2 px-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1">
                                    <option value="PRODUCT">Product</option>
                                    <option value="SERVICE">Service</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea id="description" name="description" rows="3" value={product.description} onChange={handleChange} className="mt-1 block w-full rounded-lg border border-slate-300 bg-slate-50 py-2 px-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"></textarea>
                    </div>

                    <div className="flex items-center space-x-8">
                        <div className="relative flex items-start">
                            <div className="flex h-5 items-center">
                                <input id="isPurchase" name="isPurchase" type="checkbox" checked={product.isPurchase} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                            </div>
                            <div className="ml-3 text-sm">
                                <label htmlFor="isPurchase" className="font-medium text-gray-700">Purchase Item</label>
                            </div>
                        </div>
                         <div className="relative flex items-start">
                            <div className="flex h-5 items-center">
                                <input id="isSales" name="isSales" type="checkbox" checked={product.isSales} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                            </div>
                            <div className="ml-3 text-sm">
                                <label htmlFor="isSales" className="font-medium text-gray-700">Sales Item</label>
                            </div>
                        </div>
                    </div>

                    {/* Pricing Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="purchasePrice" className="block text-sm font-medium text-gray-700">Purchase Price (₹)</label>
                            <input type="number" name="purchasePrice" id="purchasePrice" value={product.purchasePrice} onChange={handleChange} className="mt-1 block w-full rounded-lg border border-slate-300 bg-slate-50 py-2 px-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1" />
                        </div>
                        <div>
                            <label htmlFor="salesPrice" className="block text-sm font-medium text-gray-700">Sales Price (₹)</label>
                            <input type="number" name="salesPrice" id="salesPrice" value={product.salesPrice} onChange={handleChange} className="mt-1 block w-full rounded-lg border border-slate-300 bg-slate-50 py-2 px-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1" />
                        </div>
                    </div>

                    {/* Inventory & Other Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="unitOfMeasure" className="block text-sm font-medium text-gray-700">Unit of Measure</label>
                            <input type="text" name="unitOfMeasure" id="unitOfMeasure" value={product.unitOfMeasure} onChange={handleChange} className="mt-1 block w-full rounded-lg border border-slate-300 bg-slate-50 py-2 px-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1" placeholder="e.g., pcs, kg, ltr" />
                        </div>
                        <div>
                            <label htmlFor="reorderLimit" className="block text-sm font-medium text-gray-700">Reorder Limit</label>
                            <input type="number" name="reorderLimit" id="reorderLimit" value={product.reorderLimit} onChange={handleChange} className="mt-1 block w-full rounded-lg border border-slate-300 bg-slate-50 py-2 px-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1" />
                        </div>
                    </div>

                    {/* Tax Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                         <div>
                            <label htmlFor="tax" className="block text-sm font-medium text-gray-700">Tax</label>
                            <input type="text" name="tax" id="tax" value={product.tax} onChange={handleChange} className="mt-1 block w-full rounded-lg border border-slate-300 bg-slate-50 py-2 px-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1" placeholder="e.g., GST, VAT" />
                        </div>
                        <div>
                            <label htmlFor="taxRate" className="block text-sm font-medium text-gray-700">Tax Rate (%)</label>
                            <input type="number" name="taxRate" id="taxRate" value={product.taxRate} onChange={handleChange} className="mt-1 block w-full rounded-lg border border-slate-300 bg-slate-50 py-2 px-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1" placeholder="e.g., 18" />
                        </div>
                        <div>
                            <label htmlFor="vatClassificationCode" className="block text-sm font-medium text-gray-700">VAT/GST Code</label>
                            <input type="text" name="vatClassificationCode" id="vatClassificationCode" value={product.vatClassificationCode} onChange={handleChange} className="mt-1 block w-full rounded-lg border border-slate-300 bg-slate-50 py-2 px-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1" placeholder="HSN/SAC Code" />
                        </div>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default CrmSalesProductForm;