import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import { useWorkspace } from '../contexts/workspace-context';
import { usePermissions } from '@/hooks/use-permissions';

export function WorkspaceSwitcher() {
  const navigate = useNavigate();
  const { can } = usePermissions();
  const { workspaces, currentWorkspace, loading, switchWorkspace } = useWorkspace();
  const [isOpen, setIsOpen] = useState(false);

  if (!can.readWorkspaces || loading || !currentWorkspace) {
    return null;
  }

  const handleWorkspaceChange = async (workspaceId: string) => {
    setIsOpen(false);
    if (workspaceId === currentWorkspace.id) return;
    await switchWorkspace(workspaceId);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-muted/50 rounded-full hover:bg-muted transition-colors"
      >
        <div className="flex-1 text-left">
          <p className="text-sm font-medium truncate">{currentWorkspace.name}</p>
          <p className="text-xs text-muted-foreground">Workspace</p>
        </div>
        <ChevronsUpDown className="w-4 h-4 text-muted-foreground shrink-0" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 right-0 mt-2 bg-card shadow-lg z-50 overflow-hidden">
            <div className="p-2 space-y-1">
              {workspaces.map((workspace) => (
                <button
                  key={workspace.id}
                  type="button"
                  onClick={() => handleWorkspaceChange(workspace.id)}
                  className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-sm hover:bg-muted transition-colors text-left"
                >
                  <span className="text-sm truncate">{workspace.name}</span>
                  {currentWorkspace.id === workspace.id && (
                    <Check className="w-4 h-4 text-primary shrink-0" />
                  )}
                </button>
              ))}

              {can.createWorkspaces && (
                <>
                  <div className="h-px bg-border/50 my-2" />
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      navigate('/workspaces');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-sm hover:bg-muted transition-colors text-left text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Create Workspace
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
