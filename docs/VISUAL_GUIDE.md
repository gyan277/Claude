# 🎨 Visual System Guide

## 🎯 THE BIG PICTURE

```
┌─────────────────────────────────────────────────────┐
│                  DODOW AMANMUO                      │
│           Ghana Civic Engagement Platform           │
└─────────────────────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
    ┌────▼─────┐   ┌────▼─────┐   ┌────▼─────┐
    │  SUPER   │   │  ADMIN   │   │ CITIZENS │
    │  ADMIN   │   │  USERS   │   │          │
    └──────────┘   └──────────┘   └──────────┘
         │               │               │
    Password        Email/Pass      Ghana Card
    Frontend         Supabase       Verification
         │               │               │
         │               │               │
    ┌────▼─────┐   ┌────▼─────┐   ┌────▼─────┐
    │  /admin  │   │/insights │   │   Home   │
    │  Panel   │   │Dashboard │   │  Forums  │
    └──────────┘   └──────────┘   └──────────┘
         │               │               │
    Create Users    View Stats     Vote/Post
    Manage Policies  Analyze Data  (18+ only)
    Manage News
```

---

## 🔐 LOGIN FLOW

### Super Admin Login
```
┌─────────────────────────────────────┐
│  /super-admin-login                 │
│                                     │
│  🔒 Super Admin Password            │
│  [GhanaGov2024@Admin]              │
│                                     │
│  [ Access Admin Panel ]             │
└─────────────────────────────────────┘
            ↓
┌─────────────────────────────────────┐
│  /admin                             │
│                                     │
│  👥 Users  📄 Policies  📰 News    │
│                                     │
│  Create Assembly Members            │
│  Create Ministers                   │
│  Manage All Content                 │
└─────────────────────────────────────┘
```

### Assembly/Minister Login
```
┌─────────────────────────────────────┐
│  /login                             │
│                                     │
│  📧 Email: john@gov.gh             │
│  🔒 Password: ********             │
│                                     │
│  [ Sign in ]                        │
└─────────────────────────────────────┘
            ↓
┌─────────────────────────────────────┐
│  /insights (Auto-redirect)          │
│                                     │
│  📊 District Analytics              │
│  📈 Policy Engagement               │
│  🗳️ Voting Trends                  │
│                                     │
│  + Access to all citizen features   │
└─────────────────────────────────────┘
```

### Citizen Login
```
┌─────────────────────────────────────┐
│  /signup                            │
│                                     │
│  📝 Name, Email, Password           │
│  📍 District Selection              │
│  🪪 Ghana Card Upload               │
│                                     │
│  [ Register ]                       │
└─────────────────────────────────────┘
            ↓
┌─────────────────────────────────────┐
│  Ghana Card Verification            │
│                                     │
│  🤖 AI OCR Extraction               │
│  ✅ Age Check (18+)                 │
│  ✅ District Verification           │
└─────────────────────────────────────┘
            ↓
┌─────────────────────────────────────┐
│  / (Home - Auto-redirect)           │
│                                     │
│  📰 Ghana News                      │
│  📊 Metrics                         │
│  📄 Active Policies                 │
│                                     │
│  ✅ Can Vote (if verified & 18+)    │
│  ✅ Can Post (if verified & 18+)    │
└─────────────────────────────────────┘
```

---

## 🎭 ROLE COMPARISON

```
┌──────────────┬────────────┬──────────┬──────────┬─────────┐
│  Feature     │ Super Admin│ Assembly │ Minister │ Citizen │
├──────────────┼────────────┼──────────┼──────────┼─────────┤
│ Admin Panel  │     ✅     │    ❌    │    ❌    │   ❌    │
│ Create Users │     ✅     │    ❌    │    ❌    │   ❌    │
│ Manage News  │     ✅     │    ❌    │    ❌    │   ❌    │
│ Insights     │     N/A    │    ✅    │    ✅    │   ❌    │
│ View Policies│     N/A    │    ✅    │    ✅    │   ✅    │
│ Vote         │     N/A    │    ✅    │    ✅    │   ✅*   │
│ Post Forums  │     N/A    │    ✅    │    ✅    │   ✅*   │
│ Profile      │     N/A    │    ✅    │    ✅    │   ✅    │
└──────────────┴────────────┴──────────┴──────────┴─────────┘
* Only if verified Ghana Card and 18+
```

---

## 📱 PAGE NAVIGATION

```
PUBLIC PAGES (Everyone)
├── / (Home)
│   ├── Ghana News Feed
│   ├── Platform Metrics
│   └── Featured Policies
│
├── /policies
│   ├── Browse All Policies
│   ├── Filter by Category
│   └── View Details
│
└── /forums
    ├── District Forums
    └── View Discussions

AUTHENTICATED PAGES (Logged in)
├── /profile
│   ├── User Information
│   ├── Verification Status
│   └── Ghana Card Details
│
└── /insights (Assembly/Minister only)
    ├── Analytics Dashboard
    ├── District/National Stats
    └── Engagement Metrics

ADMIN PAGES (Super Admin only)
└── /admin
    ├── Users Tab
    │   ├── Create Assembly Members
    │   ├── Create Ministers
    │   └── View/Delete Users
    │
    ├── Policies Tab
    │   ├── Create Policies
    │   ├── Edit Policies
    │   └── Delete Policies
    │
    └── News Tab
        ├── Create News Items
        ├── Edit News
        └── Delete News
```

---

## 🔄 DATA FLOW

```
SUPER ADMIN CREATES USER
    ↓
Supabase Auth (Email/Password)
    ↓
Supabase Database (users table)
    ↓
User receives credentials
    ↓
USER LOGS IN
    ↓
Check role in database
    ↓
┌─────────────────┬─────────────────┬─────────────────┐
│   citizen       │   assembly      │   minister      │
│   Redirect: /   │ Redirect: /insights│ Redirect: /insights│
└─────────────────┴─────────────────┴─────────────────┘
```

---

## 🎯 QUICK ACCESS COMMANDS

```bash
# Start development server
npm run dev

# Access super admin
http://localhost:5173/super-admin-login
Password: GhanaGov2024@Admin

# Regular user login
http://localhost:5173/login

# Citizen signup
http://localhost:5173/signup
```

---

## 🏗️ SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────┐
│           FRONTEND (React + Vite)           │
├─────────────────────────────────────────────┤
│  Components:                                │
│  ├── Layout (Navigation)                    │
│  ├── SuperAdminLogin (Password Page)        │
│  ├── Admin (Panel with 3 tabs)             │
│  ├── Login (Regular Login)                  │
│  └── SignUp (Citizen Registration)          │
└─────────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────────┐
│        SUPABASE (Backend Services)          │
├─────────────────────────────────────────────┤
│  Services:                                  │
│  ├── Authentication (Email/Password)        │
│  ├── Database (PostgreSQL)                  │
│  │   ├── users                              │
│  │   ├── policies                           │
│  │   ├── ghana_news                         │
│  │   ├── forum_posts                        │
│  │   └── forum_comments                     │
│  └── Row Level Security (RLS)               │
└─────────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────────┐
│           GROQ AI (External API)            │
├─────────────────────────────────────────────┤
│  Services:                                  │
│  ├── Ghana Card OCR (Vision)               │
│  ├── Policy Translation (NLP)              │
│  └── Constitution Q&A (Chat)               │
└─────────────────────────────────────────────┘
```

---

## 🔑 ENVIRONMENT VARIABLES

```env
# Supabase Configuration
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key

# Groq AI
VITE_GROQ_API_KEY=your-groq-key

# Super Admin (NEW!)
VITE_SUPER_ADMIN_PASSWORD=GhanaGov2024@Admin
```

---

## ✅ IMPLEMENTATION CHECKLIST

- [x] Super Admin password login page
- [x] Session-based authentication for super admin
- [x] Admin panel with 3 tabs (Users, Policies, News)
- [x] Create Assembly Members and Ministers
- [x] Regular login for Assembly/Ministers
- [x] Role-based redirect after login
- [x] Insights page for Assembly/Ministers only
- [x] Citizen registration with Ghana Card
- [x] Age verification (18+ requirement)
- [x] District-based forum posting
- [x] Database integration (all data from Supabase)
- [x] Logout functionality
- [x] Responsive design
- [x] Ghana theme colors

---

**ALL SYSTEMS OPERATIONAL! 🚀**

Your multi-tenant civic engagement platform is ready to use!
