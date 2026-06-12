import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { AppLayout } from '../components/app-layout';
import { FeatureGate } from '../components/feature-gate';
import { usePermissions } from '@/hooks/use-permissions';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ArrowLeft, Users, Plus, Trash2, UserMinus, Edit2, Save, Briefcase } from 'lucide-react';
import {
  getWorkspace,
  updateWorkspace,
  deleteWorkspace,
  addWorkspaceMember,
  removeWorkspaceMember,
  type WorkspaceJson,
} from '@/services/workspaces-api';
import { getTeam, type TeamMemberJson } from '@/services/team-api';
import { ApiError } from '@/services/api';
import { toast } from 'sonner';

export function WorkspaceDetailPage() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const { can } = usePermissions();
  const [workspace, setWorkspace] = useState<WorkspaceJson | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMemberJson[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const refresh = async () => {
    if (!workspaceId) return;
    const [ws, team] = await Promise.all([getWorkspace(workspaceId), getTeam()]);
    setWorkspace(ws);
    setEditedName(ws.name);
    setEditedDescription(ws.description);
    setTeamMembers(team.members);
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await refresh();
      } catch {
        if (!cancelled) setWorkspace(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [workspaceId]);

  const workspaceMembers = workspace?.members ?? [];
  const availableMembers = teamMembers.filter(
    (member) => !workspaceMembers.some((wm) => wm.id === member.id)
  );

  const handleSaveEdit = async () => {
    if (!workspaceId) return;
    setSaving(true);
    try {
      const updated = await updateWorkspace(workspaceId, {
        name: editedName,
        description: editedDescription,
      });
      setWorkspace(updated);
      setIsEditing(false);
      toast.success('Workspace updated');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not update workspace');
    } finally {
      setSaving(false);
    }
  };

  const handleAddMember = async (member: TeamMemberJson) => {
    if (!workspaceId) return;
    try {
      const updated = await addWorkspaceMember(workspaceId, member.id);
      setWorkspace(updated);
      setIsAddingMember(false);
      toast.success('Member added');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not add member');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    const memberToRemove = workspaceMembers.find((m) => m.id === memberId);
    if (memberToRemove?.role === 'owner') {
      toast.error('Cannot remove the workspace owner');
      return;
    }
    if (!workspaceId || !confirm('Remove this member from the workspace?')) return;
    try {
      const updated = await removeWorkspaceMember(workspaceId, memberId);
      setWorkspace(updated);
      toast.success('Member removed');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not remove member');
    }
  };

  const handleDeleteWorkspace = async () => {
    if (!workspaceId || !confirm('Delete this workspace? This cannot be undone.')) return;
    try {
      await deleteWorkspace(workspaceId);
      toast.success('Workspace deleted');
      navigate('/workspaces');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not delete workspace');
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

  if (loading) {
    return (
      <FeatureGate allowed={can.readWorkspaces} featureName="Workspaces">
        <AppLayout>
          <div className="text-center py-12 text-muted-foreground">Loading workspace...</div>
        </AppLayout>
      </FeatureGate>
    );
  }

  if (!workspace) {
    return (
      <FeatureGate allowed={can.readWorkspaces} featureName="Workspaces">
        <AppLayout>
          <div className="text-center py-12 text-muted-foreground">Workspace not found</div>
        </AppLayout>
      </FeatureGate>
    );
  }

  return (
    <FeatureGate allowed={can.readWorkspaces} featureName="Workspaces">
      <AppLayout>
        <div className="min-h-screen bg-background relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />
          <div className="max-w-4xl mx-auto px-4 py-6 relative">
            <Button variant="ghost" onClick={() => navigate('/workspaces')} className="mb-4 rounded-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Workspaces
            </Button>

            <div className="bg-card/50 backdrop-blur-md shadow-lg rounded-lg p-6 mb-6">
              {isEditing ? (
                <div className="space-y-4">
                  <Input value={editedName} onChange={(e) => setEditedName(e.target.value)} />
                  <Input
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    placeholder="Description"
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleSaveEdit} disabled={saving}>
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button variant="ghost" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h1 className="text-2xl font-semibold mb-2 flex items-center gap-2">
                      <Briefcase className="w-6 h-6" />
                      {workspace.name}
                    </h1>
                    <p className="text-muted-foreground">{workspace.description || 'No description'}</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {workspace.linksCount} links · {workspace.campaignsCount} campaigns
                    </p>
                  </div>
                  {can.updateWorkspaces && (
                    <Button variant="outline" onClick={() => setIsEditing(true)}>
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  )}
                </div>
              )}
            </div>

            <div className="bg-card/50 backdrop-blur-md shadow-lg rounded-lg p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Members
                </h2>
                {can.updateWorkspaces && (
                  <Button size="sm" onClick={() => setIsAddingMember(!isAddingMember)}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                )}
              </div>

              {isAddingMember && availableMembers.length > 0 && (
                <div className="mb-4 space-y-2">
                  {availableMembers.map((member) => (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => handleAddMember(member)}
                      className="w-full text-left p-3 bg-muted/30 rounded-lg hover:bg-muted/50"
                    >
                      {member.name} ({member.email})
                    </button>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                {workspaceMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${getRoleBadgeColor(member.role)}`}>
                        {member.role}
                      </span>
                      {can.updateWorkspaces && member.role !== 'owner' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMember(member.id)}
                        >
                          <UserMinus className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {can.destroyWorkspaces && (
              <Button variant="destructive" onClick={handleDeleteWorkspace}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Workspace
              </Button>
            )}
          </div>
        </div>
      </AppLayout>
    </FeatureGate>
  );
}
