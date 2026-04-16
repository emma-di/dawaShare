// ===== POPULATE DROPDOWNS =====
// Now group-aware: Stanford uses config arrays, generic uses group's custom data
function populateDropdowns() {
    const group = window.currentGroup || {};
    const isStanford = group.type === 'stanford';

    // Locations
    const locationSelect = document.getElementById('location');
    while (locationSelect.options.length > 1) locationSelect.remove(1);
    const locs = isStanford ? LOCATIONS : (group.custom_locations || []);
    locs.forEach(loc => {
        const opt = document.createElement('option');
        opt.value = loc; opt.textContent = loc;
        locationSelect.appendChild(opt);
    });

    // Airports
    ['depAirport', 'arrAirport'].forEach(id => {
        const sel = document.getElementById(id);
        const isStanford = group.type === 'stanford';
        const airports = isStanford ? AIRPORTS : (group.custom_airports || []);

        if (airports.length > 0) {
            // Has airports — show dropdown as normal
            while (sel.options.length > 1) sel.remove(1);
            airports.forEach(a => {
                const opt = document.createElement('option');
                opt.value = a; opt.textContent = a;
                sel.appendChild(opt);
            });
        } else {
            // Only replace if it's still a select (not already replaced)
            if (sel.tagName !== 'SELECT') return;

            // No airports configured — swap to free text input with autocomplete
            const wrapper = document.createElement('div');
            wrapper.style.position = 'relative';
            wrapper.style.width = '100%';

            const input = document.createElement('input');
            input.type = 'text';
            input.id = id;
            input.name = id;
            input.placeholder = 'e.g. LAX, JFK, Heathrow...';
            if (sel.hasAttribute('required')) input.setAttribute('required', '');

            const suggBox = document.createElement('div');
            suggBox.className = 'airport-suggestions-list';
            suggBox.style.display = 'none';

            wrapper.appendChild(input);
            wrapper.appendChild(suggBox);
            sel.replaceWith(wrapper);

            // Wire up autocomplete
            input.addEventListener('input', () => {
                const query = input.value.toLowerCase();
                suggBox.innerHTML = '';
                if (query.length < 2) { suggBox.style.display = 'none'; return; }

                if (airportData.length === 0) {
                    suggBox.innerHTML = '<div class="airport-suggestion">Loading airports...</div>';
                    suggBox.style.display = 'block';
                    return;
                }

                const matches = airportData
                    .filter(a => a.iata && (
                        a.iata.toLowerCase().startsWith(query) ||
                        a.name.toLowerCase().includes(query) ||
                        a.city.toLowerCase().includes(query)
                    ))
                    .slice(0, 6);

                if (matches.length === 0) { suggBox.style.display = 'none'; return; }

                matches.forEach(airport => {
                    const item = document.createElement('div');
                    item.className = 'airport-suggestion';
                    item.textContent = `${airport.iata} — ${airport.city}`;
                    item.addEventListener('mousedown', (e) => {
                        e.preventDefault(); // prevent blur before click
                        input.value = `${airport.iata} — ${airport.city}`;
                        suggBox.style.display = 'none';
                    });
                    suggBox.appendChild(item);
                });
                suggBox.style.display = 'block';
            });

            input.addEventListener('blur', () => {
                setTimeout(() => suggBox.style.display = 'none', 150);
            });
        }
    });
    
    // Airlines (same for all group types)
    ['depAirline', 'arrAirline'].forEach(id => {
        const sel = document.getElementById(id);
        while (sel.options.length > 1) sel.remove(1);
        AIRLINES.forEach(a => {
            const opt = document.createElement('option');
            opt.value = a; opt.textContent = a;
            sel.appendChild(opt);
        });
    });

    // Hide location row for generic groups
    const locationRow = document.getElementById('location').closest('.form-row');
    if (locationRow) locationRow.style.display = isStanford ? '' : 'none';
}

// ===== NORMALIZE SUPABASE RIDE TO DISPLAY FORMAT =====
// Keeps all display/filter logic unchanged by mapping snake_case → old column names
function normalizeRide(ride) {
    return {
        'First Name':    ride.first_name,
        'Last Name':     ride.last_name,
        'Email':         ride.email,
        'Phone':         ride.phone,
        'Location':      ride.location,
        'Location Other': ride.location_other,
        'Dep Date':      ride.dep_date,
        'Dep Time':      ride.dep_time,
        'Dep Airport':   ride.dep_airport,
        'Dep Airline':   ride.dep_airline,
        'Arr Date':      ride.arr_date,
        'Arr Time':      ride.arr_time,
        'Arr Airport':   ride.arr_airport,
        'Arr Airline':   ride.arr_airline,
    };
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

function capitalizeName(input) {
    if (input.value) {
        const trimmed = input.value.trim().replace(/\s+/g, ' ');
        const words = trimmed.split(' ');
        input.value = words.map(w => w.length > 0 ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : w).join(' ');
    }
}

firstNameInput.addEventListener('blur', function() { capitalizeName(this); });
lastNameInput.addEventListener('blur', function() { capitalizeName(this); });

// ===== TAB FUNCTIONALITY =====
let currentTab = 'departures';
let allRidesData = [];
let filters = {
    dates: [],
    airport: '',
    timeMin: 0,
    timeMax: 1440,
    locations: [],
    types: []
};

const tabButtons = document.querySelectorAll('.tab-btn');
tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        tabButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        currentTab = button.getAttribute('data-tab');
        resetFilters();
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

dateFilterBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isActive = dateFilterBtn.classList.contains('active');
    closeAllDropdowns();
    if (!isActive) { dateFilterBtn.classList.add('active'); dateFilterPanel.classList.add('active'); }
});

timeFilterBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isActive = timeFilterBtn.classList.contains('active');
    closeAllDropdowns();
    if (!isActive) { timeFilterBtn.classList.add('active'); timeFilterPanel.classList.add('active'); }
});

locationFilterBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isActive = locationFilterBtn.classList.contains('active');
    closeAllDropdowns();
    if (!isActive) { locationFilterBtn.classList.add('active'); locationFilterPanel.classList.add('active'); }
});

typeFilterBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isActive = typeFilterBtn.classList.contains('active');
    closeAllDropdowns();
    if (!isActive) { typeFilterBtn.classList.add('active'); typeFilterPanel.classList.add('active'); }
});

[dateFilterPanel, timeFilterPanel, locationFilterPanel, typeFilterPanel].forEach(panel => {
    panel.addEventListener('click', e => e.stopPropagation());
});

function closeAllDropdowns() {
    [dateFilterPanel, timeFilterPanel, locationFilterPanel, typeFilterPanel].forEach(p => p.classList.remove('active'));
    [dateFilterBtn, timeFilterBtn, locationFilterBtn, typeFilterBtn].forEach(b => b.classList.remove('active'));
}

document.addEventListener('click', closeAllDropdowns);

// Done buttons
document.getElementById('doneDateBtn').addEventListener('click', (e) => { e.stopPropagation(); closeAllDropdowns(); });
document.getElementById('doneTimeBtn').addEventListener('click', (e) => { e.stopPropagation(); updateTimeDisplay(); closeAllDropdowns(); });
document.getElementById('doneLocationBtn').addEventListener('click', (e) => { e.stopPropagation(); closeAllDropdowns(); });
document.getElementById('doneTypeBtn').addEventListener('click', (e) => { e.stopPropagation(); closeAllDropdowns(); });

// Clear buttons
document.getElementById('clearDateBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    filters.dates = [];
    updateFilterButtonText('dateFilterBtn', [], 'All Dates');
    displayRides(allRidesData);
    populateDateFilter(allRidesData);
});

document.getElementById('clearTimeBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    filters.timeMin = 0; filters.timeMax = 1440;
    updateTimeSlider();
    displayRides(allRidesData);
});

document.getElementById('clearLocationBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    filters.locations = [];
    updateFilterButtonText('locationFilterBtn', [], 'All Locations');
    displayRides(allRidesData);
    populateLocationFilter(allRidesData);
});

document.getElementById('clearTypeBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    filters.types = [];
    updateFilterButtonText('typeFilterBtn', [], 'All Types');
    displayRides(allRidesData);
    document.querySelectorAll('#typeFilterOptions input[type="checkbox"]').forEach(cb => cb.checked = false);
});

document.querySelectorAll('#typeFilterOptions input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
        const type = e.target.value;
        if (e.target.checked) { filters.types.push(type); }
        else { filters.types = filters.types.filter(t => t !== type); }
        updateFilterButtonText('typeFilterBtn', filters.types, 'All Types');
        displayRides(allRidesData);
    });
});

// ===== TIME SLIDER =====
const timeSliderMin = document.getElementById('timeSliderMin');
const timeSliderMax = document.getElementById('timeSliderMax');
const timeRangeDisplay = document.getElementById('timeRangeDisplay');
const timeSliderRange = document.getElementById('timeSliderRange');

function minutesToTimeString(minutes) {
    if (minutes === 1440) return "12:00 AM";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${String(mins).padStart(2, '0')} ${period}`;
}

function updateSliderRange() {
    const min = parseInt(timeSliderMin.value);
    const max = parseInt(timeSliderMax.value);
    const percent = (val) => (val / 1440) * 100;
    timeSliderRange.style.left = percent(min) + '%';
    timeSliderRange.style.width = (percent(max) - percent(min)) + '%';
}

function updateTimeDisplay() {
    const min = parseInt(timeSliderMin.value);
    const max = parseInt(timeSliderMax.value);
    const minTime = minutesToTimeString(min);
    const maxTime = minutesToTimeString(max);
    timeRangeDisplay.textContent = `${minTime} - ${maxTime}`;
    document.getElementById('timeFilterBtn').childNodes[0].textContent =
        (min === 0 && max === 1440) ? 'All Times ' : `${minTime} - ${maxTime} `;
}

function updateTimeSlider() {
    timeSliderMin.value = filters.timeMin;
    timeSliderMax.value = filters.timeMax;
    updateSliderRange();
    updateTimeDisplay();
}

timeSliderMin.addEventListener('input', function() {
    const min = parseInt(this.value), max = parseInt(timeSliderMax.value);
    if (min > max) { this.value = max; filters.timeMin = max; } else { filters.timeMin = min; }
    updateSliderRange(); updateTimeDisplay();
});

timeSliderMax.addEventListener('input', function() {
    const min = parseInt(timeSliderMin.value), max = parseInt(this.value);
    if (max < min) { this.value = min; filters.timeMax = min; } else { filters.timeMax = max; }
    updateSliderRange(); updateTimeDisplay();
});

timeSliderMin.addEventListener('change', () => displayRides(allRidesData));
timeSliderMax.addEventListener('change', () => displayRides(allRidesData));

filterAirport.addEventListener('change', (e) => { filters.airport = e.target.value; displayRides(allRidesData); });
document.getElementById('clearAllFiltersBtn').addEventListener('click', () => resetFilters());

function updateFilterButtonText(buttonId, filterArray, allText) {
    const button = document.getElementById(buttonId);
    if (filterArray.length === 0) {
        button.childNodes[0].textContent = allText + ' ';
    } else if (filterArray.length === 1) {
        let displayText = filterArray[0];
        if (buttonId === 'dateFilterBtn') displayText = formatDate(filterArray[0]);
        else if (buttonId === 'typeFilterBtn') {
            if (filterArray[0] === 'shuttle') displayText = 'Shuttles Only';
            else if (filterArray[0] === 'individual') displayText = 'Individuals Only';
        }
        button.childNodes[0].textContent = displayText + ' ';
    } else {
        button.childNodes[0].textContent = `${filterArray.length} selected `;
    }
}

function resetFilters() {
    filters = { dates: [], airport: '', timeMin: 0, timeMax: 1440, locations: [], types: [] };
    filterAirport.value = '';
    updateFilterButtonText('dateFilterBtn', [], 'All Dates');
    updateFilterButtonText('locationFilterBtn', [], 'All Locations');
    updateFilterButtonText('typeFilterBtn', [], 'All Types');
    document.querySelectorAll('#typeFilterOptions input[type="checkbox"]').forEach(cb => cb.checked = false);
    updateTimeSlider();
    populateFilterDropdowns(allRidesData);
    displayRides(allRidesData);
}

function populateFilterDropdowns(rides) {
    populateDateFilter(rides);
    populateAirportFilter(rides);
    populateLocationFilter(rides);
}

function populateDateFilter(rides) {
    const tabRides = rides.filter(ride =>
        currentTab === 'departures' ? (ride['Dep Date'] && ride['Dep Airport']) : (ride['Arr Date'] && ride['Arr Airport'])
    );
    const dates = new Set();
    tabRides.forEach(ride => {
        const date = currentTab === 'departures' ? ride['Dep Date'] : ride['Arr Date'];
        if (date) dates.add(date.split('T')[0]);
    });

    // Add shuttle dates only for Stanford groups
    if (window.currentGroup && window.currentGroup.type === 'stanford') {
        const shuttles = currentTab === 'departures' ? DEPARTURE_SHUTTLES : ARRIVAL_SHUTTLES;
        shuttles.forEach(s => dates.add(s.date));
    }

    const sortedDates = Array.from(dates).sort();
    const dateOptions = document.getElementById('dateFilterOptions');
    dateOptions.innerHTML = '';
    sortedDates.forEach(date => {
        const option = document.createElement('div');
        option.className = 'filter-option';
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox'; checkbox.id = `date-${date}`; checkbox.value = date;
        checkbox.checked = filters.dates.includes(date);
        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) filters.dates.push(date);
            else filters.dates = filters.dates.filter(d => d !== date);
            updateFilterButtonText('dateFilterBtn', filters.dates, 'All Dates');
            displayRides(allRidesData);
        });
        const label = document.createElement('label');
        label.htmlFor = `date-${date}`; label.textContent = formatDate(date);
        option.appendChild(checkbox); option.appendChild(label);
        dateOptions.appendChild(option);
    });
}

function populateAirportFilter(rides) {
    const tabRides = rides.filter(ride =>
        currentTab === 'departures' ? (ride['Dep Date'] && ride['Dep Airport']) : (ride['Arr Date'] && ride['Arr Airport'])
    );
    const airports = new Set();
    tabRides.forEach(ride => {
        const airport = currentTab === 'departures' ? ride['Dep Airport'] : ride['Arr Airport'];
        if (airport) airports.add(airport.split(' ')[0]);
    });
    const currentAirport = filterAirport.value;
    filterAirport.innerHTML = '<option value="">All Airports</option>';
    Array.from(airports).sort().forEach(airport => {
        const option = document.createElement('option');
        option.value = airport; option.textContent = airport;
        filterAirport.appendChild(option);
    });
    if (currentAirport && Array.from(airports).includes(currentAirport)) filterAirport.value = currentAirport;
}

function populateLocationFilter(rides) {
    const group = window.currentGroup || {};
    const isStanford = group.type === 'stanford';
    const locList = isStanford ? LOCATIONS : (group.custom_locations || []);

    const locationOptions = document.getElementById('locationFilterOptions');
    locationOptions.innerHTML = '';
    locList.forEach(configLocation => {
        const option = document.createElement('div');
        option.className = 'filter-option';
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox'; checkbox.id = `location-${configLocation}`;
        checkbox.value = configLocation; checkbox.checked = filters.locations.includes(configLocation);
        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) filters.locations.push(configLocation);
            else filters.locations = filters.locations.filter(l => l !== configLocation);
            updateFilterButtonText('locationFilterBtn', filters.locations, 'All Locations');
            displayRides(allRidesData);
        });
        const label = document.createElement('label');
        label.htmlFor = `location-${configLocation}`; label.textContent = configLocation;
        option.appendChild(checkbox); option.appendChild(label);
        locationOptions.appendChild(option);
    });
}

// ===== MODAL OPEN/CLOSE =====
closeBtn.addEventListener('click', () => modal.classList.remove('active'));
alreadySubmittedBtn.addEventListener('click', () => modal.classList.remove('active'));
openFormBtn.addEventListener('click', () => modal.classList.add('active'));
modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('active'); });
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) modal.classList.remove('active');
});

// ===== SKIP SECTION FUNCTIONALITY =====
document.querySelectorAll('.skip-section-btn').forEach(button => {
    button.addEventListener('click', () => {
        const sectionType = button.getAttribute('data-section');
        const section = document.getElementById(`${sectionType}Section`);
        const isCollapsed = section.classList.contains('collapsed');

        if (isCollapsed) {
            section.classList.remove('collapsed');
            button.classList.remove('active');
            button.textContent = "Skip for now";
            if (sectionType === 'departure') {
                document.getElementById('depDate').setAttribute('required', '');
                document.getElementById('depTime').setAttribute('required', '');
                document.getElementById('depAirport').setAttribute('required', '');
            } else {
                document.getElementById('arrDate').setAttribute('required', '');
                document.getElementById('arrTime').setAttribute('required', '');
                document.getElementById('arrAirport').setAttribute('required', '');
            }
        } else {
            section.classList.add('collapsed');
            button.classList.add('active');
            button.textContent = 'Skipped - Click to add info';
            const prefix = sectionType === 'departure' ? 'dep' : 'arr';
            ['Date', 'Time', 'Airport', 'Airline'].forEach(field => {
                const el = document.getElementById(`${prefix}${field}`);
                if (el) { el.removeAttribute('required'); el.value = ''; }
            });
        }
    });
});

// ===== FORM SUBMISSION → SUPABASE =====
rideForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = rideForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    const group = window.currentGroup;
    if (!group) { alert('No group selected.'); submitBtn.disabled = false; submitBtn.textContent = originalText; return; }

    const getValue = (id) => (document.getElementById(id)?.value || '').trim();
    const depSkipped = document.getElementById('departureSection').classList.contains('collapsed');
    const arrSkipped = document.getElementById('arrivalSection').classList.contains('collapsed');

    // Build ride object for Supabase
    const rideData = {
        group_id:      group.id,
        first_name:    getValue('firstName'),
        last_name:     getValue('lastName'),
        email:         getValue('emailUsername'),
        phone:         getValue('phone') || null,
        location:      getValue('location') || null,
        location_other: getValue('locationOther') || null,
        dep_date:      !depSkipped ? (getValue('depDate') || null) : null,
        dep_time:      !depSkipped ? (getValue('depTime') || null) : null,
        dep_airport:   !depSkipped ? (getValue('depAirport') || null) : null,
        dep_airline:   !depSkipped ? (getValue('depAirline') || null) : null,
        arr_date:      !arrSkipped ? (getValue('arrDate') || null) : null,
        arr_time:      !arrSkipped ? (getValue('arrTime') || null) : null,
        arr_airport:   !arrSkipped ? (getValue('arrAirport') || null) : null,
        arr_airline:   !arrSkipped ? (getValue('arrAirline') || null) : null,
    };

    try {
        // Check if this email already has a ride in this group
        const { data: existing } = await supabaseClient
            .from('rides')
            .select('id')
            .eq('group_id', group.id)
            .eq('email', rideData.email)
            .single();

        let error;
        if (existing) {
            // Update existing ride (only update non-null fields)
            const updateData = Object.fromEntries(Object.entries(rideData).filter(([_, v]) => v !== null));
            ({ error } = await supabaseClient.from('rides').update(updateData).eq('id', existing.id));
        } else {
            ({ error } = await supabaseClient.from('rides').insert(rideData));
        }

        if (error) throw error;

        alert('✅ Your ride info has been submitted!');

        // Save user info to localStorage for email pre-fill
        localStorage.setItem('dawaShare_userInfo', JSON.stringify({
            firstName: rideData.first_name,
            lastName:  rideData.last_name,
            depDate:   rideData.dep_date,
            depTime:   rideData.dep_time,
            depAirport: rideData.dep_airport,
            arrDate:   rideData.arr_date,
            arrTime:   rideData.arr_time,
            arrAirport: rideData.arr_airport,
            location:  rideData.location,
        }));

        rideForm.reset();
        modal.classList.remove('active');
        await loadRides(); // Refresh

    } catch (err) {
        console.error('Submit error:', err);
        alert('❌ Something went wrong. Please try again!');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
});

// ===== LOAD RIDES FROM SUPABASE =====
async function loadRides() {
    const group = window.currentGroup;
    if (!group) return;

    const ridesTable = document.getElementById('ridesTable');
    ridesTable.innerHTML = '<p class="loading-state">Loading rides... ⏳</p>';

    try {
        const { data, error } = await supabaseClient
            .from('rides')
            .select('*')
            .eq('group_id', group.id)
            .order('dep_date', { ascending: true });

        if (error) throw error;

        allRidesData = (data || []).map(normalizeRide);
        populateDropdowns();
        populateFilterDropdowns(allRidesData);
        displayRides(allRidesData);

    } catch (err) {
        console.error('Error loading rides:', err);
        ridesTable.innerHTML = '<p class="empty-state">Couldn\'t load rides. Try refreshing!</p>';
    }
}

// ===== DISPLAY RIDES =====
function displayRides(rides) {
    const ridesTable = document.getElementById('ridesTable');
    const group = window.currentGroup || {};
    const isStanford = group.type === 'stanford';

    // Filter by tab
    let filteredRides = rides.filter(ride =>
        currentTab === 'departures'
            ? (ride['Dep Date'] && ride['Dep Airport'])
            : (ride['Arr Date'] && ride['Arr Airport'])
    );

    // Date filter
    if (filters.dates.length > 0) {
        filteredRides = filteredRides.filter(ride => {
            const date = currentTab === 'departures' ? ride['Dep Date'] : ride['Arr Date'];
            return date && filters.dates.includes(date.split('T')[0]);
        });
    }

    // Airport filter
    if (filters.airport) {
        filteredRides = filteredRides.filter(ride => {
            const airport = currentTab === 'departures' ? ride['Dep Airport'] : ride['Arr Airport'];
            return airport && airport.startsWith(filters.airport);
        });
    }

    // Time filter
    if (filters.timeMin !== 0 || filters.timeMax !== 1440) {
        filteredRides = filteredRides.filter(ride => {
            const time = currentTab === 'departures' ? ride['Dep Time'] : ride['Arr Time'];
            if (!time) return false;
            const timeStr = String(time).trim();
            let hours, minutes;
            if (timeStr.includes(':')) {
                const parts = timeStr.split(':');
                hours = parseInt(parts[0]); minutes = parseInt(parts[1] || 0);
            }
            if (hours === undefined) return false;
            const rideMinutes = hours * 60 + minutes;
            return rideMinutes >= filters.timeMin && rideMinutes <= filters.timeMax;
        });
    }

    // Location filter
    if (filters.locations.length > 0) {
        filteredRides = filteredRides.filter(ride => {
            const loc = ride['Location'];
            if (!loc) return false;
            return filters.locations.some(sel =>
                loc === sel || loc.toLowerCase().includes(sel.toLowerCase()) || sel.toLowerCase().includes(loc.toLowerCase())
            );
        });
    }

    // Sort by date/time
    filteredRides.sort((a, b) => {
        const dateA = currentTab === 'departures' ? a['Dep Date'] : a['Arr Date'];
        const dateB = currentTab === 'departures' ? b['Dep Date'] : b['Arr Date'];
        const timeA = currentTab === 'departures' ? a['Dep Time'] : a['Arr Time'];
        const timeB = currentTab === 'departures' ? b['Dep Time'] : b['Arr Time'];
        if (dateA !== dateB) return new Date(dateA) - new Date(dateB);
        if (timeA && timeB) {
            const toMin = t => { const [h, m] = String(t).split(':').map(Number); return h * 60 + (m || 0); };
            return toMin(timeA) - toMin(timeB);
        }
        return 0;
    });

    // Shuttles — only for Stanford groups
    let shuttles = [];
    if (isStanford) {
        shuttles = currentTab === 'departures' ? [...DEPARTURE_SHUTTLES] : [...ARRIVAL_SHUTTLES];
        if (filters.types.length > 0 && !filters.types.includes('shuttle')) shuttles = [];
        if (filters.dates.length > 0) shuttles = shuttles.filter(s => filters.dates.includes(s.date));
        if (filters.airport) shuttles = shuttles.filter(s => s.airport === filters.airport);
        if (filters.timeMin !== 0 || filters.timeMax !== 1440) {
            shuttles = shuttles.filter(s => {
                const [h, m] = s.time.split(':').map(Number);
                const mins = h * 60 + (m || 0);
                return mins >= filters.timeMin && mins <= filters.timeMax;
            });
        }
    }

    // Type filter for individual rides
    if (filters.types.length > 0 && !filters.types.includes('individual')) filteredRides = [];

    if (filteredRides.length === 0 && shuttles.length === 0) {
        ridesTable.innerHTML = `<p class="empty-state">No ${currentTab} match your filters. Try adjusting your search!</p>`;
        return;
    }

    // ===== BUILD HTML =====
    let html = '';

    // --- Shuttles section ---
    if (shuttles.length > 0) {
        html += `
            <div class="section-divider">
                <div class="section-title">🚌 Official Shuttles</div>
                <div class="section-subtitle">Cheapest option – Book early!</div>
            </div>
        `;
        html += '<div class="rides-grid">';
        shuttles.forEach(shuttle => {
            const [h, m] = shuttle.time.split(':').map(Number);
            const ampm = h >= 12 ? 'PM' : 'AM';
            const h12 = h % 12 || 12;
            const formattedTime = `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
            const dateStr = formatDate(shuttle.date);
            const cardClasses = `ride-card shuttle-card${shuttle.lowTickets ? ' low-tickets' : ''}${shuttle.soldOut ? ' sold-out' : ''}`;
            html += `
                <div class="${cardClasses}">
                    <div class="card-header">
                        <div class="date-time">
                            <span class="date-large">${dateStr}</span>
                            <span class="time-large">${formattedTime}</span>
                        </div>
                    </div>
                    <div class="card-info">
                        <div class="card-airport-airline">✈️ ${shuttle.airport}</div>
                        <div class="card-location">🚌 Direct from campus</div>
                    </div>
                    <div class="card-actions">
                        ${shuttle.soldOut
                            ? '<span class="shuttle-buy-btn waitlist">Sold Out</span>'
                            : `<a href="${SHUTTLE_TICKET_URL}" target="_blank" class="shuttle-buy-btn">Buy Tickets ($5)</a>`
                        }
                    </div>
                </div>`;
        });
        html += '</div>';
    }

    // --- Individual rides section ---
    if (filteredRides.length > 0) {
        html += `
            <div class="section-divider">
                <div class="section-title">🧑 Individual Rides</div>
            </div>
        `;
        html += '<div class="rides-grid">';

        const userInfo = JSON.parse(localStorage.getItem('dawaShare_userInfo') || 'null');

        filteredRides.forEach(ride => {
            const date = currentTab === 'departures' ? ride['Dep Date'] : ride['Arr Date'];
            const time = currentTab === 'departures' ? ride['Dep Time'] : ride['Arr Time'];
            const airport = currentTab === 'departures' ? ride['Dep Airport'] : ride['Arr Airport'];
            const airline = currentTab === 'departures' ? ride['Dep Airline'] : ride['Arr Airline'];

            // Format time
            let formattedTime = 'TBD';
            if (time) {
                const timeStr = String(time).trim();
                if (timeStr.includes(':')) {
                    const [hours, minutes] = timeStr.split(':');
                    const h24 = parseInt(hours);
                    const ampm = h24 >= 12 ? 'PM' : 'AM';
                    const h12 = h24 % 12 || 12;
                    formattedTime = `${h12}:${minutes} ${ampm}`;
                }
            }

            const airportCode = airport ? airport.split(' ')[0] : 'TBD';
            const airportAirlineText = airline
                ? `✈️ ${airportCode} · ${airline}`
                : `✈️ ${airportCode}`;

            // Build email pre-fill
            let emailBody = `Hi ${ride['First Name']},\n\nI saw your ride on dawaShare and would love to coordinate!\n\n`;
            if (userInfo) {
                if (currentTab === 'departures' && userInfo.depDate && userInfo.depTime) {
                    const depAirportCode = userInfo.depAirport ? userInfo.depAirport.split(' ')[0] : 'TBD';
                    emailBody += `• Departing: ${formatDate(userInfo.depDate)} at ${userInfo.depTime} to ${depAirportCode}\n`;
                } else if (currentTab === 'arrivals' && userInfo.arrDate && userInfo.arrTime) {
                    const arrAirportCode = userInfo.arrAirport ? userInfo.arrAirport.split(' ')[0] : 'TBD';
                    emailBody += `• Arriving: ${formatDate(userInfo.arrDate)} at ${userInfo.arrTime} to ${arrAirportCode}\n`;
                }
                if (userInfo.location) emailBody += `• Location: ${userInfo.location}\n`;
                emailBody += `\nWould you be interested in sharing a ride?\n\nBest,\n${userInfo.firstName}`;
            } else {
                emailBody += `• ${currentTab === 'departures' ? 'Departing' : 'Arriving'}: [ ADD YOUR DETAILS ]\n`;
                emailBody += `• Location: [ ADD YOUR LOCATION ]\n\nLet me know if you're interested!\n\nBest,\n[Your name]`;
            }

            const emailSubject = encodeURIComponent("dawaShare: Let's share a ride!");
            const mailtoLink = `mailto:${ride['Email']}?subject=${emailSubject}&body=${encodeURIComponent(emailBody)}`;

            html += `
                <div class="ride-card">
                    <div class="card-header">
                        <div class="date-time" style="white-space:nowrap; flex-shrink:0;">
                            <span class="date-large">${formatDate(date)}</span>
                            <span class="time-large">${formattedTime}</span>
                        </div>
                        <div class="rider-name-small" style="word-break:break-word; text-align:right; min-width:0;">${ride['First Name']} ${ride['Last Name']}</div>
                    </div>
                    <div class="card-info">
                        <div class="card-airport-airline">${airportAirlineText}</div>
                        ${ride['Location'] ? `<div class="card-location">📍 ${ride['Location']}${ride['Location'] === 'Other / Off-Campus' && ride['Location Other'] ? ` (${ride['Location Other']})` : ''}</div>` : ''}
                    </div>
                    <div class="card-actions">
                        ${ride['Phone'] ? `
                            <a href="${mailtoLink}" class="contact-btn">✉️ Email</a>
                            <button class="contact-btn phone-btn" onclick="const shown=this.dataset.shown==='true'; if(/iPhone|Android/i.test(navigator.userAgent)){window.location='sms:${ride['Phone']}'}else{this.textContent=shown?'💬 Text':'${ride['Phone']}'; this.dataset.shown=shown?'false':'true'; this.classList.toggle('phone-btn-revealed',!shown);}">💬 Text</button>
                        ` : `
                            <a href="${mailtoLink}" class="contact-btn contact-btn-full">✉️ Email</a>
                        `}
                    </div>
                </div>`;
        });

        html += '</div>';
    }

    ridesTable.innerHTML = html;
}

// ===== HELPER: FORMAT DATE =====
function formatDate(dateString) {
    if (!dateString) return 'Date TBD';
    const dateOnly = dateString.split('T')[0];
    let [year, month, day] = dateOnly.split('-').map(Number);
    const currentYear = new Date().getFullYear();
    if (year > currentYear + 1) year = year - 1;
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
}

// ===== EMAIL FIELD FORMATTING =====
const emailInput = document.getElementById('emailUsername');
emailInput.addEventListener('input', (e) => {
    // Allow full email addresses (not just SUNet IDs)
    e.target.value = e.target.value.replace(/[^a-zA-Z0-9._@+-]/g, '').toLowerCase();
});

// ===== PHONE NUMBER FORMATTING =====
const phoneInput = document.getElementById('phone');
phoneInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 10) value = value.slice(0, 10);
    if (value.length >= 6) value = `(${value.slice(0,3)}) ${value.slice(3,6)}-${value.slice(6)}`;
    else if (value.length >= 3) value = `(${value.slice(0,3)}) ${value.slice(3)}`;
    e.target.value = value;
});

// ===== LOCATION "OTHER" FIELD =====
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
const today = new Date();
const todayStr = today.toISOString().split('T')[0];
const sixMonthsLater = new Date(today);
sixMonthsLater.setMonth(today.getMonth() + 6);
const maxDateStr = sixMonthsLater.toISOString().split('T')[0];
document.getElementById('depDate').setAttribute('min', todayStr);
document.getElementById('depDate').setAttribute('max', maxDateStr);
document.getElementById('arrDate').setAttribute('min', todayStr);
document.getElementById('arrDate').setAttribute('max', maxDateStr);

// ===== INIT =====
// Note: loadRides() is called by app.js when entering a group board.
// DOMContentLoaded only sets up the time slider — no auto-open modal.
window.addEventListener('DOMContentLoaded', () => {
    updateSliderRange();
    updateTimeDisplay();
});

// ===== PARALLAX =====
let ticking = false;
window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            const scrolled = window.pageYOffset;
            document.body.style.setProperty('--parallax-y', `${scrolled * 0.15}px`);
            ticking = false;
        });
        ticking = true;
    }
});