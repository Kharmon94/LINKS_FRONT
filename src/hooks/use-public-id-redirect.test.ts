import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePublicIdRedirect } from './use-public-id-redirect';

const navigate = vi.fn();

vi.mock('react-router', () => ({
  useNavigate: () => navigate,
  useParams: () => ({ linkId: '9' }),
}));

describe('usePublicIdRedirect', () => {
  beforeEach(() => {
    navigate.mockClear();
  });

  it('replaces numeric route params with publicId paths', () => {
    renderHook(() =>
      usePublicIdRedirect('9', { publicId: 'k7x2m9q4a1b2' }, (link) => `/links/${link.publicId}`)
    );

    expect(navigate).toHaveBeenCalledWith('/links/k7x2m9q4a1b2', { replace: true });
  });

  it('does nothing when resource is missing', () => {
    renderHook(() =>
      usePublicIdRedirect('linkId', null, (link) => `/links/${link.publicId}`)
    );

    expect(navigate).not.toHaveBeenCalled();
  });
});
