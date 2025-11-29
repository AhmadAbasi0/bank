const API_BASE_URL = window.location.origin;
const SESSION_KEY = 'gamezoneUser';

document.addEventListener('DOMContentLoaded', () => {
    const tabButtons = document.querySelectorAll('.tab-button');
    const forms = document.querySelectorAll('.auth-form');
    const switchButtons = document.querySelectorAll('.switch-button');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const messageBox = document.getElementById('authMessage');
    const visibilityToggles = document.querySelectorAll('.toggle-visibility');
    const resolveEndpoint = (endpoint) => {
        if (!endpoint) {
            return API_BASE_URL;
        }
        if (/^https?:\/\//i.test(endpoint)) {
            return endpoint;
        }
        if (endpoint.startsWith('/')) {
            return `${API_BASE_URL}${endpoint}`;
        }
        return `${API_BASE_URL}/${endpoint}`;
    };

    const showMessage = (type, text) => {
        if (!messageBox) return;
        messageBox.textContent = text;
        messageBox.classList.remove('d-none', 'alert-success', 'alert-danger');
        messageBox.classList.add(type === 'success' ? 'alert-success' : 'alert-danger');
    };

    const clearMessage = () => {
        if (!messageBox) return;
        messageBox.textContent = '';
        messageBox.classList.add('d-none');
        messageBox.classList.remove('alert-success', 'alert-danger');
    };

    const toggleLoading = (form, isLoading) => {
        const button = form.querySelector('.btn-primary');
        if (!button) {
            return;
        }
        if (isLoading) {
            button.classList.add('loading');
            button.setAttribute('disabled', 'disabled');
        } else {
            button.classList.remove('loading');
            button.removeAttribute('disabled');
        }
    };

    const switchTab = (target) => {
        tabButtons.forEach((btn) => {
            btn.classList.toggle('active', btn.dataset.target === target);
        });
        forms.forEach((frm) => {
            frm.classList.toggle('active', frm.id === `${target}Form`);
        });
        clearMessage();
    };

    tabButtons.forEach((button) => {
        button.addEventListener('click', () => {
            switchTab(button.dataset.target);
        });
    });

    switchButtons.forEach((button) => {
        button.addEventListener('click', () => {
            switchTab(button.dataset.target);
        });
    });

    visibilityToggles.forEach((toggle) => {
        toggle.addEventListener('click', () => {
            const input = toggle.previousElementSibling;
            if (!input) {
                return;
            }
            if (input.type === 'password') {
                input.type = 'text';
                toggle.querySelector('i').classList.replace('fa-eye', 'fa-eye-slash');
            } else {
                input.type = 'password';
                toggle.querySelector('i').classList.replace('fa-eye-slash', 'fa-eye');
            }
        });
    });

    const parseJSON = async (response) => {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return response.json();
        }
        return null;
    };

    const persistSession = (userPayload, fallback = {}) => {
        const normalized = {
            id: userPayload?.id ?? userPayload?.userId ?? fallback.id ?? null,
            username: userPayload?.username ?? fallback.username ?? '',
            firstName: userPayload?.firstName ?? userPayload?.first_name ?? fallback.firstName ?? '',
            lastName: userPayload?.lastName ?? userPayload?.last_name ?? fallback.lastName ?? '',
            email: userPayload?.email ?? fallback.email ?? '',
            token: userPayload?.token ?? fallback.token ?? null,
        };
        try {
            window.localStorage.setItem(SESSION_KEY, JSON.stringify(normalized));
        } catch (error) {
            console.error('Failed to persist session:', error);
        }
    };

    const redirectToHome = () => {
        window.location.href = 'index.html';
    };

    const handleFetch = async (endpoint, options) => {
        const response = await fetch(resolveEndpoint(endpoint), options);
        const data = await parseJSON(response);
        if (!response.ok) {
            const errorMessage = data?.message || data?.error || response.statusText || 'Unexpected error';
            throw new Error(errorMessage);
        }
        return data;
    };

    const handleSignup = async (event) => {
        event.preventDefault();
        clearMessage();
        toggleLoading(signupForm, true);

        const formData = new FormData(signupForm);
        const formValues = {
            firstName: formData.get('firstName')?.trim(),
            secondName: formData.get('lastName')?.trim(),
            email: formData.get('email')?.trim(),
            username: formData.get('username')?.trim(),
            password: formData.get('password'),
            gender: formData.get('gender')?.trim(),
        };
        const confirmPassword = formData.get('confirmPassword');

        const requiredFields = ['firstName', 'secondName', 'email', 'username', 'password', 'phoneNumber', 'gender'];
        const missingField = requiredFields.find((field) => {
            const value = field === 'phoneNumber' ? formData.get('phoneNumber')?.trim() : formValues[field];
            return !value || (typeof value === 'string' && value.trim() === '');
        });
        if (missingField) {
            toggleLoading(signupForm, false);
            showMessage('error', 'Please complete all required fields.');
            return;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(formValues.email)) {
            toggleLoading(signupForm, false);
            showMessage('error', 'Please enter a valid email address.');
            return;
        }

        if (!formValues.password || formValues.password.length < 6) {
            toggleLoading(signupForm, false);
            showMessage('error', 'Password must be at least 6 characters long.');
            return;
        }

        if (formValues.password !== confirmPassword) {
            toggleLoading(signupForm, false);
            showMessage('error', 'Passwords do not match.');
            return;
        }

        const phoneNumber = formData.get('phoneNumber')?.trim();
        const userPayload = {
            ...formValues,
            phoneNumber: phoneNumber,
        };

        try {
            const data = await handleFetch('/users/addUser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userPayload),
            });

            persistSession(data, userPayload);
            showMessage('success', 'Account created successfully! Redirecting...');
            setTimeout(() => {
                redirectToHome();
            }, 800);
        } catch (error) {
            console.error('Sign up failed:', error);
            showMessage('error', error.message || 'Unable to create account. Please try again.');
        } finally {
            toggleLoading(signupForm, false);
        }
    };

    const handleLogin = async (event) => {
        event.preventDefault();
        clearMessage();
        toggleLoading(loginForm, true);

        const formData = new FormData(loginForm);
        const payload = {
            username: formData.get('username')?.trim(),
            password: formData.get('password'),
        };

        if (!payload.username || !payload.password) {
            toggleLoading(loginForm, false);
            showMessage('error', 'Please provide both username and password.');
            return;
        }

        try {
            const users = await handleFetch('/users/getAll', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
            });

            if (!Array.isArray(users)) {
                throw new Error('Unexpected response from server.');
            }

            const normalizedUsername = payload.username.toLowerCase();
            const matchedUser = users.find((user) =>
                typeof user.username === 'string' && user.username.toLowerCase() === normalizedUsername
            );

            if (!matchedUser) {
                throw new Error('No account found with that username.');
            }

            if (matchedUser.password !== payload.password) {
                throw new Error('Incorrect password.');
            }

            persistSession(matchedUser, payload);
            showMessage('success', `Welcome back, ${matchedUser.firstName || matchedUser.username}! Redirecting...`);
            setTimeout(() => {
                redirectToHome();
            }, 600);
        } catch (error) {
            console.error('Login failed:', error);
            showMessage('error', error.message || 'Login failed. Please check your credentials.');
        } finally {
            toggleLoading(loginForm, false);
        }
    };

    loginForm?.addEventListener('submit', handleLogin);
    signupForm?.addEventListener('submit', handleSignup);
});
