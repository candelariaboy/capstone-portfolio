# 🧪 Capstone Project API Testing Guide

## Quick Verification Commands

### Test 1: Health Check - App is Running
```bash
curl http://localhost:3000
# Expected: HTML landing page (200 OK)
```

### Test 2: Create User via API
```bash
curl -X POST http://localhost:3000/api/create-user \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "student_id": "CS20201234",
    "email": "john@example.com",
    "major": "BSCS",
    "year_level": 2,
    "skills": ["React", "Node.js"],
    "interests": "Full-stack development"
  }'

# Expected Response:
# {
#   "success": true,
#   "user_id": "550e8400-e29b-41d4-a716-446655440000",
#   "message": "User created successfully"
# }
```

### Test 3: Get User from Dashboard
```bash
# After creating user, visit:
http://localhost:3000/dashboard?userId=550e8400-e29b-41d4-a716-446655440000

# Expected: Dashboard with user data loaded
# - User greeting: "Welcome, John"
# - Starting points: 50
# - Starting level: 1
# - New Student badge awarded
```

### Test 4: Analyze Portfolio (NLP)
```bash
curl -X POST http://localhost:3000/api/analyze-portfolio \
  -H "Content-Type: application/json" \
  -d '{
    "portfolio_item_id": "item-uuid",
    "user_id": "user-uuid",
    "title": "E-commerce Platform",
    "description": "Built with React, Node.js, PostgreSQL, Stripe, and Docker"
  }'

# Expected Response:
# {
#   "success": true,
#   "skills_extracted": ["React", "Node.js", "PostgreSQL", "Stripe", "Docker"],
#   "recommendations_created": 3
# }
```

### Test 5: Award Points via Gamification API
```bash
curl -X POST http://localhost:3000/api/gamification \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-uuid",
    "action": "upload_portfolio",
    "points": 25,
    "badgeType": "builder_i"
  }'

# Expected Response:
# {
#   "success": true,
#   "new_points": 75,
#   "new_level": 1,
#   "badge_awarded": true
# }
```

### Test 6: Get Gamification Stats
```bash
curl http://localhost:3000/api/gamification?userId=user-uuid

# Expected Response:
# {
#   "user_id": "user-uuid",
#   "points": 75,
#   "level": 1,
#   "badges": [
#     { "badge_type": "new_student", "earned_at": "2025-12-28T..." }
#   ]
# }
```

## Full Manual Testing Flow

### Scenario: New Student Journey

1. **Step 1: Visit Landing Page**
   - URL: `http://localhost:3000`
   - Expected: Hero section with account creation form
   - Verify: Form has 7 input fields

2. **Step 2: Create Account**
   - Fill form:
     - Name: "Test Student"
     - Student ID: "CS20251234"
     - Email: "test@example.com"
     - Major: "BSCS"
     - Year: 2
     - Skills: Add "React", "Python"
     - Interests: "AI/ML and Web Development"
   - Click "Create Profile"
   - Expected: Success toast "Account created!"

3. **Step 3: Auto-Redirect to Dashboard**
   - Expected: URL changes to `/dashboard?userId=...`
   - Expected: Page loads user data
   - Verify:
     - ✅ Welcome greeting
     - ✅ 50 starting points
     - ✅ Level 1
     - ✅ 🎓 New Student badge visible

4. **Step 4: Upload Portfolio**
   - Click "Portfolio" in nav
   - Fill upload form:
     - Title: "React Todo App"
     - Description: "Built with React, Tailwind, and Firebase"
     - File: Any file (PDF, ZIP, etc.) under 200MB
   - Click "Upload"
   - Expected: Progress bar shows 0% → 100%

5. **Step 5: View Extracted Skills**
   - After upload completes
   - Expected: Toast "Portfolio uploaded and analyzed!"
   - Expected: Skills extracted from description:
     - React, Tailwind CSS, Firebase

6. **Step 6: View AI Recommendations**
   - Click "Recommendations" in nav
   - Expected: 3 cards appear with suggestions:
     - Skill: "Master TypeScript" (gap from profile)
     - Course: "Advanced React Patterns" (aligns with React)
     - Project: "Build Full-Stack with Next.js" (progression path)
   - Click "Accept" on a recommendation
   - Expected: +50 points awarded, toast notification

7. **Step 7: Check Achievements/Leaderboard**
   - Click "Achievements" in nav
   - Expected: Badge grid shows 2 badges earned
     - 🎓 New Student
     - 🏗️ Builder I
   - Expected: Leaderboard shows student at top with points

8. **Step 8: Return to Dashboard**
   - Click "Dashboard" in nav
   - Expected: All data persists
   - Expected: Updated points (75 + 50 = 125)
   - Expected: Level calculation updated
   - Expected: All badges visible

## Postman Collection (Alternative)

Import into Postman for easy testing:

```json
{
  "info": {
    "name": "Capstone API Tests",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Create User",
      "request": {
        "method": "POST",
        "url": "http://localhost:3000/api/create-user",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\"name\":\"John\",\"student_id\":\"CS001\",\"email\":\"john@test.com\",\"major\":\"BSCS\",\"year_level\":2,\"skills\":[\"React\"],\"interests\":\"Web Dev\"}"
        }
      }
    },
    {
      "name": "Analyze Portfolio",
      "request": {
        "method": "POST",
        "url": "http://localhost:3000/api/analyze-portfolio",
        "body": {
          "raw": "{\"portfolio_item_id\":\"test-id\",\"user_id\":\"test-user\",\"title\":\"React App\",\"description\":\"Built with React and Node.js\"}"
        }
      }
    },
    {
      "name": "Award Points",
      "request": {
        "method": "POST",
        "url": "http://localhost:3000/api/gamification",
        "body": {
          "raw": "{\"userId\":\"test-user\",\"action\":\"upload_portfolio\",\"points\":25}"
        }
      }
    }
  ]
}
```

## Database Verification

### Check Users Table
```sql
SELECT id, student_id, name, points, level, skills FROM users ORDER BY created_at DESC LIMIT 5;
```

**Expected Output:**
```
id                                   | student_id | name         | points | level | skills
550e8400-e29b-41d4-a716-446655440000 | CS20251234  | Test Student | 75     | 1     | ["React", "Python"]
```

### Check Portfolio Items
```sql
SELECT id, user_id, title, skills_extracted FROM portfolio_items ORDER BY created_at DESC LIMIT 5;
```

**Expected Output:**
```
id                                   | user_id                              | title            | skills_extracted
660e8400-e29b-41d4-a716-446655440001 | 550e8400-e29b-41d4-a716-446655440000 | React Todo App   | ["React","Tailwind CSS","Firebase"]
```

### Check Badges
```sql
SELECT user_id, badge_type, earned_at FROM badges ORDER BY earned_at DESC LIMIT 10;
```

**Expected Output:**
```
user_id                              | badge_type      | earned_at
550e8400-e29b-41d4-a716-446655440000 | new_student     | 2025-12-28 10:30:45+00
550e8400-e29b-41d4-a716-446655440000 | builder_i       | 2025-12-28 10:35:22+00
```

### Check Recommendations
```sql
SELECT user_id, suggestion_type, content FROM recommendations ORDER BY created_at DESC LIMIT 5;
```

**Expected Output:**
```
user_id                              | suggestion_type | content
550e8400-e29b-41d4-a716-446655440000 | skill           | {"title": "Master TypeScript", "description": "..."}
550e8400-e29b-41d4-a716-446655440000 | course          | {"title": "Advanced React Patterns", "description": "..."}
```

## Performance Benchmarks

### Expected Response Times
| Endpoint | Expected Time | Status |
|----------|---------------|--------|
| POST /api/create-user | <200ms | ✅ |
| POST /api/analyze-portfolio | <300ms | ✅ |
| POST /api/gamification | <150ms | ✅ |
| GET /api/gamification | <100ms | ✅ |
| Dashboard page load | <1s | ✅ |

### Expected File Upload Times
| File Size | Expected Time | Status |
|-----------|---------------|--------|
| 1MB | <1s | ✅ |
| 10MB | <3s | ✅ |
| 50MB | <10s | ✅ |
| 100MB | <20s | ✅ |
| 200MB | <40s | ✅ |

## Troubleshooting

### Issue: User Not Created
**Cause:** Missing required fields  
**Fix:** Verify all form fields filled:
- Name: Required
- Student ID: Required + unique
- Email: Required

### Issue: Skills Not Extracted
**Cause:** Skills not in COMMON_SKILLS list  
**Fix:** Add to COMMON_SKILLS array in `/api/analyze-portfolio/route.ts`

### Issue: 200MB Upload Fails
**Cause:** File size validation  
**Fix:** Verify file is <209,715,200 bytes

### Issue: Dashboard Shows No User
**Cause:** Invalid userId in URL  
**Fix:** Copy exact userId from API response

### Issue: Leaderboard Empty
**Cause:** No users in database  
**Fix:** Create at least 1 user first

## Success Indicators

✅ All of the following should be true:
1. Landing page loads instantly
2. Form submits without errors
3. User created in Supabase
4. Badge automatically awarded
5. Points initialized to 50
6. Dashboard loads user data
7. Portfolio upload progresses to 100%
8. Skills extracted and displayed
9. 3 recommendations generated
10. Points/badges update in real-time
11. Leaderboard shows all users sorted by points
12. All pages responsive on mobile

---

**If all tests pass: ✅ READY FOR PRODUCTION DEPLOYMENT**
