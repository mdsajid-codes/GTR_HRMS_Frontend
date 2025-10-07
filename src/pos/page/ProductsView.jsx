import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { Search, PlusCircle, Edit, Trash2, Loader, X, Package, Save, ArrowLeft, UploadCloud, Image, Download, Barcode } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import BulkAddProductsModal from '../components/BulkAddProductsModal';
import ProductForm from '../components/ProductForm';
import BulkImageUploadModal from '../components/BulkImageUploadModal';

const API_URL = import.meta.env.VITE_API_BASE_URL;

// --- Auth Hook for POS Roles ---
const usePosAuth = () => {
    const roles = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem('roles') || '[]');
        } catch { return []; }
    }, []);

    const isSuperAdmin = roles.includes('SUPER_ADMIN');
    const isPosAdmin = roles.includes('POS_ADMIN') || isSuperAdmin;
    const canManage = roles.includes('POS_MANAGER') || isPosAdmin;

    return { isPosAdmin, canManage };
};

const formatPrice = (cents) => `AED ${(cents / 100).toFixed(2)}`;

const constructImageUrl = (relativeUrl) => {
    if (!relativeUrl || relativeUrl.startsWith('data:') || relativeUrl.startsWith('http')) {
        return relativeUrl;
    }
    // Assuming URL is like /uploads/{tenantId}/{subfolder}/{filename}
    // And we need to convert it to /api/files/view/{tenantId}/{subfolder}/{filename}
    const pathParts = relativeUrl.split('/').filter(p => p);
    if (pathParts[0] === 'uploads' && pathParts.length >= 4) {
        return `${API_URL}/pos/uploads/view/${pathParts.slice(1).join('/')}`;
    }
    return `${API_URL}${relativeUrl}`;
};

// --- Barcode Modal ---
const BarcodeModal = ({ isOpen, onClose, variant }) => {
    if (!isOpen || !variant) return null;

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = constructImageUrl(variant.barcodeImageUrl);
        link.download = `qr-${variant.sku}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm text-center" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-semibold mb-4">QR Code for {variant.sku}</h3>
                <img src={constructImageUrl(variant.barcodeImageUrl)} alt={`QR Code for ${variant.sku}`} className="mx-auto border rounded-md" />
                <button onClick={handleDownload} className="btn-primary mt-6 w-full flex items-center justify-center gap-2"><Download size={16} /> Download</button>
            </div>
        </div>
    );
};

const ProductsView = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [isBulkImageModalOpen, setIsBulkImageModalOpen] = useState(false);
    const [barcodeModalVariant, setBarcodeModalVariant] = useState(null);


    const { isPosAdmin, canManage } = usePosAuth();

    const fetchProducts = useCallback(() => {
        setLoading(true);
        const token = localStorage.getItem('token');
        axios.get(`${API_URL}/pos/products`, { headers: { "Authorization": `Bearer ${token}` } })
            .then(res => setProducts(res.data))
            .catch(() => setError('Failed to fetch products.'))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { fetchProducts(); }, [fetchProducts]);

    const handleAdd = () => { setSelectedProduct(null); setIsPanelOpen(true); };
    const handleEdit = (product) => { setSelectedProduct(product); setIsPanelOpen(true); };
    const handleClosePanel = () => { setIsPanelOpen(false); setSelectedProduct(null); };

    const handleSave = async (productData) => {
        setIsSubmitting(true);
        const token = localStorage.getItem('token');
        const method = productData.id ? 'put' : 'post';
        const url = productData.id ? `${API_URL}/pos/products/${productData.id}` : `${API_URL}/pos/products`;

        try {
            // The backend seems to expect JSON, not FormData, for creating/updating products.
            // We only use FormData for the image upload itself.
            const payload = {
                ...productData,
                // We don't need to send the local imageFile to the product endpoint
                variants: productData.variants.map(({ imageFile, ...variant }) => variant),
            };

            await axios[method](url, payload, {
                headers: { "Authorization": `Bearer ${token}` }
            });

            alert(`Product ${productData.id ? 'updated' : 'saved'} successfully!`);
            handleClosePanel();
            fetchProducts();
        } catch (err) {
            alert(`Error: ${err.response?.data?.message || 'Could not save product.'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (productId) => {
        if (window.confirm('Are you sure you want to delete this product and all its variants?')) {
            const token = localStorage.getItem('token');
            try {
                await axios.delete(`${API_URL}/pos/products/${productId}`, { headers: { "Authorization": `Bearer ${token}` } });
                fetchProducts();
            } catch (err) {
                alert('Failed to delete product.');
            }
        }
    };

    const filteredProducts = useMemo(() =>
        products.filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.sku || '').toLowerCase().includes(searchTerm.toLowerCase())
        ), [products, searchTerm]);

    const handleGenerateBarcode = (variant) => {
        setBarcodeModalVariant(variant);
    };

    return (
        <div className="p-6 md:p-8 h-full flex flex-col">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Products</h1>
                    <p className="text-slate-500 mt-1">Manage your product catalog and variants.</p>
                </div>
                {canManage && (
                    <div className="flex gap-2">
                        <button onClick={() => setIsBulkModalOpen(true)} className="btn-secondary flex items-center gap-2">
                            <UploadCloud size={18} /> Bulk Add Products
                        </button>
                        <button onClick={() => setIsBulkImageModalOpen(true)} className="btn-secondary flex items-center gap-2">
                            <UploadCloud size={18} /> Bulk Image Add
                        </button>
                        <button onClick={handleAdd} className="btn-primary flex items-center gap-2">
                            <PlusCircle size={18} /> Add Product
                        </button>
                    </div>
                )}
            </div>

            <div className="relative mb-4">
                <input type="text" placeholder="Search by name or SKU..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="input w-full max-w-sm pl-10" />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden flex-grow">
                <div className="overflow-x-auto h-full">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50 sticky top-0">
                            <tr>
                                <th className="th-cell">Name</th><th className="th-cell">SKU</th><th className="th-cell">Status</th><th className="th-cell text-center">Variants</th>
                                {canManage && <th className="th-cell">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="text-slate-700">
                            {loading ? (
                                <tr><td colSpan={canManage ? 5 : 4} className="text-center py-10"><Loader className="h-8 w-8 animate-spin text-blue-600 mx-auto" /></td></tr>
                            ) : error ? (
                                <tr><td colSpan={canManage ? 5 : 4} className="text-center py-10 text-red-500">{error}</td></tr>
                            ) : filteredProducts.length > 0 ? (
                                filteredProducts.map(product => (
                                    <tr key={product.id} className="border-b border-slate-200 hover:bg-slate-50">
                                        <td className="td-cell font-medium">{product.name}</td>
                                        <td className="td-cell text-sm text-slate-500">{product.sku || '-'}</td>
                                        <td className="td-cell">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${product.active ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}`}>
                                                {product.active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="td-cell text-center">{product.variants?.length || 0}</td>
                                        {canManage && (
                                            <td className="td-cell">
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => handleEdit(product)} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-full" title="Edit"><Edit size={16} /></button>
                                                    {isPosAdmin && <button onClick={() => handleDelete(product.id)} className="p-1.5 text-red-600 hover:bg-red-100 rounded-full" title="Delete"><Trash2 size={16} /></button>}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={canManage ? 5 : 4} className="text-center py-10 text-slate-500">
                                    <Package className="mx-auto h-12 w-12 text-slate-400" />
                                    <h3 className="mt-2 text-sm font-semibold text-slate-900">No products found</h3>
                                    <p className="mt-1 text-sm text-slate-500">Get started by adding a new product.</p>
                                </td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Side Panel for Add/Edit */}
            <AnimatePresence>
                {isPanelOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="fixed inset-0 bg-black bg-opacity-60 z-40"
                            onClick={handleClosePanel}
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="fixed top-0 right-0 h-full w-full max-w-lg bg-white shadow-2xl z-50 flex flex-col"
                        >
                            <div className="p-4 border-b flex-shrink-0 flex items-center gap-4">
                                <button onClick={handleClosePanel} className="p-1.5 rounded-full hover:bg-slate-100">
                                    <ArrowLeft size={20} />
                                </button>
                                <h2 className="text-xl font-semibold text-slate-800">
                                    {selectedProduct ? 'Edit Product' : 'Add New Product'}
                                </h2>
                            </div>
                            <ProductForm
                                product={selectedProduct}
                                onSave={handleSave}
                                onCancel={handleClosePanel}
                                isSubmitting={isSubmitting}
                                onGenerateBarcode={handleGenerateBarcode}
                            />
                            <div className="p-4 border-t bg-slate-50 flex-shrink-0 flex justify-end sticky gap-2 bottom-0 z-50">
                                <button type="button" onClick={handleClosePanel} className="btn-secondary" disabled={isSubmitting}>Cancel</button>
                                <button id="product-form-submit-button" type="submit" form="product-form" className="btn-primary flex items-center gap-2 w-36 justify-center" disabled={isSubmitting}> {isSubmitting && <Loader className="animate-spin h-4 w-4" />} <Save size={16} /> Save Product </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <BulkAddProductsModal
                isOpen={isBulkModalOpen}
                onClose={() => setIsBulkModalOpen(false)}
                onUploadSuccess={() => {
                    fetchProducts(); // Refresh product list on successful upload
                }}
            />

            <BulkImageUploadModal
                isOpen={isBulkImageModalOpen}
                onClose={() => setIsBulkImageModalOpen(false)}
            />

            <BarcodeModal
                isOpen={!!barcodeModalVariant}
                onClose={() => setBarcodeModalVariant(null)}
                variant={barcodeModalVariant}
            />
        </div>
    );
}

export default ProductsView;
