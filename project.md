# Outceedo Frontend

React 19 + TypeScript + Vite sports platform with five distinct user roles: **player**, **expert**, **team**, **sponsor**, and **fan**.

---

## Tech Stack

| Layer | Library / Tool |
|---|---|
| UI Framework | React 19, TypeScript |
| Build Tool | Vite + @tailwindcss/vite |
| Styling | Tailwind CSS v4, shadcn/ui (Radix UI) |
| State | Redux Toolkit v2, React Redux v9 |
| Routing | React Router v7 |
| HTTP | Axios (3 instances via `apiConfig.ts`) |
| Forms | React Hook Form v7 + Zod v3 |
| Video Calls | Agora RTC SDK v4 |
| Payments | Stripe (react-stripe-js) |
| Icons | lucide-react, FontAwesome, react-icons |
| Notifications | SweetAlert2, Sonner |
| PDF / Export | @react-pdf/renderer, html-to-image, html2canvas |
| Charts | Recharts |

---

## Project Structure

```
outceedo.frontend/
├── public/
├── src/
│   ├── assets/                  # Images, board assets, team assets
│   ├── common/                  # Shared utilities & guards
│   │   ├── Checkauth.tsx        # Role-based route guard
│   │   ├── Commonform.tsx
│   │   ├── Detailsform.tsx
│   │   ├── publicProfile.tsx
│   │   ├── banned.tsx
│   │   ├── notfound.tsx
│   │   └── ScrollToTop.tsx
│   ├── components/
│   │   ├── ui/                  # shadcn/ui primitives (Button, Card, Dialog, Input, etc.)
│   │   ├── player/              # Player layout, header, sidebar
│   │   ├── expert/              # Expert layout, header, sidebar
│   │   ├── team/                # Team layout, header, sidebar
│   │   ├── sponsor/             # Sponsor layout, header, sidebar
│   │   ├── fan/                 # Fan layout, header, sidebar
│   │   └── follower/            # FollowersList component
│   ├── Pages/
│   │   ├── Auth/                # Login, Signup, EmailVerification, ForgotPassword, ResetPassword
│   │   ├── Home/                # Marketing site (Hero, Features, Pricing, Contact, About, etc.)
│   │   ├── Player/              # Public player view (Playerview.tsx, PlayerProfilesfetch.tsx, PlayerProfileDetails.tsx)
│   │   ├── Expert/              # Public expert view
│   │   ├── Media/               # MediaEdit, MediaView
│   │   ├── Reviews/             # Reviewview, Reviewprofilenoedit
│   │   ├── team/                # Public team view (teamProfile.tsx, TeamProfileDetails.tsx, teamPlayers.tsx)
│   │   └── common/              # AssessmentReport, referral, subscriptionCancel
│   ├── Playerpages/             # Player dashboard pages
│   │   ├── playerprofile.tsx    # Main profile (tabs: details, media, reviews, account, businessCard, matches, team)
│   │   ├── team.tsx             # Team association tab — view team, exit team
│   │   ├── profiledetails.tsx
│   │   ├── businessCard.tsx
│   │   ├── profileMatches.tsx
│   │   ├── experts.tsx
│   │   ├── BookService.tsx
│   │   ├── PlayerSponsors.tsx
│   │   ├── settings.tsx
│   │   └── bookings/            # mybooking.tsx, AgoraVideoModal.tsx, Table.tsx
│   ├── expertpages/             # Expert dashboard pages
│   │   ├── expertdata.tsx       # Main profile
│   │   ├── Dashboard.tsx
│   │   ├── Slots.tsx            # Availability management
│   │   ├── Expertservices.tsx
│   │   ├── evaluation.tsx       # Player assessment form
│   │   ├── BusinessCard.tsx
│   │   └── bookings/            # mybooking.tsx, AgoraVideoModal.tsx
│   ├── teampages/               # Team dashboard pages
│   │   ├── teamprofile.tsx      # Main profile (tabs: details, media, account, matches, manage team)
│   │   ├── teamPlayers.tsx      # Manage Team tab — search players, add/remove, roster rows
│   │   ├── teamdetails.tsx
│   │   ├── profileMatches.tsx
│   │   ├── settings.tsx
│   │   ├── SponsorApplicationpage.tsx
│   │   └── bookings/
│   ├── SponsorPages/            # Sponsor dashboard pages
│   │   ├── Sponsorprofile.tsx
│   │   ├── Sponsorplayer.tsx
│   │   ├── SponsorApplication.tsx
│   │   └── playerinfo.tsx       # Renders Playerview
│   ├── fanpages/                # Fan pages
│   │   ├── FanProfile.tsx
│   │   ├── Players.tsx
│   │   ├── Experts.tsx
│   │   └── Following.tsx
│   ├── store/
│   │   ├── store.ts             # Redux store config
│   │   ├── hooks.ts             # useAppDispatch, useAppSelector
│   │   ├── apiConfig.ts         # Axios instances (authService, userService, usersService)
│   │   ├── auth-slice/          # Auth state + thunks
│   │   ├── profile-slice/       # Profile state + thunks
│   │   └── plans-slice/         # Subscription state
│   ├── lib/
│   │   └── utils.ts             # cn() helper
│   ├── App.tsx                  # All route definitions
│   └── main.tsx                 # React entry point
├── .env                         # Environment variables
├── vite.config.ts
├── tsconfig.json
├── nginx.conf
├── Dockerfile
└── docker-compose.yml
```

---

## Environment Variables

```env
VITE_PORT=https://api.outceedo.com       # API gateway base URL
VITE_STRIPE_PUB=pk_live_...              # Stripe publishable key
VITE_AGORA_APP_ID=...                    # Agora video SDK app ID
VITE_HOME=https://outceedo.com           # Marketing site URL
STRIPE_SECRET=sk_live_...               # Stripe secret (server-side only)
VITE_USER=http://localhost:8001          # User service (dev override)
```

> All `VITE_*` variables are exposed to the browser. Never put secrets in `VITE_*` variables.

---

## API Services

Defined in `src/store/apiConfig.ts`. All instances attach `Authorization: Bearer <token>` via a request interceptor reading `localStorage.getItem("accessToken")`.

| Instance | Base URL | Used for |
|---|---|---|
| `authService` | `/api/v1/auth` | Login, register, verify email, password reset |
| `userService` | `/api/v1/user` | Profiles, matches, reports, players, bookings |
| `usersService` | `/api/v1/users` | Search, public profile browsing |

---

## Redux Store

```
store
├── auth       — isAuthenticated, user (id, username, role, isBan, isSuspended), loading, error
├── profile    — currentProfile, viewedProfile, profiles[], pagination, services[]
└── subscription — isActive, planName, planId, expiryDate
```

### Key Profile Thunks

| Thunk | What it does |
|---|---|
| `getProfile(username)` | Fetches a profile. Sets `currentProfile` if own username, else `viewedProfile` |
| `updateProfile(data)` | PATCH own profile |
| `updateProfilePhoto(file)` | Upload & update profile picture |
| `getProfiles(limit, page, role)` | Paginated list of profiles by role |
| `searchProfiles(query, limit, page, role)` | Search profiles |

### Navigating to another user's profile

```ts
// Set the username in localStorage, then navigate
localStorage.setItem("viewplayerusername", username);  // for players
localStorage.setItem("viewteamusername", username);    // for teams
navigate("/team/playerinfo");
```

The target component calls `dispatch(getProfile(username))` which sets `viewedProfile` in Redux.

---

## Routing

All routes are defined in `src/App.tsx`. Each role's routes are wrapped in `<CheckAuth>` for protection.

### Auth Routes

| Path | Component |
|---|---|
| `/login` | Login |
| `/signup` | Signup |
| `/emailverification` | EmailVerification |
| `/forgotpassword` | ForgotPassword |
| `/reset-password/:id` | ResetPassword |

### Player Routes (`/player/*`)

| Path | Component / Description |
|---|---|
| `/profile` | `playerprofile.tsx` — tabs: details, media, reviews, account, businessCard, matches, **team** |
| `/matches` | Match history |
| `/mybooking` | Expert bookings with Agora video |
| `/viewexperts` | Browse experts |
| `/book` | Book an expert service |
| `/sponsors` | Sponsor partnerships |
| `/applications` | Sponsor applications |
| `/playerinfo` | View another player's profile (`Playerview`) |
| `/teamprofile` | View a team's public profile |
| `/referral` | Referral program |
| `/details-form` | Profile completion form |

### Expert Routes (`/expert/*`)

| Path | Component / Description |
|---|---|
| `/profile` | `expertdata.tsx` — main profile |
| `/mybooking` | Manage bookings from players |
| `/viewplayers` | Browse players |
| `/slots` | Set availability windows |
| `/evaluation` | Assessment form for players |
| `/playerinfo` | View player profile |
| `/referral` | Referral program |

### Team Routes (`/team/*`)

| Path | Component / Description |
|---|---|
| `/profile` | `teamprofile.tsx` — tabs: details, media, account, matches, **manage team** |
| `/players` | Browse players (public listing) |
| `/experts` | Browse experts |
| `/sponsors` | Sponsor management |
| `/playerinfo` | View player's public profile (`Playerview`) |
| `/teamprofile` | View another team's public profile |
| `/referral` | Referral program |

### Sponsor Routes (`/sponsor/*`)

| Path | Component / Description |
|---|---|
| `/profile` | Sponsor profile |
| `/players` | Browse players |
| `/teams` | Browse teams |
| `/playerinfo` | View player profile |
| `/teaminfo` | View team profile |
| `/referral` | Referral program |

### Fan Routes (`/fan/*`)

| Path | Component / Description |
|---|---|
| `/profile` | Fan profile |
| `/players` | Browse players |
| `/experts` | Browse experts |
| `/playerinfo` | View player profile |

### Public Routes

| Path | Description |
|---|---|
| `/` | Home (marketing) or redirect to role dashboard |
| `/about` | About page |
| `/plans` | Pricing & subscription plans |
| `/privacy` | Privacy policy |
| `/terms` | Terms of service |
| `/:username` | Public profile (any user) |
| `/banned` | Ban / suspension page |

---

## Auth Flow

### Registration
1. User selects role + fills in name, email, password, country → `registerUser()` thunk
2. Redirected to `/emailverification`
3. Enters OTP → `verifyEmail()` thunk → verified

### Login
1. Email + password → `loginUser()` thunk
2. Token + user data stored in `localStorage`
3. `validateToken()` called → fetches full user (checks `isBan`, `isSuspended`)
4. Redirect to role-based dashboard (`/player/profile`, `/team/profile`, etc.)

### Route Protection (`CheckAuth.tsx`)
- No token → redirect to `/login`
- Role mismatch → redirect to `/unauthorized`
- `isBan || isSuspended` → redirect to `/banned`

### localStorage Keys

| Key | Value |
|---|---|
| `accessToken` | JWT bearer token |
| `username` | Own username |
| `role` | `player` \| `expert` \| `team` \| `sponsor` \| `fan` |
| `userId` | Own user ID |
| `viewplayerusername` | Target player username for profile view navigation |
| `viewteamusername` | Target team username for profile view navigation |
| `playerStats` | Cached player stats (JSON) |

---

## Teams Feature

### Team Dashboard (`teampages/teamprofile.tsx`)
The **Manage Team** tab (5th tab) renders `teampages/teamPlayers.tsx`:
- **Search** — debounced search by username, returns player cards with an ℹ Info button
- **Info Modal** — shows full player details (bio, skills, age, height, city, sport) with Add / View Profile actions
- **Add Players** — POST `/api/v1/user/players/add` with `{ usernames: string[] }`. Only players with no team are eligible
- **Roster** — roster rows with photo, name, sport badge, View Profile + Remove buttons
- **Remove** — DELETE `/api/v1/user/players/remove` with `{ usernames: string[] }`

### Public Team Profile (`Pages/team/teamProfile.tsx`)
5 tabs: **details**, **media**, **reviews**, **matches**, **players**.  
The **players** tab renders `Pages/team/teamPlayers.tsx` (read-only), driven by `profileData.teamPlayersData` (no extra API call needed).

### Player Team Tab (`Playerpages/team.tsx`)
Rendered inside the player's own profile under the **team** tab:
- Shows team card: gradient banner, team photo, team name, `@username`, Active Member badge
- **View Team** button → sets `viewteamusername` in localStorage and navigates to team profile
- **Exit Team** button → confirmation modal → PATCH `/api/v1/user/players/exit` → re-fetches profile

### Player View (`Pages/Player/Playerview.tsx`)
When viewing a player who belongs to a team, a compact **team badge card** is shown beside the stats card:
- Gradient banner, team photo, team name, `@username`, "My Team" badge
- Data sourced from `profileData.associatedTeam` (JSON: `{ teamName, teamUsername, photo }`)

---

## Profile Data Flow

```
User visits /team/playerinfo
    ↓
localStorage.getItem("viewplayerusername")
    ↓
dispatch(getProfile(username))  →  sets viewedProfile in Redux
    ↓
Playerview reads viewedProfile
    ↓
Shows player profile with stats, team badge, follow, reviews, matches
```

---

## Subscription & Payments

- **Stripe** integration for plan purchases
- `subscription` Redux slice tracks `isActive`, `planName`, `expiryDate`
- Free plan: only *Recorded Video Assessment* available to players
- Premium plan: all expert services unlocked; following other users enabled
- `/plans` page shows pricing; redirected after Stripe checkout to `/subscription/success` or `/subscription/cancel`

---

## Video Calls

- **Agora RTC SDK** powers expert-player sessions
- `AgoraVideoModal.tsx` exists in `Playerpages/bookings/`, `expertpages/bookings/`, `teampages/bookings/`
- Triggered from the booking management page when a session starts

---

## PDF & Export

- Player assessment reports exported via `@react-pdf/renderer`
- Business cards exportable as image via `html-to-image` / `html2canvas`

---

## Development

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:5173)
npm run dev

# Type check + production build
npm run build

# Preview production build
npm run preview

# Lint
npm run lint
```

### Path Alias
`@` maps to `./src` — use `@/components/ui/button` instead of `../../components/ui/button`.

---

## Deployment

| File | Purpose |
|---|---|
| `Dockerfile` | Multi-stage build → nginx static server |
| `docker-compose.yml` | Local container compose |
| `nginx.conf` | SPA fallback (`try_files $uri /index.html`) |
| `netlify.toml` | Netlify deployment config |
| `.github/workflows/` | CI/CD pipelines |
