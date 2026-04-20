import { useState } from 'react';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';

interface Workspace {
  id: string;
  name: string;
}

export function WorkspaceSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  
  // Mock data - replace with API call to Rails backend
  const [workspaces] = useState<Workspace[]>([
    { id: '1', name: 'Personal Workspace' },
    { id: '2', name: 'Marketing Team' },
    { id: '3', name: 'Development Team' },
  ]);
  
  const [currentWorkspace, setCurrentWorkspace] = useState(workspaces[0]);

  const handleWorkspaceChange = (workspace: Workspace) => {
    setCurrentWorkspace(workspace);
    setIsOpen(false);
    // TODO: Replace with actual API call to switch workspace
    console.log('Switched to workspace:', workspace.name);
  };

  return (
    <div className="relative">
      <button
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
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute top-full left-0 right-0 mt-2 bg-card shadow-lg z-50 overflow-hidden">
            <div className="p-2 space-y-1">
              {workspaces.map((workspace) => (
                <button
                  key={workspace.id}
                  onClick={() => handleWorkspaceChange(workspace)}
                  className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-sm hover:bg-muted transition-colors text-left"
                >
                  <span className="text-sm truncate">{workspace.name}</span>
                  {currentWorkspace.id === workspace.id && (
                    <Check className="w-4 h-4 text-primary shrink-0" />
                  )}
                </button>
              ))}
              
              <div className="h-px bg-border/50 my-2" />
              
              <button className="w-full flex items-center gap-2 px-3 py-2 rounded-sm hover:bg-muted transition-colors text-left text-sm">
                <Plus className="w-4 h-4" />
                Create Workspace
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}