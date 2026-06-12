import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from './auth-context';
import { setActiveWorkspace } from '@/services/account-api';
import { listWorkspaces, type WorkspaceJson } from '@/services/workspaces-api';
import { ApiError } from '@/services/api';
import { toast } from 'sonner';

interface WorkspaceContextValue {
  workspaces: WorkspaceJson[];
  currentWorkspace: WorkspaceJson | null;
  loading: boolean;
  refreshWorkspaces: () => Promise<void>;
  switchWorkspace: (workspaceId: string) => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextValue | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { user, checkAuth, isAuthenticated } = useAuth();
  const [workspaces, setWorkspaces] = useState<WorkspaceJson[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshWorkspaces = useCallback(async () => {
    if (!isAuthenticated || !user?.permissions?.workspaces?.read) {
      setWorkspaces([]);
      return;
    }
    setLoading(true);
    try {
      const data = await listWorkspaces();
      setWorkspaces(data);
    } catch (e) {
      if (!(e instanceof ApiError && e.status === 403)) {
        setWorkspaces([]);
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.permissions?.workspaces?.read]);

  useEffect(() => {
    refreshWorkspaces();
  }, [refreshWorkspaces, user?.activeWorkspaceId]);

  const currentWorkspace = useMemo(() => {
    if (!workspaces.length) return null;
    if (user?.activeWorkspaceId) {
      return workspaces.find((w) => w.id === user.activeWorkspaceId) || workspaces[0];
    }
    return workspaces[0];
  }, [workspaces, user?.activeWorkspaceId]);

  const switchWorkspace = useCallback(
    async (workspaceId: string) => {
      try {
        await setActiveWorkspace(workspaceId);
        await checkAuth();
        toast.success('Workspace switched');
      } catch (e) {
        toast.error(e instanceof ApiError ? e.message : 'Could not switch workspace');
      }
    },
    [checkAuth]
  );

  const value = useMemo(
    () => ({
      workspaces,
      currentWorkspace,
      loading,
      refreshWorkspaces,
      switchWorkspace,
    }),
    [workspaces, currentWorkspace, loading, refreshWorkspaces, switchWorkspace]
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspace must be used within WorkspaceProvider');
  return ctx;
}
