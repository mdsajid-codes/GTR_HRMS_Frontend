import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error("No authentication token found.");
    }
    return { "Authorization": `Bearer ${token}` };
};

const api = axios.create({
    baseURL: API_URL,
});

api.interceptors.request.use(config => {
    try {
        config.headers = {
            ...config.headers,
            ...getAuthHeaders(),
        };
    } catch (error) {
        // Handle cases where token is not available if needed
        console.error(error.message);
    }
    return config;
});

// --- Leave Type Endpoints ---
export const getAllLeaveTypes = () => api.get('/leave-types');
export const createLeaveType = (data) => api.post('/leave-types', data);
export const updateLeaveType = (id, data) => api.put(`/leave-types/${id}`, data);
export const deleteLeaveType = (id) => api.delete(`/leave-types/${id}`);

// --- Leave Policy Endpoints ---
export const getAllLeavePolicies = () => api.get('/leave-policies');
export const createLeavePolicy = (data) => api.post('/leave-policies', data);
export const updateLeavePolicy = (id, data) => api.put(`/leave-policies/${id}`, data);
export const deleteLeavePolicy = (id) => api.delete(`/leave-policies/${id}`);

// --- Leave Allocation Endpoints ---
export const createLeaveAllocation = (data) => api.post('/leave-allocations', data);
export const getAllocationsForEmployee = (employeeCode) => api.get(`/leave-allocations/employee/${employeeCode}`);
export const updateLeaveAllocation = (id, data) => api.put(`/leave-allocations/${id}`, data);
export const deleteLeaveAllocation = (id) => api.delete(`/leave-allocations/${id}`);

// --- Leave Request Endpoints ---
export const createLeaveRequest = (data) => api.post('/leave-requests', data);
export const getAllLeaveRequests = () => api.get('/leave-requests'); // New endpoint for admin/HR
export const getLeaveRequestsForEmployee = (employeeCode) => api.get(`/leave-requests/employee/${employeeCode}`);
export const cancelLeaveRequest = (id) => api.put(`/leave-requests/${id}/cancel`);

// --- Leave Approval Endpoints ---
export const getPendingApprovals = () => api.get('/leave-approvals/pending');
export const processLeaveApproval = (data) => api.post('/leave-approvals/process', data);

// --- Leave Balance Endpoints ---
export const getBalancesForEmployee = (employeeCode) => api.get(`/leave-balances/employee/${employeeCode}`);
export const createOrUpdateBalance = (data) => api.post('/leave-balances', data);
export const deleteBalance = (id) => api.delete(`/leave-balances/${id}`);

// --- Leave Encashment Endpoints ---
export const createEncashmentRequest = (data) => api.post('/leave-encashment-requests', data);
export const getEncashmentRequestsForEmployee = (employeeCode) => api.get(`/leave-encashment-requests/employee/${employeeCode}`);
export const processEncashmentRequest = (data) => api.put('/leave-encashment-requests/process', data);

// --- Other related endpoints that might be needed for forms ---
// Assuming you have these endpoints from other modules
export const getAllJobBands = () => api.get('/job-bands'); // Example endpoint
export const searchEmployees = (term) => api.get(`/employees/search?term=${term}`); // Example endpoint