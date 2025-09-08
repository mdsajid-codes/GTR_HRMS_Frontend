import React, { useState } from 'react';
import { Sparkles, Building2, Eye, EyeOff, Loader } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import AuthNavbar from '../components/AuthNavbar';
import axios from 'axios';

const Register = () => {
    const [formData, setFormData] = useState({
        tenantId: '',
        companyName: '',
        adminEmail: '',
        adminPassword: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_BASE_URL;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');

        if (formData.adminPassword !== formData.confirmPassword) {
            setError('Passwords do not match.');
            setIsLoading(false);
            return;
        }

        try {
            const { confirmPassword, ...requestData } = formData;
            await axios.post(`${API_URL}/master/tenant-requests/register`, requestData);
            setSuccess('Registration request submitted successfully! You will be notified once approved.');
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            console.error('Registration request failed:', err);
            if (err.response) {
                setError(err.response.data.message || 'Registration failed. The company ID might already be taken.');
            } else if (err.request) {
                setError('No response from server. Please check your network connection.');
            } else {
                setError('Failed to submit registration request. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-slate-50 text-slate-900">
            <AuthNavbar />
            <main className="flex-grow flex items-center justify-center p-4">
                <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg">
                    <div className="text-center">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <Sparkles className="h-8 w-8 text-blue-600" />
                        <h1 className="text-3xl font-bold">Enterprise HRMS</h1>
                    </div>
                    <h2 className="text-2xl font-bold">Create Your Company Account</h2>
                </div>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="companyId" className="block text-sm font-medium text-slate-700">
                            Company ID
                        </label>
                        <input
                            id="companyId"
                            name="tenantId"
                            type="text"
                            required
                            value={formData.tenantId}
                            onChange={handleChange}
                            className="mt-1 appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-600 focus:border-blue-600 sm:text-sm"
                            placeholder="e.g., ACME-CORP"
                        />
                    </div>

                    <div>
                        <label htmlFor="companyName" className="block text-sm font-medium text-slate-700">
                            Company Name
                        </label>
                        <input
                            id="companyName"
                            name="companyName"
                            type="text"
                            required
                            value={formData.companyName}
                            onChange={handleChange}
                            className="mt-1 appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-600 focus:border-blue-600 sm:text-sm"
                            placeholder="e.g., Acme Corporation"
                        />
                    </div>

                    <div>
                        <label htmlFor="adminUsername" className="block text-sm font-medium text-slate-700">
                            Admin Email
                        </label>
                        <input
                            id="adminUsername"
                            name="adminEmail"
                            type="email"
                            autoComplete="email"
                            required
                            value={formData.adminEmail}
                            onChange={handleChange}
                            className="mt-1 appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-600 focus:border-blue-600 sm:text-sm"
                            placeholder="e.g., admin@acme.com"
                        />
                    </div>

                    <div>
                        <label htmlFor="adminPassword" className="block text-sm font-medium text-slate-700">
                            Admin Password
                        </label>
                        <div className="relative mt-1">
                            <input
                                id="adminPassword"
                                name="adminPassword"
                                type={showPassword ? 'text' : 'password'}
                                autoComplete="new-password"
                                required
                                value={formData.adminPassword}
                                onChange={handleChange}
                                className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-600 focus:border-blue-600 sm:text-sm"
                                placeholder="Create a strong password"
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">
                            Confirm Password
                        </label>
                        <div className="relative mt-1">
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type={showConfirmPassword ? 'text' : 'password'}
                                autoComplete="new-password"
                                required
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-600 focus:border-blue-600 sm:text-sm"
                                placeholder="Confirm your password"
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>

                    {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                    {success && <p className="text-sm text-green-600 text-center">{success}</p>}

                    <div className="flex justify-center pt-2">
                        <Button type="submit" className="justify-center" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader className="animate-spin h-5 w-5 mr-3" />
                                    Submitting Request...
                                </>
                            ) : (
                                <>
                                    <Building2 className="h-5 w-5 mr-2" />
                                    Register Company
                                </>
                            )}
                        </Button>
                    </div>
                </form>
                <p className="text-center text-sm text-slate-600">
                    Already have an account?{' '}
                    <Link to="/login" className="font-medium text-blue-600 hover:text-blue-700">
                        Sign in
                    </Link>
                </p>
                </div>
            </main>
        </div>
    );
}

export default Register;
