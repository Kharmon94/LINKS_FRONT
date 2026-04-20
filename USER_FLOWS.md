# User Flows & Authentication System

## Complete User Journey

---

## Flow 1: New User Creates First Link (Homepage)

### Step-by-Step

1. **User lands on homepage** (`/`)
   - Sees hero section with 3-step form
   - No login required

2. **Step 1: Enter URL**
   - User pastes destination URL (e.g., Instagram profile)
   - Clicks "Next"

3. **Step 2: Name It (Optional)**
   - User can give link a custom name
   - Can skip this step
   - Clicks "Next" or "Skip"

4. **Step 3: Enter Details**
   - User enters their name (required)
   - User enters their email (required)
   - Clicks "Create Your Experience"

5. **Backend Processing**
   - ✅ Creates/finds user account with email
   - ✅ Sets user to Free tier
   - ✅ Creates link associated with user
   - ✅ Generates magic link token
   - ✅ Sends 2 emails:
     - Link confirmation email (with short URL)
     - Magic link email (for dashboard access)

6. **Success Screen**
   - User sees generated short link: `links.blackcollar.io/abc123`
   - Can copy link immediately
   - Link is LIVE and works right away
   - Instructions show:
     - "Program your NFC device" (with guide link)
     - "Confirm your email to access dashboard"

7. **Email Arrives**
   - **Email 1:** "Your link is ready!"
     - Shows the short link
     - Button: "Access My Dashboard" (magic link)
   - **Email 2:** Can be combined or separate magic link email

8. **User Clicks Magic Link**
   - Token verified
   - Session created
   - Redirected to `/dashboard`
   - **Now logged in!**

9. **Dashboard Shows**
   - Their 1 link with analytics
   - Free tier badge: "Free Plan - 1/1 links used"
   - Link creation form is disabled
   - Message: "Upgrade to Starter for 20 links"

---

## Flow 2: Existing User Returns (Sign In)

### Step-by-Step

1. **User visits site**
   - Goes to `/auth` or clicks "Login" button

2. **Auth Page**
   - Two options:
     - "Continue with Google" (OAuth)
     - "Send Magic Link" (email)

3. **Option A: Magic Link**
   - User enters email
   - Clicks "Send Magic Link"
   - Frontend calls: `POST /api/auth/magic-link`

4. **Backend Processing**
   - Finds user by email
   - Generates new magic link token
   - Token expires in 15 minutes
   - Sends magic link email

5. **"Check Your Email" Screen**
   - Shows: "We sent a magic link to [email]"
   - Instructions: "Click the link to sign in. Expires in 15 minutes."

6. **User Clicks Email Link**
   - Redirected to: `/auth/verify?token=xyz789...`
   - Frontend calls: `POST /api/auth/verify`

7. **Verification Success**
   - Token validated
   - Session created
   - User data returned
   - Redirected to `/dashboard`

8. **Option B: Google OAuth**
   - User clicks "Continue with Google"
   - Redirected to Google OAuth
   - Grants permission
   - Redirected back to app
   - Session created
   - Lands on `/dashboard`

---

## Flow 3: User Hits Free Tier Limit

### Scenario: User tries to create 2nd link

1. **User on Dashboard**
   - Sees: "Free Plan - 1/1 links used"
   - Link creation form shows "Upgrade Required" message

2. **User Clicks "Create New Link"**
   - Modal appears:
     - "You've reached your free tier limit"
     - Shows Free vs Starter comparison
     - "Upgrade to Starter - $10/month"
     - Button: "Upgrade Now"

3. **User Clicks "Upgrade Now"**
   - Redirected to `/pricing`
   - Sees all tiers
   - Starter plan highlighted

4. **User Selects Plan**
   - Clicks "Get Started" on Starter
   - Redirected to Stripe checkout
   - Completes payment

5. **After Payment Success**
   - Webhook updates user tier to "starter"
   - Redirected back to `/dashboard`
   - Can now create up to 20 links
   - Can create up to 2 campaigns

---

## Flow 4: User Tries to Access Protected Page

### Scenario: User is logged out but visits `/dashboard`

1. **User Navigates to `/dashboard`**
   - Not authenticated
   - `ProtectedRoute` component checks auth state

2. **Redirect to Auth**
   - Automatically redirected to `/auth`
   - Can request magic link or use Google

3. **After Login**
   - Redirected back to `/dashboard`
   - Can access protected pages

---

## Flow 5: User Creates Link from Dashboard

### For users already logged in

1. **User on Dashboard**
   - Sees link creation form
   - Checks tier limits:
     - Free: "1/1 used" → Form disabled
     - Starter: "5/20 used" → Form enabled
     - Growth: "Unlimited" → Form enabled

2. **User Enters URL**
   - Types destination URL
   - Optionally adds custom name
   - Clicks "Create Link"

3. **Backend Processing**
   - Checks if user is at limit
   - If yes: Returns 403 error → Shows upgrade modal
   - If no: Creates link → Returns short URL

4. **Success**
   - Link appears in list
   - Can copy, edit, or view analytics
   - Counter updates: "6/20 used"

---

## Flow 6: User Logs Out

1. **User Clicks "Sign Out"**
   - In mobile menu or user dropdown
   - Frontend calls: `DELETE /api/auth/logout`

2. **Session Destroyed**
   - User logged out
   - Redirected to `/` (homepage)
   - Protected pages no longer accessible

---

## Flow 7: Google OAuth for New User

### First-time Google sign-in

1. **User on Auth Page**
   - Clicks "Continue with Google"

2. **Google OAuth**
   - Redirected to Google
   - Selects account
   - Grants permissions

3. **Backend Callback**
   - Receives Google user data
   - Checks if user exists (by email)
   - If new: Creates user account
     - Sets to Free tier
     - No password needed
   - If existing: Logs in
   - Creates session

4. **Redirect to Dashboard**
   - User logged in
   - Can start creating links

---

## Authentication States

### User States

| State | Description | Can Access |
|-------|-------------|------------|
| **Anonymous** | No account, visiting site | Homepage, Use Cases, Pricing, Auth page |
| **New User (Email Sent)** | Created link, hasn't clicked magic link yet | Same as Anonymous + their link works |
| **Authenticated - Free** | Logged in, Free tier | Dashboard (read-only if 1/1 links used) |
| **Authenticated - Starter** | Logged in, Starter tier | Dashboard + can create up to 20 links |
| **Authenticated - Growth** | Logged in, Growth tier | Full access, unlimited links |
| **Authenticated - Enterprise** | Logged in, Enterprise tier | Full access, everything unlimited |

---

## Session Management

### How Sessions Work

1. **Session Created When:**
   - User clicks magic link (token verified)
   - User completes Google OAuth
   - Backend sets: `session[:user_id] = user.id`

2. **Session Stored:**
   - Cookie: `_blackcollar_session`
   - HTTPOnly, Secure (production)
   - Expires: 2 weeks

3. **Session Checked:**
   - Every protected route
   - `ProtectedRoute` component calls `GET /api/auth/session`
   - If valid: Renders page
   - If invalid: Redirects to `/auth`

4. **Session Destroyed:**
   - User clicks "Sign Out"
   - Calls `DELETE /api/auth/logout`
   - Cookie cleared

---

## Tier Enforcement

### Free Tier (1 Link)

**Can Do:**
- ✅ Create 1 link
- ✅ View analytics for that link
- ✅ Edit link destination
- ✅ See basic click data

**Cannot Do:**
- ❌ Create 2nd link (blocked, shows upgrade)
- ❌ Create campaigns
- ❌ Use randomizer
- ❌ Add custom domains
- ❌ Access advanced analytics

### Starter Tier (20 Links, 2 Campaigns)

**Can Do:**
- ✅ Create up to 20 links
- ✅ Create up to 2 campaigns
- ✅ Full analytics per link
- ✅ Edit and manage links

**Cannot Do:**
- ❌ Create 21st link (blocked, shows upgrade)
- ❌ Create 3rd campaign (blocked)
- ❌ Use randomizer (Growth+)
- ❌ Add custom domains (Growth+)

### Growth Tier (Unlimited Links & Campaigns)

**Can Do:**
- ✅ Unlimited links
- ✅ Unlimited campaigns
- ✅ Randomizer feature
- ✅ Up to 10 custom domains
- ✅ Advanced analytics
- ✅ Location-based routing

**Cannot Do:**
- ❌ Unlimited custom domains (Enterprise only)
- ❌ White-label branding (Enterprise only)

### Enterprise Tier (Everything Unlimited)

**Can Do:**
- ✅ Everything in Growth
- ✅ Unlimited custom domains
- ✅ White-label branding
- ✅ Priority support
- ✅ Custom integrations
- ✅ Dedicated account manager

---

## Error Handling

### Common Scenarios

1. **User at Link Limit**
   - API returns: `403 Forbidden`
   - Frontend shows upgrade modal
   - CTA: "Upgrade to Starter"

2. **Invalid Magic Link Token**
   - API returns: `401 Unauthorized`
   - Frontend shows: "Invalid or expired token"
   - CTA: "Request New Link"

3. **Email Not Found**
   - API returns: `404 Not Found`
   - Frontend shows: "No account found. Create a link first!"

4. **Session Expired**
   - API returns: `401 Unauthorized`
   - Frontend redirects to `/auth`
   - User can request new magic link

---

## Magic Link Security

### Best Practices

1. **Token Generation**
   - Use `SecureRandom.urlsafe_base64(32)`
   - 32-byte random token
   - URL-safe characters

2. **Token Expiration**
   - Expires in 15 minutes
   - Stored: `magic_link_expires_at`
   - Checked on verification

3. **One-Time Use**
   - Token cleared after successful verification
   - Set to `nil` after use
   - Prevents replay attacks

4. **Rate Limiting**
   - Limit magic link requests per email
   - 3 requests per 15 minutes max
   - Prevents spam

---

## Key Differences from Traditional Auth

| Traditional Auth | Magic Link Auth |
|------------------|-----------------|
| User creates password | No password needed |
| User remembers password | Email is the only credential |
| Password reset flow | Every login is a "reset" |
| Password strength requirements | Security via email access |
| 2FA often needed | Email is inherently 2FA |
| Vulnerable to password reuse | No password to reuse |

---

## Future Enhancements

1. **Remember Device**
   - Longer session for trusted devices
   - "Trust this device for 30 days"

2. **Biometric Login**
   - WebAuthn support
   - Touch ID / Face ID

3. **Anonymous Link Claiming**
   - Links created without login
   - Claim them after signup

4. **Social Login Expansion**
   - Add Facebook, Twitter, Apple
   - Same magic link fallback

---

This completes the authentication and user flow documentation for Blackcollar.io!
