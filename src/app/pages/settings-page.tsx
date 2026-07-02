import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { AppLayout } from '../components/app-layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useAuth } from '../contexts/auth-context';
import { usePermissions } from '@/hooks/use-permissions';
import { User, Key, Bell, CreditCard, Globe, Check, X, Copy, AlertCircle, HelpCircle } from 'lucide-react';
import { apiRequest, ApiError } from '@/services/api';
import { NotificationPreferenceRow } from '../components/notification-preference-row';
import { toast } from 'sonner';
import {
  updateAccount,
  updatePassword,
  fetchNotificationPreferences,
  updateNotificationPreferences,
  type NotificationPreferences,
} from '@/services/account-api';
import {
  createDomain,
  deleteDomain,
  listDomains,
  setDefaultDomain,
  verifyDomain,
  customDomainCnameTarget,
  type CustomDomainJson,
} from '@/services/domains-api';
import { createPortalSession } from '@/services/billing-api';
import type { SubscriptionTier } from '@/types';
import {
  enablePushNotifications,
  isPushSupported,
  unsubscribeFromPush,
} from '@/lib/push-notifications';

const TIER_LABELS: Record<SubscriptionTier, string> = {
  free: 'Free',
  starter: 'Starter',
  growth: 'Growth',
  pro: 'Pro',
  enterprise: 'Enterprise',
};

const TIER_FEATURES: Record<SubscriptionTier, string[]> = {
  free: ['1 link', 'Basic analytics'],
  starter: ['Up to 20 links', '2 campaigns', 'Tap analytics dashboard'],
  growth: ['Unlimited links & campaigns', 'Custom domain', 'Workspaces & team'],
  pro: ['Unlimited links & campaigns', 'Custom domain', 'Workspaces & team', 'Advanced analytics'],
  enterprise: ['Everything in Pro', 'Dedicated support'],
};

export function SettingsPage() {
  const { isAuthenticated, user, logout, checkAuth } = useAuth();
  const { can, limits } = usePermissions();
  const navigate = useNavigate();
  
  const [name, setName] = useState(user?.name || '');
  const [email] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [billingLoading, setBillingLoading] = useState(false);
  const [notifPrefs, setNotifPrefs] = useState<NotificationPreferences | null>(null);
  const [notifSaving, setNotifSaving] = useState(false);

  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user?.name]);

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchNotificationPreferences();
        if (!cancelled) setNotifPrefs(data.notificationPreferences);
      } catch {
        if (!cancelled) setNotifPrefs(null);
      }
    })();
    return () => { cancelled = true; };
  }, [isAuthenticated]);

  // Custom domains state
  const [newDomain, setNewDomain] = useState('');
  const [domains, setDomains] = useState<CustomDomainJson[]>([]);
  const [domainsLoading, setDomainsLoading] = useState(false);
  const [verifyingDomainId, setVerifyingDomainId] = useState<string | null>(null);

  const cnameTarget = customDomainCnameTarget();

  useEffect(() => {
    if (!isAuthenticated || !can.manageDomains) return;
    let cancelled = false;
    (async () => {
      setDomainsLoading(true);
      try {
        const data = await listDomains();
        if (!cancelled) setDomains(data);
      } catch {
        if (!cancelled) setDomains([]);
      } finally {
        if (!cancelled) setDomainsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, can.manageDomains]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      await updateAccount({ name });
      await checkAuth();
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not update profile');
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setPasswordSaving(true);
    try {
      await updatePassword({
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      });
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not change password');
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleUpgrade = () => {
    navigate('/pricing');
  };

  const handleManageBilling = async () => {
    setBillingLoading(true);
    try {
      const { url } = await createPortalSession();
      window.location.href = url;
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not open billing portal');
      setBillingLoading(false);
    }
  };

  const handleNotifToggle = async (key: keyof NotificationPreferences, value: boolean) => {
    if (!notifPrefs) return;
    const updated = { ...notifPrefs, [key]: value };
    setNotifPrefs(updated);
    setNotifSaving(true);
    try {
      const data = await updateNotificationPreferences({ [key]: value });
      setNotifPrefs(data.notificationPreferences);
      toast.success('Preferences saved');
    } catch {
      setNotifPrefs(notifPrefs);
      toast.error('Could not save preferences');
    } finally {
      setNotifSaving(false);
    }
  };

  const handleRestartTutorial = () => {
    localStorage.removeItem('blackcollar_tutorial_completed');
    toast.success('Tutorial reset — visit the dashboard to start again');
  };

  const tier = (user?.subscriptionTier || 'free') as SubscriptionTier;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain.trim()) {
      toast.error('Please enter a domain name');
      return;
    }
    try {
      const created = await createDomain(newDomain.trim());
      setDomains((prev) => [...prev, created]);
      setNewDomain('');
      toast.success(`Domain ${created.domain} added — configure DNS to verify`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not add domain');
    }
  };

  const handleSetDefaultDomain = async (domainId: string) => {
    try {
      const updated = await setDefaultDomain(domainId);
      setDomains((prev) =>
        prev.map((d) => ({ ...d, isDefault: d.id === updated.id }))
      );
      toast.success('Default domain updated');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not update default domain');
    }
  };

  const handleRemoveDomain = async (domainId: string) => {
    const domainToRemove = domains.find((d) => d.id === domainId);
    if (domainToRemove?.isDefault) {
      toast.error('Cannot remove the default domain. Set another domain as default first.');
      return;
    }
    try {
      await deleteDomain(domainId);
      setDomains((prev) => prev.filter((d) => d.id !== domainId));
      toast.success('Domain removed');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not remove domain');
    }
  };

  const handleVerifyDomain = async (domainId: string) => {
    setVerifyingDomainId(domainId);
    try {
      const updated = await verifyDomain(domainId);
      setDomains((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
      if (updated.status === 'verified') {
        toast.success(`${updated.domain} verified successfully`);
      } else {
        toast.error('Verification failed — check that the TXT record is published');
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not verify domain');
    } finally {
      setVerifyingDomainId(null);
    }
  };

  const copyDNSRecord = (record: string) => {
    navigator.clipboard.writeText(record);
    toast.success('DNS record copied');
  };

  // Push notifications (PWA)
  const [pushSupported] = useState(() => isPushSupported());
  const [pushPermission, setPushPermission] = useState<NotificationPermission>(
    pushSupported ? Notification.permission : 'denied'
  );
  const [pushBusy, setPushBusy] = useState(false);

  const handleEnablePush = async () => {
    if (!pushSupported) return;
    setPushBusy(true);
    try {
      const ok = await enablePushNotifications();
      setPushPermission(Notification.permission);
      if (ok) {
        toast.success('Push notifications enabled');
      } else if (Notification.permission !== 'granted') {
        return;
      } else {
        toast.error('Missing VAPID public key or could not subscribe');
      }
    } catch {
      toast.error('Could not enable push notifications');
    } finally {
      setPushBusy(false);
    }
  };

  const handleDisablePush = async () => {
    if (!pushSupported) return;
    setPushBusy(true);
    try {
      await unsubscribeFromPush();
      toast.success('Push notifications disabled');
    } catch {
      toast.error('Could not disable push notifications');
    } finally {
      setPushBusy(false);
    }
  };

  return (
    <AppLayout>
      <div className="min-h-0 bg-background relative mx-[0px] mt-[20px] mb-[0px]">
        {/* Subtle background pattern for glass effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />
        
        <div className="px-4 py-8 max-w-4xl mx-auto relative">
          <h1 className="mb-8 text-[32px] text-center">Account Settings</h1>

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 mb-8 h-auto gap-2 bg-card/50 backdrop-blur-md shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)] p-2">
              <TabsTrigger value="profile" className="flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 py-2 px-1 md:px-2 md:py-3 rounded-full data-[state=active]:bg-black dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-black">
                <User className="w-4 h-4" />
                <span className="text-[10px] md:text-sm">Profile</span>
              </TabsTrigger>
              {can.domains && (
              <TabsTrigger value="domains" className="flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 py-2 px-1 md:px-2 md:py-3 rounded-full data-[state=active]:bg-black dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-black">
                <Globe className="w-4 h-4" />
                <span className="text-[10px] md:text-sm">Domains</span>
              </TabsTrigger>
              )}
              <TabsTrigger value="security" className="flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 py-2 px-1 md:px-2 md:py-3 rounded-full data-[state=active]:bg-black dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-black">
                <Key className="w-4 h-4" />
                <span className="text-[10px] md:text-sm">Security</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 py-2 px-1 md:px-2 md:py-3 rounded-full data-[state=active]:bg-black dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-black">
                <Bell className="w-4 h-4" />
                <span className="text-[10px] md:text-sm">Notifications</span>
              </TabsTrigger>
              {can.billing && (
              <TabsTrigger value="billing" className="flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 py-2 px-1 md:px-2 md:py-3 rounded-full data-[state=active]:bg-black dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-black">
                <CreditCard className="w-4 h-4" />
                <span className="text-[10px] md:text-sm">Billing</span>
              </TabsTrigger>
              )}
              <TabsTrigger value="help" className="flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 py-2 px-1 md:px-2 md:py-3 rounded-full data-[state=active]:bg-black dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-black">
                <HelpCircle className="w-4 h-4" />
                <span className="text-[10px] md:text-sm">Help</span>
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <div className="bg-card/50 backdrop-blur-md shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)] rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-11 rounded-full bg-muted border-0 focus:ring-0 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      disabled
                      className="h-11 rounded-full bg-muted border-0 focus:ring-0 focus:outline-none opacity-70"
                    />
                    <p className="text-xs text-muted-foreground">Email cannot be changed here.</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button type="submit" size="lg" disabled={profileSaving} className="rounded-full bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90">
                      {profileSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="destructive" 
                      size="lg"
                      onClick={handleLogout}
                      className="rounded-full"
                    >
                      Sign out
                    </Button>
                  </div>
                </form>
              </div>
            </TabsContent>

            {/* Domains Tab */}
            {can.domains && (
            <TabsContent value="domains">
              <div className="bg-card/50 backdrop-blur-md shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)] rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Custom Domains</h2>
                <p className="text-sm text-muted-foreground mb-2">
                  Use your own domain for branded short links. Add a custom domain and configure DNS to get started.
                </p>
                {limits.domains.max != null && (
                  <p className="text-sm text-muted-foreground mb-6">
                    Domains: {limits.domains.used} / {limits.domains.max}
                  </p>
                )}
                {limits.domains.max == null && <div className="mb-6" />}

                {/* Add Domain Form */}
                <form onSubmit={handleAddDomain} className="space-y-4 mb-8 pb-8 border-b border-border">
                  <div>
                    <Label htmlFor="new-domain" className="text-sm font-medium mb-2 block">Add New Domain</Label>
                    <div className="flex gap-2">
                      <Input
                        id="new-domain"
                        type="text"
                        placeholder="yourdomain.com"
                        value={newDomain}
                        onChange={(e) => setNewDomain(e.target.value)}
                        className="h-11 rounded-full bg-muted border-0 focus:ring-0 focus:outline-none flex-1"
                      />
                      <Button type="submit" size="lg" className="rounded-full bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90">
                        <Globe className="w-4 h-4 mr-2" />
                        Add Domain
                      </Button>
                    </div>
                  </div>
                </form>

                {/* Domains List */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Your Domains</h3>
                  {domains.map((domain) => (
                    <div
                      key={domain.id}
                      className="bg-muted/30 rounded-lg p-4 space-y-3"
                    >
                      {/* Domain Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-lg">{domain.domain}</h4>
                            {domain.isDefault && (
                              <span className="text-xs px-2 py-1 rounded-full bg-primary text-primary-foreground">
                                Default
                              </span>
                            )}
                            {domain.status === 'verified' ? (
                              <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-700 dark:text-green-400">
                                <Check className="w-3 h-3" />
                                Verified
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-700 dark:text-yellow-400">
                                <AlertCircle className="w-3 h-3" />
                                Pending
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">Added on {domain.createdAt}</p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {!domain.isDefault && domain.status === 'verified' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="rounded-full" 
                              onClick={() => handleSetDefaultDomain(domain.id)}
                            >
                              Set Default
                            </Button>
                          )}
                          {!domain.isDefault && (
                            <Button 
                              size="sm" 
                              variant="destructive"
                              className="rounded-full" 
                              onClick={() => handleRemoveDomain(domain.id)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* DNS Configuration */}
                      {(domain.status === 'pending' || domain.status === 'verified') && (
                        <div className="mt-4 pt-4 border-t border-border space-y-4">
                          {domain.status === 'pending' && (
                            <div>
                              <p className="text-sm font-medium mb-2">Step 1 — Verify ownership (required)</p>
                              <p className="text-xs text-muted-foreground mb-3">
                                Add this TXT record, then click Verify DNS. Propagation can take a few minutes.
                              </p>
                              <div className="bg-background rounded p-3 mb-3">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs font-medium">Type: TXT</span>
                                  {domain.verificationToken && (
                                    <button
                                      type="button"
                                      onClick={() => copyDNSRecord(domain.verificationToken!)}
                                      className="text-xs text-primary hover:underline flex items-center gap-1"
                                    >
                                      <Copy className="w-3 h-3" />
                                      Copy value
                                    </button>
                                  )}
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                  <div>
                                    <span className="text-muted-foreground">Name:</span>{' '}
                                    <code className="break-all">_links-verification.{domain.domain}</code>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Value:</span>{' '}
                                    <code className="break-all">{domain.verificationToken || '—'}</code>
                                  </div>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                className="rounded-full"
                                disabled={verifyingDomainId === domain.id || !domain.verificationToken}
                                onClick={() => void handleVerifyDomain(domain.id)}
                              >
                                {verifyingDomainId === domain.id ? 'Verifying...' : 'Verify DNS'}
                              </Button>
                            </div>
                          )}

                          <div>
                            <p className="text-sm font-medium mb-2">
                              Step 2 — Route traffic (required for redirects)
                            </p>
                            <div className="bg-amber-500/10 border border-amber-500/20 rounded p-3 mb-3 text-xs text-muted-foreground space-y-2">
                              <p>
                                <span className="font-medium text-foreground">2a — Platform TLS (ops):</span>{' '}
                                After TXT verification, add <code>{domain.domain}</code> to the API Railway service
                                under Networking → Custom Domain. TLS is issued once DNS propagates.
                              </p>
                              <p>
                                <span className="font-medium text-foreground">2b — Customer DNS:</span>{' '}
                                Point the domain (or www subdomain) at the shared target below. Apex domains
                                often need ALIAS/ANAME instead of CNAME — check your DNS provider.
                              </p>
                            </div>
                            <div className="bg-background rounded p-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium">Type: CNAME (or ALIAS for apex)</span>
                                <button
                                  type="button"
                                  onClick={() => copyDNSRecord(cnameTarget)}
                                  className="text-xs text-primary hover:underline flex items-center gap-1"
                                >
                                  <Copy className="w-3 h-3" />
                                  Copy target
                                </button>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                <div>
                                  <span className="text-muted-foreground">Name:</span> @ or www
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Target:</span>{' '}
                                  <code className="break-all">{cnameTarget}</code>
                                </div>
                              </div>
                            </div>
                            {domain.status === 'pending' && (
                              <p className="text-xs text-muted-foreground mt-3">
                                Complete Step 1 first. Routing (Step 2) is separate and requires the Railway
                                custom-domain registration before redirects will work.
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {domains.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Globe className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p>No custom domains added yet</p>
                      <p className="text-sm">Add your first domain to get started with branded links</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            )}

            {/* Security Tab */}
            <TabsContent value="security">
              <div className="bg-card rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Change Password</h2>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      className="h-11 rounded-full bg-muted border-0 focus:ring-0 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="h-11 rounded-full bg-muted border-0 focus:ring-0 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-new-password">Confirm New Password</Label>
                    <Input
                      id="confirm-new-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="h-11 rounded-full bg-muted border-0 focus:ring-0 focus:outline-none"
                    />
                  </div>
                  <Button type="submit" size="lg" disabled={passwordSaving} className="rounded-full bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90">
                    {passwordSaving ? 'Updating...' : 'Update Password'}
                  </Button>
                </form>

                <div className="mt-8 pt-8 border-t border-border">
                  <h3 className="text-lg font-semibold mb-4">Two-Factor Authentication</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add an extra layer of security to your account. Coming soon.
                  </p>
                  <Button variant="outline" size="lg" disabled>
                    Enable 2FA (Coming soon)
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications">
              <div className="bg-card/50 backdrop-blur-md shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)] rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Notification Preferences</h2>
                {!notifPrefs ? (
                  <p className="text-muted-foreground text-sm">Loading preferences...</p>
                ) : (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-1">Push Notifications</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Receive real-time alerts on this device (requires install + permission)
                    </p>
                    <div className="flex items-center gap-2 mb-4">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={!isAuthenticated || !pushSupported || pushBusy || pushPermission !== 'granted'}
                        onClick={handleDisablePush}
                      >
                        Disable
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        disabled={!isAuthenticated || !pushSupported || pushBusy}
                        onClick={handleEnablePush}
                      >
                        Enable
                      </Button>
                    </div>
                    <div className={pushPermission !== 'granted' ? 'opacity-50 pointer-events-none' : undefined}>
                      <NotificationPreferenceRow
                        title="Link Alerts"
                        description="Get notified when links reach click milestones"
                        checked={notifPrefs.push_link_alerts}
                        disabled={notifSaving || pushPermission !== 'granted'}
                        onCheckedChange={(value) => void handleNotifToggle('push_link_alerts', value)}
                      />
                      <NotificationPreferenceRow
                        title="Daily/Weekly Analytics"
                        description="Receive periodic analytics summaries on this device"
                        checked={notifPrefs.push_weekly_reports}
                        disabled={notifSaving || pushPermission !== 'granted'}
                        onCheckedChange={(value) => void handleNotifToggle('push_weekly_reports', value)}
                      />
                      <NotificationPreferenceRow
                        title="Marketing Notifications"
                        description="Product updates and tips via push"
                        checked={notifPrefs.push_marketing}
                        disabled={notifSaving || pushPermission !== 'granted'}
                        onCheckedChange={(value) => void handleNotifToggle('push_marketing', value)}
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-4">Email</h3>
                    <NotificationPreferenceRow
                      title="Link Alerts"
                      description="Get notified when links reach click milestones"
                      checked={notifPrefs.email_link_alerts}
                      disabled={notifSaving}
                      onCheckedChange={(value) => void handleNotifToggle('email_link_alerts', value)}
                    />
                    <NotificationPreferenceRow
                      title="Marketing Emails"
                      description="Receive product updates and tips"
                      checked={notifPrefs.email_marketing}
                      disabled={notifSaving}
                      onCheckedChange={(value) => void handleNotifToggle('email_marketing', value)}
                    />
                    <NotificationPreferenceRow
                      title="Daily/Weekly Analytics"
                      description="Get weekly analytics summaries via email"
                      checked={notifPrefs.email_weekly_reports}
                      disabled={notifSaving}
                      onCheckedChange={(value) => void handleNotifToggle('email_weekly_reports', value)}
                    />
                  </div>
                </div>
                )}
              </div>
            </TabsContent>

            {/* Help Tab */}
            <TabsContent value="help">
              <div className="bg-card/50 backdrop-blur-md rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Help</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Restart the product tour to see a walkthrough of key features again.
                </p>
                <Button variant="outline" onClick={handleRestartTutorial}>
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Restart product tour
                </Button>
              </div>
            </TabsContent>

            {/* Billing Tab */}
            {can.billing && (
            <TabsContent value="billing">
              <div className="bg-card rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Billing & Subscription</h2>
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-medium text-lg">{TIER_LABELS[tier]} Plan</h3>
                      <p className="text-sm text-muted-foreground">Currently active</p>
                    </div>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                    {TIER_FEATURES[tier].map((feature) => (
                      <p key={feature} className="text-sm">✓ {feature}</p>
                    ))}
                    {limits && (
                      <p className="text-sm pt-2 border-t border-border mt-2">
                        Links: {limits.links.used}{limits.links.max != null ? ` / ${limits.links.max}` : ' (unlimited)'}
                      </p>
                    )}
                  </div>
                </div>
                {tier === 'free' ? (
                  <Button size="lg" className="w-full mb-3" onClick={handleUpgrade}>
                    Upgrade plan
                  </Button>
                ) : null}
                {can.portal && (
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full"
                    disabled={billingLoading}
                    onClick={() => void handleManageBilling()}
                  >
                    {billingLoading ? 'Opening portal...' : 'Manage subscription'}
                  </Button>
                )}
              </div>
            </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
}