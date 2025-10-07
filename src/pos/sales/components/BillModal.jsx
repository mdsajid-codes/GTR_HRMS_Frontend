import React, { useState, useEffect } from 'react';
import { X, User, Printer, CreditCard, DollarSign, Loader, ParkingSquare } from 'lucide-react';
import { formatPrice, formatVariantAttributes } from '../utils';

const BillModal = ({
    isOpen,
    onClose,
    cart,
    customer,
    subtotal,
    tax,
    discountCents,
    total,
    onProcessSale,
    onOpenDiscountModal,
    onParkSale,
    loading
}) => {
    const [orderId, setOrderId] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('CASH');
    const [receivedAmount, setReceivedAmount] = useState('');

    useEffect(() => {
        if (isOpen) {
            // Generate a random order ID when the modal opens
            setOrderId(`ORD-${Date.now().toString().slice(-6)}`);
            // Reset payment fields
            setReceivedAmount('');
        }
    }, [isOpen]);

    const balanceAmount = total;
    const changeAmount = receivedAmount ? (parseFloat(receivedAmount) * 100) - total : 0;

    const handlePay = () => {
        if (loading) return;
        onProcessSale(orderId, {
            method: paymentMethod,
            amountCents: paymentMethod === 'CASH' && receivedAmount ? parseFloat(receivedAmount) * 100 : total,
            reference: paymentMethod === 'CARD' ? 'CARD_TRANSACTION' : null
        });
    };

    const handlePrintOrder = () => {
        window.print();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div id="bill-modal-content" className="bg-white rounded-lg shadow-xl w-full max-w-4xl flex max-h-[90vh]" onClick={e => e.stopPropagation()}>
                {/* Left Side: Sale Summary */}
                <div className="w-3/5 flex flex-col border-r border-slate-200">
                    <div className="p-4 border-b">
                        <h3 className="text-xl font-semibold">Sale Summary</h3>
                        <div className="flex justify-between items-center text-sm text-slate-500 mt-1">
                            <span>Order ID: <span className="font-medium text-slate-700">{orderId}</span></span>
                            <div className="flex items-center gap-2">
                                <User size={14} />
                                <span>{customer?.name || 'Walk-in Customer'}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex-grow overflow-y-auto p-4 space-y-2">
                        {cart.map(item => (
                            <div key={item.productVariantId} className="flex justify-between items-center text-sm">
                                <div>
                                    <p className="font-medium">{item.productName}</p>
                                    <p className="text-xs text-slate-500">{formatVariantAttributes(item.attributes)}</p>
                                </div>
                                <div className="text-right">
                                    <p>{item.quantity} x {formatPrice(item.priceCents)}</p>
                                    <p className="font-semibold">{formatPrice(item.quantity * item.priceCents)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="p-4 border-t bg-slate-50 space-y-1 text-sm">
                        <div className="flex justify-between"><span className="text-slate-600">Subtotal</span><span className="font-medium">{formatPrice(subtotal)}</span></div>
                        {discountCents > 0 && <div className="flex justify-between text-green-600"><span className="font-medium">Discount</span><span className="font-medium">-{formatPrice(discountCents)}</span></div>}
                        <div className="flex justify-between"><span className="text-slate-600">Delivery Charge</span><span>AED 0.00</span></div>
                        <div className="flex justify-between"><span className="text-slate-600">Tax (estimated)</span><span>{formatPrice(tax)}</span></div>
                        <div className="flex justify-between text-lg font-bold pt-2 border-t mt-2"><span >Total</span><span>{formatPrice(total)}</span></div>
                    </div>
                    <div className="p-4 border-t grid grid-cols-4 gap-2">
                        <button className="btn-secondary text-sm" onClick={onClose}>Close</button>
                        <button className="btn-secondary text-sm" onClick={onOpenDiscountModal}>Discount</button>                        
                        <button onClick={handlePrintOrder} className="btn-secondary text-sm flex items-center justify-center gap-2">
                            <Printer size={14} /> Print Order
                        </button>
                        <button onClick={() => onParkSale(orderId)} className="btn-primary text-sm flex items-center justify-center gap-2" disabled={loading}>
                            <ParkingSquare size={14} /> Park Sale
                        </button>
                    </div>
                </div>

                {/* Right Side: Payment */}
                <div className="w-2/5 flex flex-col bg-slate-50">
                    <div className="p-4 border-b border-slate-200 flex justify-end">
                        <button className="btn-secondary text-sm" onClick={() => alert('New Sale clicked')}>New Sale</button>
                    </div>
                    <div className="p-6 space-y-4 flex-grow">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="label">Paid Amount</label>
                                <p className="input-display">{formatPrice(receivedAmount ? parseFloat(receivedAmount) * 100 : 0)}</p>
                            </div>
                            <div>
                                <label className="label">Balance Amount</label>
                                <p className="input-display font-bold text-blue-600">{formatPrice(balanceAmount)}</p>
                            </div>
                        </div>
                        <div>
                            <label className="label">Received Amount</label>
                            <input
                                type="number"
                                value={receivedAmount}
                                onChange={e => setReceivedAmount(e.target.value)}
                                className="input text-lg text-center"
                                placeholder="0.00"
                                disabled={paymentMethod !== 'CASH'}
                            />
                        </div>
                        <div>
                            <label className="label">Change Amount</label>
                            <p className="input-display font-bold text-green-600">{formatPrice(changeAmount > 0 ? changeAmount : 0)}</p>
                        </div>

                        <div className="pt-4">
                            <label className="label">Mode of Payment</label>
                            <div className="flex gap-2 mt-1">
                                <button onClick={() => setPaymentMethod('CASH')} className={`flex-1 btn-secondary flex items-center justify-center gap-2 ${paymentMethod === 'CASH' && 'ring-2 ring-blue-500'}`}>
                                    <DollarSign size={16} /> Cash
                                </button>
                                <button onClick={() => setPaymentMethod('CARD')} className={`flex-1 btn-secondary flex items-center justify-center gap-2 ${paymentMethod === 'CARD' && 'ring-2 ring-blue-500'}`}>
                                    <CreditCard size={16} /> Card
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="p-4">
                        <button onClick={handlePay} className="w-full btn-primary text-lg" disabled={loading}>
                            {loading ? <Loader className="animate-spin h-5 w-5 mr-2" /> : null}
                            Pay
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BillModal;