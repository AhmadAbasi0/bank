const API_BASE_URL = window.location.origin;
const SESSION_KEY = 'gamezoneUser';

document.addEventListener('DOMContentLoaded', () => {
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const hamburgerMenuDropdown = document.getElementById('hamburgerMenuDropdown');
    const closeMenu = document.getElementById('closeMenu');
    const logoutBtn = document.getElementById('logoutBtn');
    const logoutBtnMain = document.getElementById('logoutBtnMain');

    // Toggle hamburger menu
    if (hamburgerMenu) {
        hamburgerMenu.addEventListener('click', () => {
            hamburgerMenu.classList.toggle('active');
            hamburgerMenuDropdown.classList.toggle('active');
        });
    }

    // Close menu button
    if (closeMenu) {
        closeMenu.addEventListener('click', () => {
            hamburgerMenu.classList.remove('active');
            hamburgerMenuDropdown.classList.remove('active');
        });
    }

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (hamburgerMenuDropdown && hamburgerMenuDropdown.classList.contains('active')) {
            if (!hamburgerMenuDropdown.contains(e.target) && !hamburgerMenu?.contains(e.target)) {
                hamburgerMenu?.classList.remove('active');
                hamburgerMenuDropdown.classList.remove('active');
            }
        }
    });

    // Close menu when clicking on a link
    const menuLinks = document.querySelectorAll('.menu-item a');
    menuLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburgerMenu?.classList.remove('active');
            hamburgerMenuDropdown?.classList.remove('active');
        });
    });

    // Load user data from database
    const loadUserData = async () => {
        try {
            const userSession = JSON.parse(localStorage.getItem(SESSION_KEY));
            if (!userSession || !userSession.username) {
                window.location.href = 'auth.html';
                return;
            }

            // Fetch user data from database
            const response = await fetch(`${API_BASE_URL}/user/findByUsername/${encodeURIComponent(userSession.username)}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch user data');
            }

            const userData = await response.json();
            
            if (!userData) {
                throw new Error('User not found');
            }

            // Debug: Log the received data
            console.log('User data from database:', userData);
            console.log('Account data:', userData.account);

            // Get account data
            const account = userData.account || {};
            
            // Debug: Log account values
            console.log('Balance from DB:', account.balance);
            console.log('Points from DB:', account.points);
            console.log('Debt from DB:', account.deptSum);
            console.log('Account ID from DB:', account.id);
            
            // Populate profile header
            const fullName = `${userData.firstName || ''} ${userData.secondName || ''}`.trim();
            document.getElementById('profileName').textContent = fullName || userData.username || 'User';

            // Populate account details cards - using actual database values
            document.getElementById('accountName').textContent = account.accountName || userData.username || '--';
            // Ensure balance is from database - use the actual value
            const balance = account.balance !== null && account.balance !== undefined ? parseFloat(account.balance) : 0;
            document.getElementById('accountBalance').textContent = `$${balance.toFixed(2)}`;
            
            const points = account.points !== null && account.points !== undefined ? account.points : 0;
            document.getElementById('accountPoints').textContent = points.toString();
            
            // Display debt with minus sign
            const debt = account.deptSum !== null && account.deptSum !== undefined ? account.deptSum : 0;
            document.getElementById('accountDebt').textContent = `-$${parseFloat(debt).toFixed(2)}`;

            // Populate profile information
            document.getElementById('profileEmail').textContent = userData.email || '--';
            document.getElementById('profileUsername').textContent = userData.username || '--';
            document.getElementById('profileFirstName').textContent = userData.firstName || '--';
            document.getElementById('profileLastName').textContent = userData.secondName || '--';
            document.getElementById('profilePhone').textContent = userData.phoneNumber || '--';
            
            // Display account ID
            const accountId = account.id !== null && account.id !== undefined ? account.id : '--';
            document.getElementById('profileAccountId').textContent = accountId.toString();
            
            // Show admin menu item if account id = 1
            const adminMenuItem = document.getElementById('adminMenuItem');
            if (adminMenuItem && account.id === 1) {
                adminMenuItem.style.display = 'block';
            } else if (adminMenuItem) {
                adminMenuItem.style.display = 'none';
            }
            
            // Set gender and apply theme
            const gender = userData.gender || 'male';
            const genderSelect = document.getElementById('profileGender');
            if (genderSelect) {
                genderSelect.value = gender;
            }
            
            // Apply theme based on gender
            applyGenderTheme(gender);
        } catch (error) {
            console.error('Error loading user data:', error);
            alert('Failed to load profile data. Please try again.');
            // Optionally redirect to auth if session is invalid
            // window.location.href = 'auth.html';
        }
    };

    // Apply theme based on gender
    const applyGenderTheme = (gender) => {
        const root = document.documentElement;
        if (gender === 'female') {
            // Pink theme for female
            root.style.setProperty('--primary-color', '#ec4899');
            root.style.setProperty('--primary-dark', '#be185d');
            root.style.setProperty('--primary-light', '#f472b6');
        } else {
            // Blue theme for male (default)
            root.style.setProperty('--primary-color', '#1e40af');
            root.style.setProperty('--primary-dark', '#1e3a8a');
            root.style.setProperty('--primary-light', '#3b82f6');
        }
    };

    // Update gender
    const updateGender = async () => {
        try {
            const userSession = JSON.parse(localStorage.getItem(SESSION_KEY));
            if (!userSession || !userSession.username) {
                alert('Session expired. Please login again.');
                window.location.href = 'auth.html';
                return;
            }

            const genderSelect = document.getElementById('profileGender');
            const newGender = genderSelect.value;

            const response = await fetch(`${API_BASE_URL}/user/updateGender/${encodeURIComponent(userSession.username)}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ gender: newGender }),
            });

            if (!response.ok) {
                throw new Error('Failed to update gender');
            }

            const updatedUser = await response.json();
            
            // Apply new theme
            applyGenderTheme(newGender);
            
            // Update session
            const currentSession = JSON.parse(localStorage.getItem(SESSION_KEY));
            currentSession.gender = newGender;
            localStorage.setItem(SESSION_KEY, JSON.stringify(currentSession));
            
            alert('Gender updated successfully!');
        } catch (error) {
            console.error('Error updating gender:', error);
            alert('Failed to update gender. Please try again.');
        }
    };

    // Handle logout
    const handleLogout = () => {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem(SESSION_KEY);
            window.location.href = 'auth.html';
        }
    };

    // Event listeners for logout buttons
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    if (logoutBtnMain) {
        logoutBtnMain.addEventListener('click', handleLogout);
    }

    // Event listener for update gender button
    const updateGenderBtn = document.getElementById('updateGenderBtn');
    if (updateGenderBtn) {
        updateGenderBtn.addEventListener('click', updateGender);
    }

    // Load user data on page load
    loadUserData();
});

