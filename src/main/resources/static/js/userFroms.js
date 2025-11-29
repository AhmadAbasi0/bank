const API_BASE_URL = window.location.origin;
const SESSION_KEY = 'gamezoneUser';

document.addEventListener('DOMContentLoaded', () => {
    const reservationForm = document.getElementById('reservationForm');
    const reservationMessage = document.getElementById('reservationMessage');

    // Load user data into reservation form
    const loadUserDataToReservation = () => {
        try {
            const userSession = JSON.parse(localStorage.getItem(SESSION_KEY));
            if (!userSession) {
                window.location.href = 'auth.html';
                return;
            }

            // Populate reservation form with user data
            document.getElementById('resFirstName').value = userSession.firstName || '';
            document.getElementById('resLastName').value = userSession.lastName || '';
            document.getElementById('resEmail').value = userSession.email || '';
            document.getElementById('resPhone').value = userSession.phoneNumber || '';
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    };

    // Show message
    const showMessage = (type, text) => {
        if (!reservationMessage) return;
        reservationMessage.textContent = text;
        reservationMessage.classList.remove('d-none', 'alert-success', 'alert-danger');
        reservationMessage.classList.add(type === 'success' ? 'alert-success' : 'alert-danger');
    };

    // Clear message
    const clearMessage = () => {
        if (!reservationMessage) return;
        reservationMessage.textContent = '';
        reservationMessage.classList.add('d-none');
        reservationMessage.classList.remove('alert-success', 'alert-danger');
    };

    // Toggle loading state
    const toggleLoading = (isLoading) => {
        const button = reservationForm.querySelector('.btn-primary');
        if (!button) return;

        if (isLoading) {
            button.classList.add('loading');
            button.setAttribute('disabled', 'disabled');
        } else {
            button.classList.remove('loading');
            button.removeAttribute('disabled');
        }
    };

    // Handle reservation form submission
    const handleReservationSubmit = async (event) => {
        event.preventDefault();
        clearMessage();
        toggleLoading(true);

        const formData = new FormData(reservationForm);
        const reservationData = {
            firstName: formData.get('firstName')?.trim(),
            lastName: formData.get('lastName')?.trim(),
            email: formData.get('email')?.trim(),
            phoneNumber: formData.get('phoneNumber')?.trim(),
            platform: formData.get('platform')?.trim(),
            date: formData.get('date'),
            time: formData.get('time'),
            duration: formData.get('duration'),
            notes: formData.get('notes')?.trim() || '',
        };

        // Validate required fields
        const requiredFields = ['firstName', 'lastName', 'email', 'platform', 'date', 'time', 'duration'];
        const missingField = requiredFields.find(field => !reservationData[field]);

        if (missingField) {
            toggleLoading(false);
            showMessage('error', 'Please fill in all required fields.');
            return;
        }

        try {
            // Create reservation payload
            const payload = {
                firstName: reservationData.firstName,
                secondName: reservationData.lastName,
                email: reservationData.email,
                phoneNumber: reservationData.phoneNumber,
                platform: reservationData.platform,
                date: reservationData.date,
                time: reservationData.time,
                duration: reservationData.duration,
                notes: reservationData.notes,
            };

            // Send reservation to backend
            const response = await fetch('/reservations/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || data.error || 'Failed to create reservation');
            }

            showMessage('success', 'Appointment booked successfully! We will contact you shortly.');
            
            // Reset form after 2 seconds
            setTimeout(() => {
                reservationForm.reset();
                loadUserDataToReservation();
            }, 2000);
        } catch (error) {
            console.error('Reservation failed:', error);
            showMessage('error', error.message || 'Failed to book appointment. Please try again.');
        } finally {
            toggleLoading(false);
        }
    };

    // Event listeners
    if (reservationForm) {
        reservationForm.addEventListener('submit', handleReservationSubmit);
        loadUserDataToReservation();
    }
});