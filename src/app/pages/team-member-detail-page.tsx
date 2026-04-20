import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { AppLayout } from '../components/app-layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ArrowLeft, Save, Trash2, Users, Mail, Calendar, Shield, Link2, MousePointerClick, FolderKanban, Briefcase, ExternalLink, Globe } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
}

interface MemberStats {
  linksCreated: number;
  totalClicks: number;
  campaigns: number;
  workspaces: string[];
}

interface RecentClick {
  id: string;
  linkName: string;
  shortUrl: string;
  timestamp: string;
  location: string;
}

export function TeamMemberDetailPage() {
  const { memberId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<TeamMember>({
    id: '',
    name: '',
    email: '',
    role: 'member',
    joinedAt: '',
  });

  const [stats, setStats] = useState<MemberStats>({
    linksCreated: 0,
    totalClicks: 0,
    campaigns: 0,
    workspaces: [],
  });

  const [recentClicks, setRecentClicks] = useState<RecentClick[]>([]);

  useEffect(() => {
    // Mock data - replace with API call to Rails backend
    const mockMembers: Record<string, TeamMember> = {
      '1': {
        id: '1',
        name: 'Developer',
        email: 'dev@example.com',
        role: 'owner',
        joinedAt: '2026-01-01',
      },
      '2': {
        id: '2',
        name: 'John Smith',
        email: 'john@example.com',
        role: 'admin',
        joinedAt: '2026-02-01',
      },
      '3': {
        id: '3',
        name: 'Jane Doe',
        email: 'jane@example.com',
        role: 'member',
        joinedAt: '2026-02-15',
      },
    };

    // Mock stats data
    const mockStats: Record<string, MemberStats> = {
      '1': {
        linksCreated: 45,
        totalClicks: 12543,
        campaigns: 8,
        workspaces: ['Marketing Team', 'Product Launch', 'Sales Division'],
      },
      '2': {
        linksCreated: 28,
        totalClicks: 7821,
        campaigns: 5,
        workspaces: ['Marketing Team', 'Customer Support'],
      },
      '3': {
        linksCreated: 15,
        totalClicks: 3245,
        campaigns: 3,
        workspaces: ['Product Launch'],
      },
    };

    // Mock recent clicks data
    const mockRecentClicks: Record<string, RecentClick[]> = {
      '1': [
        {
          id: '1',
          linkName: 'Spring Sale Campaign',
          shortUrl: 'blk.io/spring-sale',
          timestamp: '2026-03-10T10:30:00',
          location: 'New York, US',
        },
        {
          id: '2',
          linkName: 'Product Demo Video',
          shortUrl: 'blk.io/demo-vid',
          timestamp: '2026-03-10T09:15:00',
          location: 'London, UK',
        },
        {
          id: '3',
          linkName: 'Newsletter Signup',
          shortUrl: 'blk.io/newsletter',
          timestamp: '2026-03-09T16:45:00',
          location: 'Toronto, CA',
        },
      ],
      '2': [
        {
          id: '4',
          linkName: 'Customer Survey',
          shortUrl: 'blk.io/survey-2026',
          timestamp: '2026-03-10T11:20:00',
          location: 'Chicago, US',
        },
        {
          id: '5',
          linkName: 'Feature Update Blog',
          shortUrl: 'blk.io/feature-update',
          timestamp: '2026-03-10T08:00:00',
          location: 'Berlin, DE',
        },
      ],
      '3': [
        {
          id: '6',
          linkName: 'Product Launch Page',
          shortUrl: 'blk.io/launch',
          timestamp: '2026-03-09T14:30:00',
          location: 'Sydney, AU',
        },
      ],
    };

    if (memberId && mockMembers[memberId]) {
      setFormData(mockMembers[memberId]);
      setStats(mockStats[memberId] || { linksCreated: 0, totalClicks: 0, campaigns: 0, workspaces: [] });
      setRecentClicks(mockRecentClicks[memberId] || []);
    }
  }, [memberId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Replace with actual API call to Rails backend
    console.log('Updating team member:', formData);
    alert('Team member updated successfully!');
    navigate('/team');
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to remove this team member? This action cannot be undone.')) {
      // TODO: Replace with actual API call to Rails backend
      alert('Team member removed successfully!');
      navigate('/team');
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-primary/10 text-primary';
      case 'admin':
        return 'bg-blue-500/10 text-blue-500';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const isOwner = formData.role === 'owner';

  return (
    <AppLayout>
      <div className="min-h-screen bg-background relative">
        {/* Subtle background pattern for glass effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />
        
        <div className="max-w-2xl mx-auto px-4 py-8 relative">
          {/* Header */}
          <Button
            variant="ghost"
            onClick={() => navigate('/team')}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Team
          </Button>

          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-[32px] mb-2">{formData.name}</h1>
            <div className="flex items-center justify-center gap-2">
              <span
                className={`text-xs px-3 py-1 rounded-full font-medium ${getRoleBadgeColor(
                  formData.role
                )}`}
              >
                {formData.role.charAt(0).toUpperCase() + formData.role.slice(1)}
              </span>
            </div>
          </div>

          {/* Member Info Cards */}
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <div className="bg-card/50 backdrop-blur-md shadow-lg rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Email</p>
              </div>
              <p className="text-sm font-medium break-all">{formData.email}</p>
            </div>
            <div className="bg-card/50 backdrop-blur-md shadow-lg rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Joined</p>
              </div>
              <p className="text-sm font-medium">{formatDate(formData.joinedAt)}</p>
            </div>
          </div>

          {/* Activity Stats */}
          <div className="mb-8">
            <h2 className="text-[20px] font-light text-center mb-4">Activity Overview</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="bg-card/50 backdrop-blur-md shadow-lg rounded-lg p-6 text-center">
                <Link2 className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-2xl font-semibold mb-1">{stats.linksCreated}</p>
                <p className="text-xs text-muted-foreground">Links Created</p>
              </div>
              <div className="bg-card/50 backdrop-blur-md shadow-lg rounded-lg p-6 text-center">
                <MousePointerClick className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-2xl font-semibold mb-1">{stats.totalClicks.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total Clicks</p>
              </div>
              <div className="bg-card/50 backdrop-blur-md shadow-lg rounded-lg p-6 text-center col-span-2 sm:col-span-1">
                <FolderKanban className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-2xl font-semibold mb-1">{stats.campaigns}</p>
                <p className="text-xs text-muted-foreground">Campaigns</p>
              </div>
            </div>
          </div>

          {/* Workspaces */}
          {stats.workspaces.length > 0 && (
            <div className="mb-8">
              <h2 className="text-[20px] font-light text-center mb-4">Workspaces</h2>
              <div className="bg-card/50 backdrop-blur-md shadow-lg rounded-lg p-6">
                <div className="space-y-3">
                  {stats.workspaces.map((workspace, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-background/50 rounded-lg"
                    >
                      <Briefcase className="w-5 h-5 text-primary shrink-0" />
                      <span className="text-sm font-medium">{workspace}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Recent Clicks */}
          {recentClicks.length > 0 && (
            <div className="mb-8">
              <h2 className="text-[20px] font-light text-center mb-4">Recent Clicks</h2>
              <div className="bg-card/50 backdrop-blur-md shadow-lg rounded-lg p-6">
                <div className="space-y-3">
                  {recentClicks.map((click) => (
                    <div
                      key={click.id}
                      className="flex items-start gap-4 p-4 bg-background/50 rounded-lg hover:bg-background/70 transition-colors"
                    >
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                        <MousePointerClick className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm mb-1">{click.linkName}</h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                          <ExternalLink className="w-3 h-3" />
                          <span className="truncate">{click.shortUrl}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Globe className="w-3 h-3" />
                            <span>{click.location}</span>
                          </div>
                          <span>•</span>
                          <span>{formatTimestamp(click.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Edit Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-card/50 backdrop-blur-md shadow-lg rounded-lg p-6 space-y-6">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Member Settings
              </h2>

              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Member name"
                  className="h-12 rounded-full bg-background/50"
                  disabled={isOwner}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="member@example.com"
                  className="h-12 rounded-full bg-background/50"
                  disabled={isOwner}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-medium">Role</Label>
                <Select 
                  value={formData.role} 
                  onValueChange={(value) => setFormData({ ...formData, role: value as TeamMember['role'] })}
                  disabled={isOwner}
                >
                  <SelectTrigger className="h-12 rounded-full bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owner">Owner</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  {isOwner && "The owner role cannot be modified."}
                  {formData.role === 'admin' && "Admins can manage team members and settings."}
                  {formData.role === 'member' && "Members can create and manage links."}
                </p>
              </div>
            </div>

            {/* Save Button */}
            {!isOwner && (
              <Button type="submit" className="w-full h-12 rounded-full">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            )}
          </form>

          {/* Danger Zone */}
          {!isOwner && (
            <div className="mt-12 pt-8 border-t border-border/30">
              <div className="bg-destructive/10 backdrop-blur-md border border-destructive/30 rounded-lg p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-destructive mb-2">Danger Zone</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Removing a team member will revoke their access immediately. This action cannot be undone.
                </p>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  className="rounded-full"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove Team Member
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}