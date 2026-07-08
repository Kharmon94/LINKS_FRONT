import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AppLayout } from '../components/app-layout';
import { FeatureGate } from '../components/feature-gate';
import { usePermissions } from '@/hooks/use-permissions';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Users, Mail, Clock } from 'lucide-react';
import {
  getTeam,
  inviteTeamMember,
  type TeamMemberJson,
  type TeamInvitationJson,
} from '@/services/team-api';
import { ApiError } from '@/services/api';

export function TeamPage() {
  const { can } = usePermissions();
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'member' | 'admin'>('member');
  const [members, setMembers] = useState<TeamMemberJson[]>([]);
  const [invitations, setInvitations] = useState<TeamInvitationJson[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);

  const loadTeam = useCallback(async () => {
    const data = await getTeam();
    setMembers(data.members);
    setInvitations(data.invitations);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await loadTeam();
      } catch {
        if (!cancelled) {
          setMembers([]);
          setInvitations([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadTeam]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!can.inviteTeam) return;
    setInviting(true);
    try {
      await inviteTeamMember(inviteEmail.trim(), inviteRole);
      toast.success(`Invitation sent to ${inviteEmail}`);
      setInviteEmail('');
      setInviteRole('member');
      await loadTeam();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not send invitation');
    } finally {
      setInviting(false);
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

  const formatExpiry = (expiresAt?: string) => {
    if (!expiresAt) return 'No expiry';
    return new Date(expiresAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <FeatureGate allowed={can.readTeam} featureName="Team">
      <AppLayout>
        <div className="min-h-screen bg-background relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />

          <div className="max-w-4xl mx-auto px-4 py-6 relative">
            <div className="mb-6">
              <h1 className="mb-2 text-center text-[36px]">Team</h1>
              <p className="text-sm text-muted-foreground text-center">
                Manage your team members and their permissions
              </p>
            </div>

            {can.inviteTeam && (
              <div className="bg-card/50 backdrop-blur-md shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)] p-5 mb-6">
                <h2 className="mb-4 text-center font-light text-[20px]">Invite Team Member</h2>
                <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <Input
                      type="email"
                      placeholder="email@example.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      required
                      className="h-10 rounded-full bg-muted border-0 focus:ring-0 focus:outline-none"
                    />
                  </div>
                  <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as typeof inviteRole)}>
                    <SelectTrigger className="h-10 w-full sm:w-[140px] rounded-full bg-muted border-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    type="submit"
                    disabled={inviting}
                    className="h-10 rounded-full bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    {inviting ? 'Sending...' : 'Send Invite'}
                  </Button>
                </form>
              </div>
            )}

            <div className="mb-6">
              <h2 className="text-xl mb-4 text-center">Team Members</h2>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading team...</div>
              ) : members.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No team members yet</div>
              ) : (
                <div className="space-y-3">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="bg-card/50 backdrop-blur-md shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)] p-4"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                            <Users className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm mb-0.5 truncate">{member.name}</h3>
                            <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                          </div>
                        </div>
                        <span
                          className={`text-xs px-3 py-1 rounded-full font-medium ${getRoleBadgeColor(member.role)}`}
                        >
                          {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {!loading && invitations.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl mb-4 text-center">Pending Invitations</h2>
                <div className="space-y-3">
                  {invitations.map((invitation) => (
                    <div
                      key={invitation.id}
                      className="bg-card/50 backdrop-blur-md shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)] p-4"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center shrink-0">
                            <Mail className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm mb-0.5 truncate">{invitation.email}</h3>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Expires {formatExpiry(invitation.expiresAt)}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`text-xs px-3 py-1 rounded-full font-medium ${getRoleBadgeColor(invitation.role)}`}
                        >
                          {invitation.role.charAt(0).toUpperCase() + invitation.role.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card/50 backdrop-blur-md shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)] p-4">
                <p className="text-xs text-muted-foreground mb-1 text-center">Total Members</p>
                <p className="text-3xl text-center">{members.length}</p>
              </div>
              <div className="bg-card/50 backdrop-blur-md shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)] p-4">
                <p className="text-xs text-muted-foreground mb-1 text-center">Pending Invites</p>
                <p className="text-3xl text-center">{invitations.length}</p>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    </FeatureGate>
  );
}
