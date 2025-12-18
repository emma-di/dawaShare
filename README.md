# dawaShare

A community rideshare platform for Stanford students traveling to/from airports during breaks.

## About

dawaShare helps Stanford students find carpool partners and view official shuttle options in one place. Students can post their travel details, filter through available rides, and contact each other directly via email or text.

## Features

- **Post & Browse Rides**: Submit departure/arrival details through a simple form
- **Smart Filtering**: Filter rides by date, time, airport, campus location, and type (shuttles vs. individuals)
- **Integrated Shuttles**: Official Stanford shuttle schedules appear alongside individual rides, chronologically sorted
- **Direct Contact**: Email and text buttons for easy communication
- **Mobile Friendly**: Responsive design works on all devices

## How It Works

1. **Students submit** their travel info (dates, times, airport, campus location)
2. **Data saves** to Google Sheets via Apps Script backend
3. **Site displays** all rides chronologically with filters
4. **Students contact** each other directly when they find a match

## Setup

### 1. Google Sheets Backend
- Create a Google Sheet with columns: Timestamp, First Name, Last Name, Email, Phone, Location, Dep Date, Dep Time, Dep Airport, Dep Airline, Arr Date, Arr Time, Arr Airport, Arr Airline
- Create a Google Apps Script web app that accepts POST requests and returns GET data
- Update `GOOGLE_SHEET_URL` in `config.js` with your Apps Script endpoint

### 2. Configure Shuttles
Edit `config.js`:
```javascript
const DEPARTURE_SHUTTLES = [
    { date: '2025-12-19', time: '08:30', airport: 'SFO', lowTickets: true },
    // Add more shuttles...
];
```

### 3. Update Settings
- `SHUTTLE_TICKET_URL`: Link to shuttle booking page
- `LOCATIONS`: Campus housing options
- `AIRPORTS`: Available airports
- `AIRLINES`: Airline options

### 4. Deploy
Host on any static site platform (GitHub Pages, Netlify, Vercel, etc.); currently on Netlify.

## File Structure
```
├── index.html          # Main page structure
├── styles.css          # Styling and layout
├── script.js           # Core functionality and filtering
├── config.js           # Configuration (shuttles, dropdowns, API)
└── README.md          # Documentation
```

## Privacy & Safety

- Email addresses only visible via mailto links
- Phone numbers only shown when "Text" button is clicked
- All contact happens directly between students
- Form data stored in Google Sheets (controlled access)
- No authentication required (Stanford community trust model)

## Future Enhancements

- Email notifications for new matching rides
- Calendar export for travel dates
- Ride capacity tracking

## Credits

Built for Students for a Sustainable Stanford 🌎💚

Questions or feedback? Contact emmadi [at] stanford [dot] edu
