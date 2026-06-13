import { useState } from 'react';
import { useNavigate } from 'react-router';
import { AppLayout } from '../components/app-layout';
import { FeatureGate } from '../components/feature-gate';
import { usePermissions } from '@/hooks/use-permissions';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Briefcase, Plus, Users, Link as LinkIcon, Lock } from 'lucide-react';
import { useWorkspace } from '../contexts/workspace-context';
import { createWorkspace } from '@/services/workspaces-api';
import { ApiError } from '@/services/api';
import { toast } from 'sonner';

export function WorkspacesPage() {
  const navigate = useNavigate();
  const { workspaces, loading, refreshWorkspaces, switchWorkspace } = useWorkspace();
  const { can } = usePermissions();
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [newWorkspaceDescription, setNewWorkspaceDescription] = useState('');
  const [creating, setCreating] = useState(false);

  const canCreateWorkspace = can.createWorkspaces;

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const created = await createWorkspace({
        name: newWorkspaceName.trim(),
        description: newWorkspaceDescription.trim(),
      });
      await refreshWorkspaces();
      await switchWorkspace(created.id, { silent: true });
      setNewWorkspaceName('');
      setNewWorkspaceDescription('');
      setIsCreatingWorkspace(false);
      toast.success('Workspace created');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not create workspace');
    } finally {
      setCreating(false);
    }
  };

  const totalLinks = workspaces.reduce((sum, ws) => sum + ws.linksCount, 0);
  const totalCampaigns = workspaces.reduce((sum, ws) => sum + ws.campaignsCount, 0);

  return (
    <FeatureGate allowed={can.readWorkspaces} featureName="Workspaces">
      <AppLayout>
        <div className="min-h-screen bg-background relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />

          <div className="max-w-6xl mx-auto px-4 py-6 relative">
            <div className="mb-6">
              <h1 className="mb-2 text-center text-[36px]">Workspaces</h1>
              <p className="text-sm text-muted-foreground text-center">
                Organize your links and campaigns into workspaces and control team access
              </p>
            </div>

            {canCreateWorkspace ? (
              <div className="mb-6 flex justify-center">
                <Button
                  onClick={() => setIsCreatingWorkspace(true)}
                  className="h-10 rounded-full bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Workspace
                </Button>
              </div>
            ) : (
              <div className="mb-6 flex justify-center items-center gap-2 text-sm text-muted-foreground">
                <Lock className="w-4 h-4" />
                Only owners and admins can create workspaces
              </div>
            )}

            {isCreatingWorkspace && (
              <div className="bg-card/50 backdrop-blur-md shadow-lg p-6 mb-6 max-w-lg mx-auto">
                <h2 className="text-lg mb-4 text-center">New Workspace</h2>
                <form onSubmit={handleCreateWorkspace} className="space-y-4">
                  <Input
                    placeholder="Workspace name"
                    value={newWorkspaceName}
                    onChange={(e) => setNewWorkspaceName(e.target.value)}
                    required
                  />
                  <Input
                    placeholder="Description (optional)"
                    value={newWorkspaceDescription}
                    onChange={(e) => setNewWorkspaceDescription(e.target.value)}
                  />
                  <div className="flex gap-3 justify-center">
                    <Button type="submit" disabled={creating}>
                      {creating ? 'Creating...' : 'Create'}
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => setIsCreatingWorkspace(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading workspaces...</div>
            ) : workspaces.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No workspaces yet</div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {workspaces.map((workspace) => (
                  <div
                    key={workspace.id}
                    onClick={() => navigate(`/workspaces/${workspace.id}`)}
                    className="bg-card/50 backdrop-blur-md shadow-lg p-5 cursor-pointer hover:bg-card/70 transition-all"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <Briefcase className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold truncate">{workspace.name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {workspace.description || 'No description'}
                    </p>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {workspace.members?.length ?? 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <LinkIcon className="w-3 h-3" />
                        {workspace.linksCount}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-card/50 backdrop-blur-md p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">Workspaces</p>
                <p className="text-3xl">{workspaces.length}</p>
              </div>
              <div className="bg-card/50 backdrop-blur-md p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">Total Links</p>
                <p className="text-3xl">{totalLinks}</p>
              </div>
              <div className="bg-card/50 backdrop-blur-md p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">Campaigns</p>
                <p className="text-3xl">{totalCampaigns}</p>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    </FeatureGate>
  );
}
