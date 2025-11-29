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

            // Get account data
            const account = userData.account || {};
            
            // Populate profile header
            const fullName = `${userData.firstName || ''} ${userData.secondName || ''}`.trim();
            document.getElementById('profileName').textContent = fullName || userData.username || 'User';

            // Populate account details cards
            document.getElementById('accountName').textContent = account.accountName || userData.username || '--';
            document.getElementById('accountBalance').textContent = account.balance !== undefined ? `$${parseFloat(account.balance).toFixed(2)}` : '$0.00';
            document.getElementById('accountPoints').textContent = account.points !== undefined ? account.points : '0';
            
            // Display debt with minus sign
            const debt = account.deptSum !== undefined ? account.deptSum : 0;
            document.getElementById('accountDebt').textContent = `-$${parseFloat(debt).toFixed(2)}`;

            // Populate profile information
            document.getElementById('profileEmail').textContent = userData.email || '--';
            document.getElementById('profileUsername').textContent = userData.username || '--';
            document.getElementById('profileFirstName').textContent = userData.firstName || '--';
            document.getElementById('profileLastName').textContent = userData.secondName || '--';
            document.getElementById('profilePhone').textContent = userData.phoneNumber || '--';

            // Set member since date (using current date as example)
            const today = new Date();
            document.getElementById('profileMemberSince').textContent = today.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            console.error('Error loading user data:', error);
            alert('Failed to load profile data. Please try again.');
            // Optionally redirect to auth if session is invalid
            // window.location.href = 'auth.html';
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

    // Load user data on page load
    loadUserData();
});