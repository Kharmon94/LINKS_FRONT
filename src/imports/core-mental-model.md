The Core Mental Model
Everything in your app orbits around Links. Campaigns group links. Teams own campaigns and links. Randomizers are a special link behavior. Keep that hierarchy clear and your nav/page structure will make sense naturally.
Team → Campaigns → Links → (optional) Randomizer Pool
                         → Analytics

Page Structure
Public / Auth

/ — Marketing landing page
/login /register /forgot-password
/[short-code] — The redirect handler (not a UI page, pure backend)

App (authenticated)
The main app shell should be a persistent sidebar with these top-level sections:

Dashboard /dashboard — High-level stats: clicks today, top performing links, active campaigns
Links /links — All links table with search/filter, create button
Links / Detail /links/[id] — Stats, edit destination, toggle randomizer, QR/NFC export
Campaigns /campaigns — Campaign list with aggregate performance
Campaigns / Detail /campaigns/[id] — Member links, combined analytics, timeline
Randomizer — This lives inside a link detail, not as its own top-level section. A link has a toggle: "Single destination" vs "Randomized pool." When randomized is on, a pool manager appears inline.
Analytics /analytics — Cross-campaign reporting, date ranges, device/geo breakdowns
Team /team — Member list, roles, invitations
Settings /settings — Account, billing, API keys, integrations

Admin (separate shell or /admin prefix)

User management, team oversight, billing, feature flags, system health


Key Structural Decisions to Make Now
1. Randomizer placement — Don't give it top-level nav. It's a property of a link, not a standalone object. Treat it as a mode within link detail. This keeps the mental model clean and prevents users from hunting for it.
2. Analytics placement — Decide if analytics lives in three places (link detail, campaign detail, and a global /analytics page) or just two. Having it embedded contextually at each level and globally is the right call for your use case since marketers will want both micro and macro views.
3. NFC / QR export — This should be a prominent action on the link detail page, not buried in settings. Think: a dedicated "Export for NFC" button that generates the short URL and QR side by side.
4. Team permissions model — Decide on roles early because it affects what UI elements are visible or locked. A simple three-tier works well: Owner → Admin → Member. This determines who can delete campaigns, invite members, access billing, etc.
5. Sidebar structure — For a team product, consider whether the top-level context switcher (if teams can have sub-workspaces or if users belong to multiple teams) lives at the very top of the sidebar. If one user = one team for now, skip it and add it later.

Scalability Notes for Your Dev
The Rails backend should model short_links with a link_type enum (single, randomized) and a separate link_pool_entries table for randomizer entries. Campaigns are just a join between campaigns and short_links. This keeps the schema flat and queryable for analytics without complex polymorphism.
For analytics, plan for a separate click_events table from day one — don't aggregate into the links table. Raw events → aggregation later. This is the decision that most link shortener apps regret skipping early.
