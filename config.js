// ===== DROPDOWN CONFIGURATION =====
// Update these arrays with your real values
// This file is separate so it won't get overwritten when updating other functionality

const LOCATIONS = [
  'Branner',
  'Casper Quad',
  'Crothers / Crothers Memorial',
  'Cowell Lane',
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
  'Other / Off-Campus'
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
    'Emirates',
    'Frontier',
    'Hawaiian',
    'JetBlue',
    'Korean Air',
    'Southwest',
    'Spirit',
    'Turkish',
    'United',
    'Other'
];

// ===== API CONFIGURATION =====
// Google Sheets API endpoint for ride data
const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbz3tCsxyBNcBZZA2JfEKE71Am54hSCoak2rFQqy3_x5tCEf1MbV9z9wrHu2xou1XO2o/exec';

// Shuttle ticket purchase URL
const SHUTTLE_TICKET_URL = 'https://events.humanitix.com/2025-winter-shuttles';

// ===== SHUTTLE CONFIGURATION =====
// Outbound shuttles (Departures from Stanford to Airport)
const DEPARTURE_SHUTTLES = [
    { date: '2025-03-18', time: '19:45', airport: 'SFO', lowTickets: false },
    { date: '2025-03-19', time: '17:30', airport: 'SFO', lowTickets: false },
    { date: '2025-03-20', time: '05:30', airport: 'SFO', lowTickets: false },
    { date: '2025-03-20', time: '08:00', airport: 'SFO', lowTickets: false },
    { date: '2025-03-20', time: '11:30', airport: 'SFO', lowTickets: false },
    { date: '2025-03-20', time: '19:30', airport: 'SFO', lowTickets: false },
    { date: '2025-03-21', time: '03:30', airport: 'SFO', lowTickets: false },
    { date: '2025-03-21', time: '05:45', airport: 'SFO', lowTickets: false },
    { date: '2025-03-21', time: '10:00', airport: 'SFO', lowTickets: false }
];

// Return shuttles (Arrivals from Airport to Stanford)
const ARRIVAL_SHUTTLES = [
    { date: '2025-03-28', time: '10:30', airport: 'SFO', lowTickets: false },
    { date: '2025-03-28', time: '20:30', airport: 'SFO', lowTickets: false },
    { date: '2025-03-29', time: '10:30', airport: 'SFO', lowTickets: false },
    { date: '2025-03-29', time: '13:30', airport: 'SFO', lowTickets: false },
    { date: '2025-03-29', time: '15:30', airport: 'SFO', lowTickets: false },
    { date: '2025-03-29', time: '18:00', airport: 'SFO', lowTickets: false }
];