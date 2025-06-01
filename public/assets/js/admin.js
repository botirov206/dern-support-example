// Admin API endpoints
const API_URL = '/api';

// Fetch admin dashboard data
async function getAdminDashboardData() {
    try {
        const response = await fetchWithAuth(`${API_URL}/admin/dashboard`);
        if (!response.ok) throw new Error('Failed to fetch dashboard data');
        return await response.json();
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        showAdminError('Could not load dashboard overview. ');
        throw error;
    }
}

// Fetch support requests with pagination and filters
async function getRequests(page = 1, limit = 10, filters = {}) {
    try {
        const queryParams = new URLSearchParams({
            page,
            limit,
            ...filters
        });
        const response = await fetchWithAuth(`${API_URL}/admin/requests?${queryParams}`);
        if (!response.ok) throw new Error('Failed to fetch requests');
        return await response.json();
    } catch (error) {
        console.error('Error fetching requests:', error);
        showAdminError('Could not load support requests.');
        throw error;
    }
}

// Update support request
async function updateRequest(requestId, data) {
    try {
        const response = await fetchWithAuth(`${API_URL}/admin/requests/${requestId}`, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Failed to update request' }));
            throw new Error(errorData.message);
        }
        return await response.json();
    } catch (error) {
        console.error('Error updating request:', error);
        showAdminError(`Error updating request: ${error.message}`);
        throw error;
    }
}

// Fetch users with pagination and filters
async function getUsers(page = 1, limit = 10, filters = {}) {
    try {
        const queryParams = new URLSearchParams({
            page,
            limit,
            ...filters
        });
        const response = await fetchWithAuth(`${API_URL}/admin/users?${queryParams}`);
        if (!response.ok) throw new Error('Failed to fetch users');
        return await response.json();
    } catch (error) {
        console.error('Error fetching users:', error);
        showAdminError('Could not load users.');
        throw error;
    }
}

// Update user status or role
async function updateUser(userId, data) {
    try {
        const response = await fetchWithAuth(`${API_URL}/admin/users/${userId}`, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Failed to update user' }));
            throw new Error(errorData.message);
        }
        return await response.json();
    } catch (error) {
        console.error('Error updating user:', error);
        showAdminError(`Error updating user: ${error.message}`);
        throw error;
    }
}

// Fetch system metrics
async function getSystemMetrics() {
    try {
        const response = await fetchWithAuth(`${API_URL}/admin/metrics`);
        if (!response.ok) throw new Error('Failed to fetch metrics');
        return await response.json();
    } catch (error) {
        console.error('Error fetching metrics:', error);
        showAdminError('Could not load system metrics.');
        throw error;
    }
}

// Fetch articles for admin management
async function getArticles(filters = {}) {
    try {
        const queryParams = new URLSearchParams(filters);
        const response = await fetchWithAuth(`${API_URL}/admin/articles?${queryParams}`);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Failed to fetch articles' }));
            throw new Error(errorData.message);
        }
        const data = await response.json();
        return data.articles;
    } catch (error) {
        console.error('Error fetching articles for admin:', error);
        showAdminError('Could not load articles.', error.message);
        throw error;
    }
}

// Fetch admin users (for assignment dropdown)
async function getAdminUsers() {
    try {
        // Assuming the getUsers function can filter by role, or we create a specific endpoint
        const data = await getUsers(1, 1000, { role: 'admin' }); // Fetch up to 1000 admins
        return data.users || [];
    } catch (error) {
        console.error('Error fetching admin users:', error);
        showAdminError('Could not load admin users for assignment.');
        return []; // Return empty array on error
    }
}

// Helper function to display errors on admin pages
// Ensures a consistent way to show errors, can be expanded (e.g., to use a modal or specific div)
function showAdminError(message, details = '') {
    console.error('Admin Error:', message, details);
    // Simple alert for now, can be replaced with a more sophisticated UI element
    alert(`Error: ${message} ${details ? details : ''}`);
}

// Helper function to format dates
function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Helper function to format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount || 0);
}

// Helper function to format status badges
function getStatusBadgeClasses(status) {
    const baseClasses = 'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full';
    switch (status) {
        case 'completed':
            return `${baseClasses} bg-green-100 text-green-800`;
        case 'in-progress':
            return `${baseClasses} bg-blue-100 text-blue-800`;
        case 'pending':
            return `${baseClasses} bg-yellow-100 text-yellow-800`;
        case 'cancelled':
            return `${baseClasses} bg-red-100 text-red-800`;
        default:
            return `${baseClasses} bg-gray-100 text-gray-800`;
    }
}

// Helper function to format urgency badges
function getUrgencyBadgeClasses(urgency) {
    const baseClasses = 'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full';
    switch (urgency) {
        case 'high':
            return `${baseClasses} bg-red-100 text-red-800`;
        case 'medium':
            return `${baseClasses} bg-yellow-100 text-yellow-800`;
        case 'low':
            return `${baseClasses} bg-green-100 text-green-800`;
        default:
            return `${baseClasses} bg-gray-100 text-gray-800`;
    }
}

// Helper function to format account type badges
function getAccountTypeBadgeClasses(accountType) {
    const baseClasses = 'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full';
    switch (accountType) {
        case 'business':
            return `${baseClasses} bg-purple-100 text-purple-800`;
        case 'individual':
            return `${baseClasses} bg-blue-100 text-blue-800`;
        default:
            return `${baseClasses} bg-gray-100 text-gray-800`;
    }
}

// Export functions for use in admin pages
window.getAdminDashboardData = getAdminDashboardData;
window.getRequests = getRequests;
window.updateRequest = updateRequest;
window.getUsers = getUsers;
window.updateUser = updateUser;
window.getSystemMetrics = getSystemMetrics;
window.getArticles = getArticles;
window.formatDate = formatDate;
window.formatCurrency = formatCurrency;
window.getStatusBadgeClasses = getStatusBadgeClasses;
window.getUrgencyBadgeClasses = getUrgencyBadgeClasses;
window.getAccountTypeBadgeClasses = getAccountTypeBadgeClasses;
window.showAdminError = showAdminError;
window.getAdminUsers = getAdminUsers; 