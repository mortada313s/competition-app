<div align="center">

<img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white" />
<img src="https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
<img src="https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=node.js&logoColor=white" />
<img src="https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white" />
<img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" />
<img src="https://img.shields.io/badge/Made%20in-Iraq%20🇮🇶-red?style=for-the-badge" />

# 🏆 Competition App

### An interactive QR-based competition platform for events and companies

[Report Bug](../../issues) · [Request Feature](../../issues)

**Maintained by [Mortada Mohammed Abdulabbas](https://github.com/mortada313s) — Iraq 🇮🇶**

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Requirements](#-requirements)
- [Installation](#-installation)
- [Usage Guide](#-usage-guide)
- [API Reference](#-api-reference)
- [Database Schema](#-database-schema)
- [Security](#-security)
- [Roadmap](#-roadmap)
- [Author](#-author)

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
│   Admin   │ ◄────────────────── │  MySQL Database  │
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
| 🗄️ MySQL Database | Persistent data with relational integrity |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Vite 8 |
| Backend | Node.js 20 (HTTP) |
| Database | MySQL 8.0 |
| QR Code | qrcode.react |
| Routing | React Router DOM |
| Styling | CSS Variables + Custom Design System |

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
│   ├── 📄 index.cjs                 # Node.js HTTP server + MySQL queries
│   └── 📂 uploads/                  # Uploaded logo images
│
├── 📂 dist/                         # Production build output
├── 📄 .env.example                  # Environment variables template
├── 📄 .gitignore
├── 📄 CHANGELOG.md
├── 📄 CONTRIBUTING.md
├── 📄 LICENSE
├── 📄 README.md
├── 📄 SECURITY.md
├── 📄 package.json
└── 📄 vite.config.js

---

## ⚙️ Requirements

| Requirement | Version |
|-------------|---------|
| Node.js | `>= 20.x` |
| npm | `>= 10.x` |
| MySQL | `>= 8.0` |
| Browser | Chrome / Firefox / Safari |

---

## 🚀 Installation

### 1. Clone the repository

```bash
git clone https://github.com/mortada313s/competition-app.git
cd competition-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up MySQL

```bash
sudo mysql
```

```sql
CREATE DATABASE competition_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'competition_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON competition_db.* TO 'competition_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

Then create the tables:

```bash
sudo mysql competition_db < server/schema.sql
```

### 4. Configure environment

```bash
cp .env.example .env
# Edit .env with your database credentials
```

### 5. Build the project

```bash
npm run build
```

### 6. Start the server

```bash
node server/index.cjs
```

### 7. Open the app
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
| `DELETE` | `/api/results/:id` | Delete a specific result by ID |
| `DELETE` | `/api/results/all` | Delete all results |

---

## 🗄️ Database Schema

```sql
-- Admin account
CREATE TABLE admin (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(100) NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Agents (representatives)
CREATE TABLE agents (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Participants registered by agents
CREATE TABLE participants (
  token VARCHAR(100) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  agent_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE SET NULL
);

-- Competition results
CREATE TABLE results (
  id INT PRIMARY KEY AUTO_INCREMENT,
  participant_token VARCHAR(100) NOT NULL,
  participant_name VARCHAR(100) NOT NULL,
  prize VARCHAR(255),
  challenge INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (participant_token) REFERENCES participants(token) ON DELETE CASCADE
);

-- Competition configuration
CREATE TABLE config (
  id INT PRIMARY KEY DEFAULT 1,
  target1 DECIMAL(5,1) DEFAULT 7.0,
  target2 DECIMAL(5,1) DEFAULT 4.0,
  max1 INT DEFAULT 10,
  max2 INT DEFAULT 10,
  prize1 VARCHAR(255),
  prize_a VARCHAR(255),
  prize_b VARCHAR(255),
  prize_a_weight INT DEFAULT 70
);

-- Company branding
CREATE TABLE branding (
  id INT PRIMARY KEY DEFAULT 1,
  company_name VARCHAR(255),
  welcome TEXT,
  logo_url VARCHAR(500)
);
```

---

## 🛡️ Security

| Aspect | Current | Recommended for Production |
|--------|---------|---------------------------|
| Admin auth | Plain text in MySQL | bcrypt hashing |
| Agent auth | Plain text code | bcrypt hash |
| Database | MySQL (local) | MySQL with SSL |
| HTTPS | ❌ | ✅ Required |
| Rate Limiting | ❌ | ✅ Required |
| Input Validation | Basic | Full server-side validation |

---

## 🗺️ Roadmap

- [ ] Password hashing with bcrypt
- [ ] JWT session management
- [ ] Deploy to the internet (Railway / Render / VPS)
- [ ] Mobile app (React Native / Expo)
- [ ] Real-time updates via WebSocket
- [ ] Export results to Excel / PDF
- [ ] Multi-competition support
- [ ] Analytics charts in dashboard

---

## 👤 Author

**Mortada Mohammed Abdulabbas**

- GitHub: [@mortada313s](https://github.com/mortada313s)
- Location: Iraq 🇮🇶

---

## 📄 License

MIT License © 2026 [Mortada Mohammed Abdulabbas](https://github.com/mortada313s)

---

<div align="center">
  Built with ❤️ from Iraq 🇮🇶 — Competition App 2026
</div>
