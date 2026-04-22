// ===== LOCAL STORAGE =====
function getSavedGroups() {
    return JSON.parse(localStorage.getItem('dawaShareGroups') || '[]');
}

function saveGroup(group) {
    const groups = getSavedGroups();
    if (!groups.find(g => g.id === group.id)) {
        groups.push(group);
        localStorage.setItem('dawaShareGroups', JSON.stringify(groups));
    }
}

// ===== NAVIGATION =====
function showHomeScreen() {
    document.getElementById('homeScreen').style.display = 'flex';
    document.getElementById('rideBoard').style.display = 'none';
}

function showRideBoard(group) {
    window.currentGroup = group;
    document.getElementById('homeScreen').style.display = 'none';
    document.getElementById('rideBoard').style.display = 'block';
    document.getElementById('groupNameDisplay').textContent = group.name || group.code;
    document.getElementById('groupCodeDisplay').textContent = group.code;
    const subtitle = document.getElementById('formSubtitle');
    if (subtitle) {
        subtitle.textContent = group.type === 'stanford' 
            ? 'Help fellow Stanford students find carpool matches'
            : 'Help your group find carpool matches';
    }
    // script.js will call loadRides() on DOMContentLoaded,
    // but when navigating here after init we call it manually
    if (typeof loadRides === 'function') loadRides();
}

// ===== HOME TABS =====
document.querySelectorAll('.home-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.home-tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.home-tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(btn.dataset.tab).classList.add('active');
    });
});

// ===== AIRPORT AUTOCOMPLETE =====
let airportData = [];

async function loadAirports() {
    const res = await fetch('https://raw.githubusercontent.com/algolia/datasets/master/airports/airports.json');
    const json = await res.json();
    // Algolia format uses iata_code instead of iata
    airportData = json.map(a => ({
        iata: a.iata_code,
        name: a.name,
        city: a.city
    }));
}

function setupAirportAutocomplete(inputId, suggestionsId) {
    const input = document.getElementById(inputId);
    const suggestions = document.getElementById(suggestionsId);

    if (!input || !suggestions) return; // element not in DOM yet

    input.addEventListener('input', () => {
        const query = input.value.toLowerCase();
        suggestions.innerHTML = '';
        if (query.length < 2) { suggestions.style.display = 'none'; return; }

        const matches = airportData
            .filter(a => a.iata && (
                a.iata.toLowerCase().startsWith(query) ||
                a.name.toLowerCase().includes(query) ||
                a.city.toLowerCase().includes(query)
            ))
            .slice(0, 6);

        if (matches.length === 0) { suggestions.style.display = 'none'; return; }

        matches.forEach(airport => {
            const item = document.createElement('div');
            item.className = 'airport-suggestion';
            item.textContent = `${airport.iata} — ${airport.name}, ${airport.city}`;
            item.addEventListener('click', () => {
                const value = `${airport.iata} - ${airport.name}`;
                // Add as a tag
                const tag = document.createElement('div');
                tag.className = 'airport-tag';
                tag.innerHTML = `${value} <button onclick="this.parentElement.remove()">×</button>`;
                tag.dataset.value = value;
                document.getElementById('selectedAirports').appendChild(tag);
                input.value = '';
                suggestions.style.display = 'none';
            });
            suggestions.appendChild(item);
        });
        suggestions.style.display = 'block';
    });

    document.addEventListener('click', (e) => {
        if (!input.contains(e.target)) suggestions.style.display = 'none';
    });
}

// ===== MY SHARES =====
function renderMyShares() {
    const groups = getSavedGroups();
    const container = document.getElementById('mySharesList');

    if (groups.length === 0) {
        container.innerHTML = `
            <div class="empty-shares">
                <div class="empty-icon">✈️</div>
                <p class="empty-title">No dawaShares yet</p>
                <p class="empty-sub">Join one with a code or create a new one below</p>
            </div>
        `;
        return;
    }

    container.innerHTML = groups.map((group, index) => `
        <div class="group-card" data-index="${index}">
            <div class="group-card-icon">${group.type === 'stanford' ? '🌲' : '✈️'}</div>
            <div class="group-card-info">
                <div class="group-card-name">${group.name || group.code}</div>
                <div class="group-card-code">${group.code}</div>
            </div>
            <div class="group-card-arrow">›</div>
        </div>
    `).join('');

    container.querySelectorAll('.group-card').forEach((card, index) => {
        card.addEventListener('click', () => enterGroup(groups[index]));
    });
}

function enterGroup(group) {
    showRideBoard(group);
}

// ===== JOIN FLOW =====
document.getElementById('joinBtn').addEventListener('click', () => {
    document.getElementById('joinModal').classList.add('active');
});

document.getElementById('closeJoinModal').addEventListener('click', () => {
    document.getElementById('joinModal').classList.remove('active');
    document.getElementById('joinCodeInput').value = '';
    document.getElementById('joinError').textContent = '';
});

document.getElementById('joinSubmitBtn').addEventListener('click', async () => {
    const code = document.getElementById('joinCodeInput').value.trim().toUpperCase();
    const errorEl = document.getElementById('joinError');
    const btn = document.getElementById('joinSubmitBtn');

    if (!code) { errorEl.textContent = 'Please enter a code'; return; }

    btn.textContent = 'Looking up...';
    btn.disabled = true;

    const { data, error } = await supabaseClient
        .from('groups')
        .select('*')
        .eq('code', code)
        .single();

    btn.textContent = 'Join';
    btn.disabled = false;

    if (error || !data) {
        errorEl.textContent = 'Code not found — double-check and try again!';
        return;
    }

    saveGroup(data);
    document.getElementById('joinModal').classList.remove('active');
    document.getElementById('joinCodeInput').value = '';
    errorEl.textContent = '';
    renderMyShares();
    // Switch to My Shares tab
    document.querySelector('.home-tab-btn[data-tab="mySharesTab"]').click();
});

// ===== CREATE FLOW =====
document.getElementById('createStanfordBtn').addEventListener('click', () => {
    document.getElementById('customGroupName').placeholder = 'e.g. Spring Break 2026';
    document.getElementById('customCreateModal').dataset.groupType = 'stanford';
    document.getElementById('customCreateModal').classList.add('active');
    const airportRow = document.getElementById('airportSearchInput')?.closest('div')?.parentElement;
    if (airportRow) airportRow.style.display = 'none';
    const sel = document.getElementById('selectedAirports');
    if (sel) sel.style.display = 'none';
});

document.getElementById('createCustomBtn').addEventListener('click', () => {
    document.getElementById('customCreateModal').classList.add('active');
    const airportRow = document.getElementById('airportSearchInput')?.closest('div')?.parentElement;
    if (airportRow) airportRow.style.display = 'block';
    const sel = document.getElementById('selectedAirports');
    if (sel) sel.style.display = 'flex';
});

document.getElementById('closeCustomModal').addEventListener('click', () => {
    document.getElementById('customCreateModal').classList.remove('active');
    document.getElementById('customCreateModal').dataset.groupType = '';
    document.getElementById('customGroupName').placeholder = 'e.g. Spring Break 2026';
    document.getElementById('customGroupName').value = '';
    document.getElementById('customCreateError').textContent = '';
    const sel = document.getElementById('selectedAirports');
    if (sel) { sel.innerHTML = ''; sel.style.display = 'flex'; }
    const airportInput = document.getElementById('airportSearchInput');
    if (airportInput) {
        airportInput.value = '';
        const airportRow = airportInput.closest('div')?.parentElement;
        if (airportRow) airportRow.style.display = 'block';
    }
});

document.getElementById('customCreateSubmit').addEventListener('click', async () => {
    const name = document.getElementById('customGroupName').value.trim();
    if (!name) {
        document.getElementById('customCreateError').textContent = 'Please enter a name';
        return;
    }
    const type = document.getElementById('customCreateModal').dataset.groupType || 'generic';
    document.getElementById('customCreateModal').dataset.groupType = '';
    document.getElementById('customCreateModal').classList.remove('active');
    await createGroup(type, name);
});

async function createGroup(type, name) {
    // Collect selected airports for generic groups
    const selectedAirports = type === 'generic'
        ? Array.from(document.querySelectorAll('#selectedAirports .airport-tag'))
              .map(tag => tag.dataset.value)
        : [];
    // Try generating a unique code (retry up to 5 times on collision)
    let code, data, error;
    for (let i = 0; i < 5; i++) {
        code = generateCode();
        ({ data, error } = await supabaseClient
            .from('groups')
            .insert({ code, type, name, custom_airports: selectedAirports })
            .select()
            .single());
        if (!error) break;
    }

    if (error || !data) {
        alert('Something went wrong creating the group. Try again!');
        return;
    }

    saveGroup(data);

    // Show the code reveal modal
    document.getElementById('newGroupCode').textContent = data.code;
    document.getElementById('newGroupName').textContent = data.name;
    document.getElementById('codeRevealModal').classList.add('active');

    document.getElementById('enterGroupBtn').onclick = () => {
        document.getElementById('codeRevealModal').classList.remove('active');
        showRideBoard(data);
    };
}

// ===== CODE COPY =====
document.getElementById('copyCodeBtn').addEventListener('click', () => {
    const code = document.getElementById('newGroupCode').textContent;
    const shareUrl = `${window.location.origin}/${code}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
        document.getElementById('copyCodeBtn').textContent = 'Copied link!';
        setTimeout(() => document.getElementById('copyCodeBtn').textContent = 'Copy link', 2000);
    });
});

// ===== BACK BUTTON =====
document.getElementById('backToHomeBtn').addEventListener('click', () => {
    window.currentGroup = null;
    showHomeScreen();
    renderMyShares();
});

// ===== CODE GENERATOR =====
function generateCode() {
    // No confusable chars (0/O, 1/I)
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
}

// ===== INIT =====
window.addEventListener('DOMContentLoaded', () => {
    renderMyShares();
    showHomeScreen();
    loadAirports(); // load airport data in background
    setupAirportAutocomplete('airportSearchInput', 'airportSuggestions');

    // ===== DEEP LINK: auto-join from /XXXXXX =====
    const pathCode = window.location.pathname.replace('/', '').toUpperCase();
    if (pathCode && pathCode.length === 6) {
        supabaseClient
            .from('groups')
            .select('*')
            .eq('code', pathCode)
            .single()
            .then(({ data, error }) => {
                if (data && !error) {
                    saveGroup(data);
                    renderMyShares();
                    showRideBoard(data);
                    window.history.replaceState({}, '', '/');
                }
            });
    }
});

