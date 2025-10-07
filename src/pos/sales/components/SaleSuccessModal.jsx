import React, { useState } from 'react';
import axios from 'axios';
import { CheckCircle, Printer, Loader } from 'lucide-react';
import Modal from '../../components/Modal';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const SaleSuccessModal = ({ sale, onClose }) => {
    const [isPrinting, setIsPrinting] = useState(false);

    const handlePrint = async () => {
        setIsPrinting(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/pos/sales/${sale.id}/invoice/pdf`, {
                headers: { "Authorization": `Bearer ${token}` },
                responseType: 'blob', // Important: we expect a binary file
            });

            const file = new Blob([response.data], { type: 'application/pdf' });
            const fileURL = URL.createObjectURL(file);
            window.open(fileURL, '_blank'); // Open the blob URL in a new tab
        } catch (err) {
            console.error("Error fetching invoice PDF:", err);
            alert("Could not load the invoice. Please try again.");
        } finally {
            setIsPrinting(false);
        }
    };

    return (
        <Modal isOpen={!!sale} onClose={onClose} title="Sale Successful">
            <div className="text-center p-4">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <p className="text-lg">The sale has been completed successfully.</p>
                <div className="mt-6 flex flex-col sm:flex-row justify-center gap-2">
                    <button onClick={handlePrint} className="btn-primary flex items-center justify-center" disabled={isPrinting}>
                        {isPrinting ? <Loader className="animate-spin h-5 w-5 mr-2" /> : <Printer className="mr-2 h-5 w-5" />}
                        {isPrinting ? 'Loading...' : 'Print Invoice'}
                    </button>
                    <button onClick={onClose} className="btn-secondary">New Sale</button>
                </div>
            </div>
        </Modal>
    );
};

export default SaleSuccessModal;