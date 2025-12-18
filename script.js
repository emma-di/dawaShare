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

// ===== NAME AUTO-CAPITALIZATION =====
const firstNameInput = document.getElementById('firstName');
const lastNameInput = document.getElementById('lastName');

// Capitalize first letter when user leaves the field
function capitalizeName(input) {
    if (input.value) {
        // Trim leading/trailing spaces and collapse multiple spaces
        const trimmed = input.value.trim().replace(/\s+/g, ' ');
        
        // Split by spaces to handle multiple words
        const words = trimmed.split(' ');
        const capitalizedWords = words.map(word => {
            if (word.length > 0) {
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            }
            return word;
        });
        input.value = capitalizedWords.join(' ');
    }
}

firstNameInput.addEventListener('blur', function() {
    capitalizeName(this);
});

lastNameInput.addEventListener('blur', function() {
    capitalizeName(this);
});

// ===== TAB FUNCTIONALITY =====
let currentTab = 'departures'; // Track which tab is active
let allRidesData = []; // Store all rides data (cached)
let filters = {
    dates: [],
    airport: '',
    times: [],
    locations: [],
    types: [] // 'shuttle' or 'individual'
};

const tabButtons = document.querySelectorAll('.tab-btn');
tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all tabs
        tabButtons.forEach(btn => btn.classList.remove('active'));
        // Add active class to clicked tab
        button.classList.add('active');
        // Update current tab
        currentTab = button.getAttribute('data-tab');
        // Reset filters when switching tabs
        resetFilters();
        // Reload rides with new filter (uses cached data, no fetch)
        displayRides(allRidesData);
    });
});

// ===== FILTER FUNCTIONALITY =====
const filterAirport = document.getElementById('filterAirport');
const dateFilterBtn = document.getElementById('dateFilterBtn');
const dateFilterPanel = document.getElementById('dateFilterPanel');
const timeFilterBtn = document.getElementById('timeFilterBtn');
const timeFilterPanel = document.getElementById('timeFilterPanel');
const locationFilterBtn = document.getElementById('locationFilterBtn');
const locationFilterPanel = document.getElementById('locationFilterPanel');
const typeFilterBtn = document.getElementById('typeFilterBtn');
const typeFilterPanel = document.getElementById('typeFilterPanel');

// Toggle dropdown panels
dateFilterBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isActive = dateFilterBtn.classList.contains('active');
    // Close all dropdowns
    closeAllDropdowns();
    // Toggle this one
    if (!isActive) {
        dateFilterBtn.classList.add('active');
        dateFilterPanel.classList.add('active');
    }
});

timeFilterBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isActive = timeFilterBtn.classList.contains('active');
    closeAllDropdowns();
    if (!isActive) {
        timeFilterBtn.classList.add('active');
        timeFilterPanel.classList.add('active');
    }
});

locationFilterBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isActive = locationFilterBtn.classList.contains('active');
    closeAllDropdowns();
    if (!isActive) {
        locationFilterBtn.classList.add('active');
        locationFilterPanel.classList.add('active');
    }
});

typeFilterBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isActive = typeFilterBtn.classList.contains('active');
    closeAllDropdowns();
    if (!isActive) {
        typeFilterBtn.classList.add('active');
        typeFilterPanel.classList.add('active');
    }
});

// Prevent dropdown from closing when clicking inside
dateFilterPanel.addEventListener('click', (e) => {
    e.stopPropagation();
});

timeFilterPanel.addEventListener('click', (e) => {
    e.stopPropagation();
});

locationFilterPanel.addEventListener('click', (e) => {
    e.stopPropagation();
});

typeFilterPanel.addEventListener('click', (e) => {
    e.stopPropagation();
});

// Close all dropdowns helper
function closeAllDropdowns() {
    dateFilterPanel.classList.remove('active');
    dateFilterBtn.classList.remove('active');
    timeFilterPanel.classList.remove('active');
    timeFilterBtn.classList.remove('active');
    locationFilterPanel.classList.remove('active');
    locationFilterBtn.classList.remove('active');
    typeFilterPanel.classList.remove('active');
    typeFilterBtn.classList.remove('active');
}

// Close dropdowns when clicking outside
document.addEventListener('click', closeAllDropdowns);

// Done buttons
document.getElementById('doneDateBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    closeAllDropdowns();
});

document.getElementById('doneTimeBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    closeAllDropdowns();
});

document.getElementById('doneLocationBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    closeAllDropdowns();
});

document.getElementById('doneTypeBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    closeAllDropdowns();
});

// Clear All buttons
document.getElementById('clearDateBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    filters.dates = [];
    updateFilterButtonText('dateFilterBtn', [], 'All Dates');
    displayRides(allRidesData);
    // Re-populate date checkboxes without affecting other filters
    populateDateFilter(allRidesData);
});

document.getElementById('clearTimeBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    filters.times = [];
    updateFilterButtonText('timeFilterBtn', [], 'All Times');
    displayRides(allRidesData);
    // Re-populate time checkboxes without affecting other filters
    populateTimeFilter(allRidesData);
});

document.getElementById('clearLocationBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    filters.locations = [];
    updateFilterButtonText('locationFilterBtn', [], 'All Locations');
    displayRides(allRidesData);
    // Re-populate location checkboxes without affecting other filters
    populateLocationFilter(allRidesData);
});

document.getElementById('clearTypeBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    filters.types = [];
    updateFilterButtonText('typeFilterBtn', [], 'All Types');
    displayRides(allRidesData);
    // Uncheck all type checkboxes
    document.querySelectorAll('#typeFilterOptions input[type="checkbox"]').forEach(cb => {
        cb.checked = false;
    });
});

// Type filter checkboxes
document.querySelectorAll('#typeFilterOptions input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
        const type = e.target.value;
        if (e.target.checked) {
            filters.types.push(type);
        } else {
            filters.types = filters.types.filter(t => t !== type);
        }
        updateFilterButtonText('typeFilterBtn', filters.types, 'All Types');
        displayRides(allRidesData);
    });
});

// Airport filter (single select)
filterAirport.addEventListener('change', (e) => {
    filters.airport = e.target.value;
    displayRides(allRidesData);
});

// Master Clear All Filters button
document.getElementById('clearAllFiltersBtn').addEventListener('click', () => {
    resetFilters();
});

function updateFilterButtonText(buttonId, filterArray, allText) {
    const button = document.getElementById(buttonId);
    if (filterArray.length === 0) {
        button.childNodes[0].textContent = allText + ' ';
    } else if (filterArray.length === 1) {
        // Format the single item based on which filter it is
        let displayText = filterArray[0];
        if (buttonId === 'dateFilterBtn') {
            displayText = formatDate(filterArray[0]);
        } else if (buttonId === 'typeFilterBtn') {
            // Format type filter display text
            if (filterArray[0] === 'shuttle') {
                displayText = 'Shuttles Only';
            } else if (filterArray[0] === 'individual') {
                displayText = 'Individuals Only';
            }
        }
        button.childNodes[0].textContent = displayText + ' ';
    } else {
        button.childNodes[0].textContent = `${filterArray.length} selected `;
    }
}

function resetFilters() {
    filters = { dates: [], airport: '', times: [], locations: [], types: [] };
    filterAirport.value = '';
    updateFilterButtonText('dateFilterBtn', [], 'All Dates');
    updateFilterButtonText('timeFilterBtn', [], 'All Times');
    updateFilterButtonText('locationFilterBtn', [], 'All Locations');
    updateFilterButtonText('typeFilterBtn', [], 'All Types');
    // Uncheck all type checkboxes
    document.querySelectorAll('#typeFilterOptions input[type="checkbox"]').forEach(cb => {
        cb.checked = false;
    });
    populateFilterDropdowns(allRidesData);
    displayRides(allRidesData);
}

function populateFilterDropdowns(rides) {
    populateDateFilter(rides);
    populateAirportFilter(rides);
    populateTimeFilter(rides);
    populateLocationFilter(rides);
}

function populateDateFilter(rides) {
    // Filter rides based on current tab first
    const tabFilteredRides = rides.filter(ride => {
        if (currentTab === 'departures') {
            return ride['Dep Date'] && ride['Dep Airport'];
        } else {
            return ride['Arr Date'] && ride['Arr Airport'];
        }
    });
    
    const dates = new Set();
    tabFilteredRides.forEach(ride => {
        const date = currentTab === 'departures' ? ride['Dep Date'] : ride['Arr Date'];
        if (date) {
            // Normalize date to YYYY-MM-DD format (remove time portion if present)
            const normalizedDate = date.split('T')[0];
            console.log('Adding date to filter options:', date, '→', normalizedDate);
            dates.add(normalizedDate);
        }
    });
    
    // Add shuttle dates to the set (Set automatically prevents duplicates)
    const shuttles = currentTab === 'departures' ? DEPARTURE_SHUTTLES : ARRIVAL_SHUTTLES;
    console.log('Adding shuttle dates for', currentTab, '- shuttle count:', shuttles.length);
    shuttles.forEach(shuttle => {
        // Shuttle dates are already in YYYY-MM-DD format
        console.log('Adding shuttle date:', shuttle.date);
        dates.add(shuttle.date);
    });
    
    // Convert to array and sort chronologically
    // Use string comparison since YYYY-MM-DD format sorts correctly alphabetically
    // This avoids timezone conversion issues from new Date()
    const sortedDates = Array.from(dates).sort();
    
    // Populate date checkboxes
    const dateOptions = document.getElementById('dateFilterOptions');
    dateOptions.innerHTML = '';
    sortedDates.forEach(date => {
        const option = document.createElement('div');
        option.className = 'filter-option';
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `date-${date}`;
        checkbox.value = date;
        checkbox.checked = filters.dates.includes(date);
        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                filters.dates.push(date);
            } else {
                filters.dates = filters.dates.filter(d => d !== date);
            }
            updateFilterButtonText('dateFilterBtn', filters.dates, 'All Dates');
            displayRides(allRidesData);
        });
        const label = document.createElement('label');
        label.htmlFor = `date-${date}`;
        label.textContent = formatDate(date);
        option.appendChild(checkbox);
        option.appendChild(label);
        dateOptions.appendChild(option);
    });
}

function populateAirportFilter(rides) {
    // Filter rides based on current tab first
    const tabFilteredRides = rides.filter(ride => {
        if (currentTab === 'departures') {
            return ride['Dep Date'] && ride['Dep Airport'];
        } else {
            return ride['Arr Date'] && ride['Arr Airport'];
        }
    });
    
    const airports = new Set();
    tabFilteredRides.forEach(ride => {
        const airport = currentTab === 'departures' ? ride['Dep Airport'] : ride['Arr Airport'];
        if (airport) airports.add(airport.split(' ')[0]); // Get airport code
    });
    
    // Store current selection
    const currentAirport = filterAirport.value;
    
    // Populate airport dropdown (single select)
    filterAirport.innerHTML = '<option value="">All Airports</option>';
    Array.from(airports).sort().forEach(airport => {
        const option = document.createElement('option');
        option.value = airport;
        option.textContent = airport;
        filterAirport.appendChild(option);
    });
    
    // Restore selection if it still exists
    if (currentAirport && Array.from(airports).includes(currentAirport)) {
        filterAirport.value = currentAirport;
    }
}

function populateTimeFilter(rides) {
    // Filter rides based on current tab first
    const tabFilteredRides = rides.filter(ride => {
        if (currentTab === 'departures') {
            return ride['Dep Date'] && ride['Dep Airport'];
        } else {
            return ride['Arr Date'] && ride['Arr Airport'];
        }
    });
    
    const timeRanges = new Set();
    
    // Add time ranges from individual rides
    tabFilteredRides.forEach(ride => {
        const time = currentTab === 'departures' ? ride['Dep Time'] : ride['Arr Time'];
        if (time) {
            // Categorize times into ranges using LOCAL time
            const timeStr = String(time).trim();
            let hours;
            
            if (timeStr.includes('T') && timeStr.includes('Z')) {
                // UTC time - convert to local
                const fullDate = new Date(timeStr);
                hours = fullDate.getHours(); // Gets local hours
            } else if (timeStr.includes('T')) {
                // ISO format but not UTC
                hours = parseInt(timeStr.split('T')[1].split(':')[0]);
            } else if (timeStr.includes(':')) {
                hours = parseInt(timeStr.split(':')[0]);
            }
            
            if (hours !== undefined) {
                if (hours >= 3 && hours < 9) timeRanges.add('Early Morning (3-9am)');
                else if (hours >= 9 && hours < 12) timeRanges.add('Morning (9am-12pm)');
                else if (hours >= 12 && hours < 17) timeRanges.add('Afternoon (12-5pm)');
                else if (hours >= 17 && hours < 21) timeRanges.add('Evening (5-9pm)');
                else timeRanges.add('Night (9pm-3am)');
            }
        }
    });
    
    // Add time ranges from shuttles
    const shuttles = currentTab === 'departures' ? DEPARTURE_SHUTTLES : ARRIVAL_SHUTTLES;
    shuttles.forEach(shuttle => {
        const hours = parseInt(shuttle.time.split(':')[0]);
        if (hours >= 3 && hours < 9) timeRanges.add('Early Morning (3-9am)');
        else if (hours >= 9 && hours < 12) timeRanges.add('Morning (9am-12pm)');
        else if (hours >= 12 && hours < 17) timeRanges.add('Afternoon (12-5pm)');
        else if (hours >= 17 && hours < 21) timeRanges.add('Evening (5-9pm)');
        else timeRanges.add('Night (9pm-3am)');
    });
    
    // Populate time checkboxes - show all time ranges, always enabled
    const timeOptions = document.getElementById('timeFilterOptions');
    timeOptions.innerHTML = '';
    const timeOrder = ['Early Morning (3-9am)', 'Morning (9am-12pm)', 'Afternoon (12-5pm)', 'Evening (5-9pm)', 'Night (9pm-3am)'];
    timeOrder.forEach(timeRange => {
        const option = document.createElement('div');
        option.className = 'filter-option';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `time-${timeRange}`;
        checkbox.value = timeRange;
        checkbox.checked = filters.times.includes(timeRange);
        // Always enabled - let users select any time
        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                filters.times.push(timeRange);
            } else {
                filters.times = filters.times.filter(t => t !== timeRange);
            }
            updateFilterButtonText('timeFilterBtn', filters.times, 'All Times');
            displayRides(allRidesData);
        });
        const label = document.createElement('label');
        label.htmlFor = `time-${timeRange}`;
        label.textContent = timeRange;
        option.appendChild(checkbox);
        option.appendChild(label);
        timeOptions.appendChild(option);
    });
}

function populateLocationFilter(rides) {
    // Filter rides based on current tab first
    const tabFilteredRides = rides.filter(ride => {
        if (currentTab === 'departures') {
            return ride['Dep Date'] && ride['Dep Airport'];
        } else {
            return ride['Arr Date'] && ride['Arr Airport'];
        }
    });
    
    // Get locations that actually have rides (with the exact values from spreadsheet)
    const availableLocationsFromData = new Set();
    tabFilteredRides.forEach(ride => {
        const location = ride['Location'];
        if (location) availableLocationsFromData.add(location);
    });
    
    console.log('Locations from data:', Array.from(availableLocationsFromData));
    
    // Populate location checkboxes - show ALL locations from config, always enabled
    const locationOptions = document.getElementById('locationFilterOptions');
    locationOptions.innerHTML = '';
    LOCATIONS.forEach(configLocation => {
        const option = document.createElement('div');
        option.className = 'filter-option';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `location-${configLocation}`;
        checkbox.value = configLocation;
        checkbox.checked = filters.locations.includes(configLocation);
        // Always enabled - let users select any location
        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                filters.locations.push(configLocation);
            } else {
                filters.locations = filters.locations.filter(l => l !== configLocation);
            }
            updateFilterButtonText('locationFilterBtn', filters.locations, 'All Locations');
            displayRides(allRidesData);
        });
        const label = document.createElement('label');
        label.htmlFor = `location-${configLocation}`;
        label.textContent = configLocation;
        option.appendChild(checkbox);
        option.appendChild(label);
        locationOptions.appendChild(option);
    });
}

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
            button.textContent = "Skip for now";
            
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
    
    // Check if sections are skipped (collapsed)
    const departureSection = document.getElementById('departureSection');
    const arrivalSection = document.getElementById('arrivalSection');
    
    data.departureSkipped = departureSection.classList.contains('collapsed');
    data.arrivalSkipped = arrivalSection.classList.contains('collapsed');
    
    // If section is skipped, clear its data so backend knows not to update those fields
    if (data.departureSkipped) {
        delete data.depDate;
        delete data.depTime;
        delete data.depAirport;
        delete data.depAirline;
    }
    
    if (data.arrivalSkipped) {
        delete data.arrDate;
        delete data.arrTime;
        delete data.arrAirport;
        delete data.arrAirline;
    }
    
    try {
        // Send data to Google Sheets
        // Note: mode: 'no-cors' means we can't read the response, so we'll assume success
        const fetchPromise = fetch(GOOGLE_SHEET_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        // Don't wait forever - give it 2 seconds max, then assume success
        const timeoutPromise = new Promise(resolve => setTimeout(resolve, 2000));
        
        // Wait for whichever comes first: response or timeout
        await Promise.race([fetchPromise, timeoutPromise]);
        
        // Success! (we assume, since no-cors doesn't let us check)
        alert('✅ Thank you! Your ride info has been submitted successfully.');
        
        // Save user's info to localStorage for pre-filling emails
        localStorage.setItem('dawaShare_userInfo', JSON.stringify({
            firstName: data.firstName,
            lastName: data.lastName,
            depDate: data.depDate,
            depTime: data.depTime,
            depAirport: data.depAirport,
            depAirline: data.depAirline,
            arrDate: data.arrDate,
            arrTime: data.arrTime,
            arrAirport: data.arrAirport,
            arrAirline: data.arrAirline,
            location: data.location
        }));
        
        // Reset form and close modal
        rideForm.reset();
        modal.classList.remove('active');
        
        // Refresh the rides display (forces new fetch)
        forceRefreshData();
        
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
let isDataLoaded = false; // Track if we've loaded data yet

async function loadRides() {
    // If data is already cached, just re-render with cached data
    if (isDataLoaded) {
        displayRides(allRidesData);
        return;
    }
    
    // Show loading state
    const ridesTable = document.getElementById('ridesTable');
    ridesTable.innerHTML = '<p class="loading-state">Loading rides... ⏳</p>';
    
    try {
        const response = await fetch(GOOGLE_SHEET_URL);
        const result = await response.json();
        
        if (result.result === 'success' && result.data.length > 0) {
            allRidesData = result.data;
            isDataLoaded = true; // Mark data as loaded
            populateFilterDropdowns(allRidesData);
            displayRides(allRidesData);
        } else {
            ridesTable.innerHTML = '<p class="empty-state">No rides yet. Be the first to share your ride info!</p>';
        }
    } catch (error) {
        console.error('Error loading rides:', error);
        ridesTable.innerHTML = '<p class="empty-state">No rides yet. Be the first to share your ride info!</p>';
    }
}

// Force refresh data (call this after form submission)
function forceRefreshData() {
    isDataLoaded = false;
    loadRides();
}

// ===== DISPLAY RIDES IN TABLE =====
function displayRides(rides) {
    const ridesTable = document.getElementById('ridesTable');
    
    console.log('=== displayRides called ===');
    console.log('Total rides received:', rides.length);
    console.log('First ride data:', rides[0]);
    
    // Filter rides based on current tab
    let filteredRides = rides.filter(ride => {
        if (currentTab === 'departures') {
            return ride['Dep Date'] && ride['Dep Airport'];
        } else {
            return ride['Arr Date'] && ride['Arr Airport'];
        }
    });
    
    console.log('Filtered rides for', currentTab, ':', filteredRides.length);
    
    // Apply additional filters
    if (filters.dates.length > 0) {
        console.log('DATE FILTER ACTIVE - Selected dates:', filters.dates);
        filteredRides = filteredRides.filter(ride => {
            const date = currentTab === 'departures' ? ride['Dep Date'] : ride['Arr Date'];
            if (!date) return false;
            
            // Normalize date to YYYY-MM-DD format
            // Handle both ISO strings and plain date strings
            let normalizedDate;
            if (date.includes('T')) {
                // ISO format with time - split and take date part
                normalizedDate = date.split('T')[0];
            } else if (date.includes('-')) {
                // Already in YYYY-MM-DD format
                normalizedDate = date;
            } else {
                // Fallback: try to parse as date
                const parsed = new Date(date);
                normalizedDate = parsed.toISOString().split('T')[0];
            }
            
            const matches = filters.dates.includes(normalizedDate);
            console.log('Date check:', normalizedDate, 'matches filter?', matches);
            return matches;
        });
    }
    
    if (filters.airport) {
        filteredRides = filteredRides.filter(ride => {
            const airport = currentTab === 'departures' ? ride['Dep Airport'] : ride['Arr Airport'];
            return airport && airport.startsWith(filters.airport);
        });
    }
    
    if (filters.times.length > 0) {
        filteredRides = filteredRides.filter(ride => {
            const time = currentTab === 'departures' ? ride['Dep Time'] : ride['Arr Time'];
            if (!time) return false;
            
            const timeStr = String(time).trim();
            let hours;
            
            if (timeStr.includes('T') && timeStr.includes('Z')) {
                // UTC time - convert to local
                const fullDate = new Date(timeStr);
                hours = fullDate.getHours(); // Gets local hours
            } else if (timeStr.includes('T')) {
                // ISO format but not UTC
                hours = parseInt(timeStr.split('T')[1].split(':')[0]);
            } else if (timeStr.includes(':')) {
                hours = parseInt(timeStr.split(':')[0]);
            }
            
            if (hours === undefined) return false;
            
            return filters.times.some(timeRange => {
                if (timeRange === 'Early Morning (3-9am)') return hours >= 3 && hours < 9;
                if (timeRange === 'Morning (9am-12pm)') return hours >= 9 && hours < 12;
                if (timeRange === 'Afternoon (12-5pm)') return hours >= 12 && hours < 17;
                if (timeRange === 'Evening (5-9pm)') return hours >= 17 && hours < 21;
                if (timeRange === 'Night (9pm-3am)') return hours >= 21 || hours < 3;
                return false;
            });
        });
    }
    
    if (filters.locations.length > 0) {
        filteredRides = filteredRides.filter(ride => {
            const rideLocation = ride['Location'];
            if (!rideLocation) return false;
            
            // Check if any selected location matches (exact or partial match)
            return filters.locations.some(selectedLoc => {
                // Exact match
                if (rideLocation === selectedLoc) return true;
                // Partial match (case-insensitive) - handles "Toyon" vs "Toyon Hall"
                return rideLocation.toLowerCase().includes(selectedLoc.toLowerCase()) ||
                       selectedLoc.toLowerCase().includes(rideLocation.toLowerCase());
            });
        });
    }
    
    // Sort rides by date and time (earliest first)
    filteredRides.sort((a, b) => {
        const dateA = currentTab === 'departures' ? a['Dep Date'] : a['Arr Date'];
        const dateB = currentTab === 'departures' ? b['Dep Date'] : b['Arr Date'];
        const timeA = currentTab === 'departures' ? a['Dep Time'] : a['Arr Time'];
        const timeB = currentTab === 'departures' ? b['Dep Time'] : b['Arr Time'];
        
        // Compare dates first
        if (dateA !== dateB) {
            return new Date(dateA) - new Date(dateB);
        }
        
        // If dates are equal, compare times
        if (timeA && timeB) {
            // Extract hours from ISO format
            const getHours = (timeStr) => {
                const str = String(timeStr).trim();
                if (str.includes('T')) {
                    return parseInt(str.split('T')[1].split(':')[0]);
                }
                return 0;
            };
            return getHours(timeA) - getHours(timeB);
        }
        
        return 0;
    });
    
    let html = '<div class="rides-grid">';
    
    // ===== PREPARE SHUTTLES =====
    let shuttles = currentTab === 'departures' ? DEPARTURE_SHUTTLES : ARRIVAL_SHUTTLES;
    
    // Apply filters to shuttles (NOTE: Shuttles are NOT filtered by location - they serve all locations)
    // Type filter
    if (filters.types.length > 0) {
        if (!filters.types.includes('shuttle')) {
            shuttles = [];
        }
    }
    
    // Date filter
    if (filters.dates.length > 0) {
        shuttles = shuttles.filter(shuttle => filters.dates.includes(shuttle.date));
    }
    
    // Airport filter
    if (filters.airport) {
        shuttles = shuttles.filter(shuttle => shuttle.airport === filters.airport);
    }
    
    // Time filter
    if (filters.times.length > 0) {
        shuttles = shuttles.filter(shuttle => {
            const hours = parseInt(shuttle.time.split(':')[0]);
            return filters.times.some(timeRange => {
                if (timeRange === 'Early Morning (3-9am)') return hours >= 3 && hours < 9;
                if (timeRange === 'Morning (9am-12pm)') return hours >= 9 && hours < 12;
                if (timeRange === 'Afternoon (12-5pm)') return hours >= 12 && hours < 17;
                if (timeRange === 'Evening (5-9pm)') return hours >= 17 && hours < 21;
                if (timeRange === 'Night (9pm-3am)') return hours >= 21 || hours < 3;
                return false;
            });
        });
    }
    
    // Filter individual rides by type filter
    if (filters.types.length > 0 && filters.types.includes('individual') && !filters.types.includes('shuttle')) {
        // Show only individuals, shuttles already filtered out above
    } else if (filters.types.length > 0 && !filters.types.includes('individual')) {
        // Only shuttles selected, remove all individual rides
        filteredRides = [];
    }
    
    // Check if we have any results
    if (filteredRides.length === 0 && shuttles.length === 0) {
        ridesTable.innerHTML = `<p class="empty-state">No ${currentTab} match your filters. Try adjusting your search!</p>`;
        return;
    }
    
    // ===== COMBINE SHUTTLES AND RIDES INTO ONE ARRAY FOR CHRONOLOGICAL SORTING =====
    const allItems = [];
    
    // Add shuttles with type marker and sortable datetime
    shuttles.forEach(shuttle => {
        allItems.push({
            type: 'shuttle',
            data: shuttle,
            sortDateTime: `${shuttle.date}T${shuttle.time}:00` // e.g., "2025-12-19T08:30:00"
        });
    });
    
    // Add individual rides with type marker and sortable datetime
    filteredRides.forEach(ride => {
        const date = currentTab === 'departures' ? ride['Dep Date'] : ride['Arr Date'];
        const time = currentTab === 'departures' ? ride['Dep Time'] : ride['Arr Time'];
        
        // Extract date and time for sorting
        let sortDate = date ? date.split('T')[0] : '9999-12-31'; // Far future if no date
        let sortTime = '00:00:00';
        
        if (time) {
            const timeStr = String(time).trim();
            if (timeStr.includes('T') && timeStr.includes('Z')) {
                // UTC time - convert to local for sorting
                const fullDate = new Date(timeStr);
                const hours = String(fullDate.getHours()).padStart(2, '0');
                const mins = String(fullDate.getMinutes()).padStart(2, '0');
                sortTime = `${hours}:${mins}:00`;
            } else if (timeStr.includes('T')) {
                sortTime = timeStr.split('T')[1].split('.')[0];
            } else if (timeStr.includes(':')) {
                const parts = timeStr.split(':');
                sortTime = `${parts[0].padStart(2, '0')}:${parts[1] || '00'}:00`;
            }
        }
        
        allItems.push({
            type: 'ride',
            data: ride,
            sortDateTime: `${sortDate}T${sortTime}`
        });
    });
    
    // Sort all items chronologically
    allItems.sort((a, b) => a.sortDateTime.localeCompare(b.sortDateTime));
    
    // ===== RENDER ALL ITEMS IN CHRONOLOGICAL ORDER =====
    allItems.forEach(item => {
        if (item.type === 'shuttle') {
            // Render shuttle card
            const shuttle = item.data;
        // Parse date manually to avoid timezone issues
        const [year, month, day] = shuttle.date.split('-').map(Number);
        const shuttleDate = new Date(year, month - 1, day); // Create in local timezone
        
        const formattedDate = shuttleDate.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'numeric', 
            day: 'numeric' 
        });
        
        // Format time to 12-hour format
        const [hours24, minutes] = shuttle.time.split(':');
        const hours = parseInt(hours24);
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const hours12 = hours % 12 || 12;
        const formattedTime = `${hours12}:${minutes} ${ampm}`;
        
        const icon = currentTab === 'departures' ? '🛫' : '🛬';
        const airportText = `${icon} ${shuttle.airport}`;
        
        // Determine card classes
        let cardClasses = 'ride-card shuttle-card';
        if (shuttle.lowTickets) cardClasses += ' low-tickets';
        if (shuttle.soldOut) cardClasses += ' sold-out';
        
        // Button text and class
        const btnText = shuttle.soldOut ? 'Join Waitlist' : 'Buy Tickets ($5)';
        const btnClass = shuttle.soldOut ? 'shuttle-buy-btn waitlist' : 'shuttle-buy-btn';
        
        html += `
            <div class="${cardClasses}">
                <div class="card-header">
                    <div class="date-time">
                        <span class="date-large">${formattedDate}</span>
                        <span class="time-large">${formattedTime}</span>
                    </div>
                </div>
                
                <div class="card-info">
                    <div class="card-airport-airline">${airportText}</div>
                    <div class="card-location">🚌 Direct from campus</div>
                </div>
                
                <div class="card-actions">
                    <a href="${SHUTTLE_TICKET_URL}" target="_blank" class="${btnClass}">${btnText}</a>
                </div>
            </div>
        `;
        } else {
            // Render individual ride card
            const ride = item.data;
        console.log('--- Processing ride ---');
        console.log('Name:', ride['First Name'], ride['Last Name']);
        console.log('Dep Time:', ride['Dep Time']);
        console.log('Arr Time:', ride['Arr Time']);
        
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
        
        // Format time to 12-hour format with AM/PM
        let formattedTime = 'Time TBD';
        if (time) {
            console.log('Raw time value:', time, 'Type:', typeof time);
            const timeStr = String(time).trim();
            console.log('Time string after trim:', timeStr);
            
            if (timeStr && timeStr !== '' && timeStr !== 'undefined' && timeStr !== 'null') {
                let hours24, minutes;
                
                // Check if it's an ISO datetime format (e.g., "1899-12-30T16:00:00.000Z")
                if (timeStr.includes('T') && timeStr.includes(':') && timeStr.includes('Z')) {
                    // This is a UTC time from Google Sheets - need to convert to local time
                    const fullDate = new Date(timeStr);
                    hours24 = fullDate.getHours(); // This gets local hours
                    minutes = String(fullDate.getMinutes()).padStart(2, '0');
                    console.log('Parsed from ISO UTC format - local hours24:', hours24, 'minutes:', minutes);
                } else if (timeStr.includes('T') && timeStr.includes(':')) {
                    // ISO format but not UTC marked - extract time portion
                    const timePortion = timeStr.split('T')[1].split('.')[0]; // Gets "23:00:00"
                    const [hourStr, minuteStr] = timePortion.split(':');
                    hours24 = parseInt(hourStr, 10);
                    minutes = minuteStr;
                    console.log('Parsed from ISO format - hours24:', hours24, 'minutes:', minutes);
                } else if (timeStr.includes(':')) {
                    // Regular HH:MM format
                    const [hourStr, minuteStr] = timeStr.split(':');
                    hours24 = parseInt(hourStr, 10);
                    minutes = minuteStr ? minuteStr.substring(0, 2) : '00';
                    console.log('Parsed from HH:MM format - hours24:', hours24, 'minutes:', minutes);
                } else {
                    // Try parsing as just a number
                    hours24 = parseInt(timeStr, 10);
                    minutes = '00';
                    console.log('Parsed as number - hours24:', hours24);
                }
                
                console.log('Parsed hours24:', hours24, 'minutes:', minutes);
                
                if (!isNaN(hours24) && hours24 >= 0 && hours24 <= 23) {
                    const ampm = hours24 >= 12 ? 'PM' : 'AM';
                    const hours12 = hours24 % 12 || 12;
                    formattedTime = `${hours12}:${minutes} ${ampm}`;
                    console.log('Formatted time:', formattedTime);
                }
            }
        } else {
            console.log('Time is null/undefined/falsy');
        }
        
        console.log('Selected data for', currentTab, '- date:', date, 'time:', time, 'airport:', airport, 'airline:', airline);
        
        // Extract airport code (first 3 letters before the dash)
        const airportCode = airport ? airport.split(' ')[0] : '';
        
        // Build airport + airline text with comma if both exist
        let airportAirlineText = icon;
        if (airportCode) {
            airportAirlineText += ` ${airportCode}`;
            if (airline) {
                airportAirlineText += `, ${airline}`;
            }
        } else if (airline) {
            airportAirlineText += ` ${airline}`;
        } else {
            airportAirlineText += ' Airport TBD';
        }
        
        // Create pre-filled email with subject and body
        // Try to get user's stored info from localStorage
        const userInfo = JSON.parse(localStorage.getItem('dawaShare_userInfo') || '{}');
        
        let emailBody = `Hi ${ride['First Name']},\n\n` +
            `I found your ride on dawaShare and I'm traveling around the same time!\n\n`;
        
        // Add recipient's info as context
        emailBody += `You're ${currentTab === 'departures' ? 'departing' : 'arriving'} on ${formatDate(date)} at ${formattedTime} from ${airportCode || 'TBD'}${airline ? ` (${airline})` : ''}.\n\n`;
        
        // If we have user's info, include ONLY the relevant travel details based on current tab
        if (userInfo.firstName) {
            emailBody += `Here's my travel info:\n`;
            
            if (currentTab === 'departures') {
                // On departures tab - only show departure info
                if (userInfo.depDate && userInfo.depTime) {
                    const depAirportCode = userInfo.depAirport ? userInfo.depAirport.split(' ')[0] : 'TBD';
                    
                    // Parse user's departure time
                    let userDepTime = 'TBD';
                    if (userInfo.depTime) {
                        const timeStr = String(userInfo.depTime).trim();
                        if (timeStr.includes('T')) {
                            const timePart = timeStr.split('T')[1];
                            const [hours, minutes] = timePart.split(':');
                            const hours24 = parseInt(hours);
                            const ampm = hours24 >= 12 ? 'PM' : 'AM';
                            const hours12 = hours24 % 12 || 12;
                            userDepTime = `${hours12}:${minutes} ${ampm}`;
                        } else if (timeStr.includes(':')) {
                            const [hours, minutes] = timeStr.split(':');
                            const hours24 = parseInt(hours);
                            const ampm = hours24 >= 12 ? 'PM' : 'AM';
                            const hours12 = hours24 % 12 || 12;
                            userDepTime = `${hours12}:${minutes} ${ampm}`;
                        }
                    }
                    
                    emailBody += `• Departing: ${formatDate(userInfo.depDate)} at ${userDepTime} from ${depAirportCode}`;
                    if (userInfo.depAirline) {
                        emailBody += ` (${userInfo.depAirline})`;
                    }
                    emailBody += `\n`;
                } else {
                    emailBody += `• Departing: [ ADD YOUR DEPARTURE DETAILS ]\n`;
                }
            } else {
                // On arrivals tab - only show arrival info
                if (userInfo.arrDate && userInfo.arrTime) {
                    const arrAirportCode = userInfo.arrAirport ? userInfo.arrAirport.split(' ')[0] : 'TBD';
                    
                    // Parse user's arrival time
                    let userArrTime = 'TBD';
                    if (userInfo.arrTime) {
                        const timeStr = String(userInfo.arrTime).trim();
                        if (timeStr.includes('T')) {
                            const timePart = timeStr.split('T')[1];
                            const [hours, minutes] = timePart.split(':');
                            const hours24 = parseInt(hours);
                            const ampm = hours24 >= 12 ? 'PM' : 'AM';
                            const hours12 = hours24 % 12 || 12;
                            userArrTime = `${hours12}:${minutes} ${ampm}`;
                        } else if (timeStr.includes(':')) {
                            const [hours, minutes] = timeStr.split(':');
                            const hours24 = parseInt(hours);
                            const ampm = hours24 >= 12 ? 'PM' : 'AM';
                            const hours12 = hours24 % 12 || 12;
                            userArrTime = `${hours12}:${minutes} ${ampm}`;
                        }
                    }
                    
                    emailBody += `• Arriving: ${formatDate(userInfo.arrDate)} at ${userArrTime} to ${arrAirportCode}`;
                    if (userInfo.arrAirline) {
                        emailBody += ` (${userInfo.arrAirline})`;
                    }
                    emailBody += `\n`;
                } else {
                    emailBody += `• Arriving: [ ADD YOUR ARRIVAL DETAILS ]\n`;
                }
            }
            
            // Always prompt for location (whether they have it or not)
            if (userInfo.location) {
                emailBody += `• Location: ${userInfo.location}\n`;
            } else {
                emailBody += `• Location: [ ADD YOUR LOCATION ]\n`;
            }
            
            emailBody += `\nWould you be interested in sharing a ride?\n\n`;
            emailBody += `Best,\n${userInfo.firstName}`;
        } else {
            // No stored info - use simple template
            emailBody += `I'd love to share a ride if our times work out. Here are my travel details:\n\n`;
            emailBody += `• ${currentTab === 'departures' ? 'Departing' : 'Arriving'}: [ ADD YOUR ${currentTab === 'departures' ? 'DEPARTURE' : 'ARRIVAL'} INFO HERE ]\n`;
            emailBody += `• Location: [ ADD YOUR LOCATION HERE ]\n\n`;
            emailBody += `Let me know if you're interested!\n\n`;
            emailBody += `Best,\n[Your name]`;
        }
        
        const emailSubject = encodeURIComponent('dawaShare: Let\'s share a ride!');
        const mailtoLink = `mailto:${ride['Email']}?subject=${emailSubject}&body=${encodeURIComponent(emailBody)}`;
        
        html += `
            <div class="ride-card">
                <div class="card-header">
                    <div class="date-time">
                        <span class="date-large">${formatDate(date)}</span>
                        <span class="time-large">${formattedTime}</span>
                    </div>
                    <div class="rider-name-small">${ride['First Name']} ${ride['Last Name']}</div>
                </div>
                
                <div class="card-info">
                    <div class="card-airport-airline">${airportAirlineText}</div>
                    ${ride['Location'] ? `<div class="card-location">📍 ${ride['Location']}${ride['Location'] === 'Other / Off-Campus' && ride['Location Other'] ? ` (${ride['Location Other']})` : ''}</div>` : ''}
                </div>
                
                <div class="card-actions">
                    ${ride['Phone'] ? `
                        <a href="${mailtoLink}" class="contact-btn">✉️ Email</a>
                        <a href="sms:${ride['Phone']}" class="contact-btn phone-btn">💬 Text</a>
                    ` : `
                        <a href="${mailtoLink}" class="contact-btn contact-btn-full">✉️ Email</a>
                    `}
                </div>
            </div>
        `;
        } // End if shuttle vs ride
    }); // End allItems.forEach
    
    html += '</div>';
    ridesTable.innerHTML = html;
}

// ===== HELPER FUNCTION =====
function formatDate(dateString) {
    if (!dateString) return 'Date TBD';
    
    // Parse YYYY-MM-DD format manually to avoid any timezone issues
    const dateOnly = dateString.split('T')[0]; // Remove time if present: "2025-12-17"
    let [year, month, day] = dateOnly.split('-').map(Number);
    
    // Auto-correct year if it's too far in the future (likely typo)
    // If year is more than 1 year from now, assume they meant current academic year
    const currentYear = new Date().getFullYear();
    if (year > currentYear + 1) {
        console.log(`Auto-correcting year from ${year} to ${year - 1}`);
        year = year - 1;
    }
    
    // Create date in local timezone to get weekday
    const date = new Date(year, month - 1, day);
    
    // Format as "Day, M/D" to match shuttle format (e.g., "Sun, 12/21")
    return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'numeric', 
        day: 'numeric' 
    });
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

// ===== LOCATION "OTHER" FIELD LOGIC =====
const locationSelect = document.getElementById('location');
const locationOtherRow = document.getElementById('locationOtherRow');
const locationOtherInput = document.getElementById('locationOther');

locationSelect.addEventListener('change', (e) => {
    if (e.target.value === 'Other / Off-Campus') {
        locationOtherRow.style.display = 'block';
        locationOtherInput.setAttribute('required', '');
    } else {
        locationOtherRow.style.display = 'none';
        locationOtherInput.removeAttribute('required');
        locationOtherInput.value = '';
    }
});

// ===== DATE VALIDATION =====
// Set minimum date to today and maximum to 6 months in future
const today = new Date();
const todayStr = today.toISOString().split('T')[0];
const sixMonthsLater = new Date(today);
sixMonthsLater.setMonth(today.getMonth() + 6);
const maxDateStr = sixMonthsLater.toISOString().split('T')[0];

document.getElementById('depDate').setAttribute('min', todayStr);
document.getElementById('depDate').setAttribute('max', maxDateStr);
document.getElementById('arrDate').setAttribute('min', todayStr);
document.getElementById('arrDate').setAttribute('max', maxDateStr);

// Load rides and show modal when page loads
window.addEventListener('DOMContentLoaded', () => {
    populateDropdowns();
    loadRides();
    // Show modal automatically on page load
    modal.classList.add('active');
});