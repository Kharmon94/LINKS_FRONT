import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { isNumericId } from '@/lib/resource-paths';

export function usePublicIdRedirect(
  routeParam: string | undefined,
  resource: { publicId: string } | null | undefined,
  buildPath: (resource: { publicId: string }) => string
) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!routeParam || !resource?.publicId) return;
    if (!isNumericId(routeParam)) return;
    if (routeParam === resource.publicId) return;

    navigate(buildPath(resource), { replace: true });
  }, [routeParam, resource, buildPath, navigate]);
}
