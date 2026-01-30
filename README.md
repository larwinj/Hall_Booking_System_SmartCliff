# Hall Booking System

A feature-based Hall Booking System built with HTML, JavaScript, and Tailwind CSS, designed for both Admin and Customer roles.
This app uses JSON Server (db.json) as a lightweight backend for database operations.

# 🔗Live Demo : https://hall-booking-system-smart-cliff.vercel.app/

# 📂 GitHub Repo : https://github.com/larwinj/Hall_Booking_System_SmartCliff.git

# 🚀 Features
👩‍💼 Admin :
    - 📊 Dashboard – View overall system stats
    - 📑 Booking Management – Manage hall bookings
    - 🏛  Halls Management – Add, update, or remove halls
    - 📝 Query Management - View, respond, delete query
    - 🛠 Content & Query Management – Handle customer queries and content
    - 📂 Report Management – Generate and view reports
    - 🔄 Backup & Recovery – Data recovery support
👨‍💻 Customer : 
    - 🔑 Authentication – Secure login and access
    - 📊 Dashboard – Personalized user overview
    - 🏨 View Halls – View available halls with details
    - 📝 Bookings Form – Submit booking requests
    - 📅 My Bookings – Track and manage personal bookings
    - 📤 Contact Query – Raise queries for admin support
    
## Project Structure

Hall_Booking_System/
├── Admin/
│ ├── Assets/ # Admin assets (images, icons, etc.)
│ └── Features/ # Admin-specific features
│ ├── Backup & Recovery/
│ ├── Bookingmanagement/ # booking.html, booking.js
│ ├── ContentManagement/
│ ├── DashBoard/
│ ├── HallsManagement/
│ ├── QueryManagement/
│ └── ReportManagement/
│
├── Customer/
│ ├── Assets/ # Customer assets
│ └── Features/ # Customer-specific features
│ ├── Auth/ # loginSignUp.html,loginSignUp.js
│ ├── BookingsForm/
│ ├── ContactQuery/
│ ├── Dashboard/
│ ├── Halls/ # rooms.html, rooms.js
│ ├── MyBookings/
│ └── Navbar/
│
├── db.json # JSON Server database
├── index.html # Main entry page
├── index.js # Root JavaScript
└── navbar.html # Common navbar


## Getting Started 
1. Simply open `index.html` in your browser or visit the deployed version.
2. Install JSON Server - npm install -g json-server
3. Run the JSON Server - json-server --watch db.json or (json-server --watch db.json --port 3000)
        |_Server will start at : https://mpnt1qbp-3000.inc1.devtunnels.ms/

## Architecture

- Feature-based structure – Each module (Admin/Customer) is self-contained
- JSON Server – Simulates backend  with db.json
- Tailwind CSS – For fast, responsive, and modern UI styling
- HTML + JS Modules – Keeps business logic separate for each feature
