const API_BASE_URL = window.location.origin;
const SESSION_KEY = 'gamezoneUser';

let currentAccountId = null;

document.addEventListener('DOMContentLoaded', () => {
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const hamburgerMenuDropdown = document.getElementById('hamburgerMenuDropdown');
    const closeMenu = document.getElementById('closeMenu');
    const logoutBtn = document.getElementById('logoutBtn');
    const transactionForm = document.getElementById('transactionForm');

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

    // Handle logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to logout?')) {
                localStorage.removeItem(SESSION_KEY);
                window.location.href = 'auth.html';
            }
        });
    }

    // Load user data and initialize
    loadUserData();

    // Handle form submission
    if (transactionForm) {
        transactionForm.addEventListener('submit', handleSendMoney);
    }
});

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
        
        if (!userData || !userData.account) {
            throw new Error('User account not found');
        }

        currentAccountId = userData.account.id;

        // Update balance display
        const balance = userData.account.balance !== null && userData.account.balance !== undefined 
            ? parseFloat(userData.account.balance) : 0;
        document.getElementById('userBalance').textContent = `$${balance.toFixed(2)}`;

        // Show admin menu item if account id = 1
        const adminMenuItem = document.getElementById('adminMenuItem');
        if (adminMenuItem && currentAccountId === 1) {
            adminMenuItem.style.display = 'block';
        } else if (adminMenuItem) {
            adminMenuItem.style.display = 'none';
        }

        // Load transaction history
        loadTransactionHistory();
    } catch (error) {
        console.error('Error loading user data:', error);
        alert('Failed to load user data. Please try again.');
        window.location.href = 'auth.html';
    }
};

const loadTransactionHistory = async () => {
    try {
        const tbody = document.getElementById('transactionsTableBody');
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">Loading...</td></tr>';

        const response = await fetch(`${API_BASE_URL}/transactions/account/${currentAccountId}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to load transactions');
        }

        const transactions = await response.json();
        tbody.innerHTML = '';

        if (transactions.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">No transactions yet</td></tr>';
            return;
        }

        // Sort by date (newest first)
        transactions.sort((a, b) => {
            const dateA = new Date(a.transactionDate);
            const dateB = new Date(b.transactionDate);
            return dateB - dateA;
        });

        // Show only last 10 transactions
        transactions.slice(0, 10).forEach(transaction => {
            const row = document.createElement('tr');
            const date = new Date(transaction.transactionDate);
            const isSender = transaction.senderAccountId === currentAccountId;
            const isReceiver = transaction.receiverAccountId === currentAccountId;
            
            let toFromText = '';
            if (isSender) {
                toFromText = `To: ${transaction.receiverAccountId}`;
            } else if (isReceiver) {
                toFromText = `From: ${transaction.senderAccountId}`;
            }

            const amountClass = isSender ? 'text-danger' : 'text-success';
            const amountPrefix = isSender ? '-' : '+';
            const statusClass = transaction.status === 'SUCCESS' ? 'badge bg-success' : 
                               transaction.status === 'FAILED' ? 'badge bg-danger' : 
                               'badge bg-warning';

            row.innerHTML = `
                <td>${date.toLocaleDateString()} ${date.toLocaleTimeString()}</td>
                <td>${toFromText}</td>
                <td class="${amountClass}">${amountPrefix}$${parseFloat(transaction.amount).toFixed(2)}</td>
                <td><span class="${statusClass}">${transaction.status}</span></td>
                <td><small>${transaction.referenceNumber}</small></td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading transaction history:', error);
        document.getElementById('transactionsTableBody').innerHTML = 
            '<tr><td colspan="5" class="text-center text-danger">Error loading transactions</td></tr>';
    }
};

const handleSendMoney = async (e) => {
    e.preventDefault();
    
    const sendBtn = document.getElementById('sendBtn');
    const receiverAccountId = document.getElementById('receiverAccountId').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const description = document.getElementById('description').value;

    // Validation
    if (!receiverAccountId || receiverAccountId <= 0) {
        showError('Please enter a valid receiver account ID');
        return;
    }

    if (!amount || amount <= 0) {
        showError('Please enter a valid amount');
        return;
    }

    if (receiverAccountId == currentAccountId) {
        showError('You cannot send money to your own account');
        return;
    }

    // Disable button
    sendBtn.disabled = true;
    sendBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Sending...';

    try {
        const response = await fetch(`${API_BASE_URL}/transactions/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                senderAccountId: currentAccountId,
                receiverAccountId: parseInt(receiverAccountId),
                amount: amount,
                description: description || null
            }),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Transaction failed');
        }

        if (result.status === 'FAILED') {
            showError('Insufficient balance. You do not have enough money to complete this transaction.');
        } else {
            showSuccess(`Transaction successful! Reference: ${result.referenceNumber}`);
            // Reset form
            document.getElementById('transactionForm').reset();
            // Reload balance and transaction history
            await loadUserData();
        }
    } catch (error) {
        console.error('Error sending money:', error);
        showError('Failed to send money: ' + error.message);
    } finally {
        // Re-enable button
        sendBtn.disabled = false;
        sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Money';
    }
};

const showError = (message) => {
    const errorDiv = document.getElementById('errorMessage');
    const successDiv = document.getElementById('successMessage');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    successDiv.style.display = 'none';
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
};

const showSuccess = (message) => {
    const successDiv = document.getElementById('successMessage');
    const errorDiv = document.getElementById('errorMessage');
    successDiv.textContent = message;
    successDiv.style.display = 'block';
    errorDiv.style.display = 'none';
    setTimeout(() => {
        successDiv.style.display = 'none';
    }, 5000);
};

