# Links Email Templates

Production-ready HTML email templates for **Links** by **BlackCollar**.

## Brand system

| Token | Value |
|-------|--------|
| Product name | Links |
| Parent / from domain | BlackCollar (`updates.blackcollar.io`) |
| Font | Montserrat (Google Fonts + Arial/sans-serif fallbacks) |
| Primary / CTA | `#000000` (keep black CTAs on white cards in dark-mode clients) |
| Background | `#f5f5f5` outer, `#ffffff` card |
| Muted text | `#666666` / `#999999` |
| Success / danger accents | `#22c55e` / `#ef4444` (analytics deltas only) |
| Corners | Sharp (0 radius) |
| Logo | B mark (square); absolute URL via `{{LOGO_URL}}` (Rails: `EMAIL_LOGO_URL`, fallback `FRONTEND_ORIGIN` + `/icons/icon-512.png`) |

Product-facing copy uses **Links**. Legal/footer copyright uses **© BlackCollar**.

## Overview

- **Font:** Montserrat (300, 400, 500, 600, 700)
- **Design:** No rounded borders, clean lines
- **Color scheme:** Black & white primary with accent colors for alerts
- **Mobile-responsive:** Table layout optimized for email clients

## Templates Included

### 1. **base-template.html**
Base structure that all other templates extend from. Contains:
- Header with logo
- Content area placeholder
- Footer with links and unsubscribe
- Mobile-responsive CSS

### 2. **welcome-email.html**
Sent when a user signs up for Links.

**Trigger:** User creates new account

**Variables:**
- `{{LOGO_URL}}` - URL to Links logo
- `{{USER_NAME}}` - User's first name or full name
- `{{DASHBOARD_URL}}` - Link to dashboard
- `{{HELP_URL}}` - Link to help center
- `{{PRIVACY_URL}}` - Link to privacy policy
- `{{UNSUBSCRIBE_URL}}` - Unsubscribe link

**Content:**
- Welcome message
- 3-step getting started guide
- Key features overview
- CTA to dashboard

### 3. **weekly-analytics.html**
Weekly performance summary email sent to active users.

**Trigger:** Every Monday morning (or configured schedule)

**Variables:**
- `{{DATE_RANGE}}` - Date range for report (e.g., "March 3-9, 2026")
- `{{TOTAL_CLICKS}}` - Total clicks across all links
- `{{CHANGE_PERCENT}}` - Percentage change vs last week
- `{{CHANGE_COLOR}}` - Color for change indicator (#22c55e for positive, #ef4444 for negative)
- `{{CHANGE_ICON}}` - "↑" or "↓" based on change direction
- `{{ACTIVE_LINKS}}` - Number of active links
- `{{ACTIVE_CAMPAIGNS}}` - Number of active campaigns
- `{{LINK_1_NAME}}` - Top link #1 name
- `{{LINK_1_SHORT_URL}}` - Top link #1 short URL
- `{{LINK_1_CLICKS}}` - Top link #1 click count
- `{{LINK_2_NAME}}`, `{{LINK_2_SHORT_URL}}`, `{{LINK_2_CLICKS}}` - Top link #2
- `{{LINK_3_NAME}}`, `{{LINK_3_SHORT_URL}}`, `{{LINK_3_CLICKS}}` - Top link #3
- `{{TOP_CAMPAIGN_NAME}}` - Top performing campaign name
- `{{TOP_CAMPAIGN_CLICKS}}` - Campaign total clicks
- `{{TOP_CAMPAIGN_LINKS}}` - Number of links in campaign
- `{{GEO_1_COUNTRY}}`, `{{GEO_1_CLICKS}}`, `{{GEO_1_PERCENT}}` - Top country #1
- `{{GEO_2_COUNTRY}}`, `{{GEO_2_CLICKS}}`, `{{GEO_2_PERCENT}}` - Top country #2
- `{{GEO_3_COUNTRY}}`, `{{GEO_3_CLICKS}}`, `{{GEO_3_PERCENT}}` - Top country #3
- `{{ANALYTICS_URL}}` - Link to full analytics page
- `{{EMAIL_PREFERENCES_URL}}` - Link to email preferences

**Content:**
- Total clicks with percentage change
- Active links and campaigns count
- Top 3 performing links
- Top performing campaign
- Geographic insights with visual bars
- CTA to view full analytics

### 4. **password-reset.html**
Sent when user requests password reset.

**Trigger:** User clicks "Forgot Password"

**Variables:**
- `{{USER_NAME}}` - User's name
- `{{RESET_URL}}` - Password reset link with token
- `{{EXPIRY_TIME}}` - How long link is valid (e.g., "1 hour", "24 hours")
- `{{DASHBOARD_URL}}`, `{{HELP_URL}}`, `{{PRIVACY_URL}}` - Standard footer links

**Content:**
- Password reset button
- Plain text link as backup
- Security notice with expiry time
- Note about ignoring if not requested

### 5. **team-invitation.html**
Sent when a user is invited to join a team.

**Trigger:** Admin/owner invites new team member

**Variables:**
- `{{INVITER_NAME}}` - Name of person sending invitation
- `{{INVITER_EMAIL}}` - Email of person sending invitation
- `{{TEAM_NAME}}` - Name of team being invited to
- `{{ROLE}}` - User's role (e.g., "Member", "Admin")
- `{{ACCEPT_INVITATION_URL}}` - Link to accept invitation
- `{{EXPIRY_DAYS}}` - Number of days until invitation expires (e.g., "7 days")
- Standard footer variables

**Content:**
- Invitation details with inviter info
- Team name and user's role
- Benefits of joining team
- CTA to accept invitation
- Expiry notice

### 6. **domain-verification.html**
Sent when user adds a custom domain.

**Trigger:** User adds custom domain in Settings

**Variables:**
- `{{USER_NAME}}` - User's name
- `{{DOMAIN}}` - Domain being verified (e.g., "mybrand.com")
- `{{DNS_HOST}}` - DNS host record (e.g., "@" or "link")
- `{{DNS_A_VALUE}}` - IP address for A record
- `{{DNS_TXT_VALUE}}` - TXT record value for verification
- `{{VERIFY_DOMAIN_URL}}` - Link to domain settings page
- `{{HELP_DNS_URL}}` - Link to DNS setup documentation
- Standard footer variables

**Content:**
- Domain verification status
- DNS configuration instructions (A and TXT records)
- Step-by-step setup guide
- CTA to domain settings
- Help resources

### 7. **link-limit-warning.html**
Sent when user approaches their plan's link limit.

**Trigger:** User reaches 90% of plan limit (e.g., 90/100 links)

**Variables:**
- `{{USER_NAME}}` - User's name
- `{{PLAN_NAME}}` - Current plan name (e.g., "Free Plan")
- `{{LINKS_USED}}` - Number of links created
- `{{LINKS_TOTAL}}` - Total links allowed on plan
- `{{USAGE_PERCENT}}` - Percentage used (e.g., "90" for 90%)
- `{{USAGE_COLOR}}` - Color for progress bar (#fbbf24 for warning, #ef4444 for critical)
- `{{PRO_PRICE}}` - Pro plan monthly price (e.g., "29")
- `{{UPGRADE_URL}}` - Link to upgrade page
- `{{MANAGE_LINKS_URL}}` - Link to links management page
- `{{EMAIL_PREFERENCES_URL}}` - Link to email preferences
- Standard footer variables

**Content:**
- Current usage with visual progress bar
- Warning about reaching limit
- Pro plan features and benefits
- Pricing information
- CTA to upgrade
- Alternative option to manage existing links

### 8. **email-verification.html**
Sent when user signs up to verify their email address.

**Trigger:** User creates new account

**Variables:**
- `{{USER_NAME}}` - User's name
- `{{VERIFICATION_URL}}` - Email verification link with token
- `{{EXPIRY_TIME}}` - How long link is valid (e.g., "24 hours")
- Standard footer variables

**Content:**
- Email verification button
- Plain text link as backup
- Expiry notice
- Note about ignoring if didn't sign up

### 9. **monthly-report.html**
Monthly performance overview sent to active users.

**Trigger:** First day of each month

**Variables:**
- `{{MONTH}}` - Month name (e.g., "February")
- `{{NEXT_MONTH}}` - Next month name
- `{{USER_NAME}}` - User's name
- `{{TOTAL_CLICKS}}` - Total clicks in month
- `{{CHANGE_PERCENT}}` - Percentage change vs previous month
- `{{CHANGE_COLOR}}` - Color for change indicator
- `{{CHANGE_ICON}}` - "↑" or "↓" based on direction
- `{{LINKS_CREATED}}` - Links created in month
- `{{CAMPAIGNS_COUNT}}` - Number of campaigns
- `{{BEST_LINK_NAME}}` - Top performing link name
- `{{BEST_LINK_CLICKS}}` - Top link clicks
- `{{TOP_COUNTRY}}` - Top geographic market
- `{{TOP_COUNTRY_PERCENT}}` - Percentage of clicks
- `{{MOBILE_PERCENT}}`, `{{DESKTOP_PERCENT}}`, `{{TABLET_PERCENT}}` - Device breakdown
- `{{CAMPAIGN_1_NAME}}`, `{{CAMPAIGN_1_CLICKS}}` - Top campaign #1
- `{{CAMPAIGN_2_NAME}}`, `{{CAMPAIGN_2_CLICKS}}` - Top campaign #2
- `{{CAMPAIGN_3_NAME}}`, `{{CAMPAIGN_3_CLICKS}}` - Top campaign #3
- `{{ANALYTICS_URL}}` - Link to analytics
- Standard footer variables

**Content:**
- Month overview with key metrics
- Highlights (best link, top country, device breakdown)
- Top 3 campaigns with ranking
- CTA to view detailed report

### 10. **upgrade-confirmation.html**
Sent when user successfully upgrades to Pro plan.

**Trigger:** User completes payment for Pro plan

**Variables:**
- `{{USER_NAME}}` - User's name
- `{{PLAN_NAME}}` - Plan name (e.g., "Pro")
- `{{PRICE}}` - Monthly price
- `{{BILLING_PERIOD}}` - "month" or "year"
- `{{START_DATE}}` - Subscription start date
- `{{NEXT_BILLING_DATE}}` - Next billing date
- `{{PRO_GUIDE_URL}}` - Link to Pro user guide
- `{{SUPPORT_EMAIL}}` - Support email address
- `{{BILLING_URL}}` - Link to billing settings
- Standard footer variables

**Content:**
- Celebration message
- Subscription details (plan, pricing, dates)
- Complete list of Pro features unlocked
- CTA to explore features
- Help resources

### 11. **link-milestone.html**
Sent when a link reaches a significant click milestone.

**Trigger:** Link hits 100, 500, 1,000, 5,000, 10,000+ clicks

**Variables:**
- `{{USER_NAME}}` - User's name
- `{{MILESTONE_NUMBER}}` - Number of clicks reached (e.g., "1000")
- `{{LINK_NAME}}` - Link name
- `{{SHORT_URL}}` - Short URL
- `{{TOP_COUNTRY}}` - Top performing country
- `{{DAYS_ACTIVE}}` - Number of days since link created
- `{{AVG_CLICKS_PER_DAY}}` - Average clicks per day
- `{{LINK_ANALYTICS_URL}}` - Link to full analytics
- `{{SHARE_URL}}` - Link to share achievement
- Standard footer variables

**Content:**
- Celebration message with milestone number
- Link details
- Performance highlights
- CTA to view full analytics
- Option to share achievement

### 12. **inactive-user-reengagement.html**
Sent to users who haven't logged in for 30+ days.

**Trigger:** User inactive for 30 days

**Variables:**
- `{{USER_NAME}}` - User's name
- `{{TOTAL_LINKS}}` - Number of links in account
- `{{TOTAL_CLICKS}}` - Total clicks across all links
- `{{LAST_LOGIN_DATE}}` - Last login date
- `{{SUPPORT_EMAIL}}` - Support email
- `{{CREATE_LINK_URL}}` - Link to create new link
- `{{ANALYTICS_URL}}` - Link to analytics
- `{{CAMPAIGNS_URL}}` - Link to campaigns
- `{{SETTINGS_URL}}` - Link to settings
- `{{DELETE_ACCOUNT_URL}}` - Link to delete account
- Standard footer variables

**Content:**
- "We miss you" message
- Account summary (links, clicks, last login)
- What's new features
- Quick action links
- Help resources
- Delete account option

### 13. **campaign-summary.html**
Sent when a campaign ends or upon request.

**Trigger:** Campaign end date reached or manual request

**Variables:**
- `{{USER_NAME}}` - User's name
- `{{CAMPAIGN_NAME}}` - Campaign name
- `{{DATE_RANGE}}` - Campaign date range
- `{{TOTAL_CLICKS}}` - Total campaign clicks
- `{{TOTAL_LINKS}}` - Number of links in campaign
- `{{AVG_CLICKS}}` - Average clicks per link
- `{{DURATION_DAYS}}` - Campaign duration in days
- `{{AVG_PER_DAY}}` - Average clicks per day
- `{{LINK_1_NAME}}`, `{{LINK_1_SHORT_URL}}`, `{{LINK_1_CLICKS}}`, `{{LINK_1_PERCENT}}` - Top link #1
- `{{LINK_2_NAME}}`, `{{LINK_2_SHORT_URL}}`, `{{LINK_2_CLICKS}}`, `{{LINK_2_PERCENT}}` - Top link #2
- `{{LINK_3_NAME}}`, `{{LINK_3_SHORT_URL}}`, `{{LINK_3_CLICKS}}`, `{{LINK_3_PERCENT}}` - Top link #3
- `{{TOP_COUNTRY}}`, `{{TOP_COUNTRY_PERCENT}}` - Top location
- `{{TOP_REFERRER}}` - Top referrer
- `{{MOBILE_PERCENT}}`, `{{DESKTOP_PERCENT}}`, `{{TABLET_PERCENT}}` - Device breakdown
- `{{CAMPAIGN_ANALYTICS_URL}}` - Link to campaign analytics
- Standard footer variables

**Content:**
- Campaign name and date range
- Key metrics (total clicks, links, averages)
- Top 3 performing links with percentages
- Campaign insights (location, referrer, devices)
- CTA to view complete report

## Live Rails mailers

These design templates map to live API mailers (HTML + text):

| Design inspiration | Mailer |
|--------------------|--------|
| `email-verification.html` (auth CTA pattern) | `UserMailer#magic_link` |
| `link-milestone.html` (simplified) | `UserMailer#link_created` |
| `link-milestone.html` | `UserMailer#link_milestone` |
| `campaign-summary.html` / milestone variant | `UserMailer#campaign_milestone` |
| `team-invitation.html` | `TeamMailer#invitation` |
| Branded shell (light) | `ContactMailer#inbound` |

Welcome, weekly, monthly, domain, upgrade, and reengagement templates remain **design assets only** until their send pipelines exist.

## Variable Reference

### Common Variables (used in all templates)
- `{{LOGO_URL}}` - Links logo image URL (absolute; set via `EMAIL_LOGO_URL` in Rails)
- `{{DASHBOARD_URL}}` - Link to main dashboard
- `{{HELP_URL}}` - Link to help/support center
- `{{PRIVACY_URL}}` - Link to privacy policy
- `{{UNSUBSCRIBE_URL}}` - Unsubscribe from marketing emails

### Email-Specific Variables
See individual template sections above for complete variable lists.

## Testing

### Email Client Testing
Test templates in major email clients:
- Gmail (Desktop & Mobile)
- Outlook (Desktop & Web)
- Apple Mail (macOS & iOS)
- Yahoo Mail
- Mobile clients (iOS Mail, Android Gmail)

**Tools:**
- [Litmus](https://litmus.com/) - Premium email testing
- [Email on Acid](https://www.emailonacid.com/) - Email testing platform
- [Mailtrap](https://mailtrap.io/) - Email testing for development

### Variable Testing
Create test data to ensure all variables render correctly:
- Test with long names/URLs
- Test with special characters
- Test with missing data (fallbacks)

### Deliverability Testing
- Set up SPF, DKIM, and DMARC records
- Test spam scores with [Mail Tester](https://www.mail-tester.com/)
- Monitor bounce and complaint rates

## Best Practices

1. **Inline CSS**: All CSS is inlined for email client compatibility
2. **Tables for Layout**: Email clients don't support modern CSS layouts
3. **Alt Text**: All images have alt text for accessibility
4. **Plain Text**: Create plain text versions alongside HTML
5. **Unsubscribe**: Always include unsubscribe link (except transactional)
6. **Test Before Deploy**: Always test in real email clients
7. **Monitor Metrics**: Track open rates, click rates, and unsubscribes

## Image Assets Needed

Replace `{{LOGO_URL}}` with an absolute URL to the square B mark. Options:
- Set `EMAIL_LOGO_URL` in the API environment (e.g. `https://links.blackcollar.io/icons/icon-512.png`)
- Fallback: `FRONTEND_ORIGIN` + `/icons/icon-512.png`
- Header img size in templates: 48×48 (do not use wide wordmark dimensions)

## Support

For questions or issues with these templates:
- Email: support via BlackCollar / Links ops inbox
- Product: Links by BlackCollar

---

**Last Updated:** July 10, 2026
**Version:** 2.0.0
