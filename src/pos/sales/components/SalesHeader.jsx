import React from 'react';
import { Search, ScanLine, Tag, Store, User, UserPlus, PlusCircle } from 'lucide-react';

const SalesHeader = ({
    searchTerm, onSearchTermChange,
    barcode, onBarcodeChange, onBarcodeScan,
    selectedCategory, onCategoryChange, categories,
    selectedStore, onStoreChange, stores,
    selectedCustomer, onCustomerChange, customers,
    onAddCustomer, onAddProduct
}) => {
    return (
        <div className="mb-4 flex gap-4">
            <div className="relative flex-grow">
                <input type="text" placeholder="Search products..." value={searchTerm} onChange={e => onSearchTermChange(e.target.value)} className="input w-full pl-10" />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            </div>
            <div className="relative">
                <input
                    type="text"
                    placeholder="Scan barcode..."
                    value={barcode}
                    onChange={e => onBarcodeChange(e.target.value)}
                    onKeyDown={onBarcodeScan}
                    className="input w-64 pl-10" />
                <ScanLine className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            </div>
            <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <select value={selectedCategory} onChange={e => onCategoryChange(e.target.value)} className="input pl-10 appearance-none">
                    <option value="All">All Categories</option>
                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    <option value="Uncategorized">Uncategorized</option>
                </select>
            </div>
            <div className="relative">
                <Store className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <select value={selectedStore} onChange={e => onStoreChange(e.target.value)} className="input pl-10 appearance-none" required>
                    <option value="" disabled>Select a Store</option>
                    {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
            </div>
            <div className="relative flex items-center gap-2">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <select value={selectedCustomer} onChange={e => onCustomerChange(e.target.value)} className="input pl-10 appearance-none w-48">
                    <option value="">Walk-in Customer</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <button onClick={onAddCustomer} className="p-2 btn-secondary" title="Add New Customer">
                    <UserPlus size={16} />
                </button>
            </div>
            <div>
                <button onClick={onAddProduct} className="btn-primary h-full flex items-center gap-2"><PlusCircle size={16} /> Add Product</button>
            </div>
        </div>
    );
};

export default SalesHeader;