# Deployment Guide: GitHub & Vercel

This guide walks you through deploying your Next.js Squish app to GitHub and then to Vercel.

---

## Part 1: Deploying to GitHub

### Prerequisites
- A GitHub account
- Git installed on your local machine
- Your project code ready to commit

### Step 1: Initialize Git Repository (if not already done)

If you haven't initialized git yet, run:

```bash
git init
```

### Step 2: Create a GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the **"+"** icon in the top right → **"New repository"**
3. Fill in:
   - **Repository name**: `squish` (or your preferred name)
   - **Description**: "AI Voice Meditation App"
   - **Visibility**: Choose Public or Private
   - **DO NOT** initialize with README, .gitignore, or license (you already have these)
4. Click **"Create repository"**

### Step 3: Connect Local Repository to GitHub

GitHub will show you commands. Run these in your project directory:

```bash
# Add all files to git
git add .

# Create initial commit
git commit -m "Initial commit: Squish meditation app"

# Add GitHub remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/squish.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 4: Verify on GitHub

- Go to your repository on GitHub
- You should see all your files there
- Your `.env.local` file should **NOT** be visible (it's in `.gitignore`)

### Important Notes for GitHub

✅ **DO commit:**
- Source code files
- Configuration files (`package.json`, `next.config.ts`, etc.)
- Public assets
- Documentation

❌ **DON'T commit:**
- `.env.local` or any `.env*` files (already in `.gitignore`)
- `node_modules/` (already in `.gitignore`)
- `.next/` build folder (already in `.gitignore`)
- `.vercel/` folder (already in `.gitignore`)

---

## Part 2: Deploying to Vercel

### Prerequisites
- Your code pushed to GitHub
- A Vercel account (free tier works great)
- Your environment variables ready (from `env.example`)

### Step 1: Sign Up / Sign In to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"** or **"Log In"**
3. Choose **"Continue with GitHub"** (recommended - easiest integration)

### Step 2: Import Your GitHub Repository

1. After logging in, click **"Add New..."** → **"Project"**
2. You'll see a list of your GitHub repositories
3. Find your `squish` repository and click **"Import"**

### Step 3: Configure Project Settings

Vercel will auto-detect Next.js. You'll see:

**Project Name**: `squish` (or change it)
**Framework Preset**: Next.js (auto-detected)
**Root Directory**: `./` (default)
**Build Command**: `pnpm build` (or `npm run build`)
**Output Directory**: `.next` (auto-detected)
**Install Command**: `pnpm install` (or `npm install`)

**Keep the defaults** - they're correct for Next.js!

### Step 4: Add Environment Variables

This is **critical** - your app needs these to work:

1. In the **"Environment Variables"** section, click **"Add"** for each variable:

   **Supabase:**
   - `NEXT_PUBLIC_SUPABASE_URL` = `your_supabase_url_here`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `your_supabase_anon_key_here`
   - `SUPABASE_SERVICE_ROLE_KEY` = `your_supabase_service_role_key_here`

   **Vapi:**
   - `VAPI_API_KEY` = `your_vapi_api_key_here`
   - `VAPI_ASSISTANT_ID` = `your_vapi_assistant_id_here`
   - `VAPI_PUBLIC_KEY` = `your_vapi_public_key_here`

   **Inkeep (optional):**
   - `NEXT_PUBLIC_INKEEP_API_KEY` = `your_inkeep_api_key_here`

2. For each variable, select which environments it applies to:
   - ✅ **Production**
   - ✅ **Preview** (recommended)
   - ✅ **Development** (optional)

3. Click **"Add"** after each variable

### Step 5: Deploy!

1. Click **"Deploy"** button at the bottom
2. Vercel will:
   - Clone your repo
   - Install dependencies (`pnpm install`)
   - Build your app (`pnpm build`)
   - Deploy to a global CDN

3. Wait 1-2 minutes for the build to complete

### Step 6: Get Your Live URL

Once deployment finishes:
- You'll see: **"Congratulations! Your project has been deployed"**
- Your live URL will be: `https://squish-xxxxx.vercel.app` (or your custom domain)
- Click the URL to visit your live app!

### Step 7: Configure Supabase Callback URL (Important!)

Your app uses Supabase authentication, so you need to add your Vercel URL to Supabase:

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Authentication** → **URL Configuration**
4. Add your Vercel URL to **Redirect URLs**:
   - `https://YOUR_VERCEL_DOMAIN/auth/callback`
   - Example: `https://squish-xxxxx.vercel.app/auth/callback`
5. Also add your custom domain if you have one
6. Click **Save**

**Note:** For local development, make sure `http://localhost:3000/auth/callback` is also in the list.

### Step 8: Configure Vapi Webhook (Important!)

Since your app uses Vapi, you need to update the webhook URL:

1. Go to your Vapi dashboard
2. Find your assistant settings
3. Update the webhook URL to: `https://YOUR_VERCEL_DOMAIN/api/vapi/webhook`
   - Example: `https://squish-xxxxx.vercel.app/api/vapi/webhook`

---

## Automatic Deployments

### How It Works

Once connected, Vercel automatically deploys:

- **Production**: Every push to `main` branch
- **Preview**: Every push to other branches or pull requests

### Workflow Example

```bash
# Make changes locally
git add .
git commit -m "Update landing page"
git push origin main

# Vercel automatically:
# 1. Detects the push
# 2. Builds your app
# 3. Deploys to production
# 4. Updates your live URL
```

---

## Managing Deployments

### View Deployments

1. Go to your Vercel dashboard
2. Click on your project
3. See all deployments in the **"Deployments"** tab

### Redeploy

- **Automatic**: Push new code to GitHub
- **Manual**: Click **"Redeploy"** on any deployment

### Environment Variables

To update environment variables:
1. Go to **Project Settings** → **Environment Variables**
2. Add, edit, or delete variables
3. **Redeploy** for changes to take effect

### Custom Domain

1. Go to **Project Settings** → **Domains**
2. Add your custom domain (e.g., `squish.com`)
3. Follow DNS configuration instructions
4. Vercel will handle SSL certificates automatically

---

## Troubleshooting

### Build Fails

**Check:**
- All environment variables are set correctly
- Build logs in Vercel dashboard (click on failed deployment)
- Common issues:
  - Missing environment variables
  - TypeScript errors
  - Missing dependencies in `package.json`

### App Works Locally But Not on Vercel

**Common causes:**
- Missing environment variables in Vercel
- API endpoints expecting different URLs
- CORS issues (check your API routes)

### Environment Variables Not Working

- Make sure variables are added to **Production** environment
- **Redeploy** after adding variables
- Check variable names match exactly (case-sensitive)

---

## Best Practices

### 1. Use Environment Variables
- Never hardcode secrets
- Use Vercel's environment variables UI
- Different values for Production vs Preview if needed

### 2. Test Before Deploying
```bash
# Test production build locally
pnpm build
pnpm start
```

### 3. Monitor Deployments
- Check Vercel dashboard regularly
- Review build logs for warnings
- Test your live site after each deployment

### 4. Use Preview Deployments
- Create feature branches for testing
- Vercel creates preview URLs automatically
- Test thoroughly before merging to `main`

### 5. Keep Dependencies Updated
```bash
# Check for outdated packages
pnpm outdated

# Update carefully
pnpm update
```

---

## Quick Reference

### GitHub Commands
```bash
git add .
git commit -m "Your message"
git push origin main
```

### Vercel CLI (Optional)
```bash
# Install Vercel CLI
pnpm add -g vercel

# Login
vercel login

# Deploy from local
vercel

# Link to existing project
vercel link
```

### Check Deployment Status
- Vercel Dashboard: [vercel.com/dashboard](https://vercel.com/dashboard)
- GitHub: Your repository page

---

## Summary

**GitHub Deployment:**
1. Create repo on GitHub
2. Push code with `git push`
3. Code is now version-controlled and backed up

**Vercel Deployment:**
1. Import GitHub repo to Vercel
2. Add environment variables
3. Click Deploy
4. Get live URL automatically
5. Future pushes auto-deploy

**Result:** Your app is live at `https://your-app.vercel.app` and automatically updates on every push to GitHub!

---

## Need Help?

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Next.js Deployment**: [nextjs.org/docs/deployment](https://nextjs.org/docs/deployment)
- **GitHub Docs**: [docs.github.com](https://docs.github.com)

