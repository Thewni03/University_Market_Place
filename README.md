<div align="center">

<img src="https://img.shields.io/badge/UniMarket-University%20Platform-22c55e?style=for-the-badge&logo=graduation-cap&logoColor=white" alt="UniMarket"/>

# UniMarket
### University Skill & Product Exchange Platform

*A full-stack web application built for university students to connect, trade skills, sell second-hand items, and support each other — all within a trusted campus community.*

**MERN Project**

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-Real--time-010101?style=flat-square&logo=socket.io)](https://socket.io/)
[![Python](https://img.shields.io/badge/Python-ML%20Engine-3776AB?style=flat-square&logo=python)](https://www.python.org/)
[![Express.js](https://img.shields.io/badge/Express.js-Backend-000000?style=flat-square&logo=express)](https://expressjs.com/)

</div>

## About the Project

UniMarket is a university marketplace platform developed as a group project for the BSc (Hons) Information Technology programme at SLIIT. The platform enables students to offer freelance services, post service requests, buy and sell second-hand items, chat in real time, and engage with a campus-wide social feed — all within a verified student community.

The platform is designed with accessibility at its core, ensuring students with visual impairments, colour blindness, dyslexia, or hearing difficulties can fully participate.

## Features

### User Authentication & Verification
- Student registration with student ID upload
- Admin-reviewed verification workflow — only verified students can access the platform
- JWT-based authentication with secure password reset via OTP email
- Trust score system based on profile completeness and activity

### Campus Marketplace (Second-Hand Shop)
- List second-hand textbooks, electronics, lab equipment, furniture and more
- Browse and filter by faculty, category, condition and price
- Two purchase flows: **Meet on Campus** (arrange physical handover) or **Pay First** (bank transfer / Dialog eZ Cash / FriMi)
- Automated email notifications sent to both buyer and seller on every transaction
- Cart persists across page refreshes
- Favourites, view counts, and seller ratings

### Offer a Service
- Students can list their skills as paid services (tutoring, design, photography, coding, etc.)
- Set hourly rate, location mode (Online / On-Campus), and availability
- Service discovery with category filters and ML-powered trending

### Post a Request
- Students post what they need (a tutor, a designer, a photographer)
- Other students can respond and offer to help

### Booking System
- Book services directly through the platform
- Booking history with status tracking (pending, accepted, rejected, completed)
- Payment gateway integration for service payments

### TalkSpace — Live Chat
- Real-time inbox-style messaging between students using Socket.IO
- Floating chat widget accessible from anywhere on the platform
- Unread message notifications

### Smart Notification System
- In-app notifications for all key events: bookings, purchases, forum replies, profile updates
- Users can toggle notifications on/off — history still accessible when muted
- Real-time delivery via Socket.IO

### Q&A Forum
- Students post questions and answers organised by category
- Like and reply system with notification triggers

### Campus Feed
- Social feed for campus announcements, posts, and updates
- Posts ranked by trust score and engagement

### Machine Learning — Trending Engine
- Python-based ML backend predicts trending service categories
- Analyses view counts, booking rates and recency to surface relevant services
- Gracefully falls back to mock data if the Python engine is offline

### Admin Dashboard
- Separate admin backend on port 5002 with independent JWT auth
- User management: approve, reject, suspend, delete accounts
- SLA tracker — flags pending verifications by wait time (On Time / Warning / Overdue)
- Bulk approve high-trust users with one click
- Analytics: service views, bookings, estimated revenue, category breakdown
- Earnings leaderboard per provider
- 
## Getting Started

### Prerequisites

- Node.js v18+
- Python 3.9+
- MongoDB Atlas account
- Gmail account with App Password enabled

### Clone the repository

```bash
git clone https://github.com/Thewni03/University_Market_Place.git
cd University_Market_Place
```

### Set up the backend and frontend (Admin & Student)

```bash
npm install
npm start        # backend
npm run dev      # frontend
```

### Set up the ML engine

```bash
cd ml-engine
pip install -r requirements.txt
python app.py
```

---

## Running Ports Summary

| Service | Port | URL |
|---|---|---|
| Main Backend | 5001 | http://localhost:5001 |
| Admin Backend | 5002 | http://localhost:5002 |
| Student Frontend | 5173 | http://localhost:5173 |
| Admin Frontend | 5174 | http://localhost:5174 |

## Team

This project was built as a group assignment for **IT3040 – IT Project Management**, Year 3 Semester 1, BSc (Hons) Information Technology at **SLIIT**.

| Member | Responsibilities |
|---|---|
| **Thewni Mahathanthri** | Admin Dashboard · Accessibility Widget · Campus Marketplace · Email Notifications · Notification System |
| **Keerthihan** | User Profile · Offer a Service · Navbar · TalkSpace Live Chat · ML Integration |
| **Dileepa** | Booking System · Payment Gateway · Payment UI · Reviews & Ratings |
| **Dulaj Rathnayake** | Q&A Forum · Service Requests · Campus Feed · Home UI · Search & Filters · ML Trending Engine |


## License

This project was developed for educational purposes as part of a university module. All rights reserved by the development team.


<div align="center">

Built with ❤️ by the UniMarket Team · SLIIT · 2026

</div>
