// ===== DROPDOWN CONFIGURATION =====
// Update these arrays with your real values
// This file is separate so it won't get overwritten when updating other functionality

const LOCATIONS = [
  'Branner',
  'Casper Quad',
  'Crothers / Crothers Memorial (CroMem)',
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
    { date: '2025-12-19', time: '08:30', airport: 'SFO', lowTickets: true },
    { date: '2025-12-19', time: '19:00', airport: 'SFO', lowTickets: true },
    { date: '2025-12-20', time: '06:30', airport: 'SFO', lowTickets: false },
    { date: '2025-12-20', time: '09:15', airport: 'SFO', lowTickets: true },
    { date: '2025-12-20', time: '18:00', airport: 'SFO', lowTickets: true },
    { date: '2025-12-21', time: '05:15', airport: 'SFO', lowTickets: true },
    { date: '2025-12-21', time: '07:30', airport: 'SFO', lowTickets: true },
    { date: '2025-12-21', time: '08:30', airport: 'SFO', soldOut: true },
    { date: '2025-12-21', time: '09:30', airport: 'SJC', lowTickets: false },
    { date: '2025-12-21', time: '11:00', airport: 'SFO', soldOut: true },
    { date: '2025-12-21', time: '13:30', airport: 'SFO', lowTickets: true }
];

// Return shuttles (Arrivals from Airport to Stanford)
const ARRIVAL_SHUTTLES = [
    { date: '2025-01-04', time: '11:30', airport: 'SFO', lowTickets: false },
    { date: '2025-01-04', time: '14:30', airport: 'SFO', lowTickets: false },
    { date: '2025-01-04', time: '20:30', airport: 'SFO', lowTickets: false },
    { date: '2025-01-05', time: '09:15', airport: 'SJC', lowTickets: false },
    { date: '2025-01-05', time: '11:00', airport: 'SFO', lowTickets: true },
    { date: '2025-01-05', time: '13:30', airport: 'SFO', lowTickets: false }
];