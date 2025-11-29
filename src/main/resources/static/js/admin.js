const API_BASE_URL = window.location.origin;
const SESSION_KEY = 'gamezoneUser';

let currentAccountId = null;
let currentEditId = null;
let currentEditType = null;

document.addEventListener('DOMContentLoaded', () => {
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const hamburgerMenuDropdown = document.getElementById('hamburgerMenuDropdown');
    const closeMenu = document.getElementById('closeMenu');
    const logoutBtn = document.getElementById('logoutBtn');

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

    // Check admin access and load data
    checkAdminAccess();

    // Tab switching
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            switchTab(tab);
        });
    });

    // Refresh buttons
    document.getElementById('refreshUsersBtn').addEventListener('click', () => loadUsers());
    document.getElementById('refreshAccountsBtn').addEventListener('click', () => loadAccounts());
    document.getElementById('refreshTransactionsBtn').addEventListener('click', () => loadTransactions());
    document.getElementById('refreshLoansBtn').addEventListener('click', () => loadLoans());

    // Search user button
    document.getElementById('searchUserBtn').addEventListener('click', searchUserById);
    document.getElementById('searchUserId').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchUserById();
        }
    });

    // Save edit button
    document.getElementById('saveEditBtn').addEventListener('click', saveEdit);
});

const checkAdminAccess = async () => {
    try {
        const userSession = JSON.parse(localStorage.getItem(SESSION_KEY));
        if (!userSession || !userSession.username) {
            window.location.href = 'auth.html';
            return;
        }

        // Fetch user data to get account id
        const response = await fetch(`${API_BASE_URL}/user/findByUsername/${encodeURIComponent(userSession.username)}`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user data');
        }

        const userData = await response.json();
        if (!userData || !userData.account) {
            throw new Error('User account not found');
        }

        currentAccountId = userData.account.id;

        // Check if user is admin
        const adminCheck = await fetch(`${API_BASE_URL}/admin/check/${currentAccountId}`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
        });

        const adminResult = await adminCheck.json();
        if (!adminResult.isAdmin) {
            alert('Access denied. Admin privileges required.');
            window.location.href = 'index.html';
            return;
        }

        // Load initial data
        loadUsers();
        loadTransactions();
        loadLoans();
    } catch (error) {
        console.error('Error checking admin access:', error);
        alert('Failed to verify admin access. Redirecting...');
        window.location.href = 'index.html';
    }
};

const switchTab = (tab) => {
    // Update tab buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tab) {
            btn.classList.add('active');
        }
    });

    // Update table containers
    document.querySelectorAll('.table-container').forEach(container => {
        container.classList.remove('active');
    });

    // Smooth transition
    setTimeout(() => {
        if (tab === 'users') {
            document.getElementById('usersTable').classList.add('active');
            if (document.getElementById('usersTableBody').children.length === 1 && 
                document.getElementById('usersTableBody').children[0].textContent === 'Loading...') {
                loadUsers();
            }
        } else if (tab === 'accounts') {
            document.getElementById('accountsTable').classList.add('active');
            if (document.getElementById('accountsTableBody').children.length === 1 && 
                document.getElementById('accountsTableBody').children[0].textContent === 'Loading...') {
                loadAccounts();
            }
        } else if (tab === 'transactions') {
            document.getElementById('transactionsTable').classList.add('active');
            if (document.getElementById('transactionsTableBody').children.length === 1 && 
                document.getElementById('transactionsTableBody').children[0].textContent === 'Loading...') {
                loadTransactions();
            }
        } else if (tab === 'loans') {
            document.getElementById('loansTable').classList.add('active');
            if (document.getElementById('loansTableBody').children.length === 1 && 
                document.getElementById('loansTableBody').children[0].textContent === 'Loading...') {
                loadLoans();
            }
        }
    }, 150);
};

const loadUsers = async () => {
    try {
        const tbody = document.getElementById('usersTableBody');
        tbody.innerHTML = '<tr><td colspan="10" class="text-center">Loading...</td></tr>';

        const response = await fetch(`${API_BASE_URL}/admin/users/all?accountId=${currentAccountId}`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
        });

        if (!response.ok) {
            if (response.status === 403) {
                throw new Error('Access denied');
            }
            throw new Error('Failed to load users');
        }

        const users = await response.json();
        tbody.innerHTML = '';

        if (users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="10" class="text-center">No users found</td></tr>';
            return;
        }

        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.id || '--'}</td>
                <td>${user.username || '--'}</td>
                <td>${user.firstName || '--'}</td>
                <td>${user.secondName || '--'}</td>
                <td>${user.email || '--'}</td>
                <td>${user.phoneNumber || '--'}</td>
                <td>${user.gender || '--'}</td>
                <td>${user.password ? '••••••••' : '--'}</td>
                <td>${user.account ? user.account.id : '--'}</td>
                <td>
                    <button class="btn btn-sm btn-primary edit-btn" data-id="${user.id}" data-type="user">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });

        // Add event listeners to edit buttons
        document.querySelectorAll('.edit-btn[data-type="user"]').forEach(btn => {
            btn.addEventListener('click', () => openEditModal(btn.dataset.id, 'user'));
        });
    } catch (error) {
        console.error('Error loading users:', error);
        showError('Failed to load users: ' + error.message);
        document.getElementById('usersTableBody').innerHTML = 
            '<tr><td colspan="10" class="text-center text-danger">Error loading users</td></tr>';
    }
};

const loadAccounts = async () => {
    try {
        const tbody = document.getElementById('accountsTableBody');
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">Loading...</td></tr>';

        const response = await fetch(`${API_BASE_URL}/admin/accounts/all?accountId=${currentAccountId}`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
        });

        if (!response.ok) {
            if (response.status === 403) {
                throw new Error('Access denied');
            }
            throw new Error('Failed to load accounts');
        }

        const accounts = await response.json();
        tbody.innerHTML = '';

        if (accounts.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No accounts found</td></tr>';
            return;
        }

        accounts.forEach(account => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${account.id || '--'}</td>
                <td>${account.accountName || '--'}</td>
                <td>$${account.balance !== null && account.balance !== undefined ? parseFloat(account.balance).toFixed(2) : '0.00'}</td>
                <td>${account.points !== null && account.points !== undefined ? account.points : 0}</td>
                <td>$${account.deptSum !== null && account.deptSum !== undefined ? parseFloat(account.deptSum).toFixed(2) : '0.00'}</td>
                <td>
                    <button class="btn btn-sm btn-primary edit-btn" data-id="${account.id}" data-type="account">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });

        // Add event listeners to edit buttons
        document.querySelectorAll('.edit-btn[data-type="account"]').forEach(btn => {
            btn.addEventListener('click', () => openEditModal(btn.dataset.id, 'account'));
        });
    } catch (error) {
        console.error('Error loading accounts:', error);
        showError('Failed to load accounts: ' + error.message);
        document.getElementById('accountsTableBody').innerHTML = 
            '<tr><td colspan="6" class="text-center text-danger">Error loading accounts</td></tr>';
    }
};

const openEditModal = async (id, type) => {
    currentEditId = id;
    currentEditType = type;

    try {
        let data;
        if (type === 'user') {
            const response = await fetch(`${API_BASE_URL}/user/findUserId/${id}`, {
                method: 'GET',
                headers: { 'Accept': 'application/json' },
            });
            if (!response.ok) throw new Error('Failed to fetch user');
            const userOpt = await response.json();
            data = userOpt;
        } else {
            const response = await fetch(`${API_BASE_URL}/account/findAccountId/${id}`, {
                method: 'GET',
                headers: { 'Accept': 'application/json' },
            });
            if (!response.ok) throw new Error('Failed to fetch account');
            const accountOpt = await response.json();
            data = accountOpt;
        }

        const modalTitle = document.getElementById('editModalTitle');
        const formFields = document.getElementById('editFormFields');
        formFields.innerHTML = '';

        if (type === 'user') {
            modalTitle.textContent = 'Edit User';
            const fields = [
                { name: 'id', label: 'ID', type: 'number', value: data.id },
                { name: 'username', label: 'Username', type: 'text', value: data.username },
                { name: 'firstName', label: 'First Name', type: 'text', value: data.firstName },
                { name: 'secondName', label: 'Last Name', type: 'text', value: data.secondName },
                { name: 'email', label: 'Email', type: 'email', value: data.email },
                { name: 'phoneNumber', label: 'Phone Number', type: 'text', value: data.phoneNumber },
                { name: 'gender', label: 'Gender', type: 'select', value: data.gender, options: ['male', 'female'] },
                { name: 'password', label: 'Password', type: 'password', value: '' },
            ];

            fields.forEach(field => {
                const div = document.createElement('div');
                div.className = 'mb-3';
                let input;
                if (field.type === 'select') {
                    input = `<select class="form-control" name="${field.name}" required>
                        ${field.options.map(opt => 
                            `<option value="${opt}" ${opt === field.value ? 'selected' : ''}>${opt.charAt(0).toUpperCase() + opt.slice(1)}</option>`
                        ).join('')}
                    </select>`;
                } else {
                    input = `<input type="${field.type}" class="form-control" name="${field.name}" value="${field.value || ''}" ${field.name === 'id' ? 'readonly' : ''}>`;
                }
                div.innerHTML = `
                    <label class="form-label">${field.label}</label>
                    ${input}
                `;
                formFields.appendChild(div);
            });
        } else {
            modalTitle.textContent = 'Edit Account';
            const fields = [
                { name: 'id', label: 'ID', type: 'number', value: data.id },
                { name: 'accountName', label: 'Account Name', type: 'text', value: data.accountName },
                { name: 'balance', label: 'Balance', type: 'number', value: data.balance, step: '0.01' },
                { name: 'points', label: 'Points', type: 'number', value: data.points },
                { name: 'deptSum', label: 'Debt Sum', type: 'number', value: data.deptSum },
            ];

            fields.forEach(field => {
                const div = document.createElement('div');
                div.className = 'mb-3';
                div.innerHTML = `
                    <label class="form-label">${field.label}</label>
                    <input type="${field.type}" class="form-control" name="${field.name}" 
                           value="${field.value !== null && field.value !== undefined ? field.value : ''}" 
                           ${field.step ? `step="${field.step}"` : ''} 
                           ${field.name === 'id' ? 'readonly' : ''}>
                `;
                formFields.appendChild(div);
            });
        }

        const modal = new bootstrap.Modal(document.getElementById('editModal'));
        modal.show();
    } catch (error) {
        console.error('Error opening edit modal:', error);
        showError('Failed to load data for editing: ' + error.message);
    }
};

const saveEdit = async () => {
    try {
        const form = document.getElementById('editForm');
        const formData = new FormData(form);
        const updates = {};

        // Collect form data
        for (const [key, value] of formData.entries()) {
            if (value !== '' && key !== 'id') {
                // Determine the type based on field name
                if (currentEditType === 'user') {
                    if (key === 'id') {
                        updates[key] = parseInt(value);
                    } else {
                        updates[key] = value;
                    }
                } else {
                    if (key === 'balance' || key === 'points' || key === 'deptSum') {
                        if (key === 'balance') {
                            updates[key] = parseFloat(value);
                        } else {
                            updates[key] = parseInt(value);
                        }
                    } else {
                        updates[key] = value;
                    }
                }
            }
        }

        // Send update request
        const endpoint = currentEditType === 'user' 
            ? `${API_BASE_URL}/admin/users/update/${currentEditId}?accountId=${currentAccountId}`
            : `${API_BASE_URL}/admin/accounts/update/${currentEditId}?adminAccountId=${currentAccountId}`;

        const response = await fetch(endpoint, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(updates),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Failed to update');
        }

        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('editModal'));
        modal.hide();

        // Reload data
        if (currentEditType === 'user') {
            loadUsers();
        } else {
            loadAccounts();
        }

        showSuccess('Record updated successfully!');
    } catch (error) {
        console.error('Error saving edit:', error);
        showError('Failed to save changes: ' + error.message);
    }
};

const loadTransactions = async () => {
    try {
        const tbody = document.getElementById('transactionsTableBody');
        tbody.innerHTML = '<tr><td colspan="8" class="text-center">Loading...</td></tr>';

        const response = await fetch(`${API_BASE_URL}/transactions/admin/all?adminAccountId=${currentAccountId}`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
        });

        if (!response.ok) {
            if (response.status === 403) {
                throw new Error('Access denied');
            }
            throw new Error('Failed to load transactions');
        }

        const transactions = await response.json();
        tbody.innerHTML = '';

        if (transactions.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center">No transactions found</td></tr>';
            return;
        }

        // Sort by date (newest first)
        transactions.sort((a, b) => {
            const dateA = new Date(a.transactionDate);
            const dateB = new Date(b.transactionDate);
            return dateB - dateA;
        });

        transactions.forEach(transaction => {
            const row = document.createElement('tr');
            const date = new Date(transaction.transactionDate);
            const statusClass = transaction.status === 'SUCCESS' ? 'badge bg-success' : 
                               transaction.status === 'FAILED' ? 'badge bg-danger' : 
                               'badge bg-warning';

            row.innerHTML = `
                <td>${transaction.id || '--'}</td>
                <td>${date.toLocaleDateString()} ${date.toLocaleTimeString()}</td>
                <td>${transaction.senderAccountId || '--'}</td>
                <td>${transaction.receiverAccountId || '--'}</td>
                <td>$${transaction.amount !== null && transaction.amount !== undefined ? parseFloat(transaction.amount).toFixed(2) : '0.00'}</td>
                <td><span class="${statusClass}">${transaction.status || '--'}</span></td>
                <td><small>${transaction.referenceNumber || '--'}</small></td>
                <td>
                    ${transaction.status === 'SUCCESS' ? 
                        `<button class="btn btn-sm btn-danger delete-transaction-btn" data-id="${transaction.id}">
                            <i class="fas fa-trash"></i> Delete
                        </button>` : 
                        '<span class="text-muted">N/A</span>'
                    }
                </td>
            `;
            tbody.appendChild(row);
        });

        // Add event listeners to delete buttons
        document.querySelectorAll('.delete-transaction-btn').forEach(btn => {
            btn.addEventListener('click', () => deleteTransaction(btn.dataset.id));
        });
    } catch (error) {
        console.error('Error loading transactions:', error);
        showError('Failed to load transactions: ' + error.message);
        document.getElementById('transactionsTableBody').innerHTML = 
            '<tr><td colspan="8" class="text-center text-danger">Error loading transactions</td></tr>';
    }
};

const deleteTransaction = async (transactionId) => {
    if (!confirm('Are you sure you want to delete this transaction? This will reverse the transaction and return money to the sender.')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/transactions/admin/delete/${transactionId}?adminAccountId=${currentAccountId}`, {
            method: 'DELETE',
            headers: { 'Accept': 'application/json' },
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Failed to delete transaction');
        }

        showSuccess('Transaction deleted and reversed successfully!');
        
        // Reload transactions and accounts
        loadTransactions();
        loadAccounts();
    } catch (error) {
        console.error('Error deleting transaction:', error);
        showError('Failed to delete transaction: ' + error.message);
    }
};

const showError = (message) => {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
};

const showSuccess = (message) => {
    const successDiv = document.getElementById('successMessage');
    successDiv.textContent = message;
    successDiv.style.display = 'block';
    setTimeout(() => {
        successDiv.style.display = 'none';
    }, 3000);
};

const searchUserById = async () => {
    const userIdInput = document.getElementById('searchUserId');
    const userId = userIdInput.value.trim();

    if (!userId) {
        showError('Please enter a user ID to search');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/user/findUserId/${userId}`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
        });

        if (!response.ok) {
            throw new Error('User not found');
        }

        const userOpt = await response.json();
        if (!userOpt || !userOpt.id) {
            throw new Error('User not found');
        }

        // Switch to users tab
        switchTab('users');

        // Clear and populate table with search result
        const tbody = document.getElementById('usersTableBody');
        tbody.innerHTML = '';

        const user = userOpt;
        const row = document.createElement('tr');
        row.style.backgroundColor = '#fff3cd'; // Highlight the found user
        row.innerHTML = `
            <td>${user.id || '--'}</td>
            <td>${user.username || '--'}</td>
            <td>${user.firstName || '--'}</td>
            <td>${user.secondName || '--'}</td>
            <td>${user.email || '--'}</td>
            <td>${user.phoneNumber || '--'}</td>
            <td>${user.gender || '--'}</td>
            <td>${user.password ? '••••••••' : '--'}</td>
            <td>${user.account ? user.account.id : '--'}</td>
            <td>
                <button class="btn btn-sm btn-primary edit-btn" data-id="${user.id}" data-type="user">
                    <i class="fas fa-edit"></i> Edit
                </button>
            </td>
        `;
        tbody.appendChild(row);

        // Add event listener to edit button
        row.querySelector('.edit-btn').addEventListener('click', () => openEditModal(user.id, 'user'));

        showSuccess(`User with ID ${userId} found!`);
        
        // Clear search input after a delay
        setTimeout(() => {
            userIdInput.value = '';
        }, 2000);
    } catch (error) {
        console.error('Error searching user:', error);
        showError('User not found with ID: ' + userId);
    }
};

const loadLoans = async () => {
    try {
        const tbody = document.getElementById('loansTableBody');
        tbody.innerHTML = '<tr><td colspan="10" class="text-center">Loading...</td></tr>';

        const response = await fetch(`${API_BASE_URL}/loans/getAll`, {
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
            tbody.innerHTML = '<tr><td colspan="10" class="text-center">No loans found</td></tr>';
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
                <td>${loan.id || '--'}</td>
                <td><small>${loan.loanNumber || '--'}</small></td>
                <td>${loan.userId || '--'}</td>
                <td>$${loan.amount !== null && loan.amount !== undefined ? parseFloat(loan.amount).toFixed(2) : '0.00'}</td>
                <td>$${loan.interest !== null && loan.interest !== undefined ? parseFloat(loan.interest).toFixed(2) : '0.00'}</td>
                <td>$${loan.returnAmount !== null && loan.returnAmount !== undefined ? parseFloat(loan.returnAmount).toFixed(2) : '0.00'}</td>
                <td><small>${loan.reason || '--'}</small></td>
                <td><span class="${statusClass}">${status}</span></td>
                <td><small>${date.toLocaleDateString()} ${date.toLocaleTimeString()}</small></td>
                <td>
                    ${status === 'PENDING' ? 
                        `<button class="btn btn-sm btn-success approve-loan-btn me-1" data-id="${loan.id}">
                            <i class="fas fa-check"></i> Approve
                        </button>
                        <button class="btn btn-sm btn-danger reject-loan-btn" data-id="${loan.id}">
                            <i class="fas fa-times"></i> Reject
                        </button>` : 
                        '<span class="text-muted">N/A</span>'
                    }
                </td>
            `;
            tbody.appendChild(row);
        });

        // Add event listeners to approve/reject buttons
        document.querySelectorAll('.approve-loan-btn').forEach(btn => {
            btn.addEventListener('click', () => approveLoan(btn.dataset.id));
        });

        document.querySelectorAll('.reject-loan-btn').forEach(btn => {
            btn.addEventListener('click', () => rejectLoan(btn.dataset.id));
        });
    } catch (error) {
        console.error('Error loading loans:', error);
        showError('Failed to load loans: ' + error.message);
        document.getElementById('loansTableBody').innerHTML = 
            '<tr><td colspan="10" class="text-center text-danger">Error loading loans</td></tr>';
    }
};

const approveLoan = async (loanId) => {
    // First confirmation
    if (!confirm(`Are you sure you want to APPROVE loan #${loanId}?`)) {
        return;
    }

    // Second confirmation
    if (!confirm(`This is your final confirmation. Do you want to APPROVE loan #${loanId}? This action cannot be undone.`)) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/loans/approve/${loanId}`, {
            method: 'POST',
            headers: { 'Accept': 'application/json' },
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Failed to approve loan');
        }

        showSuccess('Loan approved successfully!');
        loadLoans();
    } catch (error) {
        console.error('Error approving loan:', error);
        showError('Failed to approve loan: ' + error.message);
    }
};

const rejectLoan = async (loanId) => {
    // First confirmation
    if (!confirm(`Are you sure you want to REJECT loan #${loanId}?`)) {
        return;
    }

    // Second confirmation
    if (!confirm(`This is your final confirmation. Do you want to REJECT loan #${loanId}? This action cannot be undone.`)) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/loans/reject/${loanId}`, {
            method: 'POST',
            headers: { 'Accept': 'application/json' },
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Failed to reject loan');
        }

        showSuccess('Loan rejected successfully!');
        loadLoans();
    } catch (error) {
        console.error('Error rejecting loan:', error);
        showError('Failed to reject loan: ' + error.message);
    }
};

