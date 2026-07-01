import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import { useWorkspace } from '../contexts/workspace-context';
import { usePermissions } from '@/hooks/use-permissions';
import { useIsMobile } from './ui/use-mobile';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from './ui/sheet';
import { WORKSPACE_PICKER_Z_CLASS } from './nav/nav-utils';

type WorkspaceSwitcherProps = {
  variant?: 'default' | 'compact';
};

export function WorkspaceSwitcher({ variant = 'default' }: WorkspaceSwitcherProps) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { can } = usePermissions();
  const { workspaces, currentWorkspace, loading, switchWorkspace } = useWorkspace();
  const [isOpen, setIsOpen] = useState(false);

  if (!can.readWorkspaces || loading || !currentWorkspace) {
    return null;
  }

  const handleWorkspaceChange = async (workspaceId: string) => {
    setIsOpen(false);
    if (workspaceId === currentWorkspace.publicId) return;
    await switchWorkspace(workspaceId);
  };

  const isCompact = variant === 'compact';

  const triggerButton = (
    <button
      type="button"
      onClick={() => setIsOpen(!isOpen)}
      className={
        isCompact
          ? 'inline-flex items-center gap-2 px-3 py-2 rounded-full bg-muted/50 hover:bg-muted transition-colors max-w-[200px]'
          : 'w-full flex items-center justify-between gap-2 px-4 py-3 bg-muted/50 rounded-full hover:bg-muted transition-colors'
      }
    >
      <div className={`text-left min-w-0 ${isCompact ? '' : 'flex-1'}`}>
        <p className={`truncate ${isCompact ? 'text-xs font-medium' : 'text-sm font-medium'}`}>
          {currentWorkspace.name}
        </p>
        {!isCompact && <p className="text-xs text-muted-foreground">Workspace</p>}
      </div>
      <ChevronsUpDown className="w-4 h-4 text-muted-foreground shrink-0" />
    </button>
  );

  const workspaceList = (
    <>
      {workspaces.map((workspace) => (
        <button
          key={workspace.publicId}
          type="button"
          onClick={() => handleWorkspaceChange(workspace.publicId)}
          className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-sm hover:bg-muted transition-colors text-left ${
            currentWorkspace.publicId === workspace.publicId ? 'bg-muted/70' : ''
          }`}
        >
          <span className="text-sm truncate">{workspace.name}</span>
          {currentWorkspace.publicId === workspace.publicId && (
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
    </>
  );

  if (isMobile) {
    return (
      <div>
        {triggerButton}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetContent
            side="bottom"
            overlayClassName={WORKSPACE_PICKER_Z_CLASS}
            className={`rounded-t-2xl ${WORKSPACE_PICKER_Z_CLASS} pb-[calc(2rem+env(safe-area-inset-bottom,0px))]`}
          >
            <SheetHeader>
              <SheetTitle>Switch workspace</SheetTitle>
            </SheetHeader>
            <div className="mt-2 max-h-[min(50vh,320px)] overflow-y-auto p-2 space-y-1">
              {workspaceList}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    );
  }

  return (
    <div className="relative">
      {triggerButton}

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[120]" onClick={() => setIsOpen(false)} />
          <div
            className={`absolute top-full mt-2 bg-card shadow-lg z-[121] overflow-hidden rounded-lg border border-border/30 ${
              isCompact ? 'right-0 min-w-[220px]' : 'left-0 right-0'
            }`}
          >
            <div className="p-2 space-y-1">{workspaceList}</div>
          </div>
        </>
      )}
    </div>
  );
}
