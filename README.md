# 🇬🇭 Dodow Amanmuo - Ghana Civic Engagement Platform

A comprehensive digital platform for Ghanaian citizens to engage with government policies, vote on initiatives, and participate in democratic discourse.

## 🌟 Features

### 🏛️ Policy Management
- Browse and search government policies
- Vote on policies (support/oppose)
- Real-time vote counting and percentages
- Official responses from government officials
- Multi-language translation (English + 9 local languages)

### 👥 Multi-Tenant User System
- **Citizens** - Vote, participate in forums, view policies
- **Assembly Members** - Post official responses, participate in district + national forums
- **Ministers** - Post official responses, participate in national forums
- **Super Admin** - Full platform management with password-protected access

### 📰 Ghana News
- Admin-managed news articles
- Image upload support via Supabase Storage
- News categorization and search

### 💬 Community Forums
- District-level forums for local issues
- National forums for country-wide discussions
- Role-based access control
- Real-time engagement

### 🤖 AI-Powered Features
- Policy summarization
- Comment suggestions
- Constitution Q&A assistant
- Ghana Card OCR verification
- Sentiment analysis
- Content moderation

### 🔐 Security & Verification
- Ghana Card verification with OCR
- Age verification (18+ for voting and forum participation)
- Row Level Security (RLS) via Supabase
- Session-based super admin authentication

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Supabase account
- Groq API key (for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd Claude
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Copy `.env.example` to `.env` and fill in your credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_GROQ_API_KEY=your_groq_api_key
   VITE_SUPER_ADMIN_PASSWORD=your_admin_password
   ```

4. **Set up the database**
   
   Go to your Supabase dashboard → SQL Editor and run these files in order:
   
   ```
   1. database/COMPLETE_DATABASE_SETUP.sql
   2. database/FIX_ALL_RLS_POLICIES.sql
   3. database/SETUP_IMAGE_STORAGE.sql (optional - for news images)
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## 📁 Project Structure

```
Claude/
├── src/
│   ├── components/        # React components
│   ├── pages/            # Page components
│   ├── services/         # API and service integrations
│   ├── context/          # React context providers
│   └── assets/           # Images and static files
├── database/             # SQL setup files
│   ├── COMPLETE_DATABASE_SETUP.sql
│   ├── FIX_ALL_RLS_POLICIES.sql
│   └── SETUP_IMAGE_STORAGE.sql
├── docs/                 # Documentation
│   ├── README_START_HERE.md
│   ├── QUICK_START.md
│   └── ADMIN_ACCESS_GUIDE.md
└── README.md            # This file
```

## 📚 Documentation

Comprehensive documentation is available in the `/docs` folder:

- **[README_START_HERE.md](docs/README_START_HERE.md)** - Start here for setup instructions
- **[QUICK_START.md](docs/QUICK_START.md)** - 5-minute quick start guide
- **[ADMIN_ACCESS_GUIDE.md](docs/ADMIN_ACCESS_GUIDE.md)** - Admin panel tutorial
- **[AI_FEATURES_GUIDE.md](docs/AI_FEATURES_GUIDE.md)** - AI features documentation
- **[FORUM_ACCESS_RULES.md](docs/FORUM_ACCESS_RULES.md)** - Forum access rules by role
- **[FIXES_COMPLETED.md](docs/FIXES_COMPLETED.md)** - Technical implementation details

## 🗄️ Database Setup

All database SQL files are in the `/database` folder:

### Required Setup:
1. **COMPLETE_DATABASE_SETUP.sql** - Creates policies, votes, and responses tables
2. **FIX_ALL_RLS_POLICIES.sql** - Configures Row Level Security policies

### Optional Setup:
3. **SETUP_IMAGE_STORAGE.sql** - Enables image uploads for Ghana News
4. **ADD_GHANA_CARD_COLUMNS.sql** - Ghana Card verification features
5. **FORUM_FEATURES_SCHEMA.sql** - Forum functionality

## 🔐 Security

- **No service role key in frontend** - Uses Supabase anon key + RLS policies
- **Row Level Security (RLS)** - All tables protected with appropriate policies
- **Session-based admin auth** - Super admin access protected by password
- **Ghana Card verification** - OCR + API verification for user identity
- **Age verification** - Ensures users are 18+ for voting and forums

## 🛠️ Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **AI**: Groq API (Llama 3 models)
- **Routing**: React Router
- **State Management**: React Context API

## 📱 User Roles & Permissions

| Feature | Citizen | Assembly Member | Minister | Super Admin |
|---------|---------|-----------------|----------|-------------|
| View Policies | ✅ | ✅ | ✅ | ✅ |
| Vote on Policies | ✅ | ✅ | ✅ | ✅ |
| Post Official Responses | ❌ | ✅ | ✅ | ✅ |
| District Forums | ✅ | ✅ | ❌ | ✅ |
| National Forums | ✅ | ✅ | ✅ | ✅ |
| Admin Panel | ❌ | ❌ | ❌ | ✅ |
| Create Policies | ❌ | ❌ | ❌ | ✅ |
| Manage Users | ❌ | ❌ | ❌ | ✅ |
| Create News | ❌ | ❌ | ❌ | ✅ |

## 🆘 Troubleshooting

### "new row violates row-level security policy"
**Solution:** Run `database/FIX_ALL_RLS_POLICIES.sql` in Supabase SQL Editor

### Policies not loading
**Solution:** Run `database/COMPLETE_DATABASE_SETUP.sql` to create tables

### Images not uploading
**Solution:** Run `database/SETUP_IMAGE_STORAGE.sql` to create storage bucket

### More help
See [docs/README_START_HERE.md](docs/README_START_HERE.md) for detailed troubleshooting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Ghana National Identification Authority (NIA) for Ghana Card verification
- Groq for AI API services
- Supabase for backend infrastructure
- The Ghanaian developer community

## 📞 Support

For issues and questions:
- Check the [docs](docs/) folder for comprehensive guides
- Open an issue on GitHub
- Contact the development team

---

**Built with ❤️ for Ghana 🇬🇭**
