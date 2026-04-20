# Development Mode Guide

## Overview

The application now works **without a Rails backend** by using a development mode that simulates authentication and API calls. This allows you to develop and test the frontend independently.

---

## 🎮 Dev Auth Toggle

A floating button appears in the **bottom-right corner** of the screen (only in development):

- **Green Button:** "Authenticated" - You're logged in
- **Red Button:** "Not Authenticated" - You're logged out

Click the button to **instantly toggle** between authenticated and unauthenticated states.

---

## 🔄 How It Works

### Without Backend Connected

When API endpoints return errors (404, network errors, etc.):

1. **Auth Check** (`/api/auth/session`):
   - Falls back to checking `localStorage.getItem('dev_auth_state')`
   - If value is `'authenticated'`, creates a mock user
   - If not set, treats user as logged out

2. **Magic Link Request** (`/api/auth/magic-link`):
   - Logs error to console
   - Doesn't actually send email (no backend)

3. **Google OAuth** (`/api/auth/google`):
   - In dev mode, sets `localStorage` and redirects to dashboard
   - Simulates instant authentication

4. **Link Creation** (`/api/links/create-with-account`):
   - Generates a random short code
   - Shows success screen with mock link
   - Works without creating real database records

---

## 📋 Testing Authentication Flows

### Method 1: Dev Toggle Button (Easiest)

1. Open the app
2. See red "Not Authenticated" button in bottom-right
3. Click it → Turns green "Authenticated"
4. Navigate to `/dashboard` → Works!
5. Click again → Turns red, logs you out
6. Navigate to `/dashboard` → Redirected to `/auth`

### Method 2: Google OAuth Button

1. Go to `/auth`
2. Click "Continue with Google"
3. In dev mode, instantly logs you in
4. Redirected to `/dashboard`

### Method 3: Magic Link Flow

1. Go to `/auth`
2. Enter any email
3. Click "Send Magic Link"
4. See "Check your email" screen
5. Navigate to `/auth/verify?token=anything`
6. In dev mode, instantly logs you in
7. Redirected to `/dashboard`

### Method 4: Homepage Form

1. Go to `/` homepage
2. Fill out 3-step form with any data
3. Submit
4. See success screen with generated link
5. Link is displayed (works immediately)

---

## 🔍 Console Warnings (Expected)

You'll see these messages in the browser console - **this is normal**:

```
Auth API not available. Using development mode.
Using mock link generation - connect to Rails backend for production
Logout API not available. Clearing development state.
```

These are **informational warnings** that confirm the app is working in dev mode.

---

## 🎭 Mock User Data

When authenticated in dev mode, you get this user:

```javascript
{
  id: 'dev-user-123',
  email: 'dev@example.com',
  name: 'Development User',
  subscriptionTier: 'growth', // Change this to test different tiers!
  role: 'owner'
}
```

### Testing Different Subscription Tiers

Edit `/src/app/contexts/auth-context.tsx` line ~57:

```typescript
subscriptionTier: 'free',     // Test free tier (1 link limit)
subscriptionTier: 'starter',  // Test starter tier (20 links)
subscriptionTier: 'growth',   // Test growth tier (unlimited)
subscriptionTier: 'enterprise', // Test enterprise tier
```

---

## 🛠️ localStorage Keys

The app uses these localStorage keys in dev mode:

| Key | Values | Purpose |
|-----|--------|---------|
| `dev_auth_state` | `'authenticated'` or `null` | Tracks if user should be logged in |

### Manual Control

You can manually set the auth state in browser DevTools console:

```javascript
// Log in
localStorage.setItem('dev_auth_state', 'authenticated');
window.location.reload();

// Log out
localStorage.removeItem('dev_auth_state');
window.location.reload();
```

---

## 🚀 Production vs Development

### Development Mode (Current)

- ✅ Works without backend
- ✅ Uses localStorage for auth state
- ✅ Shows dev toggle button
- ✅ Generates mock links
- ✅ Console warnings appear
- ✅ Google OAuth simulated

### Production Mode (With Backend)

- ✅ Calls real API endpoints
- ✅ Uses session cookies
- ✅ No dev toggle button
- ✅ Creates real links in database
- ✅ No console warnings
- ✅ Real Google OAuth

---

## 🔄 Switching to Production

When the Rails backend is deployed and ready:

1. **Update API URLs** (if needed):
   - Currently using relative paths `/api/*`
   - Works if frontend and backend share domain
   - Or update to full URLs: `https://api.blackcollar.io/api/*`

2. **Deploy Frontend**:
   - Build: `npm run build`
   - Deploy to your hosting
   - Set `NODE_ENV=production`

3. **Dev Toggle Disappears**:
   - Only shows when `import.meta.env.DEV === true`
   - Production builds set this to `false`

4. **Real API Calls Work**:
   - No more fallback to mock data
   - Errors show real API messages

---

## 🧪 What You Can Test Now

### ✅ Working Without Backend

1. **Navigation**
   - All routes accessible
   - Protected routes redirect when logged out
   - Back button works

2. **Authentication UI**
   - Auth page layout
   - Magic link request flow
   - "Check email" screen
   - Verify page states (loading, success, error)

3. **Dashboard Access**
   - Toggle to "authenticated"
   - Access all dashboard pages
   - See mock user data
   - Logout functionality

4. **Homepage Form**
   - 3-step form flow
   - Form validation
   - Success screen
   - Copy link functionality

5. **Responsive Design**
   - Mobile menu
   - Desktop navigation
   - Dark/light mode toggle

### ⏳ Requires Backend

1. **Real Magic Links**
   - Email delivery
   - Token verification
   - Session creation

2. **Link Creation**
   - Database storage
   - Click tracking
   - Analytics data

3. **Tier Enforcement**
   - Free tier limits
   - Upgrade prompts
   - Payment processing

4. **Google OAuth**
   - Real OAuth flow
   - Token exchange
   - User creation

---

## 🐛 Troubleshooting

### Dev Toggle Not Appearing

- Check you're in development mode: `npm run dev`
- Clear browser cache
- Check console for errors

### Can't Access Dashboard

- Click the dev toggle to turn it green
- Or go to `/auth` and click Google OAuth button
- Check localStorage for `dev_auth_state`

### "Network Error" Messages

- **This is expected!** Backend isn't connected
- App falls back to mock data
- Check console for "Using development mode" message

### Auth State Not Persisting

- Check browser's localStorage in DevTools
- Try manually setting: `localStorage.setItem('dev_auth_state', 'authenticated')`
- Refresh page

---

## 📝 Quick Commands

```bash
# Start development server
npm run dev

# Clear localStorage (in browser console)
localStorage.clear()

# Force login (in browser console)
localStorage.setItem('dev_auth_state', 'authenticated')
window.location.reload()

# Force logout (in browser console)
localStorage.removeItem('dev_auth_state')
window.location.reload()

# Check current auth state (in browser console)
localStorage.getItem('dev_auth_state')
```

---

## ✅ Summary

- **Dev mode is active** - No backend needed to develop
- **Dev toggle button** - Click to login/logout instantly  
- **Mock data** - Realistic user data and generated links
- **Full UI testing** - Test all pages and flows
- **Console warnings** - Expected and informational
- **Production ready** - Will work seamlessly when backend connects

**Ready to develop!** 🚀
