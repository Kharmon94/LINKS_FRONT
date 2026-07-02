import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { PwaOnboardingGate } from './pwa-onboarding-gate';

const usePwaInstallMock = vi.fn();

vi.mock('../contexts/pwa-install-context', () => ({
  usePwaInstall: () => usePwaInstallMock(),
}));

function renderGate(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route
          path="*"
          element={
            <PwaOnboardingGate>
              <div>App content</div>
            </PwaOnboardingGate>
          }
        />
        <Route path="/pwa/onboarding" element={<div>Onboarding page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('PwaOnboardingGate', () => {
  beforeEach(() => {
    localStorage.clear();
    usePwaInstallMock.mockReset();
  });

  it('renders children when not in standalone mode', () => {
    usePwaInstallMock.mockReturnValue({ isStandalone: false });
    renderGate('/links');
    expect(screen.getByText('App content')).toBeInTheDocument();
  });

  it('renders children when standalone and onboarding is complete', () => {
    localStorage.setItem('pwa_onboarding_completed', '1');
    usePwaInstallMock.mockReturnValue({ isStandalone: true });
    renderGate('/links');
    expect(screen.getByText('App content')).toBeInTheDocument();
  });

  it('redirects standalone users to onboarding when not complete', () => {
    usePwaInstallMock.mockReturnValue({ isStandalone: true });
    render(
      <MemoryRouter initialEntries={['/links']}>
        <Routes>
          <Route
            path="/links"
            element={
              <PwaOnboardingGate>
                <div>App content</div>
              </PwaOnboardingGate>
            }
          />
          <Route path="/pwa/onboarding" element={<div>Onboarding page</div>} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText('Onboarding page')).toBeInTheDocument();
    expect(screen.queryByText('App content')).not.toBeInTheDocument();
  });

  it('allows standalone users already on onboarding route', () => {
    usePwaInstallMock.mockReturnValue({ isStandalone: true });
    render(
      <MemoryRouter initialEntries={['/pwa/onboarding']}>
        <Routes>
          <Route
            path="/pwa/onboarding"
            element={
              <PwaOnboardingGate>
                <div>Onboarding page</div>
              </PwaOnboardingGate>
            }
          />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText('Onboarding page')).toBeInTheDocument();
  });
});
