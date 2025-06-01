const API_URL = '/api'; // Added API_URL

// Authentication functions
async function login(email, password) {
    try {
        const response = await fetch('/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        
        if (!response.ok) {
            if (data.errors) {
                const errorMessages = data.errors.map(err => err.message || err.msg).join('\n');
                throw new Error(errorMessages);
            }
            throw new Error(data.message || 'Login failed');
        }

        // Store auth data
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('currentUser', JSON.stringify(data.user));

        // Redirect based on user role
        if (data.user.role === 'admin') {
            window.location.href = '/admin';
        } else {
            window.location.href = '/dashboard';
        }
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}

async function register(formData) {
    try {
        const response = await fetch('/api/users/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (!response.ok) {
            if (data.errors) {
                const errorMessages = data.errors.map(err => 
                    `${err.field ? err.field + ': ' : ''}${err.message || err.msg}`
                ).join('\n');
                throw new Error(errorMessages);
            }
            throw new Error(data.message || 'Registration failed');
        }

        // Store auth data
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('currentUser', JSON.stringify(data.user));

        // Redirect to dashboard
        window.location.href = '/dashboard';
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
}

function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    window.location.href = '/';
}

// Check if user is authenticated
function isAuthenticated() {
    return !!localStorage.getItem('authToken');
}

// Get current user data
function getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
}

// Fetch with authentication
async function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem('authToken');
    if (!token) {
        throw new Error('No authentication token found');
    }

    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    };

    const response = await fetch(url, { 
        ...defaultOptions, 
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    });

    if (response.status === 401) {
        // Token expired or invalid
        logout();
        throw new Error('Session expired. Please login again.');
    }

    return response;
}

// Get user requests
async function getUserRequests() {
    try {
        const response = await fetchWithAuth('/api/requests');
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Failed to fetch requests' }));
            throw new Error(errorData.message);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching requests:', error);
        throw error;
    }
}

// Create a new support request
async function createSupportRequest(requestData) {
    try {
        const response = await fetchWithAuth('/api/requests', {
            method: 'POST',
            body: JSON.stringify(requestData)
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Failed to create support request' }));
            throw new Error(errorData.message || (errorData.errors ? errorData.errors.map(e => e.msg).join(', ') : 'Request creation failed'));
        }
        return await response.json();
    } catch (error) {
        console.error('Error creating support request:', error);
        throw error;
    }
}

// Initialize protected pages
function initProtectedPage(isAdminPage = false) {
    if (!isAuthenticated()) {
        const target = isAdminPage ? '/?error=admin_auth_required' : '/?error=auth_required';
        window.location.href = target;
        return false;
    }

    const currentUser = getCurrentUser();
    if (!currentUser) {
        logout();
        return false;
    }

    // If it's an admin page, check the role
    if (isAdminPage && currentUser.role !== 'admin') {
        alert('Access Denied: You do not have permission to view this page.');
        window.location.href = '/dashboard';
        return false;
    }

    // Update UI with user info
    const userNameElements = document.querySelectorAll('.user-name');
    userNameElements.forEach(el => {
        el.textContent = currentUser.name;
    });

    const userEmailElements = document.querySelectorAll('.user-email');
    userEmailElements.forEach(el => {
        el.textContent = currentUser.email;
    });

    const userTypeElements = document.querySelectorAll('.user-type');
    userTypeElements.forEach(el => {
        el.textContent = currentUser.accountType;
    });

    return true;
}

// Document ready handler
document.addEventListener('DOMContentLoaded', () => {
    // Check if this is a protected page
    const isProtectedPage = window.location.pathname.includes('/dashboard') || 
                           window.location.pathname.includes('/admin');
    
    if (isProtectedPage) {
        initProtectedPage();
    }

    // Handle logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }

    // Show/hide login modal
    const loginBtn = document.getElementById('loginBtn');
    const loginModal = document.getElementById('loginModal');
    if (loginBtn && loginModal) {
        loginBtn.addEventListener('click', () => {
            loginModal.classList.remove('hidden');
        });
    }

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.classList.add('hidden');
        }
    });
});

// Knowledge base functions (Added)
async function getArticles(search = '', category = '', tag = '') {
    try {
        const params = new URLSearchParams({ search, category, tag }).toString();
        const response = await fetch(`${API_URL}/articles?${params}`);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Failed to fetch articles' }));
            throw new Error(errorData.message);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching articles:', error);
        throw error; // Re-throw to be caught by caller
    }
}

async function getArticle(id) {
    try {
        const response = await fetch(`${API_URL}/articles/${id}`);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Failed to fetch article' }));
            throw new Error(errorData.message);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching article:', error);
        throw error; // Re-throw to be caught by caller
    }
} 