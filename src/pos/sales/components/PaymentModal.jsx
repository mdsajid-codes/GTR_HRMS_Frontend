import React, { useState } from 'react';
import { CreditCard, DollarSign, Loader } from 'lucide-react';
import Modal from '../../components/Modal';
import { formatPrice } from '../utils';

const PaymentModal = ({ subtotal, tax, total, onProcessSale, onClose, loading }) => {
    const [paymentMethod, setPaymentMethod] = useState('CASH');
    const [amountTendered, setAmountTendered] = useState('');
    const change = amountTendered && paymentMethod === 'CASH' ? parseFloat(amountTendered) - (total / 100) : 0;

    const handleProcess = () => {
        onProcessSale({
            method: paymentMethod,
            // Send the amount tendered if cash, otherwise send the total as the card payment amount.
            // The backend will validate if the amount is sufficient.
            amountCents: paymentMethod === 'CASH' && amountTendered ? parseFloat(amountTendered) * 100 : total,
            reference: paymentMethod === 'CARD' ? 'CARD_TRANSACTION' : null
        });
    };

    return (
        <Modal isOpen={true} onClose={onClose} title="Process Payment">
            <div className="space-y-4">
                <div className="text-center">
                    <p className="text-slate-500">Total Amount Due</p>
                    <p className="text-4xl font-bold">{formatPrice(total)}</p>
                </div>
                <div className="border-t border-dashed pt-2 space-y-1 text-sm">
                    <div className="flex justify-between">
                        <span className="text-slate-600">Subtotal</span>
                        <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-600">Tax</span>
                        <span>{formatPrice(tax)}</span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setPaymentMethod('CASH')} className={`flex-1 btn-secondary flex items-center justify-center gap-2 ${paymentMethod === 'CASH' && 'ring-2 ring-blue-500'}`}><DollarSign size={16} /> Cash</button>
                    <button onClick={() => setPaymentMethod('CARD')} className={`flex-1 btn-secondary flex items-center justify-center gap-2 ${paymentMethod === 'CARD' && 'ring-2 ring-blue-500'}`}><CreditCard size={16} /> Card</button>
                </div>
                {paymentMethod === 'CASH' && (
                    <div>
                        <label className="label">Amount Tendered</label>
                        <input type="number" value={amountTendered} onChange={e => setAmountTendered(e.target.value)} className="input text-center text-lg" placeholder="0.00" />
                    </div>
                )}
                {change > 0 && (
                    <div className="text-center bg-blue-50 p-3 rounded-lg">
                        <p className="text-slate-500">Change Due</p>
                        <p className="text-2xl font-bold text-blue-600">{formatPrice(change * 100)}</p>
                    </div>
                )}
                <button onClick={handleProcess} disabled={loading} className="w-full btn-primary flex items-center justify-center">
                    {loading && <Loader className="animate-spin h-5 w-5 mr-2" />}
                    Confirm Sale
                </button>
            </div>
        </Modal>
    );
};

export default PaymentModal;