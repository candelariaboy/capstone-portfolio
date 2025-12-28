# 🎓 AI-Enhanced Gamified Student Portfolio Platform

A production-ready web application for BSCS and BSIT students to showcase their projects, receive AI-powered learning recommendations, and gamify their growth with badges and points.

**Live Demo:** [Coming Soon - Deploy to Vercel]

---

## ✨ Features

### 🎯 Core Features
- **No Authentication Required** - Simple form-based account creation with Student ID tracking
- **Portfolio Upload** - Support for up to 200MB file uploads with drag-and-drop UI
- **AI Skill Extraction** - Automatic extraction of technologies and skills from uploaded projects
- **AI Recommendations** - Personalized learning paths based on your skills and interests
- **Gamification System** - Earn badges, points, and level up as you grow
- **Leaderboard** - Anonymous ranking by points and achievements
- **Real-time Analytics** - Track your progress with progress bars and charts

### 🤖 AI & NLP Features
- **Transformers.js** - Client-side NLP for skill extraction
- **Together AI Integration** - Phi-3-mini LLM for personalized recommendations
- **Smart Skill Detection** - Context-aware extraction from portfolio items
- **Personalized Learning Paths** - Dynamic suggestions based on your profile

### 🏆 Gamification
- **Badges** - New Student, Builder I/II, AI Follower, Junior Developer, Pathfinder
- **Points System** - Earn points for uploads (+25), accepting recommendations (+50)
- **Levels** - Progress from Level 1 to 5 based on accumulated points
- **Leaderboard** - Anonymous ranking with emoji medals

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React 19 with App Router
- **Tailwind CSS** - Responsive utility-first styling
- **shadcn/ui** - Pre-built accessible components
- **Framer Motion** - Smooth animations and transitions
- **React Hot Toast** - Non-intrusive notifications

### Backend
- **Next.js API Routes** - Serverless functions
- **Skill Extraction** - Pattern-based skill detection
- **Multer** - File upload middleware
- **Resumable.js** - Resumable file uploads

### Database & Storage
- **Supabase PostgreSQL** - Relational database
- **Supabase Storage** - 500GB+ file storage (Pro plan)
- **RLS Policies** - Disabled for no-auth demo

### AI/ML
- **Together AI** - Phi-3-mini LLM ($10 credits free)
- **Custom NLP Pipeline** - Skill extraction engine
- **Recommendation Engine** - Context-aware suggestions

### Deployment
- **Vercel** - Next.js hosting (free tier)
- **Supabase Pro** - $25/month managed PostgreSQL

---

## 📋 Database Schema

### Tables
```sql
users              -- Student profiles with skills and interests
portfolio_items    -- Uploaded projects with extracted skills
badges             -- Earned achievements
achievements       -- Detailed achievement logs
recommendations    -- AI-generated learning suggestions
activity_logs      -- User action tracking
```

See [database.sql](./database.sql) for complete schema.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or pnpm
- Supabase account (free tier works initially)
- Together AI API key (optional - for LLM recommendations)

### Local Development

1. **Clone & Install**
```bash
git clone <repo>
cd sad
npm install
```

2. **Setup Supabase**
   - Create project at [supabase.com](https://supabase.com)
   - Run SQL from [database.sql](./database.sql) in SQL editor
   - Create Storage bucket: `portfolios` (public)
   - Get your URL and anon key

3. **Configure Environment**
```bash
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials
```

4. **Run Dev Server**
```bash
npm run dev
# Open http://localhost:3000
```

5. **Test Account Creation**
   - Fill form: Name, Student ID, Email, Major, Year, Skills, Interests
   - Auto-redirects to dashboard with 50 starting points
   - "New Student" badge awarded automatically

---

## 📖 API Routes

### User Management
**`POST /api/create-user`** - Create new student account
```json
{
  "name": "John Doe",
  "student_id": "2023-00123",
  "email": "john@example.com",
  "major": "BSCS",
  "year_level": 2,
  "skills": [{"name": "React"}, {"name": "Node.js"}],
  "interests": ["AI/ML", "Web Dev"]
}
```
Response: `{ success: true, user_id: "uuid" }`

### Portfolio & Analysis
**`POST /api/analyze-portfolio`** - Trigger NLP analysis
- Extracts skills from portfolio items
- Generates AI recommendations
- Awards points and badges

### Gamification
**`GET /api/gamification?userId=xxx`** - Get badges & achievements

**`POST /api/gamification`** - Award points/badges
```json
{
  "userId": "uuid",
  "action": "portfolio_upload",
  "points": 25,
  "badgeType": "builder_i"
}
```

---

## 📱 Page Structure

```
/                          - Landing page + account creation
/dashboard                 - Main dashboard (overview)
/dashboard/portfolio       - Portfolio list + upload
/dashboard/portfolio/[id]  - Portfolio item details
/dashboard/recommendations - AI learning paths
/dashboard/achievements    - Badges + leaderboard
```

---

## 🎮 Gamification System

### Badge Types
| Badge | Triggered By | Points |
|-------|-------------|--------|
| 🎓 New Student | Account creation | 50 |
| 🏗️ Builder I | First upload | +25 |
| 🏢 Builder II | 3rd upload | +25 |
| 🤖 AI Follower | Accept recommendation | +50 |
| 💻 Junior Developer | Reach Level 2 | Auto |
| 🧭 Pathfinder | Complete learning path | +200 |

### Level Progression
| Level | Points | Emoji |
|-------|--------|-------|
| 1 | 0-99 | ⭐ |
| 2 | 100-249 | ⭐⭐ |
| 3 | 250-499 | ⭐⭐⭐ |
| 4 | 500-999 | ⭐⭐⭐⭐ |
| 5 | 1000+ | ⭐⭐⭐⭐⭐ |

---

## 🌐 Deployment

### 1. GitHub Setup
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/portfolio-ai.git
git push -u origin main
```

### 2. Vercel Deployment
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import GitHub repository
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `TOGETHER_API_KEY` (optional)
4. Click Deploy
5. Share deployment URL!

### 3. Supabase Setup
- Create PostgreSQL database
- Run [database.sql](./database.sql)
- Create `portfolios` storage bucket
- Set bucket to public read

### 4. Upgrade to Pro (Optional)
- Supabase Dashboard → Billing
- Switch to Pro: $25/month
- Get 500GB storage (vs 1GB free)

---

## 📊 Success Metrics

### Track in Dashboard
- Total registrations
- Average points per student
- Badge distribution
- Upload success rate
- Recommendation acceptance rate
- Leaderboard activity

### Capstone Report Data
```csv
student_id,name,major,points,level,badges,uploads
2023-00123,John Doe,BSCS,250,3,5,4
2023-00124,Jane Smith,BSIT,450,4,7,6
```

---

## 🎯 Sample User Journey

**Day 1: Registration**
- Create account (30 seconds)
- Auto-dashboard with 50 points
- "New Student" badge 🎓

**Day 2: First Upload**
- Upload React project (50MB)
- AI extracts skills: React, Node.js
- Earn +25 points, "Builder I" badge 🏗️

**Day 3-7: Growth**
- Upload 2 more projects
- Hit "Builder II" milestone 🏢
- Accept AI recommendations (+50 pts each)
- Reach Level 2 💻

**Week 2+: Momentum**
- Climb leaderboard
- Earn more badges
- Build portfolio
- Faculty monitors progress

---

## 🔧 Configuration

### File Upload Limits
```
MAX_SIZE: 200MB (209,715,200 bytes)
FORMAT: PDF, DOC, DOCX, ZIP, CODE, IMAGE
```

### Performance Targets
- Page Load: < 2s
- Upload Speed: 10MB/s
- Analysis Time: < 5s
- API Response: < 500ms

### Database Limits
- Free Tier: 500MB storage
- Pro Tier: 500GB storage
- Concurrent connections: 100

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Upload fails | Check file size < 200MB, verify bucket exists |
| User not found | Verify userId in URL, check Supabase |
| Dashboard blank | Clear cache, check user exists in DB |
| Recommendations missing | Trigger `/api/analyze-portfolio` manually |
| Leaderboard empty | Ensure multiple users created, check RLS disabled |

---

## 📚 Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Guide](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion)
- [Together AI Docs](https://api.together.xyz)

---

## 📄 Project Structure

```
sad/
├── src/app/
│   ├── page.tsx              # Landing + registration
│   ├── api/
│   │   ├── create-user/      # User creation
│   │   ├── upload-file/      # File upload
│   │   ├── analyze-portfolio/ # NLP analysis
│   │   └── gamification/     # Points/badges
│   └── dashboard/
│       ├── page.tsx          # Main dashboard
│       ├── portfolio/        # Portfolio pages
│       ├── recommendations/  # AI paths
│       └── achievements/     # Leaderboard
├── src/components/
│   ├── ui/                   # shadcn UI
│   └── forms/                # Forms
├── src/lib/
│   ├── supabase.ts          # DB client
│   └── types.ts             # Types
├── hooks/
│   └── useGamification.ts   # Hooks
├── database.sql             # Schema
└── package.json
```

---

## ✅ Checklist

- [x] Next.js 15 setup
- [x] Supabase database
- [x] Landing page + registration
- [x] User dashboard
- [x] Portfolio upload (200MB)
- [x] Skill extraction
- [x] AI recommendations
- [x] Gamification system
- [x] Leaderboard
- [ ] Deploy to Vercel
- [ ] Upgrade Supabase Pro
- [ ] Onboard pilot students

---

## 🤝 Contributing

Feel free to extend this project:
- Add more gamification features
- Integrate real LLMs (OpenAI, Claude)
- Add social sharing
- Build analytics dashboard
- Create mobile app

---

## 📝 License

MIT License - For educational use

---

## 🎉 You Did It!

You've built a **production-ready full-stack application** with:
- ✅ Next.js + React 19
- ✅ Supabase PostgreSQL
- ✅ File uploads (200MB)
- ✅ AI skill extraction
- ✅ Gamification system
- ✅ Cloud-ready deployment

**Next: Deploy to Vercel and onboard students!**

---

**Made with ❤️ | Ready for 🚀**
