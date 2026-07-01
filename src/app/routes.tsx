import { createBrowserRouter, Navigate, Outlet } from "react-router";
import { AuthProvider } from "./contexts/auth-context";
import { WorkspaceProvider } from "./contexts/workspace-context";
import { ThemeProvider } from "./contexts/theme-context";
import { PwaInstallPrompt } from "./components/pwa-install-prompt-modal";
import { ProtectedRoute } from "./components/protected-route";
import { AdminRoute } from "./components/admin-route";
import { AdminLayout } from "./components/admin/admin-layout";
import { LandingPage } from "./pages/landing-page";
import { AuthPage } from "./pages/auth-page";
import { VerifyPage } from "./pages/verify-page";
import { LinksPage } from "./pages/links-page";
import { LinkDetailPage } from "./pages/link-detail-page";
import { LinkEditPage } from "./pages/link-edit-page";
import { CampaignsPage } from "./pages/campaigns-page";
import { CampaignDetailPage } from "./pages/campaign-detail-page";
import { CampaignFormPage } from "./pages/campaign-form-page";
import { CampaignAddLinksPage } from "./pages/campaign-add-links-page";
import { GlobalAnalyticsPage } from "./pages/global-analytics-page";
import { AnalyticsPage } from "./pages/analytics-page";
import { TeamPage } from "./pages/team-page";
import { TeamMemberDetailPage } from "./pages/team-member-detail-page";
import { WorkspacesPage } from "./pages/workspaces-page";
import { WorkspaceDetailPage } from "./pages/workspace-detail-page";
import { SettingsPage } from "./pages/settings-page";
import { UseCasesPage } from "./pages/use-cases-page";
import { BookACallPage } from "./pages/book-a-call-page";
import { PricingPage } from "./pages/pricing-page";
import { OAuthCompletePage } from "./pages/oauth-complete-page";
import { AdminLoginPage } from "./pages/admin-login-page";
import { AdminOverviewPage } from "./pages/admin/admin-overview-page";
import { AdminUsersPage } from "./pages/admin/admin-users-page";
import { AdminUserDetailPage } from "./pages/admin/admin-user-detail-page";
import { AdminLinksPage } from "./pages/admin/admin-links-page";
import { AdminLinkDetailPage } from "./pages/admin/admin-link-detail-page";
import { AdminHealthPage } from "./pages/admin/admin-health-page";
import { AdminFeatureFlagsPage } from "./pages/admin/admin-feature-flags-page";
import { AdminTeamsPage } from "./pages/admin/admin-teams-page";
import { AdminTeamDetailPage } from "./pages/admin/admin-team-detail-page";
import { AdminBillingPage } from "./pages/admin/admin-billing-page";
import { AdminCampaignsPage } from "./pages/admin/admin-campaigns-page";
import { AdminWorkspacesPage } from "./pages/admin/admin-workspaces-page";
import { AdminDomainsPage } from "./pages/admin/admin-domains-page";
import { AdminPushPage } from "./pages/admin/admin-push-page";
import { AcceptInvitePage } from "./pages/accept-invite-page";
import { ShortLinkRedirectPage } from "./pages/short-link-redirect-page";
import { NotFoundPage } from "./pages/not-found-page";

function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <WorkspaceProvider>
          <PwaInstallPrompt />
          <Outlet />
        </WorkspaceProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: "/",
        Component: LandingPage,
      },
      {
        path: "/auth",
        Component: AuthPage,
      },
      {
        path: "/auth/verify",
        Component: VerifyPage,
      },
      {
        path: "/auth/oauth-complete",
        Component: OAuthCompletePage,
      },
      {
        path: "/accept-invite/:token",
        Component: AcceptInvitePage,
      },
      {
        path: "/auth/accept-invite/:token",
        Component: AcceptInvitePage,
      },
      {
        path: "/team/accept/:token",
        Component: AcceptInvitePage,
      },
      {
        path: "/admin/login",
        Component: AdminLoginPage,
      },
      {
        path: "/admin",
        element: (
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        ),
        children: [
          { index: true, element: <Navigate to="overview" replace /> },
          { path: "overview", Component: AdminOverviewPage },
          { path: "users", Component: AdminUsersPage },
          { path: "users/:userId", Component: AdminUserDetailPage },
          { path: "links", Component: AdminLinksPage },
          { path: "links/:linkId", Component: AdminLinkDetailPage },
          { path: "health", Component: AdminHealthPage },
          { path: "feature-flags", Component: AdminFeatureFlagsPage },
          { path: "teams", Component: AdminTeamsPage },
          { path: "teams/:teamId", Component: AdminTeamDetailPage },
          { path: "billing", Component: AdminBillingPage },
          { path: "campaigns", Component: AdminCampaignsPage },
          { path: "workspaces", Component: AdminWorkspacesPage },
          { path: "domains", Component: AdminDomainsPage },
          { path: "push", Component: AdminPushPage },
        ],
      },
      {
        path: "/dashboard",
        element: <ProtectedRoute><GlobalAnalyticsPage /></ProtectedRoute>,
      },
      {
        path: "/links",
        element: <ProtectedRoute><LinksPage /></ProtectedRoute>,
      },
      {
        path: "/links/:linkId",
        element: <ProtectedRoute><LinkDetailPage /></ProtectedRoute>,
      },
      {
        path: "/links/:linkId/edit",
        element: <ProtectedRoute><LinkEditPage /></ProtectedRoute>,
      },
      {
        path: "/campaigns",
        element: <ProtectedRoute><CampaignsPage /></ProtectedRoute>,
      },
      {
        path: "/campaigns/new",
        element: <ProtectedRoute><CampaignFormPage /></ProtectedRoute>,
      },
      {
        path: "/campaigns/:campaignId",
        element: <ProtectedRoute><CampaignDetailPage /></ProtectedRoute>,
      },
      {
        path: "/campaigns/:campaignId/add-links",
        element: <ProtectedRoute><CampaignAddLinksPage /></ProtectedRoute>,
      },
      {
        path: "/campaigns/:campaignId/edit",
        element: <ProtectedRoute><CampaignFormPage /></ProtectedRoute>,
      },
      {
        path: "/analytics",
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: "/analytics/:linkId",
        element: <ProtectedRoute><AnalyticsPage /></ProtectedRoute>,
      },
      {
        path: "/team",
        element: <ProtectedRoute><TeamPage /></ProtectedRoute>,
      },
      {
        path: "/team/:memberId",
        element: <ProtectedRoute><TeamMemberDetailPage /></ProtectedRoute>,
      },
      {
        path: "/workspaces",
        element: <ProtectedRoute><WorkspacesPage /></ProtectedRoute>,
      },
      {
        path: "/workspaces/:workspaceId",
        element: <ProtectedRoute><WorkspaceDetailPage /></ProtectedRoute>,
      },
      {
        path: "/settings",
        element: <ProtectedRoute><SettingsPage /></ProtectedRoute>,
      },
      {
        path: "/use-cases",
        Component: UseCasesPage,
      },
      {
        path: "/book-a-call",
        Component: BookACallPage,
      },
      {
        path: "/pricing",
        Component: PricingPage,
      },
      {
        path: "/:shortCode",
        Component: ShortLinkRedirectPage,
      },
      {
        path: "*",
        Component: NotFoundPage,
      },
    ],
  },
]);
