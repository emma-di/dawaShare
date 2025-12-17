// ===== DROPDOWN DATA =====
// UPDATE THESE ARRAYS WITH YOUR REAL VALUES

const LOCATIONS = [
    'Branner Hall',
    'Stern Hall',
    'Wilbur Hall',
    'Florence Moore Hall',
    'Toyon Hall',
    'Roble Hall',
    'Crothers Hall',
    'Off-Campus'
];

const AIRPORTS = [
    'SFO - San Francisco International',
    'SJC - San Jose International',
    'OAK - Oakland International'
];

const AIRLINES = [
    'Alaska Airlines',
    'American Airlines',
    'Delta Air Lines',
    'JetBlue Airways',
    'Southwest Airlines',
    'United Airlines',
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

// ===== FORM SUBMISSION =====
rideForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(rideForm);
    const data = {};
    formData.forEach((value, key) => {
        data[key] = value;
    });
    
    console.log('Form submitted:', data);
    
    // TODO: Send data to backend/storage
    // For now, just show alert and close modal
    alert('Thank you! Your ride info has been submitted. (Note: Storage functionality coming soon)');
    
    // Reset form and close modal
    rideForm.reset();
    modal.classList.remove('active');
    
    // TODO: Refresh rides display
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
