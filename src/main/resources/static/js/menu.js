const API_BASE_URL = window.location.origin;
const SESSION_KEY = 'gamezoneUser';

document.addEventListener('DOMContentLoaded', () => {
    const navUsername = document.getElementById('navUsername');
    const profileNavItem = document.getElementById('profileNavItem');
    const profileLink = document.getElementById('profileLink');
    const logoutBtn = document.getElementById('logoutBtn');
    const logoutBtnMobile = document.getElementById('logoutBtnMobile');
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const hamburgerMenuDropdown = document.getElementById('hamburgerMenuDropdown');
    const closeMenu = document.getElementById('closeMenu');
    const mobileProfileItem = document.getElementById('mobileProfileItem');
    const mobileTransactionItem = document.getElementById('mobileTransactionItem');
    const mobileLoanItem = document.getElementById('mobileLoanItem');
    const mobileAdminItem = document.getElementById('mobileAdminItem');
    const mobileDivider = document.getElementById('mobileDivider');
    const mobileLogoutItem = document.getElementById('mobileLogoutItem');
    const profileButtonHero = document.getElementById('profileButtonHero');

    // Get current user from session
    const getCurrentUser = () => {
        try {
            const stored = window.localStorage.getItem(SESSION_KEY);
            if (!stored) return null;
            return JSON.parse(stored);
        } catch (error) {
            console.error('Error reading session:', error);
            return null;
        }
    };

    // Load user data from database
    const loadUserDataFromDatabase = async () => {
        try {
            const userSession = getCurrentUser();
            if (!userSession || !userSession.username) {
                return null;
            }

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
            
            // Debug: Log the received data
            console.log('Dashboard - User data from database:', userData);
            if (userData && userData.account) {
                console.log('Dashboard - Account balance:', userData.account.balance);
                console.log('Dashboard - Account points:', userData.account.points);
                console.log('Dashboard - Account debt:', userData.account.deptSum);
            }
            
            return userData;
        } catch (error) {
            console.error('Error loading user data:', error);
            return null;
        }
    };

    // Update dashboard with account data
    const updateDashboard = async () => {
        const userData = await loadUserDataFromDatabase();
        if (!userData || !userData.account) {
            return;
        }

        const account = userData.account;
        
        // Update balance - use actual database value
        const balanceEl = document.getElementById('dashboardBalance');
        if (balanceEl && account) {
            const balance = account.balance !== null && account.balance !== undefined ? parseFloat(account.balance) : 0;
            balanceEl.textContent = `$${balance.toFixed(2)}`;
        }

        // Update points - use actual database value
        const pointsEl = document.getElementById('dashboardPoints');
        if (pointsEl && account) {
            const points = account.points !== null && account.points !== undefined ? account.points : 0;
            pointsEl.textContent = points.toString();
        }

        // Update debt - use actual database value
        const debtEl = document.getElementById('dashboardDebt');
        if (debtEl && account) {
            const debt = account.deptSum !== null && account.deptSum !== undefined ? account.deptSum : 0;
            debtEl.textContent = `-$${parseFloat(debt).toFixed(2)}`;
        }
    };

    // Initialize user display
    const initializeUserDisplay = async () => {
        const user = getCurrentUser();

        if (!user) {
            // User not logged in - hide user elements
            if (navUsername) navUsername.parentElement.classList.add('d-none');
            if (profileNavItem) profileNavItem.classList.add('d-none');
            if (logoutBtn) logoutBtn.style.display = 'none';
            if (mobileProfileItem) mobileProfileItem.style.display = 'none';
            if (mobileTransactionItem) mobileTransactionItem.style.display = 'none';
            if (mobileLoanItem) mobileLoanItem.style.display = 'none';
            if (mobileAdminItem) mobileAdminItem.style.display = 'none';
            if (mobileDivider) mobileDivider.style.display = 'none';
            if (mobileLogoutItem) mobileLogoutItem.style.display = 'none';
            if (profileButtonHero) profileButtonHero.style.display = 'none';
            return;
        }

        // Load fresh data from database
        const userData = await loadUserDataFromDatabase();
        const displayUser = userData || user;

        // User is logged in - show user elements
        if (navUsername) {
            const displayName = displayUser.firstName || displayUser.username || 'User';
            navUsername.textContent = `Welcome, ${displayName}!`;
            navUsername.parentElement.classList.remove('d-none');
        }

        if (profileNavItem) {
            profileNavItem.classList.remove('d-none');
        }

        if (logoutBtn) {
            logoutBtn.style.display = 'inline-flex';
        }

        if (mobileProfileItem) {
            mobileProfileItem.style.display = 'block';
        }

        if (mobileTransactionItem) {
            mobileTransactionItem.style.display = 'block';
        }

        if (mobileLoanItem) {
            mobileLoanItem.style.display = 'block';
        }

        // Show admin menu item if account id = 1
        if (mobileAdminItem && userData && userData.account) {
            const accountId = userData.account.id;
            console.log('Checking admin access - Account ID:', accountId, 'Type:', typeof accountId);
            // Convert to number for comparison (handles both string and number)
            const accountIdNum = Number(accountId);
            if (accountIdNum === 1) {
                console.log('Admin access granted - showing admin menu');
                mobileAdminItem.style.display = 'block';
            } else {
                console.log('Not admin - hiding admin menu. Account ID:', accountIdNum);
                mobileAdminItem.style.display = 'none';
            }
        } else if (mobileAdminItem) {
            console.log('No account data - hiding admin menu');
            mobileAdminItem.style.display = 'none';
        }

        if (mobileDivider) {
            mobileDivider.style.display = 'block';
        }

        if (mobileLogoutItem) {
            mobileLogoutItem.style.display = 'block';
        }

        if (profileButtonHero) {
            profileButtonHero.style.display = 'inline-flex';
        }

        // Update hero welcome message if present
        const heroWelcome = document.getElementById('heroWelcome');
        if (heroWelcome) {
            heroWelcome.textContent = `Welcome back, ${displayUser.firstName || displayUser.username}!`;
            heroWelcome.classList.remove('d-none');
        }

        // Update dashboard with account data
        await updateDashboard();
    };

    // Handle logout
    const handleLogout = () => {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem(SESSION_KEY);
            window.location.href = 'auth.html';
        }
    };

    // Hamburger menu toggle
    if (hamburgerMenu) {
        hamburgerMenu.addEventListener('click', () => {
            hamburgerMenu.classList.toggle('active');
            if (hamburgerMenuDropdown) {
                hamburgerMenuDropdown.classList.toggle('active');
            }
        });
    }

    // Close menu button
    if (closeMenu) {
        closeMenu.addEventListener('click', () => {
            if (hamburgerMenu) hamburgerMenu.classList.remove('active');
            if (hamburgerMenuDropdown) hamburgerMenuDropdown.classList.remove('active');
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

    // Event listeners
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    if (logoutBtnMobile) {
        logoutBtnMobile.addEventListener('click', handleLogout);
    }

    // Initialize on page load
    initializeUserDisplay();

    // Check if user is logged in on pages that require authentication
    const checkAuthenticationRequired = () => {
        const currentPage = window.location.pathname;
        const user = getCurrentUser();

        // If on profile page and not logged in, redirect to auth
        if (currentPage.includes('profile.html') && !user) {
            window.location.href = 'auth.html';
        }
    };

    checkAuthenticationRequired();
});