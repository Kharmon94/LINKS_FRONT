# Rails Backend API Integration Guide

## Overview
This document outlines the Rails API endpoints needed to support the Blackcollar.io magic link authentication system and link creation flow.

---

## Authentication Flow

### How It Works

1. **Homepage Form Submission** → User submits URL + Name + Email
2. **Backend Creates**:
   - User account (if doesn't exist)
   - Link associated with user
   - Magic link token
3. **Backend Sends Two Emails**:
   - Link confirmation email (with short URL)
   - Magic link email (for dashboard access)
4. **User Clicks Magic Link** → Authenticated → Redirected to dashboard

---

## Required API Endpoints

### 1. Create Link with Account
**Endpoint:** `POST /api/links/create-with-account`

**Purpose:** Creates a user account (or finds existing) and creates a link in one atomic operation.

**Request Body:**
```json
{
  "url": "https://example.com",
  "name": "My Experience",
  "user_name": "Jane Smith",
  "email": "jane@example.com"
}
```

**Success Response (200 OK):**
```json
{
  "short_url": "links.blackcollar.io/abc123",
  "short_code": "abc123",
  "user": {
    "id": "uuid",
    "email": "jane@example.com",
    "name": "Jane Smith",
    "subscription_tier": "free"
  }
}
```

**Error Response (403 Forbidden - Hit Tier Limit):**
```json
{
  "error": "You've reached your free tier limit. Upgrade to create more links.",
  "upgrade_url": "/pricing"
}
```

**Error Response (422 Unprocessable Entity):**
```json
{
  "error": "Invalid URL format"
}
```

**Rails Implementation Example:**
```ruby
class Api::LinksController < ApplicationController
  skip_before_action :authenticate_user!, only: [:create_with_account]
  
  def create_with_account
    # Find or create user
    user = User.find_or_create_by(email: params[:email]) do |u|
      u.name = params[:user_name]
      u.subscription_tier = 'free'
      u.magic_link_token = SecureRandom.urlsafe_base64(32)
      u.magic_link_expires_at = 15.minutes.from_now
    end
    
    # Check tier limits
    if user.at_link_limit?
      render json: { 
        error: "You've reached your tier limit. Upgrade to create more links.",
        upgrade_url: "/pricing"
      }, status: :forbidden
      return
    end
    
    # Create link
    link = user.links.create!(
      destination_url: params[:url],
      name: params[:name],
      short_code: generate_short_code,
      clicks_count: 0
    )
    
    # Send emails
    UserMailer.link_created(user, link).deliver_later
    UserMailer.magic_link(user).deliver_later
    
    render json: {
      short_url: "links.blackcollar.io/#{link.short_code}",
      short_code: link.short_code,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        subscription_tier: user.subscription_tier
      }
    }
  rescue ActiveRecord::RecordInvalid => e
    render json: { error: e.message }, status: :unprocessable_entity
  end
  
  private
  
  def generate_short_code
    loop do
      code = SecureRandom.alphanumeric(6).downcase
      break code unless Link.exists?(short_code: code)
    end
  end
end
```

---

### 2. Send Magic Link
**Endpoint:** `POST /api/auth/magic-link`

**Purpose:** Generates and sends a magic link email for existing users to sign in.

**Request Body:**
```json
{
  "email": "jane@example.com"
}
```

**Success Response (200 OK):**
```json
{
  "message": "Magic link sent! Check your email."
}
```

**Error Response (404 Not Found):**
```json
{
  "error": "No account found with that email. Create a link first!"
}
```

**Rails Implementation:**
```ruby
class Api::AuthController < ApplicationController
  skip_before_action :authenticate_user!, only: [:send_magic_link, :verify]
  
  def send_magic_link
    user = User.find_by(email: params[:email])
    
    if user
      # Generate new token
      user.update!(
        magic_link_token: SecureRandom.urlsafe_base64(32),
        magic_link_expires_at: 15.minutes.from_now
      )
      
      # Send email
      UserMailer.magic_link(user).deliver_later
      
      render json: { message: "Magic link sent! Check your email." }
    else
      render json: { 
        error: "No account found with that email. Create a link first!" 
      }, status: :not_found
    end
  end
end
```

---

### 3. Verify Magic Link
**Endpoint:** `POST /api/auth/verify`

**Purpose:** Verifies the magic link token and creates a session.

**Request Body:**
```json
{
  "token": "abc123xyz789..."
}
```

**Success Response (200 OK):**
```json
{
  "user": {
    "id": "uuid",
    "email": "jane@example.com",
    "name": "Jane Smith",
    "subscription_tier": "free",
    "role": "owner"
  }
}
```

**Error Response (401 Unauthorized):**
```json
{
  "error": "Invalid or expired token"
}
```

**Rails Implementation:**
```ruby
class Api::AuthController < ApplicationController
  def verify
    user = User.find_by(magic_link_token: params[:token])
    
    if user && user.magic_link_expires_at > Time.current
      # Clear token after use
      user.update!(
        magic_link_token: nil,
        magic_link_expires_at: nil
      )
      
      # Create session
      session[:user_id] = user.id
      
      render json: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          subscription_tier: user.subscription_tier,
          role: user.role
        }
      }
    else
      render json: { 
        error: "Invalid or expired token" 
      }, status: :unauthorized
    end
  end
end
```

---

### 4. Check Session
**Endpoint:** `GET /api/auth/session`

**Purpose:** Checks if user has an active session.

**Success Response (200 OK):**
```json
{
  "user": {
    "id": "uuid",
    "email": "jane@example.com",
    "name": "Jane Smith",
    "subscription_tier": "free",
    "role": "owner"
  }
}
```

**Error Response (401 Unauthorized):**
```json
{
  "error": "Not authenticated"
}
```

**Rails Implementation:**
```ruby
class Api::AuthController < ApplicationController
  def session
    if current_user
      render json: {
        user: {
          id: current_user.id,
          email: current_user.email,
          name: current_user.name,
          subscription_tier: current_user.subscription_tier,
          role: current_user.role
        }
      }
    else
      render json: { error: "Not authenticated" }, status: :unauthorized
    end
  end
end
```

---

### 5. Logout
**Endpoint:** `DELETE /api/auth/logout`

**Purpose:** Destroys the user session.

**Success Response (200 OK):**
```json
{
  "message": "Logged out successfully"
}
```

**Rails Implementation:**
```ruby
class Api::AuthController < ApplicationController
  def logout
    session[:user_id] = nil
    render json: { message: "Logged out successfully" }
  end
end
```

---

### 6. Google OAuth (Optional)
**Endpoint:** `GET /api/auth/google`

**Purpose:** Initiates Google OAuth flow.

**Rails Implementation (using OmniAuth):**
```ruby
# config/initializers/omniauth.rb
Rails.application.config.middleware.use OmniAuth::Builder do
  provider :google_oauth2, 
    ENV['GOOGLE_CLIENT_ID'], 
    ENV['GOOGLE_CLIENT_SECRET'],
    {
      scope: 'email,profile',
      prompt: 'select_account'
    }
end

# app/controllers/api/auth_controller.rb
def google_callback
  auth = request.env['omniauth.auth']
  
  user = User.find_or_create_by(email: auth.info.email) do |u|
    u.name = auth.info.name
    u.subscription_tier = 'free'
    u.oauth_provider = 'google'
    u.oauth_uid = auth.uid
  end
  
  session[:user_id] = user.id
  redirect_to '/dashboard'
end
```

---

## Database Schema

### Users Table
```ruby
create_table :users do |t|
  t.string :email, null: false, index: { unique: true }
  t.string :name, null: false
  t.string :subscription_tier, default: 'free' # free, starter, growth, enterprise
  t.string :role, default: 'owner' # owner, admin, member
  t.string :magic_link_token
  t.datetime :magic_link_expires_at
  t.string :oauth_provider
  t.string :oauth_uid
  t.timestamps
end
```

### Links Table
```ruby
create_table :links do |t|
  t.references :user, null: true, foreign_key: true # null for anonymous links
  t.string :destination_url, null: false
  t.string :short_code, null: false, index: { unique: true }
  t.string :name
  t.integer :clicks_count, default: 0
  t.boolean :is_claimed, default: false
  t.string :browser_session_id # For claiming anonymous links
  t.timestamps
end
```

---

## Subscription Tier Limits

```ruby
class User < ApplicationRecord
  TIER_LIMITS = {
    'free' => { max_links: 1, max_campaigns: 0, max_custom_domains: 0 },
    'starter' => { max_links: 20, max_campaigns: 2, max_custom_domains: 0 },
    'growth' => { max_links: Float::INFINITY, max_campaigns: Float::INFINITY, max_custom_domains: 10 },
    'enterprise' => { max_links: Float::INFINITY, max_campaigns: Float::INFINITY, max_custom_domains: Float::INFINITY }
  }
  
  def at_link_limit?
    limit = TIER_LIMITS[subscription_tier][:max_links]
    return false if limit == Float::INFINITY
    links.count >= limit
  end
  
  def can_create_campaign?
    limit = TIER_LIMITS[subscription_tier][:max_campaigns]
    return true if limit == Float::INFINITY
    campaigns.count < limit
  end
end
```

---

## Email Templates Required

### 1. Link Created Email
**Subject:** Your Blackcollar.io link is ready! 🎉

**Content:**
- Shows the short link
- Magic link button to access dashboard
- Instructions for NFC programming
- Support contact

### 2. Magic Link Email
**Subject:** Sign in to Blackcollar.io

**Content:**
- One-click magic link button
- Expires in 15 minutes
- Security notice

### 3. Weekly Analytics Email
**Subject:** Your weekly link performance

**Content:**
- Total clicks this week
- Top performing link
- CTA to upgrade (for free users)

---

## Routes Configuration

```ruby
# config/routes.rb
namespace :api do
  namespace :auth do
    post 'magic-link', to: 'auth#send_magic_link'
    post 'verify', to: 'auth#verify'
    get 'session', to: 'auth#session'
    delete 'logout', to: 'auth#logout'
    get 'google', to: 'auth#google'
    get 'google/callback', to: 'auth#google_callback'
  end
  
  namespace :links do
    post 'create-with-account', to: 'links#create_with_account'
  end
end
```

---

## CORS Configuration

```ruby
# config/initializers/cors.rb
Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins ENV['FRONTEND_URL'] || 'http://localhost:5173'
    
    resource '/api/*',
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head],
      credentials: true
  end
end
```

---

## Session Configuration

```ruby
# config/initializers/session_store.rb
Rails.application.config.session_store :cookie_store, 
  key: '_blackcollar_session',
  domain: ENV['SESSION_DOMAIN'] || 'localhost',
  same_site: :lax,
  secure: Rails.env.production?,
  httponly: true
```

---

## Environment Variables

```bash
# .env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FRONTEND_URL=https://app.blackcollar.io
SESSION_DOMAIN=.blackcollar.io
MAGIC_LINK_BASE_URL=https://app.blackcollar.io/auth/verify
```

---

## Testing the Integration

### 1. Test Link Creation
```bash
curl -X POST https://api.blackcollar.io/api/links/create-with-account \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "name": "Test Link",
    "user_name": "Test User",
    "email": "test@example.com"
  }'
```

### 2. Test Magic Link Request
```bash
curl -X POST https://api.blackcollar.io/api/auth/magic-link \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

### 3. Test Session Check
```bash
curl -X GET https://api.blackcollar.io/api/auth/session \
  -H "Cookie: _blackcollar_session=your_session_cookie"
```

---

## Frontend Integration Points

The frontend is already configured to call these endpoints:

1. **AuthContext** (`/src/app/contexts/auth-context.tsx`):
   - `sendMagicLink()` → `POST /api/auth/magic-link`
   - `verifyMagicLink()` → `POST /api/auth/verify`
   - `checkAuth()` → `GET /api/auth/session`
   - `logout()` → `DELETE /api/auth/logout`

2. **Landing Page** (`/src/app/pages/landing-page.tsx`):
   - `handleFinalSubmit()` → `POST /api/links/create-with-account`

3. **Auth Page** (`/src/app/pages/auth-page.tsx`):
   - Form submission → `sendMagicLink()`

4. **Verify Page** (`/src/app/pages/verify-page.tsx`):
   - On mount → `verifyMagicLink(token)`

---

## Next Steps

1. ✅ Implement the 6 API endpoints in Rails
2. ✅ Set up database tables
3. ✅ Configure mailers and email templates
4. ✅ Set up Google OAuth (optional)
5. ✅ Configure CORS and sessions
6. ✅ Deploy backend to Railway
7. ✅ Update frontend API URLs to production
8. ✅ Test the complete flow end-to-end

---

## Support

For questions or issues with the integration, contact the development team or refer to the Rails documentation.
