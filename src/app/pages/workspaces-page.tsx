import { useState } from 'react';
import { useNavigate } from 'react-router';
import { AppLayout } from '../components/app-layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Briefcase, Plus, Users, Link as LinkIcon, Lock } from 'lucide-react';
import { useAuth } from '../contexts/auth-context';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member';
}

interface Workspace {
  id: string;
  name: string;
  description: string;
  members: TeamMember[];
  linksCount: number;
  campaignsCount: number;
  createdAt: string;
}

export function WorkspacesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [newWorkspaceDescription, setNewWorkspaceDescription] = useState('');
  
  // Check if user can create workspaces (only owner and admin)
  const canCreateWorkspace = user?.role === 'owner' || user?.role === 'admin';

  // Mock data - replace with API call to Rails backend
  const [workspaces, setWorkspaces] = useState<Workspace[]>([
    {
      id: '1',
      name: 'Marketing Team',
      description: 'All marketing campaigns and promotional links',
      members: [
        {
          id: '1',
          name: 'Developer',
          email: 'dev@example.com',
          role: 'owner',
        },
        {
          id: '2',
          name: 'John Smith',
          email: 'john@example.com',
          role: 'admin',
        },
        {
          id: '3',
          name: 'Jane Doe',
          email: 'jane@example.com',
          role: 'member',
        },
      ],
      linksCount: 24,
      campaignsCount: 5,
      createdAt: '2026-01-15',
    },
    {
      id: '2',
      name: 'Sales Team',
      description: 'Customer outreach and sales materials',
      members: [
        {
          id: '1',
          name: 'Developer',
          email: 'dev@example.com',
          role: 'owner',
        },
        {
          id: '2',
          name: 'John Smith',
          email: 'john@example.com',
          role: 'member',
        },
      ],
      linksCount: 18,
      campaignsCount: 3,
      createdAt: '2026-02-01',
    },
    {
      id: '3',
      name: 'Product Team',
      description: 'Product launches and feature announcements',
      members: [
        {
          id: '1',
          name: 'Developer',
          email: 'dev@example.com',
          role: 'owner',
        },
      ],
      linksCount: 12,
      campaignsCount: 2,
      createdAt: '2026-02-20',
    },
  ]);

  // All available team members for adding to workspaces
  const [allTeamMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'Developer',
      email: 'dev@example.com',
      role: 'owner',
    },
    {
      id: '2',
      name: 'John Smith',
      email: 'john@example.com',
      role: 'admin',
    },
    {
      id: '3',
      name: 'Jane Doe',
      email: 'jane@example.com',
      role: 'member',
    },
    {
      id: '4',
      name: 'Alice Johnson',
      email: 'alice@example.com',
      role: 'member',
    },
  ]);

  const handleCreateWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    
    // TODO: Replace with actual API call to Rails backend
    const newWorkspace: Workspace = {
      id: String(Date.now()),
      name: newWorkspaceName,
      description: newWorkspaceDescription,
      members: [
        {
          id: '1',
          name: 'Developer',
          email: 'dev@example.com',
          role: 'owner',
        },
      ],
      linksCount: 0,
      campaignsCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    
    setWorkspaces([...workspaces, newWorkspace]);
    setNewWorkspaceName('');
    setNewWorkspaceDescription('');
    setIsCreatingWorkspace(false);
    alert('Workspace created successfully!');
  };

  // Filter workspaces to only show those the current user is a member of
  const userWorkspaces = workspaces.filter(workspace => 
    workspace.members.some(member => member.email === user?.email)
  );

  // Calculate stats based on user's workspaces only
  const totalWorkspaces = userWorkspaces.length;
  const totalLinks = userWorkspaces.reduce((sum, ws) => sum + ws.linksCount, 0);
  const totalCampaigns = userWorkspaces.reduce((sum, ws) => sum + ws.campaignsCount, 0);

  return (
    <AppLayout>
      <div className="min-h-screen bg-background relative">
        {/* Subtle background pattern for glass effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />
        
        <div className="max-w-6xl mx-auto px-4 py-6 relative">
          {/* Header */}
          <div className="mb-6">
            <h1 className="mb-2 text-center text-[36px]">Workspaces</h1>
            <p className="text-sm text-muted-foreground text-center">
              Organize your links and campaigns into workspaces and control team access
            </p>
          </div>

          {/* Create Workspace Button */}
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
            <div className="mb-6 flex justify-center">
              <div className="bg-muted/50 backdrop-blur-md rounded-lg px-4 py-3 flex items-center gap-2 text-sm text-muted-foreground">
                <Lock className="w-4 h-4" />
                <span>Only admins and owners can create workspaces</span>
              </div>
            </div>
          )}

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-card/50 backdrop-blur-md shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)] rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-1 text-center">Total Workspaces</p>
              <p className="text-3xl text-center">{totalWorkspaces}</p>
            </div>
            <div className="bg-card/50 backdrop-blur-md shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)] rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-1 text-center">Total Links</p>
              <p className="text-3xl text-center">
                {totalLinks}
              </p>
            </div>
            <div className="bg-card/50 backdrop-blur-md shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)] rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-1 text-center">Total Campaigns</p>
              <p className="text-3xl text-center">
                {totalCampaigns}
              </p>
            </div>
          </div>

          {/* Create Workspace Form */}
          {isCreatingWorkspace && (
            <div className="bg-card/50 backdrop-blur-md shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)] rounded-lg p-5 mb-6">
              <h2 className="mb-4 text-center font-light text-[20px]">Create New Workspace</h2>
              <form onSubmit={handleCreateWorkspace} className="space-y-4">
                <div>
                  <label htmlFor="workspace-name" className="block font-medium mb-1.5 text-[15px]">
                    Workspace Name
                  </label>
                  <Input
                    id="workspace-name"
                    type="text"
                    placeholder="e.g., Marketing Team"
                    value={newWorkspaceName}
                    onChange={(e) => setNewWorkspaceName(e.target.value)}
                    required
                    className="h-10 rounded-full bg-muted border-0 focus:ring-0 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="workspace-description" className="block font-medium mb-1.5 text-[15px]">
                    Description
                  </label>
                  <Input
                    id="workspace-description"
                    type="text"
                    placeholder="Brief description of this workspace"
                    value={newWorkspaceDescription}
                    onChange={(e) => setNewWorkspaceDescription(e.target.value)}
                    required
                    className="h-10 rounded-full bg-muted border-0 focus:ring-0 focus:outline-none"
                  />
                </div>
                <div className="flex gap-3">
                  <Button 
                    type="submit" 
                    className="flex-1 h-10 rounded-full bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90"
                  >
                    Create Workspace
                  </Button>
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCreatingWorkspace(false);
                      setNewWorkspaceName('');
                      setNewWorkspaceDescription('');
                    }}
                    className="flex-1 h-10 rounded-full"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Workspaces Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {userWorkspaces.map((workspace) => (
              <div
                key={workspace.id}
                onClick={() => navigate(`/workspaces/${workspace.id}`)}
                className="bg-card/50 backdrop-blur-md shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)] rounded-lg p-5 cursor-pointer hover:bg-card/70 transition-all"
              >
                {/* Workspace Icon */}
                <div className="flex justify-center mb-3">
                  
                </div>

                {/* Workspace Name */}
                <h3 className="font-semibold text-[18px] mb-2 text-center">
                  {workspace.name}
                </h3>

                {/* Description */}
                <p className="text-xs text-muted-foreground mb-4 text-center line-clamp-2 min-h-[32px]">
                  {workspace.description}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="bg-muted/30 rounded p-2 text-center">
                    <Users className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-xs font-medium">{workspace.members.length}</p>
                  </div>
                  <div className="bg-muted/30 rounded p-2 text-center">
                    <LinkIcon className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-xs font-medium">{workspace.linksCount}</p>
                  </div>
                  <div className="bg-muted/30 rounded p-2 text-center">
                    <Briefcase className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-xs font-medium">{workspace.campaignsCount}</p>
                  </div>
                </div>

                {/* Member Avatars */}
                <div className="flex justify-center items-center gap-1">
                  {workspace.members.slice(0, 3).map((member, index) => (
                    <div
                      key={member.id}
                      className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-[10px] font-medium border-2 border-background"
                      style={{ marginLeft: index > 0 ? '-8px' : '0' }}
                      title={member.name}
                    >
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                  ))}
                  {workspace.members.length > 3 && (
                    <div
                      className="w-6 h-6 bg-muted/50 rounded-full flex items-center justify-center text-[10px] font-medium border-2 border-background"
                      style={{ marginLeft: '-8px' }}
                    >
                      +{workspace.members.length - 3}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}