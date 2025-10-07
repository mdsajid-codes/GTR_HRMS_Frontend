import React, { useState } from 'react';
import { X, Loader, UploadCloud, Image, CheckCircle, AlertCircle, Download } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const BulkImageUploadModal = ({ isOpen, onClose }) => {
    const [files, setFiles] = useState(null);
    const [loading, setLoading] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [error, setError] = useState('');
    const [downloadError, setDownloadError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleFileChange = (e) => {
        setFiles(e.target.files);
        setError('');
        setSuccessMessage('');
    };

    const handleDownloadSample = async () => {
        setDownloading(true);
        setDownloadError('');
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/pos/uploads/download-sample-text`, {
                headers: { "Authorization": `Bearer ${token}` },
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'sample.txt');
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

        } catch (err) {
            console.error("Error downloading sample file:", err);
            setDownloadError("Failed to download sample file. Please try again.");
        } finally {
            setDownloading(false);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!files || files.length === 0) {
            setError('Please select one or more image files to upload.');
            return;
        }

        setLoading(true);
        setError('');
        setSuccessMessage('');

        const formData = new FormData();
        Array.from(files).forEach(file => {
            formData.append('files', file);
        });

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_URL}/pos/uploads/product-image/bulk`, formData, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
                responseType: 'blob', // Expect a file download
            });

            // Handle file download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'uploaded_image_urls.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            setSuccessMessage(`Successfully uploaded ${files.length} image(s). A CSV file with the image URLs has been downloaded.`);
            setFiles(null); // Reset file input
        } catch (err) {
            console.error("Error uploading bulk images:", err);
            // Since responseType is blob, we need to parse the error differently if it's a JSON error
            const errorMessage = err.response?.data ?
                (await err.response.data.text()).replace(/"/g, '') : 'Failed to upload files. Please try again.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Bulk Image Upload</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100"><X className="h-5 w-5" /></button>
                </div>
                <form onSubmit={handleUpload}>
                    <div className="p-6 space-y-4">
                        <div className="flex justify-between items-start">
                            <p className="text-sm text-slate-600 max-w-prose">
                                Select multiple product images to upload. The images can be assigned to products later by referencing their filenames in the product or bulk upload sheets.
                            </p>
                            <button
                                type="button"
                                onClick={handleDownloadSample}
                                className="btn-secondary flex items-center gap-2 text-xs"
                                disabled={downloading}
                            >
                                {downloading ? <Loader className="animate-spin h-4 w-4" /> : <Download className="h-4 w-4" />} Sample
                            </button>
                        </div>
                        {downloadError && <p className="text-xs text-red-600">{downloadError}</p>}
                        <input id="bulk-image-upload" type="file" onChange={handleFileChange} accept="image/*" multiple className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                        
                        {error && <div className="bg-red-100 text-red-700 p-3 rounded-md text-sm flex items-center gap-2"><AlertCircle size={16} />{error}</div>}
                        
                        {successMessage && (
                            <div className="bg-green-50 border border-green-200 p-3 rounded-md text-sm">
                                <p className="font-semibold text-green-800 flex items-center gap-2"><CheckCircle size={16} />{successMessage}</p>
                            </div>
                        )}
                    </div>
                    <div className="p-4 border-t bg-slate-50 flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>Close</button>
                        <button type="submit" className="btn-primary flex items-center" disabled={loading || !files}>{loading ? <Loader className="animate-spin h-4 w-4 mr-2" /> : <UploadCloud className="h-4 w-4 mr-2" />} Upload</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BulkImageUploadModal;