# 📝 Git Commit Messages — Vactrix Enterprise Upgrade

---

## Commit 1 — Part 1: Real Graph + DFS Vacancy Chain

```
feat(part1): implement real adjacency list graph + recursive DFS vacancy chain engine

- Add OrgNode model: graph node with parentId edge, occupiedBy, isVacant fields
- Add OrgGraph.js: full adjacency list graph class
  - addNode O(1), addEdge O(1), getChildren O(degree)
  - dfsVacancyChain: true recursive DFS with visited set + cycle guard
  - bfsLevels: BFS for org chart rendering
  - toJSON: serialize full graph for API
- Rebuild vacancyChainService.js: replaces flat loop with real graph traversal
  - buildOrgGraph(): O(N) 2-pass build from DB
  - dfsVacancyChain: O(N×C) recursive scoring at each vacancy
  - Risk classification: LOW/MEDIUM/HIGH based on chain depth + fill success
- Add orgController.js with 3 new endpoints:
  - GET /api/org/graph — full adjacency list + dept breakdown
  - GET /api/org/vacancy-chain/:nodeId — DFS from any org node
  - POST /api/org/simulate — simulate promotion without saving
  - GET/POST /api/org/nodes — CRUD for org nodes
- Add orgRoutes.js
- Add OrgChartPage.jsx: visual org tree per department
- Update VacancyReport.jsx: show full DFS chain steps, complexity badge, graph stats
- Update seed.js: seed 17 org nodes across 5 departments with real hierarchy
- Update App.js: add /hr/org-chart route
- Update HRDashboard.jsx: add Org Chart links

Time complexity:  O(N+E) graph build + O(N×C) DFS
Space complexity: O(N+E) adjacency list + O(N) recursion stack
```

---

## Commit 2 — Part 2: Enterprise Analytics Dashboard

```
feat(part2): add enterprise analytics dashboard with 4 chart sections

Backend:
- Add analyticsController.js with 5 MongoDB aggregation pipeline endpoints:
  - getHiringFunnel: funnel stages, score distribution, monthly trend
  - getDepartmentAnalytics: per-dept stats, headcount radar, vacancy growth, trend lines
  - getSkillAnalytics: available vs required skills, gap heatmap, cert stats, dept skills
  - getPromotionAnalytics: success rate, chain depth, monthly trend, top performers
  - getAnalyticsSummary: all KPIs in one request
- Add analyticsRoutes.js

Frontend (AnalyticsDashboard.jsx — 46KB):
- Left sidebar navigation between 4 sections
- 6 KPI cards with live data
- Section 1 — Hiring Funnel: funnel bars, monthly area chart, score histogram, status pie
- Section 2 — Department: stats table with hire rate, grouped bar, line trend, radar, vacancy bar
- Section 3 — Skill Heatmap: skill bars, gap heatmap cards, gap bar chart, certs, dept pills
- Section 4 — Promotions: KPIs, approval trend area chart, score-by-status bar, chain depth, top performers
- Skeleton loaders, custom tooltips, responsive grid layout
- All charts use Recharts (already in dependencies)
- Add /hr/analytics route, link from HRDashboard
```

---

## Commit 3 — Part 3: Real-time Socket.IO Notification System

```
feat(part3): implement real-time notification system with Socket.IO

Server:
- Add Notification model: persistent history with type, recipientId, isRead, link, meta
- Add socketService.js: Socket.IO server with online user registry (Map<userId, Set<socketId>>)
  - Supports multi-tab (one user, multiple sockets)
  - Events: register, mark_read, mark_all_read, disconnect
  - emitToUser(), emitToRole() helpers
- Add notificationService.js: createAndEmit() — DB write + socket push in one atomic call
  - notifyHRTeam(): broadcasts to all HR + admin users
  - notifyAdmins(): broadcasts to admin users only
- Add notificationController.js + notificationRoutes.js:
  - GET /api/notifications (paginated)
  - GET /api/notifications/unread-count
  - PATCH /api/notifications/:id/read
  - PATCH /api/notifications/mark-all-read
  - DELETE /api/notifications/:id
- Wire notification events into applicationController:
  - Employee applies → HR team notified in real-time
  - Application status changed → employee notified
- Wire notification events into promotionController:
  - Promotion approved → employee notified
  - Promotion approved → all admins notified
- Rebuild server.js: use http.createServer for Socket.IO + register routes

Client:
- Add NotificationContext.js: Socket.IO client + REST fallback
  - Connects on auth, registers userId, listens for events
  - markAsRead(), markAllAsRead(), deleteNotification()
- Add NotificationBell.jsx: dropdown panel with:
  - Red badge with unread count
  - Green/grey live connection indicator
  - Per-notification icons, timeAgo, delete button
  - Mark all read, view all link
- Replace static bell buttons with <NotificationBell /> in all 7 navbars
- Rebuild Notifications.jsx: uses NotificationContext, type filters, real-time indicator
- Wrap App with <NotificationProvider>
```

---

## Commit 4 — Part 4: Security Hardening

```
feat(part4): enterprise security hardening — helmet, rate limiting, validation, audit logs

Dependencies added (server):
  helmet, express-rate-limit, express-validator,
  express-mongo-sanitize, xss-clean, cookie-parser

New files:
- Add AuditLog model: write-only audit trail (userId, action, resource, ip, userAgent)
- Add auditService.js: fire-and-forget log writer (never crashes main request)
- Add securityMiddleware.js:
  - helmetConfig: security headers (X-Frame-Options, HSTS, etc.)
  - authLimiter: 10 requests / 15 min on auth endpoints
  - apiLimiter: 200 requests / 1 min global API rate limit
  - sanitize: express-mongo-sanitize (NoSQL injection prevention)
  - xssProtect: xss-clean (XSS attack prevention)
  - jsonParser: 10kb body size limit
  - errorHandler: centralized error handler (last middleware)
    - Handles: ValidationError, CastError, duplicate key, JWT errors
- Add validateMiddleware.js:
  - validateRegister: name, email, password, department
  - validateLogin: email, password
  - validateJob: title, department, description, minExperience, requiredSkills
  - validateProfile: experience, performanceRating, skills, certifications

Updated files:
- authController.js:
  - bcrypt rounds upgraded: 10 → 12
  - signRefreshToken(): 30d JWT in httpOnly cookie
  - signAccessToken(): 7d access token
  - Audit logs on: LOGIN, LOGIN_FAILED, REGISTER
  - Add logout endpoint (clears refresh cookie)
- authMiddleware.js:
  - refreshToken(): validates refresh cookie → issues new access token
  - protect(): logs failed auth attempts to AuditLog
- authRoutes.js: add validation, rate limiter, logout, refresh endpoints
- userRoutes.js: add validateProfile middleware
- applicationController.js: audit log on APPLY_JOB, UPDATE_STATUS
- promotionController.js: audit log on APPROVE_PROMOTION, REJECT_PROMOTION
- server.js: apply all security middleware in correct order

Security stack (in order applied):
  helmet → CORS → cookieParser → jsonParser(10kb) →
  mongoSanitize → xssClean → apiLimiter →
  routes → errorHandler
```

---

## Commit 5 — Docs + Config

```
docs: update README, add .env.example with all required variables

- README.md: full architecture diagram, algorithm complexity analysis,
  complete API reference table, security features table,
  Socket.IO events table, tech stack table
- .env.example: MONGO_URI, JWT_SECRET, JWT_REFRESH_SECRET, PORT, NODE_ENV
- GIT_COMMIT_MESSAGE.md: all commit messages for this upgrade
- server/package.json: all new dependencies listed
```


---

## Commit 6 — Part 5: Configurable Scoring Engine

```
feat(part5): replace hardcoded scoring weights with admin-configurable rule engine

New files:
- models/ScoringConfig.js: singleton config document with weights, formulaType,
  bonusRules, version tracking, full changeLog history
- services/scoringConfigService.js: cache layer (5-min TTL) + getConfig() +
  updateConfig() with weight validation (must sum to 100) + bustCache()
- controllers/scoringController.js: getConfig, updateConfig, previewScore, getFormulas
- routes/scoringRoutes.js: GET/PUT /api/scoring/config, POST /preview, GET /formulas
- pages/admin/ScoringConfigPanel.jsx: full admin UI with:
    - Drag sliders for each weight factor
    - Stacked color bar showing weight distribution
    - Formula selector: weighted_sum | geometric_mean | harmonic_mean
    - Bonus rules panel (internal candidate, perfect match, senior exp)
    - Live score preview (updates in real-time as sliders move)
    - Change log history with version numbers
    - Recalculate all existing scores button

Updated files:
- services/scoringService.js:
    - calculateFinalScore() is now async — reads from DB config (cached)
    - Supports weighted_sum, geometric_mean, harmonic_mean formulas
    - calculateFinalScoreSync() added for DFS traversal (uses cached weights)
- services/vacancyChainService.js: passes dynamic weights to DFS scoring fn
- controllers/applicationController.js: uses async calculateFinalScore()
- routes/applicationRoutes.js: adds POST /recalculate endpoint
- App.js: adds /admin/scoring-config route
- AdminDashboard.jsx: adds Scoring Engine, Search, Analytics nav buttons
```

---

## Commit 7 — Part 6: Advanced Search + Filtering

```
feat(part6): enterprise search with debounce, pagination, compound indexes

New files:
- controllers/searchController.js: 4 endpoints using MongoDB aggregation pipelines
    - searchCandidates: filter by q, department, skills, exp range, score,
      hasCerts, rating; enrich with application stats; server-side pagination
    - searchJobs: filter by q, department, skills, exp range, isOpen;
      enrich with applicant counts; pagination + sorting
    - searchApplications: aggregation pipeline with $lookup joins;
      filter by q, status, score, department; paginated
    - getSuggestions: autocomplete for skills, departments, jobs (type-ahead)
- routes/searchRoutes.js: GET /candidates, /jobs, /applications, /suggestions
- pages/hr/SearchPage.jsx: full enterprise search UI
    - useDebounce hook (350ms) — prevents API call per keystroke
    - 3 tabs: Candidates | Jobs | Applications
    - Autocomplete suggestions dropdown with type icons
    - Left filter sidebar: department, skills, exp range sliders, score,
      hasCerts, status, sort field, sort direction
    - CandidateCard: name, email, dept, exp, rating, skills, certs, app stats
    - JobCard: title, dept, status badge, skills, applicant count
    - AppCard: name, job, score breakdown bars, status pill
    - Pagination component with ellipsis for large page counts
    - Skeleton loaders during fetch
    - Empty state with icon

MongoDB indexes added (Part 6 optimization):
- User:        { role, department }, { role, experience }, { role, performanceRating }, text(name,email)
- Job:         { isOpen, department }, { isOpen, createdAt }, text(title,description)
- Application: { userId, status }, { jobId, finalScore }, { status, finalScore }, unique(userId,jobId)

Query optimization strategy:
  Filter runs FIRST (reduces dataset) → $lookup after (smaller join) →
  sort on indexed fields → skip+limit last
  O(N log N) with indexes vs O(N²) without

Updated files:
- App.js: adds /hr/search route
- HRDashboard.jsx: adds Search to sidebar + quick actions
- AnalyticsDashboard.jsx: adds Search + Scoring Engine to sidebar
- AdminDashboard.jsx: adds Search, Scoring Engine, Analytics nav buttons
```
