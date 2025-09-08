import React, { useState } from 'react';
import { LogIn, Sparkles, Eye, EyeOff, Loader } from 'lucide-react';
import Button from '../components/Button';
import AuthNavbar from '../components/AuthNavbar';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [loginData, setLoginData] = useState({
        tenantId:"",
        email: "",
        password:""
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const API_URL = import.meta.env.VITE_API_BASE_URL;

    const handleChange = (e)=>{
        setLoginData({
            ...loginData, [e.target.name]:e.target.value,
        })
    }

    const handleSubmit = async(e)=>{
        e.preventDefault();
        setIsLoading(true);
        setError("");

        if (!API_URL) {
            setError("API URL is not configured. Please check your .env file.");
            setIsLoading(false);
            return;
        }

        try{
            let response;
            
            if(loginData.tenantId.toLowerCase() === "master" || loginData.tenantId === ""){
                response = await axios.post(`${API_URL}/master/auth/login`, {username: loginData.email, password: loginData.password});
                localStorage.setItem('token', response.data.token)
                localStorage.setItem('roles', JSON.stringify(response.data.roles))
                localStorage.setItem('username', loginData.email)
                localStorage.setItem('tenantId', 'master')
                console.log(response.data)
            } else {
                // Assuming a tenant-specific login endpoint
                response = await axios.post(`${API_URL}/auth/login`,loginData );
                localStorage.setItem('token', response.data.token)
                localStorage.setItem('roles', JSON.stringify(response.data.roles))
                localStorage.setItem('username', loginData.email)
                localStorage.setItem('tenantId', loginData.tenantId)
                console.log(response.data)
            }
            
            const rolesString = localStorage.getItem('roles');
            if (rolesString) {
                const roles = JSON.parse(rolesString);
                // Check if the user has TENANT_ADMIN or HR role
                if (roles.includes('TENANT_ADMIN') || roles.includes('HR')) {
                    navigate("/hrdashboard");
                } else if(roles.includes('MASTER_ADMIN')){
                    navigate("/master-admin")
                } else if(roles.includes('EMPLOYEE')){
                    navigate("/employee-dashboard")
                }else {
                    navigate('/'); // Navigate to a default dashboard if not an admin/HR
                }
            } else {
                navigate('/'); // Fallback if no roles are found
            }
        }catch(err){
            console.error("Error during login:", err);
            if (err.response) {
                setError(err.response.data.message || "Invalid credentials or company ID.");
            } else if (err.request) {
                setError("No response from server. Please check your network connection.");
            } else {
                setError("Failed to login. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    }
     

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
                    <h2 className="text-2xl font-bold">Sign in to your account</h2>
                </div>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="companyId" className="block text-sm font-medium text-slate-700">
                            Company ID
                        </label>
                        <div className="mt-1">
                            <input
                                id="companyId"
                                name="tenantId"
                                type="text"
                                value={loginData.tenantId}
                                onChange={handleChange}
                                className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-600 focus:border-blue-600 sm:text-sm"
                                placeholder="Your company ID (or 'master')"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                            Email or Username
                        </label>
                        <div className="mt-1">
                            <input
                                id="email"
                                name="email"
                                type="text"
                                value={loginData.email}
                                onChange={handleChange}
                                autoComplete="username"
                                required
                                className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-600 focus:border-blue-600 sm:text-sm"
                                placeholder="Your email or username"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                            Password
                        </label>
                        <div className="relative mt-1">
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                value={loginData.password}
                                onChange={handleChange}
                                autoComplete="current-password"
                                required
                                className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-600 focus:border-blue-600 sm:text-sm"
                                placeholder="Your password"
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

                    {error && <p className="text-sm text-red-600 text-center">{error}</p>}

                    <div className="flex justify-center pt-2">
                        <Button type="submit" className="justify-center" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader className="animate-spin h-5 w-5 mr-3" />
                                    Signing In...
                                </>
                            ) : (
                                <>
                                    <LogIn className="h-5 w-5 mr-2" />
                                    Sign In
                                </>
                            )}
                        </Button>
                    </div>
                </form>
                <p className="text-center text-sm text-slate-600">
                    Don't have an account?{' '}
                    <Link to="/register" className="font-medium text-blue-600 hover:text-blue-700">
                        Register here
                    </Link>
                </p>
                </div>
            </main>
        </div>
    );
}

export default Login;
