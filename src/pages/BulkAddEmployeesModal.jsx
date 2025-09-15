import React, { useState } from 'react';
import { X, Loader, UploadCloud } from 'lucide-react';
import axios from 'axios';

const BulkAddEmployeesModal = ({ isOpen, onClose }) => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const API_URL = import.meta.env.VITE_API_BASE_URL;

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setError('');
        setSuccess('');
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) {
            setError('Please select a file to upload.');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_URL}/employees/bulkEmployees`, formData, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "multipart/form-data"
                }
            });
            setSuccess(response.data);
            setFile(null); // Reset file input
        } catch (err) {
            console.error("Error uploading bulk employees:", err);
            const errorMessage = err.response?.data || 'Failed to upload file. Please check the file format and content.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Bulk Add Employees</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <form onSubmit={handleUpload}>
                    <div className="p-6 space-y-4">
                        <p className="text-sm text-slate-600">
                            Upload an Excel file (.xlsx, .xls) with employee data. The file must have the correct columns in the specified order.
                        </p>
                        <div>
                            <label htmlFor="bulk-upload-file" className="block text-sm font-medium text-slate-700 mb-1">Excel File</label>
                            <input
                                id="bulk-upload-file"
                                type="file"
                                onChange={handleFileChange}
                                accept=".xlsx, .xls"
                                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                        </div>
                        {error && <div className="bg-red-100 text-red-700 p-3 rounded-md text-sm whitespace-pre-wrap">{error}</div>}
                        {success && <div className="bg-green-100 text-green-700 p-3 rounded-md text-sm">{success}</div>}
                    </div>
                    <div className="p-4 border-t bg-slate-50 flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>Close</button>
                        <button type="submit" className="btn-primary flex items-center" disabled={loading || !file}>{loading ? <Loader className="animate-spin h-4 w-4 mr-2" /> : <UploadCloud className="h-4 w-4 mr-2" />} Upload</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BulkAddEmployeesModal;