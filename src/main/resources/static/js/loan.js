const API_BASE_URL = window.location.origin;
const SESSION_KEY = 'gamezoneUser';

let currentUser = null;
let currentUserId = null;

document.addEventListener('DOMContentLoaded', () => {
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const hamburgerMenuDropdown = document.getElementById('hamburgerMenuDropdown');
    const closeMenu = document.getElementById('closeMenu');
    const logoutBtn = document.getElementById('logoutBtn');
    const loanForm = document.getElementById('loanForm');
    const loanAmount = document.getElementById('loanAmount');

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

    // Check authentication and load user data
    checkAuthAndLoadData();

    // Calculate loan summary when amount changes
    if (loanAmount) {
        loanAmount.addEventListener('input', calculateLoanSummary);
    }

    // Handle form submission
    if (loanForm) {
        loanForm.addEventListener('submit', handleLoanSubmission);
    }
});

const checkAuthAndLoadData = async () => {
    try {
        const userSession = JSON.parse(localStorage.getItem(SESSION_KEY));
        if (!userSession || !userSession.username) {
            window.location.href = 'auth.html';
            return;
        }

        // Fetch user data from database
        const response = await fetch(`${API_BASE_URL}/user/findByUsername/${encodeURIComponent(userSession.username)}`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user data');
        }

        currentUser = await response.json();
        if (!currentUser || !currentUser.id) {
            throw new Error('User not found');
        }

        currentUserId = currentUser.id;

        // Display user points
        if (currentUser.account) {
            const points = currentUser.account.points || 0;
            document.getElementById('userPoints').textContent = points;
        }

        // Load user's loans
        loadUserLoans();
    } catch (error) {
        console.error('Error loading user data:', error);
        showError('Failed to load user data. Please try again.');
    }
};

const calculateLoanSummary = () => {
    const amount = parseFloat(document.getElementById('loanAmount').value) || 0;
    const interest = amount * 0.30;
    const total = amount + interest;

    document.getElementById('summaryAmount').textContent = `$${amount.toFixed(2)}`;
    document.getElementById('summaryInterest').textContent = `$${interest.toFixed(2)}`;
    document.getElementById('summaryTotal').textContent = `$${total.toFixed(2)}`;
};

const handleLoanSubmission = async (event) => {
    event.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    const loanAmount = document.getElementById('loanAmount').value;
    const loanReason = document.getElementById('loanReason').value;

    // Validate form
    if (!loanAmount || parseFloat(loanAmount) <= 0) {
        showError('Please enter a valid loan amount.');
        return;
    }

    if (!loanReason || loanReason.trim().length === 0) {
        showError('Please provide a reason for your loan application.');
        return;
    }

    // Disable submit button
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';

    try {
        const response = await fetch(`${API_BASE_URL}/loans/apply`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                userId: currentUserId,
                reason: loanReason.trim(),
                amount: parseFloat(loanAmount)
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Failed to submit loan application');
        }

        if (result.success) {
            showSuccess('Loan application submitted successfully! Your loan number is: ' + result.loanNumber);
            // Reset form
            document.getElementById('loanForm').reset();
            calculateLoanSummary();
            // Reload loans
            loadUserLoans();
        } else {
            throw new Error(result.message || 'Failed to submit loan application');
        }
    } catch (error) {
        console.error('Error submitting loan:', error);
        showError(error.message || 'Failed to submit loan application. Please try again.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Loan Application';
    }
};

const loadUserLoans = async () => {
    try {
        const tbody = document.getElementById('loansTableBody');
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">Loading...</td></tr>';

        const response = await fetch(`${API_BASE_URL}/loans/user/${currentUserId}`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
        });

        if (!response.ok) {
            throw new Error('Failed to load loans');
        }

        const result = await response.json();
        const loans = result.loans || [];

        tbody.innerHTML = '';

        if (loans.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">No loan applications found</td></tr>';
            return;
        }

        // Sort by date (newest first)
        loans.sort((a, b) => {
            const dateA = new Date(a.applicationDate);
            const dateB = new Date(b.applicationDate);
            return dateB - dateA;
        });

        loans.forEach(loan => {
            const row = document.createElement('tr');
            const date = new Date(loan.applicationDate);
            const status = loan.isApproved ? 'APPROVED' : (loan.status === 'REJECTED' ? 'REJECTED' : 'PENDING');
            const statusClass = status === 'APPROVED' ? 'badge bg-success' : 
                               status === 'REJECTED' ? 'badge bg-danger' : 
                               'badge bg-warning';

            row.innerHTML = `
                <td><small>${loan.loanNumber || '--'}</small></td>
                <td>$${loan.amount ? parseFloat(loan.amount).toFixed(2) : '0.00'}</td>
                <td>$${loan.interest ? parseFloat(loan.interest).toFixed(2) : '0.00'}</td>
                <td>$${loan.returnAmount ? parseFloat(loan.returnAmount).toFixed(2) : '0.00'}</td>
                <td><small>${loan.reason || '--'}</small></td>
                <td><span class="${statusClass}">${status}</span></td>
                <td><small>${date.toLocaleDateString()} ${date.toLocaleTimeString()}</small></td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading loans:', error);
        document.getElementById('loansTableBody').innerHTML = 
            '<tr><td colspan="7" class="text-center text-danger">Error loading loans</td></tr>';
    }
};

const showError = (message) => {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    
    const successDiv = document.getElementById('successMessage');
    successDiv.style.display = 'none';
    
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
};

const showSuccess = (message) => {
    const successDiv = document.getElementById('successMessage');
    successDiv.textContent = message;
    successDiv.style.display = 'block';
    
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.style.display = 'none';
    
    setTimeout(() => {
        successDiv.style.display = 'none';
    }, 5000);
};

