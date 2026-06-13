import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { AppLayout } from '../components/app-layout';
import { FeatureGate } from '../components/feature-gate';
import { usePermissions } from '@/hooks/use-permissions';
import { useLiveRefresh } from '@/hooks/use-live-refresh';
import { ANALYTICS_POLL_INTERVAL_MS } from '../config/analytics-refresh';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import {
  ArrowLeft,
  Save,
  Trash2,
  Users,
  Mail,
  Calendar,
  Shield,
  Link2,
  MousePointerClick,
  FolderKanban,
  Briefcase,
  Globe,
} from 'lucide-react';
import {
  getTeamMember,
  getTeamMemberClicks,
  updateTeamMember,
  removeTeamMember,
  type TeamMemberDetailJson,
  type MemberClickJson,
} from '@/services/team-api';
import { ApiError } from '@/services/api';
import { toast } from 'sonner';

export function TeamMemberDetailPage() {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const { can } = usePermissions();
  const [member, setMember] = useState<TeamMemberDetailJson | null>(null);
  const [role, setRole] = useState<'owner' | 'admin' | 'member'>('member');
  const [recentClicks, setRecentClicks] = useState<MemberClickJson[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadMemberData = useCallback(
    async ({ silent }: { silent: boolean }) => {
      if (!memberId) return;
      if (!silent) setLoading(true);
      try {
        const [detail, clicks] = await Promise.all([
          getTeamMember(memberId),
          getTeamMemberClicks(memberId),
        ]);
        setMember(detail);
        setRole(detail.role);
        setRecentClicks(clicks);
      } catch {
        if (!silent) setMember(null);
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [memberId],
  );

  const { refreshNow } = useLiveRefresh(loadMemberData, {
    intervalMs: ANALYTICS_POLL_INTERVAL_MS,
    enabled: !!memberId,
  });

  const prevMemberIdRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (!memberId) return;
    if (prevMemberIdRef.current !== undefined && prevMemberIdRef.current !== memberId) {
      setMember(null);
      setRecentClicks([]);
      void refreshNow();
    }
    prevMemberIdRef.current = memberId;
  }, [memberId, refreshNow]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberId || !can.manageTeam) return;
    setSaving(true);
    try {
      const updated = await updateTeamMember(memberId, { role });
      setMember(updated);
      toast.success('Team member updated');
      navigate('/team');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not update member');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!memberId || !can.removeTeamMember) return;
    if (!confirm('Are you sure you want to remove this team member? This action cannot be undone.')) {
      return;
    }
    try {
      await removeTeamMember(memberId);
      toast.success('Team member removed');
      navigate('/team');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not remove member');
    }
  };

  const getRoleBadgeColor = (memberRole: string) => {
    switch (memberRole) {
      case 'owner':
        return 'bg-primary/10 text-primary';
      case 'admin':
        return 'bg-blue-500/10 text-blue-500';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

  const formatTimestamp = (timestamp: string) =>
    new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  if (loading) {
    return (
      <FeatureGate allowed={can.readTeam} featureName="Team">
        <AppLayout>
          <div className="text-center py-12 text-muted-foreground">Loading member...</div>
        </AppLayout>
      </FeatureGate>
    );
  }

  if (!member) {
    return (
      <FeatureGate allowed={can.readTeam} featureName="Team">
        <AppLayout>
          <div className="text-center py-12 text-muted-foreground">Member not found</div>
        </AppLayout>
      </FeatureGate>
    );
  }

  return (
    <FeatureGate allowed={can.readTeam} featureName="Team">
      <AppLayout>
        <div className="min-h-screen bg-background relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />
          <div className="max-w-4xl mx-auto px-4 py-6 relative">
            <Button variant="ghost" onClick={() => navigate('/team')} className="mb-4 rounded-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Team
            </Button>

            <div className="bg-card/50 backdrop-blur-md shadow-lg rounded-lg p-6 mb-6">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-2xl font-semibold mb-1">{member.name}</h1>
                  <p className="text-muted-foreground flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {member.email}
                  </p>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${getRoleBadgeColor(member.role)}`}>
                  {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <Link2 className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-2xl font-bold">{member.stats.linksCreated}</p>
                  <p className="text-xs text-muted-foreground">Links</p>
                </div>
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <MousePointerClick className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-2xl font-bold">{member.stats.totalClicks.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Clicks</p>
                </div>
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <FolderKanban className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-2xl font-bold">{member.stats.campaigns}</p>
                  <p className="text-xs text-muted-foreground">Campaigns</p>
                </div>
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <Briefcase className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-2xl font-bold">{member.stats.workspaces.length}</p>
                  <p className="text-xs text-muted-foreground">Workspaces</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                <Calendar className="w-4 h-4" />
                Joined {formatDate(member.joinedAt)}
              </div>

              {can.manageTeam && member.role !== 'owner' && (
                <form onSubmit={handleSubmit} className="space-y-4 border-t pt-6">
                  <div>
                    <Label htmlFor="role" className="flex items-center gap-2 mb-2">
                      <Shield className="w-4 h-4" />
                      Role
                    </Label>
                    <Select value={role} onValueChange={(v) => setRole(v as typeof role)}>
                      <SelectTrigger id="role">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="member">Member</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" disabled={saving}>
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </form>
              )}

              {can.removeTeamMember && member.role !== 'owner' && (
                <div className={can.manageTeam ? 'mt-4' : 'border-t pt-6 mt-6'}>
                  <Button type="button" variant="destructive" onClick={handleDelete}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove Member
                  </Button>
                </div>
              )}
            </div>

            <div className="bg-card/50 backdrop-blur-md shadow-lg rounded-lg p-6">
              <h2 className="text-xl mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Recent Clicks
              </h2>
              {recentClicks.length === 0 ? (
                <p className="text-muted-foreground text-center py-6">No recent clicks</p>
              ) : (
                <div className="space-y-3">
                  {recentClicks.map((click) => (
                    <div key={click.id} className="flex justify-between items-center p-3 bg-muted/20 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{click.linkName}</p>
                        <p className="text-xs text-muted-foreground">{click.shortUrl}</p>
                      </div>
                      <div className="text-right text-sm">
                        <p>{formatTimestamp(click.timestamp)}</p>
                        <p className="text-xs text-muted-foreground">{click.location?.trim() || 'Unknown'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </AppLayout>
    </FeatureGate>
  );
}
