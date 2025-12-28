# 🔧 Local Development Guide

Complete guide for setting up and running the AI Student Portfolio Platform locally.

---

## 📋 Prerequisites

- Node.js 18+ ([Download](https://nodejs.org))
- npm or yarn
- Git
- Supabase account (free)
- Code editor (VS Code recommended)

---

## 1️⃣ Initial Setup

### Clone Repository
```bash
cd ~/projects
git clone https://github.com/YOUR_USERNAME/portfolio-ai.git
cd portfolio-ai
```

### Install Dependencies
```bash
npm install
# or
yarn install
```

### Create `.env.local`
```bash
# Copy template
cp .env.local.example .env.local

# Or create manually with these values:
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
TOGETHER_API_KEY=your-together-api-key (optional)
UPLOAD_MAX_FILE_SIZE=209715200
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

---

## 2️⃣ Supabase Setup (Local)

### Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Enter project details
4. Wait for initialization

### Initialize Database
1. Go to **SQL Editor** in Supabase dashboard
2. Create new query
3. Copy entire content from `database.sql` file
4. Execute

### Create Storage Bucket
1. **Storage** → "Create new bucket"
2. Name: `portfolios`
3. Check "Public bucket"
4. Create

### Get API Keys
1. **Settings** → **API**
2. Copy and paste into `.env.local`:
   - Project URL
   - Anon Key
   - Service Role Key

---

## 3️⃣ Start Development Server

### Run Dev Server
```bash
npm run dev
# or
yarn dev
```

### Access Application
```
Open browser to: http://localhost:3000
```

You should see:
- Landing page with features
- Account creation form
- Navigation bar

---

## 4️⃣ Test Core Features

### Test 1: User Registration
```
1. Fill form:
   - Name: "John Doe"
   - Student ID: "2023-00001"
   - Email: "john@example.com"
   - Major: "BSCS"
   - Year: "2"
   - Skills: "React", "Node.js"
   - Interests: "Web Development"

2. Click "Create Account & Start"
3. Should redirect to dashboard
4. Check Supabase: Data appears in users table
5. Verify: 50 starting points, Level 1
```

### Test 2: Portfolio Upload
```
1. On dashboard, go to Portfolio tab
2. Fill upload form:
   - Title: "React E-commerce App"
   - File: Upload any PDF/image < 200MB
   - Description: "Built with React, Node.js, MongoDB"

3. Click "Upload Project"
4. Monitor progress bar
5. Verify:
   - File in Supabase Storage
   - Portfolio item in database
   - +25 points awarded
   - Skills extracted
```

### Test 3: AI Recommendations
```
1. After uploading portfolio
2. Go to "Recommendations" tab
3. Should see AI suggestions
4. Click "Accept Recommendation"
5. Verify:
   - +50 points awarded
   - "AI Follower" badge (if first time)
```

### Test 4: Leaderboard
```
1. Create 2-3 test accounts (different students)
2. Upload projects for each
3. Go to Achievements tab
4. Verify leaderboard shows all students ranked by points
5. Check badges display correctly
```

---

## 5️⃣ Development Workflow

### Project Structure
```
sad/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Landing page
│   │   ├── api/                  # API routes
│   │   └── dashboard/            # Dashboard pages
│   ├── components/               # React components
│   ├── lib/                      # Utilities & types
│   └── hooks/                    # Custom hooks
├── database.sql                  # DB schema
├── .env.local                    # Environment (local only)
├── README.md                     # Main documentation
├── DEPLOYMENT.md                 # Deployment guide
├── package.json                  # Dependencies
└── tsconfig.json                 # TypeScript config
```

### Key Files to Modify

**Landing Page:** `src/app/page.tsx`
- Hero section
- Features grid
- Form styling

**Dashboard:** `src/app/dashboard/page.tsx`
- Overview widgets
- Gamification display
- Recent achievements

**API Routes:** `src/app/api/*/route.ts`
- Create custom endpoints
- Modify business logic
- Add authentication

**Styling:** Global styles in `src/app/globals.css`
- Tailwind config: `tailwind.config.ts`
- shadcn/ui theme customization

---

## 6️⃣ Common Development Tasks

### Add New Badge Type
**File:** `src/hooks/useGamification.ts`

```typescript
export type BadgeType = 
  | "new_student"
  | "builder_i"
  | "your_new_badge";  // Add here

export const BADGE_INFO: Record<BadgeType, ...> = {
  your_new_badge: {
    name: "Your Badge Name",
    description: "Badge description",
    icon: "🎖️",
  },
};
```

### Add New API Endpoint
**File:** `src/app/api/your-endpoint/route.ts`

```typescript
import { supabaseServer } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Your logic here
    const result = await supabaseServer
      .from("table_name")
      .select("*");
    
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
```

### Modify Database Schema
**File:** `database.sql`

```sql
-- Add new table
CREATE TABLE IF NOT EXISTS new_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index
CREATE INDEX idx_new_table_user_id ON new_table(user_id);
```

Then run in Supabase SQL Editor.

---

## 7️⃣ Debugging

### Browser DevTools
```
Press F12 or Right-click → Inspect

Check:
- Console for errors/warnings
- Network tab for API calls
- Application tab for localStorage
```

### Vercel/Next.js Logs
```bash
# View build output
npm run build

# View dev server logs (in terminal)
npm run dev
```

### Supabase Logs
1. Go to Supabase Dashboard
2. **Database** → **Logs**
3. View query performance and errors

### TypeScript Errors
```bash
# Check for TS errors without building
npx tsc --noEmit
```

---

## 8️⃣ Performance Optimization

### Enable Image Optimization
```typescript
// In components using images
import Image from "next/image";

<Image
  src="/image.png"
  alt="Description"
  width={400}
  height={300}
  priority
/>
```

### Code Splitting
```typescript
// Dynamic imports for heavy components
import dynamic from "next/dynamic";

const HeavyComponent = dynamic(() => import("./Heavy"), {
  loading: () => <p>Loading...</p>,
});
```

### Database Query Optimization
```typescript
// ❌ Bad: Fetches all columns
const { data } = await supabase
  .from("users")
  .select("*");

// ✅ Good: Select only needed columns
const { data } = await supabase
  .from("users")
  .select("id, name, points");
```

---

## 9️⃣ Testing

### Manual Testing Checklist
- [ ] Navigation works on mobile
- [ ] Forms validate input
- [ ] API errors handled gracefully
- [ ] File upload works
- [ ] Leaderboard sorts correctly
- [ ] Animations smooth
- [ ] Dark mode (if implemented)

### Test Different Scenarios
```
1. Empty database
2. Multiple users
3. Large file uploads
4. Network disconnection
5. Invalid input
```

---

## 🔟 Production Build

### Build for Production
```bash
npm run build
npm start
```

### Verify Build
```bash
# Should show successful build
# Route page should list all pages
```

### Performance Check
```bash
# Check bundle size
npm run build -- --analyze
```

---

## 📚 Learning Resources

### Next.js
- [App Router Documentation](https://nextjs.org/docs/app)
- [API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)

### Supabase
- [Getting Started](https://supabase.com/docs/guides/getting-started)
- [PostgreSQL Guide](https://supabase.com/docs/guides/database)
- [Storage Guide](https://supabase.com/docs/guides/storage)

### React
- [Hooks Documentation](https://react.dev/reference/react)
- [State Management](https://react.dev/learn/managing-state)

### Tailwind CSS
- [Component Examples](https://tailwindcss.com/docs)
- [Responsive Design](https://tailwindcss.com/docs/responsive-design)

---

## 🚀 Next Steps

1. **Customize:** Modify colors, fonts, features
2. **Test:** Create test accounts, upload files
3. **Deploy:** Follow DEPLOYMENT.md
4. **Share:** Get feedback from users
5. **Iterate:** Add features based on feedback

---

## 💡 Pro Tips

### Auto-format Code
```bash
npm run lint -- --fix
```

### Update Dependencies
```bash
npm update
npm audit fix
```

### Clear Cache
```bash
rm -rf .next
npm run dev
```

### Debug API Calls
```typescript
// Add logging to API routes
console.log("Request body:", body);
console.log("Response:", result);
```

---

## ❓ Troubleshooting

### "Module not found" Error
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Port 3000 Already In Use
```bash
# Run on different port
npm run dev -- -p 3001
```

### Database Connection Refused
```
1. Check .env.local values
2. Verify Supabase project is running
3. Check network connectivity
4. Check IP allowlisting
```

### Supabase RLS Errors
```
Solution: For development, disable RLS
1. Supabase → Authentication
2. Policies → Disable RLS
3. Create public access policies
```

---

**Happy coding! 🎉**

Need help? Check README.md or DEPLOYMENT.md for more info.
