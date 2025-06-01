// DOM Elements
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const loginModal = document.getElementById('loginModal');
const signupModal = document.getElementById('signupModal');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const getStartedBtn = document.getElementById('getStartedBtn');

// API URLs
const API_URL = 'http://localhost:3001/api';

// Auth token management
let authToken = localStorage.getItem('authToken');
let currentUser = JSON.parse(localStorage.getItem('currentUser'));

// Update UI based on auth state
function updateAuthUI() {
    if (authToken && currentUser) {
        if (loginBtn) {
            loginBtn.innerHTML = '<i class="fas fa-sign-out-alt mr-2"></i>Logout';
        }
        if (signupBtn) {
            signupBtn.style.display = 'none';
        }
    } else {
        if (loginBtn) {
            loginBtn.innerHTML = '<i class="fas fa-sign-in-alt mr-2"></i>Login';
        }
        if (signupBtn) {
            signupBtn.style.display = 'block';
        }
    }
}

// Modal management
function showModal(modal) {
    if (modal) {
        modal.classList.remove('hidden');
    }
}

function hideModal(modal) {
    if (modal) {
        modal.classList.add('hidden');
    }
}

function hideLoginModal() {
    hideModal(loginModal);
}

function hideSignupModal() {
    hideModal(signupModal);
}

// Event Listeners
if (loginBtn) {
    loginBtn.addEventListener('click', () => {
        if (authToken) {
            // Logout
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
            authToken = null;
            currentUser = null;
            updateAuthUI();
            window.location.href = '/';
        } else {
            showModal(loginModal);
        }
    });
}

if (signupBtn) {
    signupBtn.addEventListener('click', () => {
        showModal(signupModal);
    });
}

if (getStartedBtn) {
    getStartedBtn.addEventListener('click', () => {
        if (authToken) {
            window.location.href = '/support';
        } else {
            showModal(loginModal);
        }
    });
}

// Close modals when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === loginModal) hideModal(loginModal);
    if (e.target === signupModal) hideModal(signupModal);
});

// Form submissions
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(loginForm);
        const data = {
            email: formData.get('email'),
            password: formData.get('password')
        };

        try {
            const response = await fetch(`${API_URL}/users/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || result.errors?.[0]?.msg || 'Login failed');
            }

            authToken = result.token;
            currentUser = result.user;
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            hideModal(loginModal);
            updateAuthUI();
            
            // Clear form
            loginForm.reset();

            // Redirect based on current page
            if (window.location.pathname === '/') {
                window.location.href = '/support';
            } else {
                window.location.reload();
            }
        } catch (error) {
            alert(error.message);
        }
    });
}

if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(signupForm);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            password: formData.get('password'),
            accountType: formData.get('accountType'),
            address: formData.get('address')
        };

        try {
            const response = await fetch(`${API_URL}/users/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || result.errors?.[0]?.msg || 'Registration failed');
            }

            authToken = result.token;
            currentUser = result.user;
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            hideModal(signupModal);
            updateAuthUI();
            
            // Clear form
            signupForm.reset();

            // Show success message and redirect
            alert('Registration successful! Welcome to Dern-Support.');
            window.location.href = '/support';
        } catch (error) {
            alert(error.message);
        }
    });
}

// Initialize UI
updateAuthUI();

// API helper functions
async function fetchWithAuth(url, options = {}) {
    if (!authToken) {
        throw new Error('Authentication required');
    }

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
        ...options.headers
    };

    const response = await fetch(url, {
        ...options,
        headers
    });

    if (response.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        window.location.href = '/';
        throw new Error('Session expired');
    }

    return response;
}

// Support request functions
async function createSupportRequest(data) {
    try {
        const response = await fetchWithAuth(`${API_URL}/requests`, {
            method: 'POST',
            body: JSON.stringify(data)
        });

        return await response.json();
    } catch (error) {
        throw new Error(error.message);
    }
}

async function getUserRequests() {
    try {
        const response = await fetchWithAuth(`${API_URL}/requests`);
        return await response.json();
    } catch (error) {
        throw new Error(error.message);
    }
}

// Knowledge base functions
async function getArticles(search = '', category = '', tag = '') {
    try {
        const params = new URLSearchParams({ search, category, tag }).toString();
        const response = await fetch(`${API_URL}/articles?${params}`);
        return await response.json();
    } catch (error) {
        throw new Error(error.message);
    }
}

async function getArticle(id) {
    try {
        const response = await fetch(`${API_URL}/articles/${id}`);
        return await response.json();
    } catch (error) {
        throw new Error(error.message);
    }
} 