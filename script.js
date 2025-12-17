// ===== CONFIGURATION =====
const GOOGLE_SHEET_URL = 'YOUR_WEB_APP_URL_HERE'; // Paste your Google Sheets Web App URL here!

// ===== POPULATE DROPDOWNS =====
function populateDropdowns() {
    // Populate Location dropdowns
    const locationSelect = document.getElementById('location');
    LOCATIONS.forEach(location => {
        const option = document.createElement('option');
        option.value = location;
        option.textContent = location;
        locationSelect.appendChild(option);
    });

    // Populate Airport dropdowns
    const airportSelects = ['depAirport', 'arrAirport'];
    airportSelects.forEach(selectId => {
        const select = document.getElementById(selectId);
        
        // Add "Unknown yet" option for arrival airport
        if (selectId === 'arrAirport') {
            const unknownOption = document.createElement('option');
            unknownOption.value = 'Unknown yet';
            unknownOption.textContent = 'Unknown yet';
            select.appendChild(unknownOption);
        }
        
        AIRPORTS.forEach(airport => {
            const option = document.createElement('option');
            option.value = airport;
            option.textContent = airport;
            select.appendChild(option);
        });
    });

    // Populate Airline dropdowns
    const airlineSelects = ['depAirline', 'arrAirline'];
    airlineSelects.forEach(selectId => {
        const select = document.getElementById(selectId);
        
        // Add "Unknown yet" option for arrival airline
        if (selectId === 'arrAirline') {
            const unknownOption = document.createElement('option');
            unknownOption.value = 'Unknown yet';
            unknownOption.textContent = 'Unknown yet';
            select.appendChild(unknownOption);
        }
        
        AIRLINES.forEach(airline => {
            const option = document.createElement('option');
            option.value = airline;
            option.textContent = airline;
            select.appendChild(option);
        });
    });
}

// ===== MODAL FUNCTIONALITY =====
const modal = document.getElementById('formModal');
const openFormBtn = document.getElementById('openFormBtn');
const closeBtn = document.getElementById('closeBtn');
const alreadySubmittedBtn = document.getElementById('alreadySubmittedBtn');
const rideForm = document.getElementById('rideForm');

// Close modal when clicking X button
closeBtn.addEventListener('click', () => {
    modal.classList.remove('active');
});

// Close modal when clicking "Already submitted / Unsure rn" button
alreadySubmittedBtn.addEventListener('click', () => {
    modal.classList.remove('active');
});

// Open modal when clicking "Add Your Ride" button
openFormBtn.addEventListener('click', () => {
    modal.classList.add('active');
});

// Close modal when clicking outside the modal content
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.remove('active');
    }
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
        modal.classList.remove('active');
    }
});

// ===== FORM SUBMISSION =====
rideForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Disable submit button to prevent double submissions
    const submitBtn = rideForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
    
    // Get form data
    const formData = new FormData(rideForm);
    const data = {};
    formData.forEach((value, key) => {
        data[key] = value;
    });
    
    // Combine email parts into full email
    data.email = data.emailUsername + '@stanford.edu';
    delete data.emailUsername; // Remove the username-only field
    
    try {
        // Send data to Google Sheets
        const response = await fetch(GOOGLE_SHEET_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        // Success!
        alert('✅ Thank you! Your ride info has been submitted successfully!');
        
        // Reset form and close modal
        rideForm.reset();
        modal.classList.remove('active');
        
        // Refresh the rides display
        loadRides();
        
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Oops! Something went wrong. Please try again or contact support.');
    } finally {
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
});

// ===== LOAD RIDES FROM GOOGLE SHEETS =====
async function loadRides() {
    try {
        const response = await fetch(GOOGLE_SHEET_URL);
        const result = await response.json();
        
        if (result.result === 'success' && result.data.length > 0) {
            displayRides(result.data);
        } else {
            document.getElementById('ridesTable').innerHTML = '<p class="empty-state">No rides yet. Be the first to share your ride info!</p>';
        }
    } catch (error) {
        console.error('Error loading rides:', error);
        document.getElementById('ridesTable').innerHTML = '<p class="empty-state">No rides yet. Be the first to share your ride info!</p>';
    }
}

// ===== DISPLAY RIDES IN TABLE =====
function displayRides(rides) {
    const ridesTable = document.getElementById('ridesTable');
    
    let html = '<div class="rides-grid">';
    
    rides.forEach(ride => {
        html += `
            <div class="ride-card">
                <div class="ride-header">
                    <h3>${ride['First Name']} ${ride['Last Name']}</h3>
                    <span class="ride-date">${formatDate(ride['Dep Date'])}</span>
                </div>
                <div class="ride-details">
                    <div class="ride-section">
                        <strong>🛫 Departure:</strong>
                        <p>${ride['Dep Airport']} at ${ride['Dep Time']}</p>
                        ${ride['Dep Airline'] ? `<p class="airline">${ride['Dep Airline']}</p>` : ''}
                    </div>
                    <div class="ride-section">
                        <strong>🛬 Arrival:</strong>
                        ${ride['Arr Date'] ? `<p>${ride['Arr Airport']} at ${ride['Arr Time']}</p>` : '<p class="unknown">Unknown yet</p>'}
                        ${ride['Arr Airline'] && ride['Arr Airline'] !== 'Unknown yet' ? `<p class="airline">${ride['Arr Airline']}</p>` : ''}
                    </div>
                    ${ride['Location'] ? `<p class="location">📍 ${ride['Location']}</p>` : ''}
                </div>
                <div class="ride-contact">
                    <a href="mailto:${ride['Email']}" class="contact-btn">📧 Contact</a>
                    ${ride['Phone'] ? `<a href="tel:${ride['Phone']}" class="contact-btn">📞 Call</a>` : ''}
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    ridesTable.innerHTML = html;
}

// ===== HELPER FUNCTION =====
function formatDate(dateString) {
    if (!dateString) return 'Date TBD';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ===== EMAIL FIELD FORMATTING =====
const emailInput = document.getElementById('emailUsername');

// Validate email username (no special characters except . and _)
emailInput.addEventListener('input', (e) => {
    let value = e.target.value;
    // Remove any @ symbols or invalid characters
    value = value.replace(/@.*$/, ''); // Remove anything after @
    value = value.replace(/[^a-zA-Z0-9._-]/g, ''); // Only allow letters, numbers, dots, underscores, hyphens
    e.target.value = value.toLowerCase();
});

// ===== PHONE NUMBER FORMATTING =====
const phoneInput = document.getElementById('phone');
phoneInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 10) value = value.slice(0, 10);
    
    if (value.length >= 6) {
        value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6)}`;
    } else if (value.length >= 3) {
        value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
    }
    
    e.target.value = value;
});

// ===== DATE VALIDATION =====
// Set minimum date to today
const today = new Date().toISOString().split('T')[0];
document.getElementById('depDate').setAttribute('min', today);
document.getElementById('arrDate').setAttribute('min', today);

// Make arrival fields optional
document.getElementById('arrDate').removeAttribute('required');
document.getElementById('arrTime').removeAttribute('required');
document.getElementById('arrAirport').removeAttribute('required');

// Load rides and show modal when page loads
window.addEventListener('DOMContentLoaded', () => {
    populateDropdowns();
    loadRides();
    // Show modal automatically on page load
    modal.classList.add('active');
});
