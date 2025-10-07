import React from 'react';
import { ShoppingCart, Download } from 'lucide-react';
import { formatPrice, constructImageUrl, formatVariantAttributes } from '../utils';

const ProductCard = ({ product, variant, onAddToCart, onDownloadBarcode }) => {
    const mainAction = () => onAddToCart(product, variant, variant.quantity);

    const isOutOfStock = variant.quantity <= 0;
    return (
        <div className="bg-white rounded-lg shadow-sm text-left flex flex-col relative group">
            <button onClick={(e) => onDownloadBarcode(e, variant.id, variant.sku)} className="absolute top-2 right-2 z-10 p-1.5 bg-white/50 backdrop-blur-sm rounded-full text-slate-600 hover:bg-blue-100 hover:text-blue-700 transition-colors opacity-0 group-hover:opacity-100" title="Download QR Code">
                <Download size={16} />
            </button>
            <button onClick={mainAction} className="p-3 h-full w-full flex flex-col focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg">
                <div className="w-full aspect-square bg-slate-100 rounded-md mb-2 overflow-hidden flex-shrink-0">
                    {variant.imageUrl && !isOutOfStock ? (
                        <img src={constructImageUrl(variant.imageUrl)} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400"><ShoppingCart size={24} /></div>
                    )}
                </div>
                <div className="flex-grow">
                    <p className="font-semibold text-sm text-slate-800" title={product.name}>{product.name}</p>
                    <p className="text-xs text-slate-500">{formatVariantAttributes(variant.attributes)}</p>
                    <p className="text-xs text-slate-500 mt-1 truncate" title={product.description}>
                        {product.description || 'No description'}
                    </p>
                </div>
                <div className="text-xs text-slate-400 mt-1 space-y-0.5">
                    {variant.barcode && <p>Barcode: {variant.barcode}</p>}
                    {variant.taxRate && (
                        <p>Tax: {variant.taxRate.name} ({variant.taxRate.percent}%)</p>
                    )}
                </div>
                <p className="text-xs text-slate-500 mt-1">Quantity: {variant?.quantity}</p>
                {isOutOfStock ? (
                    <p className="text-sm font-bold text-red-600 mt-2">Out of Stock</p>
                ) : (
                    <p className="text-sm font-bold text-blue-600 mt-2">{formatPrice(variant.priceCents)}</p>
                )}
            </button>
        </div>
    );
};

const ProductGrid = ({ products, onAddToCart, onDownloadBarcode }) => (
 <div className="flex-grow overflow-y-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {products.flatMap(product => product.variants.map(variant => (
            <ProductCard key={variant.id} product={product} variant={variant} onAddToCart={onAddToCart} onDownloadBarcode={onDownloadBarcode} />
        )))}
    </div>
);

export default ProductGrid;