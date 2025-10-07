import React from 'react';
import { ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';
import { formatPrice, formatVariantAttributes } from '../utils'; // Assuming formatPrice is defined here

const Cart = ({ cart, onUpdateQuantity, onRemoveItem, onClearCart, onDiscountChange, discountCents, onOpenLookup, onOpenDiscountModal, onOpenBillModal }) => {
    const subtotal = cart.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);
    // Frontend tax calculation is an estimate. Backend is the source of truth.
    const tax = cart.reduce((sum, item) => {
        const itemTotal = item.priceCents * item.quantity;
        return sum + (item.taxRate ? Math.round(itemTotal * (item.taxRate.percent / 100)) : 0);
    }, 0);

    return (
        <div className="bg-white h-full flex flex-col">
            <div className="p-4 border-b">
                <h2 className="text-lg font-bold flex items-center gap-2"><ShoppingCart size={20} /> Cart</h2>
            </div>
            <div className="flex-grow overflow-y-auto p-4 space-y-3">
                {cart.length === 0 ? (
                    <p className="text-slate-500 text-center mt-8">Your cart is empty.</p>
                ) : (
                    cart.map(item => {
                        const itemTaxCents = item.taxRate ? Math.round(item.priceCents * item.quantity * (item.taxRate.percent / 100)) : 0;
                        return (
                            <div key={item.productVariantId} className="flex items-center gap-3">
                                <div className="flex-grow">
                                    <p className="font-medium text-sm leading-tight">{item.productName}</p>
                                    {item.attributes && Object.keys(item.attributes).length > 0 && (
                                        <p className="text-xs text-slate-500">{formatVariantAttributes(item.attributes)}</p>
                                    )}
                                    <div className="flex gap-2 items-baseline">
                                        <p className="text-xs text-slate-500">{formatPrice(item.priceCents)} each</p>
                                        <p className="text-xs text-slate-500">• Qty {item.quantity}</p>
                                        {item.taxRate ? (
                                            <p className="text-xs text-slate-500">• {item.taxRate.name} {item.taxRate.percent}%</p>
                                        ) : (
                                            <p className="text-xs text-slate-500">• No tax</p>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-500">Item tax: {formatPrice(itemTaxCents)}</p>
                                </div>
                                <div className="flex items-center gap-1.5 border rounded-md">
                                    <button onClick={() => onUpdateQuantity(item.productVariantId, -1)} className="px-2 py-1 text-slate-500 hover:bg-slate-100"><Minus size={12} /></button>
                                    <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                                    <button onClick={() => onUpdateQuantity(item.productVariantId, 1)} className="px-2 py-1 text-slate-500 hover:bg-slate-100"><Plus size={12} /></button>
                                </div>
                                <button onClick={() => onRemoveItem(item.productVariantId)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                            </div>
                        );
                    })
                )}
            </div>
            <div className="p-4 border-t bg-slate-50 space-y-2">
                <div className="flex justify-between text-sm"><span className="text-slate-600">Subtotal</span><span className="font-medium">{formatPrice(subtotal)}</span></div>
                <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Tax (estimated)</span>
                    <span className="font-medium">{formatPrice(tax)}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Delivery Charge</span>
                    <span className="font-medium">AED 0</span>
                </div>
                {discountCents > 0 && (
                    <div className="flex justify-between text-sm text-green-600 pt-2 border-t border-slate-200">
                        <span className="font-medium">Discount Applied</span>
                        <span className="font-medium">-{formatPrice(discountCents)}</span>
                    </div>
                )}

                
                <div className="grid grid-cols-2 gap-2 mt-2">
                    <button onClick={onOpenLookup} className="btn-secondary">Lookup</button>
                    <button onClick={onOpenDiscountModal} className="btn-secondary">Discounts</button>
                    <button onClick={onOpenBillModal} disabled={cart.length === 0} className="btn-primary">Bill</button>
                    <button onClick={onClearCart} disabled={cart.length === 0} className="w-full btn-secondary mt-2">
                    Clear Cart
                </button>
                </div>
                
            </div>
        </div>
    );
};

export default Cart;