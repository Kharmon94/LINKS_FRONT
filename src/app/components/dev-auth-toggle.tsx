import { useAuth } from '../contexts/auth-context';
import { Shield, ShieldOff } from 'lucide-react';

/**
 * Development-only authentication toggle
 * Shows a floating button to quickly switch between authenticated/unauthenticated states
 * Only visible when backend is not connected
 */
export function DevAuthToggle() {
  const { isAuthenticated, checkAuth } = useAuth();

  // Only show in development when API isn't available
  const isDevelopment = import.meta.env.DEV;
  
  if (!isDevelopment) return null;

  const handleToggle = () => {
    const currentState = localStorage.getItem('dev_auth_state');
    
    if (currentState === 'authenticated') {
      localStorage.removeItem('dev_auth_state');
    } else {
      localStorage.setItem('dev_auth_state', 'authenticated');
    }
    
    // Trigger auth check to update state
    checkAuth();
  };

  return (
    <div className="fixed bottom-4 right-4 z-[200]">
      <button
        onClick={handleToggle}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-full shadow-lg
          transition-all hover:scale-105
          ${isAuthenticated 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
          }
        `}
        title={isAuthenticated ? 'Click to log out (dev)' : 'Click to log in (dev)'}
      >
        {isAuthenticated ? (
          <>
            <Shield className="w-4 h-4" />
            <span className="text-xs font-medium">Authenticated</span>
          </>
        ) : (
          <>
            <ShieldOff className="w-4 h-4" />
            <span className="text-xs font-medium">Not Authenticated</span>
          </>
        )}
      </button>
      <p className="text-[10px] text-center mt-1 text-muted-foreground">
        Dev Mode
      </p>
    </div>
  );
}
