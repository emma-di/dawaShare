// ===== DROPDOWN DATA =====
// UPDATE THESE ARRAYS WITH YOUR REAL VALUES

const LOCATIONS = [
  'Branner',
  'Casper Quad',
  'Crothers / Crothers Memorial (CroMem)',
  'EVGR',
  'Florence Moore',
  'GovCo',
  'Lagunita Court',
  'Mirrielees',
  'Roble',
  'Row: Lower (closer to Tresidder)',
  'Row: Upper (further from Tresidder)',
  'Stern',
  'Toyon',
  'Wilbur',
  'Other / Off-Campus (explain below)'
];

const AIRPORTS = [
    'SFO - San Francisco International',
    'SJC - San Jose International',
    'OAK - Oakland International'
];

const AIRLINES = [
  'Air Canada',
  'Alaska',
  'American',
  'British Airways',
  'Delta',
  'Frontier',
  'Hawaiian',
  'JetBlue',
  'Korean Air',
  'Lufthansa',
  'Singapore',
  'Southwest',
  'Spirit',
  'United',
  'Other'
];

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

// Open modal on page load
window.addEventListener('DOMContentLoaded', () => {
    populateDropdowns();
    // Show modal automatically on page load
    modal.classList.add('active');
});

// Open modal when clicking "Add Your Ride" button
openFormBtn.addEventListener('click', () => {
    modal.classList.add('active');
});

// Close modal when clicking X button
closeBtn.addEventListener('click', () => {
    modal.classList.remove('active');
});

// Close modal when clicking "Already submitted / Unsure rn" button
alreadySubmittedBtn.addEventListener('click', () => {
    modal.classList.remove('active');
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

// ===== CONFIGURATION =====
const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbz3tCsxyBNcBZZA2JfEKE71Am54hSCoak2rFQqy3_x5tCEf1MbV9z9wrHu2xou1XO2o/exec'; // Paste your URL here!

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
                        <strong>Departure:</strong>
                        <p>${ride['Dep Airport']} at ${ride['Dep Time']}</p>
                        ${ride['Dep Airline'] ? `<p class="airline">${ride['Dep Airline']}</p>` : ''}
                    </div>
                    <div class="ride-section">
                        <strong>Arrival:</strong>
                        <p>${ride['Arr Airport']} at ${ride['Arr Time']}</p>
                        ${ride['Arr Airline'] ? `<p class="airline">${ride['Arr Airline']}</p>` : ''}
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
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Load rides when page loads
window.addEventListener('DOMContentLoaded', () => {
    populateDropdowns();
    loadRides();
    // Show modal automatically on page load
    modal.classList.add('active');
});

// ===== EMAIL VALIDATION =====
const emailInput = document.getElementById('email');
emailInput.addEventListener('blur', () => {
    const email = emailInput.value;
    if (email && !email.endsWith('@stanford.edu')) {
        alert('Please use your Stanford email address (@stanford.edu)');
        emailInput.focus();
    }
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
