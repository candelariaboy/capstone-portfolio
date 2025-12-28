# 🚀 Deployment Guide - AI Student Portfolio Platform

Complete step-by-step guide to deploy your application live on Vercel and Supabase.

---

## 📋 Prerequisites

Before deployment, ensure you have:
- [ ] GitHub account (for code repository)
- [ ] Vercel account (free tier works fine)
- [ ] Supabase account (Pro plan recommended)
- [ ] Together AI account (optional, for LLM recommendations)
- [ ] Project fully built locally with `npm run build`

---

## Step 1: Prepare Your GitHub Repository

### 1.1 Create GitHub Repository
```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit: AI Student Portfolio Platform"
git branch -M main

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/portfolio-ai.git
git push -u origin main
```

### 1.2 Create `.gitignore` (if not exists)
Already included in the project. Verify it contains:
```
node_modules/
.env.local
.next/
out/
build/
```

---

## Step 2: Set Up Supabase (Database & Storage)

### 2.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in project details:
   - Project Name: `student-portfolio` (or your choice)
   - Database Password: Create strong password (save it!)
   - Region: Choose closest to your users
4. Wait for project initialization (~2 minutes)

### 2.2 Create Database Tables
1. Go to **SQL Editor**
2. Create new query
3. Copy entire content from `database.sql` file in the project root
4. Paste and execute
5. Wait for tables to be created

### 2.3 Create Storage Bucket
1. Go to **Storage** in left sidebar
2. Click "Create new bucket"
3. Name: `portfolios`
4. Check "Public bucket"
5. Click Create

### 2.4 Get Supabase Credentials
1. Go to **Settings** → **API**
2. Copy these values:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - Anon Key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Service Role Key → `SUPABASE_SERVICE_ROLE_KEY`

**Save these values - you'll need them for Vercel!**

---

## Step 3: Deploy to Vercel

### 3.1 Connect Vercel to GitHub
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Select "Import Git Repository"
4. Paste your GitHub repo URL
5. Authorize Vercel with GitHub
6. Select your repository

### 3.2 Configure Environment Variables
1. After connecting repo, you'll see configuration screen
2. Click "Environment Variables"
3. Add each variable:

```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://your-project.supabase.co

Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: your-anon-key-here

Name: SUPABASE_SERVICE_ROLE_KEY
Value: your-service-role-key-here

Name: HF_TOKEN
Value: hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx (from huggingface.co - FREE)

Name: UPLOAD_MAX_FILE_SIZE
Value: 209715200

Name: NEXT_PUBLIC_APP_URL
Value: https://your-project.vercel.app
```

**IMPORTANT:** Paste actual values from Supabase!

### 3.3 Deploy
1. Click "Deploy"
2. Watch the build logs (should take 2-3 minutes)
3. Once complete, you get a live URL!
4. Click "Visit" to see your live site

### 3.4 Update Supabase CORS Settings
To allow file uploads from your Vercel domain:

1. Go to Supabase → **Storage** → **portfolios**
2. Click **Settings** (gear icon)
3. Add CORS origin:
   ```
   https://your-project.vercel.app
   ```
4. Save

---

## Step 4: Verify Deployment

### 4.1 Test Landing Page
- [ ] Open your Vercel URL
- [ ] See landing page with features
- [ ] Form displays correctly

### 4.2 Test Account Creation
- [ ] Fill registration form
- [ ] Submit (should redirect to dashboard)
- [ ] Check Supabase: Data appears in `users` table
- [ ] User receives 50 starting points
- [ ] "New Student" badge appears

### 4.3 Test Portfolio Upload
- [ ] Upload test file (PDF or image)
- [ ] Should show upload progress
- [ ] File appears in portfolio list
- [ ] File stored in Supabase storage
- [ ] +25 points awarded

### 4.4 Test Leaderboard
- [ ] Create 2-3 test accounts
- [ ] View achievements page
- [ ] Leaderboard shows all users ranked by points

---

## Step 5: Upgrade Supabase (Optional but Recommended)

### 5.1 Switch to Pro Plan
1. Go to Supabase → **Billing**
2. Click "Upgrade to Pro"
3. Payment method → Add card
4. Choose Pro plan ($25/month)
5. Confirm

**Benefits:**
- 500GB storage (vs 1GB free)
- Better performance
- Priority support
- Custom domains

### 5.2 Configure Custom Domain
1. In Supabase → **Settings** → **Custom Domain**
2. Add your domain (e.g., portfolio-ai.com)
3. Update DNS records as shown
4. Enable HTTPS

---

## Step 6: Get Together AI Credits (Optional)

For AI-powered recommendations:

1. Go to [together.ai](https://together.ai)
2. Sign up with email
3. **Free credits:** $10 automatically
4. Copy API key
5. Add to Vercel environment variables:
   ```
   TOGETHER_API_KEY=your-api-key-here
   ```
6. Redeploy for changes to take effect

---

## Step 7: Set Up Custom Domain (Optional)

### 7.1 Domain Setup in Vercel
1. In Vercel → **Domains**
2. Enter your domain
3. Add DNS records to your domain registrar:
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```
4. Wait 24-48 hours for DNS propagation

### 7.2 Auto-Renewal Settings
- Vercel automatically handles SSL/HTTPS
- No additional configuration needed

---

## 📊 Post-Deployment Checklist

- [ ] Live website accessible via Vercel URL
- [ ] Account creation works
- [ ] Portfolio upload functions
- [ ] Files stored in Supabase
- [ ] Leaderboard displays users
- [ ] Email notifications working (if configured)
- [ ] Mobile responsive design works
- [ ] All API routes responding
- [ ] Environment variables loaded correctly
- [ ] Database connections stable

---

## 🔍 Monitoring & Logs

### View Vercel Logs
1. Vercel Dashboard → **Deployments**
2. Click latest deployment
3. **Logs** tab shows build and runtime logs

### View Supabase Logs
1. Supabase Dashboard → **Database** → **Logs**
2. Monitor query performance
3. Check for errors

---

## 🐛 Common Issues & Fixes

### Issue: "Database connection failed"
**Solution:**
- Verify Supabase URL and key in environment variables
- Check if Supabase project is running
- Confirm IP allowlisting (if configured)

### Issue: "File upload fails"
**Solution:**
- Check storage bucket exists and is public
- Verify CORS configuration
- Check file size < 200MB
- Review Supabase storage logs

### Issue: "Environment variables not loaded"
**Solution:**
- Redeploy after adding variables
- Wait 2-3 minutes for propagation
- Clear Vercel cache: `vercel env pull`

### Issue: "Pages return 404"
**Solution:**
- Check that all pages built successfully
- Verify routing structure
- Check Next.js build logs

---

## 📈 Production Tips

### Performance Optimization
```javascript
// Use ISR (Incremental Static Regeneration)
export const revalidate = 3600; // Revalidate every hour
```

### Security Best Practices
- [ ] Use HTTPS only (auto-enabled on Vercel)
- [ ] Store sensitive data in environment variables
- [ ] Enable RLS on Supabase (if public database)
- [ ] Regularly rotate API keys
- [ ] Monitor failed login attempts

### Scaling for 100+ Students
1. **Upgrade Supabase:** Pro plan ($25/month) or higher
2. **Monitor database:** Check query performance
3. **Optimize images:** Use Next.js Image component
4. **Enable caching:** Configure Vercel Edge Caching
5. **Add CDN:** Vercel Pro includes automatic CDN

---

## 💰 Cost Estimation

### Monthly Costs
| Service | Free Tier | Recommended |
|---------|-----------|------------|
| Vercel | $0 | $20 (Pro) |
| Supabase | $0-25GB | $25 (500GB) |
| Together AI | $0 ($10 credits) | $0-50 |
| **Total** | **$0** | **$45-75/mo** |

---

## 🎯 Next Steps After Deployment

1. **Invite Students:** Share live URL with your class
2. **Monitor Usage:** Check leaderboard, uploads, points
3. **Gather Feedback:** Collect suggestions for improvements
4. **Iterate:** Add features based on feedback
5. **Document Results:** Track metrics for capstone report

### Capstone Report Data
```csv
deployment_date, total_users, avg_points, uploads, recommendations_accepted
2025-01-15, 45, 125, 128, 34
2025-01-22, 78, 187, 215, 52
2025-02-01, 100, 203, 312, 71
```

---

## 📞 Support & Resources

- **Vercel Docs:** https://vercel.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Together AI Docs:** https://api.together.xyz/docs

---

## ✅ Deployment Complete!

You've successfully deployed a **production-ready full-stack application** serving **100+ students** with:

- ✅ Real-time database (Supabase PostgreSQL)
- ✅ Scalable file storage (500GB)
- ✅ Custom domain support
- ✅ Automatic HTTPS
- ✅ CDN distribution
- ✅ Real-time analytics
- ✅ AI-powered recommendations
- ✅ Gamification system

**Share your live link and collect those capstone points! 🎉**

---

**Deployed with ❤️ | Built on 🚀 Vercel + Supabase**
