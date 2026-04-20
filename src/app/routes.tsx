import { createBrowserRouter, Outlet } from "react-router";
import { AuthProvider } from "./contexts/auth-context";
import { ThemeProvider } from "./contexts/theme-context";
import { ProtectedRoute } from "./components/protected-route";
import { AdminRoute } from "./components/admin-route";
import { LandingPage } from "./pages/landing-page";
import { AuthPage } from "./pages/auth-page";
import { VerifyPage } from "./pages/verify-page";
import { DashboardPage } from "./pages/dashboard-page";
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
import { AdminPage } from "./pages/admin-page";
import { NotFoundPage } from "./pages/not-found-page";

function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Outlet />
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
        path: "/admin/login",
        Component: AdminLoginPage,
      },
      {
        path: "/admin",
        element: <AdminRoute><AdminPage /></AdminRoute>,
      },
      {
        path: "/dashboard",
        element: <ProtectedRoute><DashboardPage /></ProtectedRoute>,
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
        element: <ProtectedRoute><GlobalAnalyticsPage /></ProtectedRoute>,
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
        path: "*",
        Component: NotFoundPage,
      },
    ],
  },
]);