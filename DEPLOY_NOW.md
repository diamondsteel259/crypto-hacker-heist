# 🚀 DEPLOY THIS FOLDER TO GITHUB - SIMPLE STEPS

## ✅ What's Fixed in This Folder:
- ✅ TON Connect uses correct domain: `crypto-hacker-heist.onrender.com`
- ✅ ALL mock data removed (no more Block #52341, no more 45,280 CS)
- ✅ Database seeding won't crash server
- ✅ Shows real data or 0 for new users

---

## 📤 STEP 1: UPLOAD TO GITHUB

### Option A: Delete & Re-upload (Easiest)

1. **Download** this entire `UploadToGithub` folder to your computer
2. Go to https://github.com/diamondsteel259/crypto-hacker-heist
3. Click **Settings** (repo settings, not your account)
4. Scroll to **Danger Zone** at bottom
5. Click **Delete this repository**
6. Type the repo name to confirm
7. Create **NEW** repo: `crypto-hacker-heist`
8. **Upload files** from your downloaded UploadToGithub folder
9. **Make sure files are at ROOT** (not inside a folder!)

### Option B: Replace Files (Faster)

1. **Download** this entire `UploadToGithub` folder to your computer
2. Go to https://github.com/diamondsteel259/crypto-hacker-heist
3. Click on **each folder/file** → Click the **trash icon** → Delete them all
4. Once repo is empty, click **Add file** → **Upload files**
5. **Drag ALL files** from your downloaded UploadToGithub folder
6. **Make sure structure looks like this:**
   ```
   crypto-hacker-heist/
   ├── client/
   ├── server/
   ├── shared/
   ├── public/
   ├── package.json
   ├── render.yaml
   └── ... (other files)
   ```
7. Commit with message: "Production-ready with all fixes"

---

## 🔧 STEP 2: FIX RENDER SETTINGS

### Go to Render Dashboard

1. https://dashboard.render.com
2. Click your `crypto-hacker-heist` service

### A. Clear Root Directory
1. Click **Settings** (left sidebar)
2. Scroll to **Build & Deploy** section
3. Find **"Root Directory"** field
4. **DELETE any text** (make it completely BLANK)
5. Click **Save Changes**

### B. Add Environment Variables
1. Click **Environment** (left sidebar)
2. Make sure you have:
   - `DATABASE_URL` (should already exist from database)
   - `TELEGRAM_BOT_TOKEN` = **YOUR BOT TOKEN FROM @BotFather**
   - `NODE_ENV` = `production`

**To get TELEGRAM_BOT_TOKEN:**
- Open Telegram
- Search **@BotFather**
- Send `/mybots`
- Select your bot
- Click **API Token**
- Copy and paste to Render

---

## 🚀 STEP 3: DEPLOY

1. After saving settings, click **Manual Deploy** (top right)
2. Select **Deploy latest commit**
3. Click **Deploy**
4. Wait 2-3 minutes
5. Watch **Logs** tab

### Success Looks Like:
```
==> Build successful 🎉
==> Deploying...
==> Running 'npm start'
serving on port 10000
==> Your service is live 🎉
```

**You might see:** `❌ Seeding failed: ErrorEvent` 
**THIS IS OK!** - Server will stay running. This is just a database connection warning.

---

## 🧪 STEP 4: TEST

### Open your app:
https://crypto-hacker-heist.onrender.com

### What You Should See:
- ✅ App loads (no errors)
- ✅ Balance shows **0 CS** (NOT 45,280 or 48,100)
- ✅ Shop has equipment
- ✅ Block Explorer shows **"No blocks yet"** (NOT Block #52341)
- ✅ TON Connect wallet button works

### What Was WRONG Before:
- ❌ Block #52341 (fake)
- ❌ 45,280 CS balance (fake)
- ❌ "8,432 active miners" (fake)
- ❌ Fake users like "CryptoMaster"

### What's CORRECT Now:
- ✅ 0 CS for new users
- ✅ Real blocks starting from #1
- ✅ Real mining stats
- ✅ No fake data anywhere

---

## ❗ IF YOU STILL SEE MOCK DATA AFTER DEPLOYING:

**Cause:** Browser cache or GitHub didn't update

**Fix:**
1. Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. Check GitHub - make sure files are at ROOT, not inside UploadToGithub folder
3. Check Render logs for "Build successful"
4. Redeploy in Render: **Manual Deploy** → **Clear build cache & deploy**

---

## 🆘 DATABASE CONNECTION TIMEOUT?

If you see `ETIMEDOUT 3.65.142.85:443` in logs:

**This is a Render PostgreSQL issue.** Server will stay running but database won't seed.

**Fix:**
1. Render dashboard → **Databases** (left sidebar)
2. Click your database
3. Click **Info** tab
4. Copy **External Database URL**
5. Go to your web service → **Environment** tab
6. Edit `DATABASE_URL` → Paste the External URL
7. Redeploy

**OR create new database:**
1. Render → **New** → **PostgreSQL**
2. Name: `crypto-hacker-heist-db`
3. Plan: **Free**
4. Create → Copy connection string
5. Add to web service Environment as `DATABASE_URL`
6. Redeploy

---

**THAT'S IT! Just upload these files to GitHub and deploy!**
