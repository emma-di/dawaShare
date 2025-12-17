// ===== CONFIGURATION =====
const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbz3tCsxyBNcBZZA2JfEKE71Am54hSCoak2rFQqy3_x5tCEf1MbV9z9wrHu2xou1XO2o/exec';

// ===== POPULATE DROPDOWNS =====
function populateDropdowns() {
    // Populate Location dropdown
    const locationSelect = document.getElementById('location');
    // Keep the first "Select location..." option, remove the rest
    while (locationSelect.options.length > 1) {
        locationSelect.remove(1);
    }
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
        // Keep the first "Select airport..." option, remove the rest
        while (select.options.length > 1) {
            select.remove(1);
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
        // Keep the first "Select airline..." option, remove the rest
        while (select.options.length > 1) {
            select.remove(1);
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

// ===== TAB FUNCTIONALITY =====
let currentTab = 'departures'; // Track which tab is active

const tabButtons = document.querySelectorAll('.tab-btn');
tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all tabs
        tabButtons.forEach(btn => btn.classList.remove('active'));
        // Add active class to clicked tab
        button.classList.add('active');
        // Update current tab
        currentTab = button.getAttribute('data-tab');
        // Reload rides with new filter
        loadRides();
    });
});

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

// ===== SKIP SECTION FUNCTIONALITY =====
const skipButtons = document.querySelectorAll('.skip-section-btn');

skipButtons.forEach(button => {
    button.addEventListener('click', () => {
        const sectionType = button.getAttribute('data-section');
        const section = document.getElementById(`${sectionType}Section`);
        const isCollapsed = section.classList.contains('collapsed');
        
        if (isCollapsed) {
            // Expand the section
            section.classList.remove('collapsed');
            button.classList.remove('active');
            button.textContent = "Don't know yet";
            
            // Make fields required again
            if (sectionType === 'departure') {
                document.getElementById('depDate').setAttribute('required', '');
                document.getElementById('depTime').setAttribute('required', '');
                document.getElementById('depAirport').setAttribute('required', '');
            } else if (sectionType === 'arrival') {
                document.getElementById('arrDate').setAttribute('required', '');
                document.getElementById('arrTime').setAttribute('required', '');
                document.getElementById('arrAirport').setAttribute('required', '');
            }
        } else {
            // Collapse the section
            section.classList.add('collapsed');
            button.classList.add('active');
            button.textContent = 'Skipped - Click to add info';
            
            // Remove required attributes and clear values
            if (sectionType === 'departure') {
                document.getElementById('depDate').removeAttribute('required');
                document.getElementById('depTime').removeAttribute('required');
                document.getElementById('depAirport').removeAttribute('required');
                document.getElementById('depDate').value = '';
                document.getElementById('depTime').value = '';
                document.getElementById('depAirport').value = '';
                document.getElementById('depAirline').value = '';
            } else if (sectionType === 'arrival') {
                document.getElementById('arrDate').removeAttribute('required');
                document.getElementById('arrTime').removeAttribute('required');
                document.getElementById('arrAirport').removeAttribute('required');
                document.getElementById('arrDate').value = '';
                document.getElementById('arrTime').value = '';
                document.getElementById('arrAirport').value = '';
                document.getElementById('arrAirline').value = '';
            }
        }
    });
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
    
    // Filter rides based on current tab
    const filteredRides = rides.filter(ride => {
        if (currentTab === 'departures') {
            // Show rides with departure info
            return ride['Dep Date'] && ride['Dep Airport'];
        } else {
            // Show rides with arrival info
            return ride['Arr Date'] && ride['Arr Airport'];
        }
    });
    
    if (filteredRides.length === 0) {
        ridesTable.innerHTML = `<p class="empty-state">No ${currentTab} yet. Be the first to share your ride info!</p>`;
        return;
    }
    
    let html = '<div class="rides-grid">';
    
    filteredRides.forEach(ride => {
        // Determine which info to show based on current tab
        let date, time, airport, airline, icon;
        
        if (currentTab === 'departures') {
            date = ride['Dep Date'];
            time = ride['Dep Time'];
            airport = ride['Dep Airport'];
            airline = ride['Dep Airline'];
            icon = '🛫';
        } else {
            date = ride['Arr Date'];
            time = ride['Arr Time'];
            airport = ride['Arr Airport'];
            airline = ride['Arr Airline'];
            icon = '🛬';
        }
        
        // Format time to be more readable (remove seconds if present)
        let formattedTime = time;
        if (time && time.includes(':')) {
            const timeParts = time.split(':');
            formattedTime = `${timeParts[0]}:${timeParts[1]}`;
        }
        
        // Extract airport code (first 3 letters before the dash)
        const airportCode = airport ? airport.split(' ')[0] : '';
        
        html += `
            <div class="ride-card">
                <div class="card-header">
                    <h3 class="rider-name">${ride['First Name']} ${ride['Last Name']}</h3>
                    <div class="date-time">
                        <span class="date">${formatDate(date)}</span>
                        <span class="time">${formattedTime}</span>
                    </div>
                </div>
                
                <div class="card-tags">
                    <span class="tag airport-tag">${icon} ${airportCode}</span>
                    ${airline ? `<span class="tag airline-tag">${airline}</span>` : ''}
                </div>
                
                ${ride['Location'] ? `<div class="card-location">📍 ${ride['Location']}</div>` : ''}
                
                <div class="card-actions">
                    <a href="mailto:${ride['Email']}" class="contact-btn-full">✉️ Contact</a>
                    ${ride['Phone'] ? `<a href="tel:${ride['Phone']}" class="contact-btn-full phone-btn">📞 Call</a>` : ''}
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

// Load rides and show modal when page loads
window.addEventListener('DOMContentLoaded', () => {
    populateDropdowns();
    loadRides();
    // Show modal automatically on page load
    modal.classList.add('active');
});