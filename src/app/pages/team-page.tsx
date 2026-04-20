import { useState } from 'react';
import { useNavigate } from 'react-router';
import { AppLayout } from '../components/app-layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Users, Mail, Plus, Trash2 } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
}

export function TeamPage() {
  const navigate = useNavigate();
  const [inviteEmail, setInviteEmail] = useState('');
  
  // Mock data - replace with API call to Rails backend
  const [members] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'Developer',
      email: 'dev@example.com',
      role: 'owner',
      joinedAt: '2026-01-01',
    },
    {
      id: '2',
      name: 'John Smith',
      email: 'john@example.com',
      role: 'admin',
      joinedAt: '2026-02-01',
    },
    {
      id: '3',
      name: 'Jane Doe',
      email: 'jane@example.com',
      role: 'member',
      joinedAt: '2026-02-15',
    },
  ]);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Replace with actual API call to Rails backend
    console.log('Inviting:', inviteEmail);
    alert(`Invitation sent to ${inviteEmail}`);
    setInviteEmail('');
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
          {/* Header */}
          <div className="mb-6">
            <h1 className="mb-2 text-center text-[36px]">Team</h1>
            <p className="text-sm text-muted-foreground text-center">
              Manage your team members and their permissions
            </p>
          </div>

          {/* Invite Section */}
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
              <Button type="submit" className="h-10 rounded-full bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90">
                <Mail className="w-4 h-4 mr-2" />
                Send Invite
              </Button>
            </form>
          </div>

          {/* Team Members List */}
          <div className="mb-6">
            <h2 className="text-xl mb-4 text-center">Team Members</h2>
            <div className="space-y-3">
              {members.map((member) => (
                <div
                  key={member.id}
                  onClick={() => navigate(`/team/${member.id}`)}
                  className="bg-card/50 backdrop-blur-md shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)] p-4 cursor-pointer hover:bg-card/70 transition-all"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm mb-0.5 truncate">
                          {member.name}
                        </h3>
                        <p className="text-xs text-muted-foreground truncate">
                          {member.email}
                        </p>
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
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Team Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card/50 backdrop-blur-md shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)] p-4">
              <p className="text-xs text-muted-foreground mb-1 text-center">Total Members</p>
              <p className="text-3xl text-center">{members.length}</p>
            </div>
            <div className="bg-card/50 backdrop-blur-md shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)] p-4">
              <p className="text-xs text-muted-foreground mb-1 text-center">Admins</p>
              <p className="text-3xl text-center">
                {members.filter(m => m.role === 'admin').length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}