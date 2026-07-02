import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { GuestRoute } from './guest-route';

const useAuthMock = vi.fn();

vi.mock('../contexts/auth-context', () => ({
  useAuth: () => useAuthMock(),
}));

function renderGuestRoute(path: string, respectReturnTo = false) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route
          path="/"
          element={
            <GuestRoute respectReturnTo={respectReturnTo}>
              <div>Guest content</div>
            </GuestRoute>
          }
        />
        <Route path="/auth" element={<div>Auth page</div>} />
        <Route path="/dashboard" element={<div>Dashboard</div>} />
        <Route path="/links" element={<div>Links</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('GuestRoute', () => {
  beforeEach(() => {
    sessionStorage.clear();
    useAuthMock.mockReset();
  });

  it('shows a loader while auth is resolving', () => {
    useAuthMock.mockReturnValue({ isAuthenticated: false, loading: true });
    renderGuestRoute('/');
    expect(screen.queryByText('Guest content')).not.toBeInTheDocument();
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
  });

  it('renders children for unauthenticated users', () => {
    useAuthMock.mockReturnValue({ isAuthenticated: false, loading: false });
    renderGuestRoute('/');
    expect(screen.getByText('Guest content')).toBeInTheDocument();
  });

  it('redirects authenticated users on / to /links', () => {
    useAuthMock.mockReturnValue({ isAuthenticated: true, loading: false });
    renderGuestRoute('/');
    expect(screen.getByText('Links')).toBeInTheDocument();
  });

  it('redirects authenticated users to returnTo when enabled', () => {
    useAuthMock.mockReturnValue({ isAuthenticated: true, loading: false });
    render(
      <MemoryRouter initialEntries={['/auth?returnTo=%2Flinks']}>
        <Routes>
          <Route
            path="/auth"
            element={
              <GuestRoute respectReturnTo>
                <div>Sign in</div>
              </GuestRoute>
            }
          />
          <Route path="/links" element={<div>Links</div>} />
          <Route path="/dashboard" element={<div>Dashboard</div>} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText('Links')).toBeInTheDocument();
  });

  it('redirects authenticated users to post_auth_redirect when enabled', () => {
    sessionStorage.setItem('post_auth_redirect', '/links');
    useAuthMock.mockReturnValue({ isAuthenticated: true, loading: false });
    render(
      <MemoryRouter initialEntries={['/auth']}>
        <Routes>
          <Route
            path="/auth"
            element={
              <GuestRoute respectReturnTo>
                <div>Sign in</div>
              </GuestRoute>
            }
          />
          <Route path="/links" element={<div>Links</div>} />
          <Route path="/dashboard" element={<div>Dashboard</div>} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText('Links')).toBeInTheDocument();
    expect(sessionStorage.getItem('post_auth_redirect')).toBeNull();
  });
});
