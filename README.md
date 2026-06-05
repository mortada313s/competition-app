<div align="center">

<img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white" />
<img src="https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
<img src="https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=node.js&logoColor=white" />
<img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" />

# 🏆 Competition App

### An interactive QR-based competition platform for events and companies

[Report Bug](../../issues) · [Request Feature](../../issues)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Project Structure](#-project-structure)
- [Requirements](#-requirements)
- [Installation](#-installation)
- [Usage Guide](#-usage-guide)
- [API Reference](#-api-reference)
- [Database Schema](#-database-schema)
- [Security](#-security)
- [Roadmap](#-roadmap)

---

## 🎯 Overview

A real-time interactive competition platform that allows agents to register participants and generate unique QR codes, while the admin monitors everything live from a fully-featured dashboard.
Admin controls settings ──► Agent registers participants ──► Participant scans QR ──► Challenge begins

### How it works
┌───────────┐   login + register   ┌──────────────────┐
│   Agent   │ ──────────────────► │  Registration UI  │
└───────────┘                      └────────┬─────────┘
│ generates QR
▼
┌───────────┐     scans QR code    ┌──────────────────┐
│Participant│ ──────────────────► │  Challenge Page  │
└───────────┘                      └────────┬─────────┘
│ sends result
▼
┌───────────┐    real-time update  ┌──────────────────┐
│   Admin   │ ◄────────────────── │     Server       │
└───────────┘                      └──────────────────┘

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔐 Auth System | Separate accounts for admin and agents |
| 📱 Unique QR Codes | Every participant gets a personal QR code |
| ⏱️ Interactive Timer | Circular animated stopwatch in seconds |
| 🎁 Prize System | First prize + two secondary prizes with configurable probability weights |
| 📊 Live Dashboard | Stats that refresh every 5 seconds |
| 🏢 Company Branding | Upload logo + custom welcome message |
| 🛡️ QR Protection | Each QR code can only be used once |
| 🗑️ Result Management | Delete individual results or clear all records |

---

## 📁 Project Structure
competition-app/
│
├── 📂 src/                          # Frontend source code
│   ├── 📄 main.jsx                  # Entry point
│   ├── 📄 App.jsx                   # Router & routes
│   ├── 📄 index.css                 # Global styles & design tokens
│   │
│   ├── 📂 pages/
│   │   ├── 📄 AgentPage.jsx         # Agent login + QR generation
│   │   ├── 📄 ChallengePage.jsx     # Participant challenge screen
│   │   ├── 📄 AdminLogin.jsx        # Admin login
│   │   └── 📄 AdminDashboard.jsx    # Full admin control panel
│   │
│   ├── 📂 components/
│   │   └── 📄 ProtectedRoute.jsx    # Route guard for admin pages
│   │
│   └── 📂 utils/
│       └── 📄 api.js                # Server communication functions
│
├── 📂 server/
│   ├── 📄 index.cjs                 # Node.js HTTP server
│   ├── 📄 db.json                   # JSON database (auto-created)
│   ├── 📄 db.example.json           # Database template
│   └── 📂 uploads/                  # Uploaded logo images
│
├── 📂 dist/                         # Production build output
├── 📄 package.json
├── 📄 vite.config.js
└── 📄 README.md

---

## ⚙️ Requirements

| Requirement | Version |
|-------------|---------|
| Node.js | `>= 20.x` |
| npm | `>= 10.x` |
| Browser | Chrome / Firefox / Safari |

---

## 🚀 Installation

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/competition-app.git
cd competition-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up the database

```bash
cp server/db.example.json server/db.json
```

### 4. Build the project

```bash
npm run build
```

### 5. Start the server

```bash
node server/index.cjs
```

### 6. Open the app
http://localhost:4000

> **Accessing from other devices on the same network:**
> Find your IP with `hostname -I`, then open `http://YOUR_IP:4000`

---

## 📖 Usage Guide

### 👑 Admin

| URL | Description |
|-----|-------------|
| `/admin` | Admin login page |
| `/admin/dashboard` | Full control panel |

**Default credentials:**
Username: admin
Password: admin1234
> ⚠️ Change your password immediately after first login from the **Account** tab.

**Admin capabilities:**
- Create agents and assign secret codes
- Configure challenge timers (Challenge 1 & 2)
- Set prizes and probability weights for secondary prizes
- Upload company logo and write a custom welcome message
- Monitor all results in real time
- Delete individual results or clear the entire log
- Update admin username and password

### 👤 Agent

| URL | Description |
|-----|-------------|
| `/agent` | Agent login page |

**Workflow:**
1. Agent opens `/agent` on their device
2. Enters their name and secret code assigned by the admin
3. Registers a participant (name + password)
4. A QR code is generated — the participant scans it to start the challenge

### 🎮 Participant

1. Scans the QR code with their phone camera
2. Taps **Start Challenge** — the timer begins
3. Taps **Stop** at the target time
4. **Win on Challenge 1** → Prize 1 is awarded
5. **Lose on Challenge 1** → Moves to Challenge 2
6. **Win on Challenge 2** → Random prize (Prize A or B based on admin-set weights)
7. **Lose on Challenge 2** → No prize, game over
8. Each QR code is valid for **one use only**

---

## 🔌 API Reference

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/admin/login` | Admin login |
| `POST` | `/api/admin/update` | Update admin credentials |
| `POST` | `/api/agent/login` | Agent login |

### Data

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/db` | Fetch all data |
| `GET` | `/api/check/:token` | Check if QR token has been used |
| `POST` | `/api/participant` | Register a new participant |
| `POST` | `/api/result` | Save a challenge result |
| `POST` | `/api/config` | Save competition settings |
| `POST` | `/api/agents` | Update agents list |
| `POST` | `/api/branding` | Update company branding |
| `DELETE` | `/api/results/:index` | Delete a specific result |
| `DELETE` | `/api/results/all` | Delete all results |

### Example Request

```javascript
// Agent login
const res = await fetch('/api/agent/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Ahmed', code: '1234' })
})
const data = await res.json()
// { ok: true, agent: { id: 'ahmed-abc123', name: 'Ahmed' } }
```

---

## 🗄️ Database Schema

All data is stored in `server/db.json`:

```json
{
  "admin": {
    "name": "admin",
    "pass": "admin1234"
  },
  "agents": [
    {
      "id": "ahmed-abc123",
      "name": "Ahmed",
      "code": "1234",
      "createdAt": 1234567890
    }
  ],
  "participants": {
    "TOKEN_ID": {
      "name": "Mohammed",
      "agentId": "ahmed-abc123",
      "timestamp": 1234567890
    }
  },
  "results": [
    {
      "name": "Mohammed",
      "token": "TOKEN_ID",
      "prize": "iPhone 15",
      "challenge": 1,
      "timestamp": 1234567890
    }
  ],
  "config": {
    "target1": 7.0,
    "target2": 4.0,
    "max1": 10,
    "max2": 10,
    "prize1": "First Prize",
    "prizeA": "Prize A",
    "prizeB": "Prize B",
    "prizeAWeight": 70
  },
  "branding": {
    "companyName": "Our Travel Company",
    "welcome": "Welcome to our competition!",
    "logoUrl": "/uploads/logo.png"
  }
}
```

---

## 🛡️ Security

| Aspect | Current | Recommended for Production |
|--------|---------|---------------------------|
| Admin auth | Plain text in JSON | JWT + bcrypt |
| Agent auth | Plain text code | bcrypt hash |
| Database | JSON file | PostgreSQL / MongoDB |
| HTTPS | ❌ | ✅ Required |
| Rate Limiting | ❌ | ✅ Required |
| Input Validation | Basic | Full server-side validation |

---

## 🗺️ Roadmap

- [ ] Password hashing with bcrypt
- [ ] JWT session management
- [ ] Real database (PostgreSQL or MongoDB)
- [ ] Deploy to the internet (Railway / Render)
- [ ] Mobile app (React Native / Expo)
- [ ] Real-time updates via WebSocket
- [ ] Export results to Excel / PDF
- [ ] Multi-competition support
- [ ] Analytics charts in dashboard

---

## 📄 License

MIT License — Free to use with attribution.

---

<div align="center">
  Built with ❤️ — Competition App 2025
</div>
