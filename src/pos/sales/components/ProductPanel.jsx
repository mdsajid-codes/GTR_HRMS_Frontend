import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import ProductForm from '../../components/ProductForm';

const ProductPanel = ({ isOpen, onClose, onSave, isSubmitting }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 bg-black bg-opacity-60 z-40"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="fixed top-0 right-0 h-full w-full max-w-lg bg-white shadow-2xl z-50 flex flex-col"
                    >
                        <div className="p-4 border-b flex-shrink-0 flex items-center gap-4">
                            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-100"><ArrowLeft size={20} /></button>
                            <h2 className="text-xl font-semibold text-slate-800">Add New Product</h2>
                        </div>
                        <div className="flex-grow overflow-y-auto">
                            <ProductForm onSave={onSave} onCancel={onClose} isSubmitting={isSubmitting} />
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ProductPanel;