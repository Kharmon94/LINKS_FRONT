import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { AppLayout } from '../components/app-layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useAuth } from '../contexts/auth-context';
import { usePermissions } from '@/hooks/use-permissions';
import { User, Key, Bell, CreditCard, Globe, Check, X, Copy, AlertCircle } from 'lucide-react';
import { apiRequest } from '@/services/api';

async function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i += 1) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

export function SettingsPage() {
  const { isAuthenticated, user, logout } = useAuth();
  const { can } = usePermissions();
  const navigate = useNavigate();
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Custom domains state
  const [newDomain, setNewDomain] = useState('');
  const [domains, setDomains] = useState([
    {
      id: '1',
      domain: 'links.blackcollar.io',
      status: 'verified',
      isDefault: true,
      createdAt: '2026-01-15',
    },
    {
      id: '2',
      domain: 'mybrand.com',
      status: 'verified',
      isDefault: false,
      createdAt: '2026-02-10',
    },
    {
      id: '3',
      domain: 'link.example.com',
      status: 'pending',
      isDefault: false,
      createdAt: '2026-03-05',
    },
  ]);

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Replace with actual API call to Rails backend
    console.log('Update profile:', { name, email });
    alert('Profile updated successfully!');
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    // TODO: Replace with actual API call to Rails backend
    console.log('Change password:', { currentPassword, newPassword });
    alert('Password changed successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleAddDomain = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain.trim()) {
      alert('Please enter a domain name');
      return;
    }
    // TODO: Replace with actual API call to Rails backend
    const newDomainObj = {
      id: String(Date.now()),
      domain: newDomain.trim(),
      status: 'pending',
      isDefault: false,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setDomains([...domains, newDomainObj]);
    setNewDomain('');
    alert(`Domain ${newDomain} added! Please configure your DNS settings.`);
  };

  const handleSetDefaultDomain = (domainId: string) => {
    // TODO: Replace with actual API call to Rails backend
    setDomains(domains.map(d => ({
      ...d,
      isDefault: d.id === domainId
    })));
    alert('Default domain updated!');
  };

  const handleRemoveDomain = (domainId: string) => {
    const domainToRemove = domains.find(d => d.id === domainId);
    if (domainToRemove?.isDefault) {
      alert('Cannot remove the default domain. Please set another domain as default first.');
      return;
    }
    // TODO: Replace with actual API call to Rails backend
    setDomains(domains.filter(d => d.id !== domainId));
    alert('Domain removed successfully!');
  };

  const copyDNSRecord = (record: string) => {
    navigator.clipboard.writeText(record);
    alert('DNS record copied to clipboard!');
  };

  // Push notifications (PWA)
  const [pushSupported] = useState(() => 'Notification' in window && 'serviceWorker' in navigator);
  const [pushPermission, setPushPermission] = useState<NotificationPermission>(
    pushSupported ? Notification.permission : 'denied'
  );
  const [pushBusy, setPushBusy] = useState(false);

  const handleEnablePush = async () => {
    if (!pushSupported) return;
    setPushBusy(true);
    try {
      const perm = await Notification.requestPermission();
      setPushPermission(perm);
      if (perm !== 'granted') return;

      const reg = await navigator.serviceWorker.ready;
      const existing = await reg.pushManager.getSubscription();
      if (existing) return;

      const publicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined;
      if (!publicKey) {
        alert('Missing VAPID public key');
        return;
      }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: await urlBase64ToUint8Array(publicKey),
      });

      await apiRequest('/api/v1/push/subscribe', {
        method: 'POST',
        body: JSON.stringify({ subscription: sub.toJSON() }),
      });
      alert('Push notifications enabled');
    } catch {
      alert('Could not enable push notifications');
    } finally {
      setPushBusy(false);
    }
  };

  const handleDisablePush = async () => {
    if (!pushSupported) return;
    setPushBusy(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await apiRequest('/api/v1/push/unsubscribe', {
          method: 'DELETE',
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      alert('Push notifications disabled');
    } catch {
      alert('Could not disable push notifications');
    } finally {
      setPushBusy(false);
    }
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-background relative mx-[0px] mt-[20px] mb-[0px]">
        {/* Subtle background pattern for glass effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />
        
        <div className="px-4 py-8 max-w-4xl mx-auto relative">
          <h1 className="mb-8 text-[32px] text-center">Account Settings</h1>

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-5 mb-8 h-auto gap-2 bg-card/50 backdrop-blur-md shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)] p-2">
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
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-11 rounded-full bg-muted border-0 focus:ring-0 focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button type="submit" size="lg" className="rounded-full bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90">
                      Save Changes
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
                <p className="text-sm text-muted-foreground mb-6">
                  Use your own domain for branded short links. Add a custom domain and configure DNS to get started.
                </p>

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

                      {/* DNS Configuration (only for pending domains) */}
                      {domain.status === 'pending' && (
                        <div className="mt-4 pt-4 border-t border-border">
                          <p className="text-sm font-medium mb-2">DNS Configuration</p>
                          <p className="text-xs text-muted-foreground mb-3">
                            Add the following DNS records to verify your domain:
                          </p>
                          
                          {/* A Record */}
                          <div className="bg-background rounded p-3 mb-2">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium">Type: A Record</span>
                              <button
                                onClick={() => copyDNSRecord('76.76.21.21')}
                                className="text-xs text-primary hover:underline flex items-center gap-1"
                              >
                                <Copy className="w-3 h-3" />
                                Copy
                              </button>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="text-muted-foreground">Name:</span> @
                              </div>
                              <div>
                                <span className="text-muted-foreground">Value:</span> 76.76.21.21
                              </div>
                            </div>
                          </div>

                          {/* CNAME Record */}
                          <div className="bg-background rounded p-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium">Type: CNAME Record</span>
                              <button
                                onClick={() => copyDNSRecord('cname.blackcollar.io')}
                                className="text-xs text-primary hover:underline flex items-center gap-1"
                              >
                                <Copy className="w-3 h-3" />
                                Copy
                              </button>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="text-muted-foreground">Name:</span> www
                              </div>
                              <div>
                                <span className="text-muted-foreground">Value:</span> cname.blackcollar.io
                              </div>
                            </div>
                          </div>

                          <p className="text-xs text-muted-foreground mt-3">
                            DNS changes can take up to 48 hours to propagate. We'll automatically verify your domain once the records are detected.
                          </p>
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
                  <Button type="submit" size="lg" className="rounded-full bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90">
                    Update Password
                  </Button>
                </form>

                <div className="mt-8 pt-8 border-t border-border">
                  <h3 className="text-lg font-semibold mb-4">Two-Factor Authentication</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add an extra layer of security to your account by enabling two-factor authentication.
                  </p>
                  <Button variant="outline" size="lg">
                    Enable 2FA
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications">
              <div className="bg-card/50 backdrop-blur-md shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)] rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Notification Preferences</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-border">
                    <div>
                      <h3 className="font-medium">Push Notifications</h3>
                      <p className="text-sm text-muted-foreground">
                        Receive real-time alerts on this device (requires install + permission)
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
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
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-border">
                    <div>
                      <h3 className="font-medium">Email Notifications</h3>
                      <p className="text-sm text-muted-foreground">Receive email updates about your links</p>
                    </div>
                    <input type="checkbox" className="w-5 h-5" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-border">
                    <div>
                      <h3 className="font-medium">Weekly Reports</h3>
                      <p className="text-sm text-muted-foreground">Get weekly analytics summaries</p>
                    </div>
                    <input type="checkbox" className="w-5 h-5" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-border">
                    <div>
                      <h3 className="font-medium">Marketing Emails</h3>
                      <p className="text-sm text-muted-foreground">Receive product updates and tips</p>
                    </div>
                    <input type="checkbox" className="w-5 h-5" />
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <h3 className="font-medium">Link Alerts</h3>
                      <p className="text-sm text-muted-foreground">Get notified when links reach click milestones</p>
                    </div>
                    <input type="checkbox" className="w-5 h-5" defaultChecked />
                  </div>
                </div>
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
                      <h3 className="font-medium text-lg">Free Plan</h3>
                      <p className="text-sm text-muted-foreground">Currently active</p>
                    </div>
                    <span className="text-2xl font-bold">$0/mo</span>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                    <p className="text-sm">✓ Up to 100 links</p>
                    <p className="text-sm">✓ Basic analytics</p>
                    <p className="text-sm">✓ Standard support</p>
                  </div>
                </div>
                <Button size="lg" className="w-full">
                  Upgrade to Pro
                </Button>

                <div className="mt-8 pt-8 border-t border-border">
                  <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
                  <p className="text-sm text-muted-foreground mb-4">No payment method on file</p>
                  <Button variant="outline" size="lg">
                    Add Payment Method
                  </Button>
                </div>
              </div>
            </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
}