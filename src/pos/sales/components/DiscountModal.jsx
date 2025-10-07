import React, { useState } from 'react';
import { X, Percent, CircleDollarSign } from 'lucide-react';

const TABS = ['Percentage', 'Fixed Amount'];

const DiscountModal = ({ isOpen, onClose, onApplyDiscount, subtotal }) => {
    const [activeTab, setActiveTab] = useState(TABS[0]);
    const [percentage, setPercentage] = useState('');
    const [fixedAmount, setFixedAmount] = useState('');

    if (!isOpen) return null;

    const handleApply = () => {
        let discountInCents = 0;
        if (activeTab === 'Percentage' && percentage) {
            discountInCents = Math.round(subtotal * (parseFloat(percentage) / 100));
        } else if (activeTab === 'Fixed Amount' && fixedAmount) {
            // Assuming user enters amount in currency, not cents
            discountInCents = Math.round(parseFloat(fixedAmount) * 100);
        }
        onApplyDiscount(discountInCents);
        onClose();
    };

    const handleRemove = () => {
        onApplyDiscount(0);
        onClose();
    };

    const renderContent = () => {
        if (activeTab === 'Percentage') {
            return (
                <div>
                    <label htmlFor="percentage" className="label">Discount Percentage (%)</label>
                    <input
                        id="percentage"
                        type="number"
                        value={percentage}
                        onChange={(e) => setPercentage(e.target.value)}
                        className="input"
                        placeholder="e.g., 10"
                    />
                </div>
            );
        }
        return (
            <div>
                <label htmlFor="fixedAmount" className="label">Discount Amount</label>
                <input
                    id="fixedAmount"
                    type="number"
                    value={fixedAmount}
                    onChange={(e) => setFixedAmount(e.target.value)}
                    className="input"
                    placeholder="e.g., 5.00"
                />
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="text-xl font-semibold">Apply Discount</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100"><X size={20} /></button>
                </div>
                <div className="border-b border-slate-200 flex-shrink-0">
                    <nav className="flex">
                        {TABS.map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-3 px-1 text-sm font-medium text-center transition-colors ${activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}>
                                {tab === 'Percentage' ? <Percent size={16} className="inline-block mr-2" /> : <CircleDollarSign size={16} className="inline-block mr-2" />}
                                {tab}
                            </button>
                        ))}
                    </nav>
                </div>
                <div className="p-6 space-y-4">{renderContent()}</div>
                <div className="p-4 bg-slate-50 border-t grid grid-cols-2 gap-3">
                    <button onClick={handleRemove} className="btn-danger">Remove Discount</button>
                    <button onClick={handleApply} className="btn-primary">Apply Discount</button>
                </div>
            </div>
        </div>
    );
};

export default DiscountModal;