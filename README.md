<div align="center">

# ⬡ Vactrix

### Vacancy & Talent Intelligence Platform

[![Live Demo](https://img.shields.io/badge/Live_Demo-client--jet--mu.vercel.app-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://client-jet-mu.vercel.app)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-5.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-7+-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.7-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

**Production-grade HR Analytics & Vacancy Intelligence Platform**

🔗 **Live Deployment**: [https://client-jet-mu.vercel.app](https://client-jet-mu.vercel.app)

Graph-based vacancy chain analysis · Real-time notifications · AI-assisted candidate scoring · Enterprise analytics

[🚀 Live Demo](https://client-jet-mu.vercel.app) · [Features](#-features) · [Quick Start](#-quick-start) · [Deploy Guide](#-deployment-guide) · [API Docs](#-api-reference) · [Interview Tips](#-interview-talking-points)

</div>

---

## 🧠 What is Vactrix?

**Vactrix** = *Vacancy* + *Matrix* — a platform that maps your entire organisation as an intelligent matrix of roles, skills, and people.

Most HR tools are just CRUD apps. Vactrix implements **real computer science** inside the HR domain:

- A **graph engine** (adjacency list + DFS) that simulates promotion cascades
- **MongoDB aggregation pipelines** for skill gap analysis — no data loaded into Node.js
- **Socket.IO dual-delivery** notifications (real-time push + REST polling fallback)
- **HashSet O(n) skill matching** instead of naive O(n×m) nested loops
- **Configurable weighted scoring** with admin-controlled weights stored in MongoDB

---

## 🌟 What Makes Vactrix Unique

### 1. ⬡ Graph-Based Vacancy Chain Engine (DFS)

No other student HR project implements this. When a position becomes vacant, Vactrix runs **Depth-First Search** across the org graph to simulate the entire promotion cascade:

A less common feature in academic HR projects is graph-based vacancy chain simulation. When a position becomes vacant, Vactrix runs **Depth-First Search** across the org graph to simulate the entire promotion cascade:


```
Position P becomes vacant
  └─ DFS finds best internal candidate → promotes them
       └─ Their role is now vacant → DFS recurses
            └─ Chain continues until leaf node
                 └─ Leaf = external hire needed
```

Built with a custom `OrgGraph` class using adjacency list representation. **O(N+E)** time complexity where N = org nodes, E = reporting relationships.

### 2. 🎯 Admin-Configurable Scoring Engine
Candidate scores are **not hardcoded**. Four components with weights stored in MongoDB:

```
Final Score = (Skill Match  × W₁)   ← HashSet O(n) matching
            + (Experience   × W₂)   ← linear threshold scoring
            + (Performance  × W₃)   ← 1–5 star rating scale
            + (Certifications × W₄) ← count-based bonus
```

Admins change W₁–W₄ live from the dashboard. Zero code changes needed.

### 3. 📊 Server-Side MongoDB Aggregation Pipelines
All analytics computed in MongoDB — zero raw data loaded into Node.js memory:

```javascript
// Skill gap analysis in ONE aggregation
User.aggregate([
  { $match: { role: 'employee' } },
  { $unwind: '$skills' },
  { $group: { _id: { $toLower: '$skills' }, count: { $sum: 1 } } },
  { $sort: { count: -1 } }
])
// Cross-reference with job requirements → gap computed server-side
```

Uses `$unwind`, `$group`, `$lookup`, `$bucket`, `$cond`, `$addFields` — production-grade pipeline techniques.

### 4. ⚡ Real-Time Dual-Delivery Notification Engine
```
Event fires → notificationService.create()
           → MongoDB save (persistent)
           → socketService.emit(userId)
                ├─ User ONLINE  → instant Socket.IO push
                └─ User OFFLINE → REST polling (30s interval)
```

Server maintains a `userId → socketId` Map. Handles multiple browser tabs per user.




 ### 5. 🔒 Express 5 + Security-Focused Architecture

Built on **Express 5** — handles breaking changes most tutorials ignore:
- `req.query` is now a **read-only getter** → wrote custom body-only sanitizer
- Async error propagation works without `try/catch` in every route
- Full stack: Helmet (15 headers) + Rate limiting + Mongo sanitize + JWT + Bcrypt

### 6. 🔍 Debounced Enterprise Search
- 400ms debounce — no unnecessary API calls
- MongoDB text indexes on `(name, email)` + compound indexes on `(role, department)`
- Server-side pagination with configurable page size
- Filters: department, experience range, performance rating

---

## ✨ Features

### 👑 Admin Dashboard
- Platform KPIs: total users, applications, departments
- User management table with role-based badges
- **Scoring Config Panel** — adjust skill/exp/performance/cert weights live
- Direct navigation to all HR modules

### 🏢 HR Dashboard
- Recruitment pipeline: open jobs, applicants, avg score
- Jobs table with real-time applicant counts per posting
- Top candidate leaderboard ranked by composite score
- Department breakdown chart

### 📊 HR Analytics (4 Modules)
| Module | What It Computes |
|--------|----------------|
| **Hiring Funnel** | Pipeline conversion rates, monthly trend (Area chart), score distribution (Bar) |
| **Department Analytics** | Headcount radar, hiring rate table, vacancy tracking, 6-month trend by dept |
| **Skill Heatmap** | Available vs required skills, gap tiles with intensity, dept skill matrix, top certifications |
| **Promotions** | Success rate, monthly approval trend, score component breakdown, top performers |

### 🔔 Notification Center
- React **Portal**-based dropdown (never clipped by sidebar layout)
- Live unread badge with Socket.IO push
- Mark as read / Mark all read / Delete
- Categories: Application, Promotion, Job Posted, System
- Full-page notification history with filter tabs

### 🧑 Employee Dashboard
- Open positions with eligibility indicators
- Application tracker with status (Pending / Shortlisted / Approved / Rejected)
- Profile strength meter with completion checklist
- Skills and certifications management

### 🔗 Vacancy Chain Simulator
- DFS traversal from any vacant position
- Candidate recommendations per role
- Chain depth analysis by department
- Cascade risk indicator

---

## 🛠️ Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | React 18 | Concurrent rendering, hooks |
| Routing | React Router v6 | Nested routes, loader API |
| Charts | Recharts | Bar, Area, Radar, Pie, Funnel |
| Real-time | Socket.IO Client 4.7 | WebSocket with polling fallback |
| Portal | React.createPortal | Notification dropdown outside DOM tree |
| HTTP | Axios 1.x | Interceptors, cancellation |
| Backend | Node.js 18+ | LTS, native ESM |
| Framework | **Express 5.x** | Latest major — async error handling |
| Database | MongoDB 7+ | Aggregation pipelines, text indexes |
| ODM | Mongoose 9.x | Schema validation, compound indexes |
| Auth | JWT + bcryptjs | Stateless + 10-round hashing |
| Security | Helmet + express-rate-limit | 15 headers + 200 req/min |
| Validation | express-validator | Schema-level request validation |
| Events | Socket.IO 4.7 | Real-time bidirectional events |

---

## 🏗️ System Architecture

```
┌────────────────────────────────────────────────────────┐
|                                                        |
│                    VACTRIX CLIENT                      │
│  React 18  │  React Router v6  │  Context API          │
│  Recharts  │  Axios            │  Socket.IO Client     │
|                                                        |
│                    VACTRIX CLIENT                      │
│  React 18  │  React Router v6  │  Context API          │
│  Recharts  │  Axios            │  Socket.IO Client     |
|                                                        |
│            │  React Portal     │  (Notification Bell)  │
└────────────────────┬───────────────────────────────────┘
                     │  HTTP REST + WebSocket
┌────────────────────▼───────────────────────────────────┐
|                                                        |
│                                                        │
|                                                        |
│                  EXPRESS 5 API SERVER                  │
|                                                        |
│  ┌─────────────┐ ┌─────────────┐ ┌──────────────────┐  │
│  │  JWT Auth   │ │ Rate Limit  │ │ Helmet (15 hdrs) │  │
│  │  Role Guard │ │ 200 req/min │ │ Body Sanitize    │  │
│  └─────────────┘ └─────────────┘ └──────────────────┘  │

│                                                        │
│  10 Route Controllers (auth/jobs/apps/analytics/...)   │
│                                                        │

│                                                        │
│  10 Route Controllers (auth/jobs/apps/analytics/...)   │
│                                                        │

│  ┌─────────────┐ ┌─────────────┐ ┌──────────────────┐  │
│  │  OrgGraph   │ │  Scoring    │ │   Socket.IO      │  │
│  │  DFS Engine │ │  Engine     │ │   Notif Engine   │  │
│  │  O(N+E)     │ │  HashSet    │ │   userId→socket  │  │
│  └─────────────┘ └─────────────┘ └──────────────────┘  │
└────────────────────┬───────────────────────────────────┘
                     │
┌────────────────────▼───────────────────────────────────┐
|                                                        |
│                    MONGODB ATLAS                       │
│  7 Collections  │  Compound Indexes  │  Text Search    │
│  Aggregation Pipelines (unwind/group/lookup/bucket)    │

│                    MONGODB ATLAS                       │
│  7 Collections  │  Compound Indexes  │  Text Search    │
│  Aggregation Pipelines (unwind/group/lookup/bucket)    │

└────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
Vactrix/
├── client/                              React 18 SPA
│   └── src/
│       ├── App.js                       Routes + role-based guards
│       ├── context/
│       │   ├── AuthContext.js           JWT + localStorage
│       │   └── NotificationContext.js   Socket.IO + REST polling
│       ├── components/
│       │   └── NotificationBell.jsx     React Portal dropdown
│       └── pages/
│           ├── auth/        Login (quick-fill), Register
│           ├── admin/       Dashboard, ScoringConfigPanel
│           ├── hr/          Dashboard, Analytics, Search,
│           │                Promotions, OrgChart, PostJob,
│           │                ViewApplicants, VacancyReport
│           ├── employee/    Dashboard, BrowseJobs, JobDetail,
│           │                MyApplications, Profile
│           └── shared/      Notifications, NotFound
│
└── server/
    ├── server.js                        Entry + Socket.IO init
    ├── seed.js                          Drops all → seeds fresh data
    ├── .env.example
    ├── controllers/    10 controllers (analytics = 478 lines)
    ├── middleware/     auth + security + validation
    ├── models/         User, Job, Application, OrgNode,
    │                   Notification, ScoringConfig, AuditLog
    ├── routes/         10 route files
    └── services/
        ├── OrgGraph.js              Adjacency list graph class
        ├── vacancyChainService.js   DFS traversal
        ├── scoringService.js        HashSet O(n) matching
        ├── scoringConfigService.js  Cached weight fetch
        ├── socketService.js         userId → socketId Map
        ├── notificationService.js   Create + emit
        └── auditService.js          Write-only audit log
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js ≥ 18
- MongoDB running locally (or Atlas free tier)
- npm ≥ 9

### 1. Clone & Install
```bash

git clone https://github.com/YOUR_USERNAME/vactrix.git



cd vactrix

cd server && npm install
cd ../client && npm install
```

### 2. Environment Setup
```bash
cd server
cp .env.example .env
```

`server/.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/vactrix
JWT_SECRET=your_super_secret_key_min_32_chars
NODE_ENV=development
```

### 3. Seed Database
```bash
cd server
npm run seed
```

```
⬡ Vactrix Enterprise — Seed Script
✅ MongoDB connected → mongodb://localhost:27017/vactrix
── Dropping all collections ──
── Seeding 12 professional users ──
── Seeding org hierarchy ──
── Seeding 10 job postings ──
── Seeding applications ──
🎉 Vactrix Seed Complete!
```

### 4. Run Dev Servers
```bash
# Terminal 1
cd server && npm run dev      # → http://localhost:5000

# Terminal 2
cd client && npm start        # → http://localhost:3000
```

---

## 🔐 Login Credentials

| Role | Email | Password |
|------|-------|----------|
| 👑 Admin | `admin@vactrix.com` | `admin123` |
| 🏢 HR | `hr@vactrix.com` | `hr123456` |
| 🧑 Employee | `rohan.kapoor@vactrix.com` | `emp12345` |
| 🧑 Employee | `sneha.patel@vactrix.com` | `emp12345` |
| 🧑 Employee | `vikram.singh@vactrix.com` | `emp12345` |
| 🧑 Employee | `ananya.krishnan@vactrix.com` | `emp12345` |
| 🧑 Employee | `rahul.gupta@vactrix.com` | `emp12345` |

> All credentials are clickable quick-fill buttons on the login page.

---

## 🚀 Deployment Guide

### Step 1 — Push to GitHub
```bash
cd Vactrix
git init
git add .

git commit -m "feat: Vactrix v1.0 — production ready"

git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/vactrix.git
git push -u origin main
```

---

### Step 2 — MongoDB Atlas (Free Cloud Database)

1. Go to [mongodb.com/atlas](https://mongodb.com/atlas) → sign up free
2. Create a **free M0 cluster** (no credit card needed)
3. **Database Access** → Add new user → username + password → Read/Write
4. **Network Access** → Add IP → `0.0.0.0/0` (allow all — needed for Render)
5. Click **Connect** → **Drivers** → copy connection string:
   ```
   mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/vactrix
   ```
6. Seed production DB from your local machine:
   ```bash
   cd server
   MONGO_URI="mongodb+srv://user:pass@cluster.mongodb.net/vactrix" node seed.js
   ```

---

### Step 3 — Deploy Backend to Render (Free)

1. Go to [render.com](https://render.com) → **New** → **Web Service**
2. Connect GitHub → select your `vactrix` repo
3. Settings:
   ```
   Name:          vactrix-api
   Root Directory: server
   Build Command:  npm install
   Start Command:  npm start
   ```
4. **Environment Variables** → add each one:
   ```
   MONGO_URI   = mongodb+srv://user:pass@cluster.mongodb.net/vactrix
   JWT_SECRET  = your_32_char_secret_key_here_change_this
   NODE_ENV    = production
   PORT        = 10000
   CLIENT_URL  = (leave blank for now — fill in after Step 4, this is your Vercel URL)
   ```
5. Click **Deploy** → wait ~3 minutes
6. Test your API:
   ```
   https://<your-render-app>.onrender.com/health
   ```
   Should return: `{"status":"ok","message":"Vactrix API running"}`

> ⚠️ Free Render instances sleep after 15 min. Upgrade to Starter ($7/mo) for always-on.

---

### Step 4 — Deploy Frontend to Vercel (Free)

1. Go to [vercel.com](https://vercel.com) → **New Project** → Import from GitHub
2. Settings:
   ```
   Framework Preset:  Create React App
   Root Directory:    client
   Build Command:     npm run build
   Output Directory:  build
   ```
3. **Environment Variables**:
   ```
   REACT_APP_API_URL    = https://<your-render-app>.onrender.com/api
   REACT_APP_SOCKET_URL = https://<your-render-app>.onrender.com
   ```
4. Click **Deploy** → ~2 minutes
5. Your live URL: `https://client-jet-mu.vercel.app`
6. Go back to Render → Environment tab → set `CLIENT_URL` to this exact Vercel URL (`https://client-jet-mu.vercel.app`) → save (Render redeploys so CORS allows your live frontend)

> A `client/vercel.json` file is already included in this repo — it tells Vercel to route all paths to `index.html` so React Router works correctly on page refresh/direct links.

---

### Step 5 — Update API URL in Client

In all client pages, the API config automatically reads from `process.env.REACT_APP_API_URL`.

Set `REACT_APP_API_URL` and `REACT_APP_SOCKET_URL` in your Vercel project dashboard or your local `.env` file.

---

### Alternative: Railway (All-in-One, Easiest)

1. [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub**
2. Add **MongoDB** plugin → Railway auto-provides `MONGO_URL`
3. Set env vars → done. One URL for everything.

---

## 📡 API Reference

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | Public | Login → JWT |
| POST | `/api/auth/register` | Public | Register |
| POST | `/api/auth/logout` | JWT | Logout |

### Jobs
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/jobs` | JWT | All jobs |
| POST | `/api/jobs` | HR/Admin | Create job |
| GET | `/api/jobs/:id` | JWT | Job detail |

### Applications
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/applications/:jobId` | Employee | Apply |
| GET | `/api/applications/mine` | Employee | My applications |
| GET | `/api/applications/:jobId/applicants` | HR/Admin | Applicant list |
| PATCH | `/api/applications/:id/status` | HR/Admin | Update status |

### Analytics
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/analytics/hiring-funnel` | HR/Admin | Pipeline + trend |
| GET | `/api/analytics/department` | HR/Admin | Dept breakdown |
| GET | `/api/analytics/skills` | HR/Admin | Skill heatmap + gap |
| GET | `/api/analytics/promotions` | HR/Admin | Promo metrics |
| GET | `/api/analytics/summary` | HR/Admin | All KPIs |

### Notifications
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/notifications` | JWT | My notifications |
| PATCH | `/api/notifications/:id/read` | JWT | Mark read |
| PATCH | `/api/notifications/mark-all-read` | JWT | Mark all read |
| DELETE | `/api/notifications/:id` | JWT | Delete |

### Search
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/search/candidates` | HR/Admin | Search + filter + paginate |

### Health
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | Public | Server status |

---



---

## 📊 Project Stats

| Metric | Value |
|--------|-------|
| Source files | 60+ |
| Lines of code | ~6,500 |
| API endpoints | 35+ |
| React pages | 16 |
| MongoDB collections | 7 |
| Unique algorithms | 4 |
| Security layers | 5 |

---

## 🔒 Security

- JWT authentication with expiry + refresh tokens
- Role-based access: `admin` / `hr` / `employee`
- Bcrypt password hashing (10 salt rounds)
- Helmet.js — 15 HTTP security headers
- Rate limiting: 200 req/min (API), 10/15min (auth)
- Express 5-compatible body-only MongoDB sanitization
- Input validation via express-validator on all POST/PATCH
- Immutable audit log for sensitive actions
- CORS restricted to localhost in development


---

## 📄 License

MIT — free to use for portfolio, interviews, and learning.

---


---

<div align="center">

**⬡ Vactrix — Vacancy & Talent Intelligence**

React 18 · Express 5 · MongoDB · Socket.IO · DFS Graph Engine


*If this helped you land a job — give it a ⭐*

*Found this project useful? Consider giving it a ⭐. *


</div>
