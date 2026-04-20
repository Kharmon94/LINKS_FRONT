import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { AppLayout } from '../components/app-layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ArrowLeft, Users, Plus, Trash2, UserMinus, Edit2, Save, Briefcase } from 'lucide-react';

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

export function WorkspaceDetailPage() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingMember, setIsAddingMember] = useState(false);
  
  // Mock data - replace with API call to Rails backend
  const [workspace, setWorkspace] = useState<Workspace>({
    id: workspaceId || '1',
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
  });

  const [editedName, setEditedName] = useState(workspace.name);
  const [editedDescription, setEditedDescription] = useState(workspace.description);
  const [workspaceMembers, setWorkspaceMembers] = useState(workspace.members);

  // All available team members for adding to workspaces
  const allTeamMembers: TeamMember[] = [
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
  ];

  // Get team members not in this workspace
  const availableMembers = allTeamMembers.filter(
    member => !workspaceMembers.some(wm => wm.id === member.id)
  );

  const handleSaveEdit = () => {
    // TODO: Replace with actual API call to Rails backend
    setWorkspace({
      ...workspace,
      name: editedName,
      description: editedDescription,
      members: workspaceMembers,
    });
    setIsEditing(false);
    alert('Workspace updated successfully!');
  };

  const handleAddMember = (member: TeamMember) => {
    // TODO: Replace with actual API call to Rails backend
    const updatedMembers = [...workspaceMembers, member];
    setWorkspaceMembers(updatedMembers);
    setWorkspace({
      ...workspace,
      members: updatedMembers,
    });
    setIsAddingMember(false);
    alert('Member added successfully!');
  };

  const handleRemoveMember = (memberId: string) => {
    // Prevent removing the owner
    const memberToRemove = workspaceMembers.find(m => m.id === memberId);
    if (memberToRemove?.role === 'owner') {
      alert('Cannot remove the workspace owner');
      return;
    }

    if (confirm('Are you sure you want to remove this member from the workspace?')) {
      // TODO: Replace with actual API call to Rails backend
      const updatedMembers = workspaceMembers.filter(m => m.id !== memberId);
      setWorkspaceMembers(updatedMembers);
      setWorkspace({
        ...workspace,
        members: updatedMembers,
      });
      alert('Member removed successfully!');
    }
  };

  const handleDeleteWorkspace = () => {
    if (confirm('Are you sure you want to delete this workspace? This action cannot be undone.')) {
      // TODO: Replace with actual API call to Rails backend
      alert('Workspace deleted successfully');
      navigate('/workspaces');
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

  return (
    <AppLayout>
      <div className="min-h-screen bg-background relative">
        {/* Subtle background pattern for glass effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-4 py-6 relative">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate('/workspaces')}
            className="mb-4 rounded-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Workspaces
          </Button>

          {/* Header */}
          <div className="mb-6">
            <h1 className="mb-2 text-center text-[36px]">Workspace Details</h1>
            <p className="text-sm text-muted-foreground text-center">
              Manage workspace settings and team member access
            </p>
          </div>

          {/* Workspace Info */}
          <div className="bg-card/50 backdrop-blur-md shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)] rounded-lg p-6 mb-6">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label htmlFor="edit-name" className="block font-medium mb-1.5 text-[15px]">
                    Workspace Name
                  </label>
                  <Input
                    id="edit-name"
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="h-10 rounded-full bg-muted border-0 focus:ring-0 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="edit-description" className="block font-medium mb-1.5 text-[15px]">
                    Description
                  </label>
                  <Input
                    id="edit-description"
                    type="text"
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    className="h-10 rounded-full bg-muted border-0 focus:ring-0 focus:outline-none"
                  />
                </div>
                <div className="flex gap-3">
                  <Button 
                    onClick={handleSaveEdit}
                    className="flex-1 h-10 rounded-full bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setEditedName(workspace.name);
                      setEditedDescription(workspace.description);
                    }}
                    className="flex-1 h-10 rounded-full"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Workspace Icon */}
                <div className="flex justify-center mb-3">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <Briefcase className="w-8 h-8 text-primary" />
                  </div>
                </div>

                <div>
                  <h2 className="text-[24px] font-semibold mb-2 text-center">{workspace.name}</h2>
                  <p className="text-sm text-muted-foreground text-center">{workspace.description}</p>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-muted/30 rounded p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Members</p>
                    <p className="text-2xl">{workspaceMembers.length}</p>
                  </div>
                  <div className="bg-muted/30 rounded p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Links</p>
                    <p className="text-2xl">{workspace.linksCount}</p>
                  </div>
                  <div className="bg-muted/30 rounded p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Campaigns</p>
                    <p className="text-2xl">{workspace.campaignsCount}</p>
                  </div>
                </div>
                
                <Button 
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  className="w-full h-10 rounded-full"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit Workspace
                </Button>
              </div>
            )}
          </div>

          {/* Team Members Section */}
          <div className="bg-card/50 backdrop-blur-md shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)] rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[20px] font-semibold">Team Members ({workspaceMembers.length})</h3>
              <Button 
                onClick={() => setIsAddingMember(!isAddingMember)}
                size="sm"
                className="h-9 rounded-full bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Member
              </Button>
            </div>

            {/* Add Member Section */}
            {isAddingMember && (
              <div className="bg-muted/30 rounded-lg p-4 mb-4">
                <h4 className="text-sm font-medium mb-3">Available Team Members</h4>
                {availableMembers.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {availableMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-3 bg-background/50 rounded hover:bg-background/70 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                            <Users className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{member.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleAddMember(member)}
                          className="h-8 rounded-full bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90 shrink-0"
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    All team members are already in this workspace
                  </p>
                )}
              </div>
            )}

            {/* Current Members List */}
            <div className="space-y-2">
              {workspaceMembers.map((member) => (
                <div
                  key={member.id}
                  className="bg-muted/30 rounded-lg p-4 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm mb-0.5 truncate">{member.name}</h4>
                      <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-medium ${getRoleBadgeColor(
                        member.role
                      )}`}
                    >
                      {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                    </span>
                    {member.role !== 'owner' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveMember(member.id)}
                        className="h-8 w-8 p-0 rounded-full hover:bg-destructive/10 hover:text-destructive"
                      >
                        <UserMinus className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-6">
            <h3 className="text-[20px] font-semibold mb-2 text-destructive">Danger Zone</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Deleting a workspace will remove all associated links and campaigns. This action cannot be undone.
            </p>
            <Button 
              variant="destructive"
              onClick={handleDeleteWorkspace}
              className="h-10 rounded-full"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Workspace
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
