import { useEffect, useState } from 'react';
import { X, Link as LinkIcon, FolderKanban, BarChart3 } from 'lucide-react';
import { Button } from './ui/button';
import { getTeamMember, type TeamMemberDetailJson } from '@/services/team-api';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
}

interface TeamMemberDetailsProps {
  member: TeamMember;
  onClose: () => void;
}

export function TeamMemberDetails({ member, onClose }: TeamMemberDetailsProps) {
  const [detail, setDetail] = useState<TeamMemberDetailJson | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getTeamMember(member.id);
        if (!cancelled) setDetail(data);
      } catch {
        if (!cancelled) setDetail(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [member.id]);

  const stats = detail?.stats ?? {
    linksCreated: 0,
    totalClicks: 0,
    campaigns: 0,
    workspaces: [],
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-card border border-border rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-light mb-1">{member.name}</h2>
              <p className="text-sm text-muted-foreground">{member.email}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-card/50 backdrop-blur-xl border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <LinkIcon className="w-4 h-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Total Links</p>
                </div>
                <p className="text-2xl font-bold">{stats.linksCreated}</p>
              </div>
              <div className="bg-card/50 backdrop-blur-xl border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <FolderKanban className="w-4 h-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Campaigns</p>
                </div>
                <p className="text-2xl font-bold">{stats.campaigns}</p>
              </div>
              <div className="bg-card/50 backdrop-blur-xl border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <BarChart3 className="w-4 h-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Total Clicks</p>
                </div>
                <p className="text-2xl font-bold">{stats.totalClicks.toLocaleString()}</p>
              </div>
            </div>

            {stats.workspaces.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Workspaces</h3>
                <div className="flex flex-wrap gap-2">
                  {stats.workspaces.map((name) => (
                    <span key={name} className="text-sm px-3 py-1 bg-muted rounded-full">
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
