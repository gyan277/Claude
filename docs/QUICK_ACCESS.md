# 🎯 Quick Access Guide

## 🔑 LOGIN CREDENTIALS

### Super Admin
- **URL**: http://localhost:5173/super-admin-login
- **Password**: `GhanaGov2024@Admin`
- **Access**: Admin Panel (create users, manage policies & news)

### Assembly Members & Ministers
- **URL**: http://localhost:5173/login
- **Credentials**: Created by Super Admin
- **Access**: Regular app + Insights page

### Citizens
- **URL**: http://localhost:5173/signup
- **Verification**: Ghana Card required
- **Access**: Regular app features

---

## 🚪 ROUTES

| URL | Who Can Access |
|-----|---------------|
| `/super-admin-login` | Super Admin |
| `/admin` | Super Admin (after login) |
| `/login` | Assembly, Ministers, Citizens |
| `/signup` | New Citizens |
| `/insights` | Assembly Members & Ministers only |
| `/` `/policies` `/forums` | Everyone |

---

## 📝 WORKFLOW

1. **You** → `/super-admin-login` → Enter password → Access `/admin`
2. **Create users** → Users tab → Add Assembly/Minister
3. **They login** → `/login` → Auto-redirect to `/insights`
4. **Citizens** → `/signup` → Verify Ghana Card → Access app

---

## 🔐 CHANGE PASSWORD

Edit `.env` file:
```
VITE_SUPER_ADMIN_PASSWORD=YourNewPassword
```

---

That's it! Access your admin panel now! 🎉
