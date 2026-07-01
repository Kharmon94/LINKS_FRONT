import { Navigate, useParams } from 'react-router';
import { linkPath } from '@/lib/resource-paths';

export function AnalyticsPage() {
  const { linkId } = useParams();
  if (!linkId) {
    return <Navigate to="/analytics" replace />;
  }
  return <Navigate to={linkPath({ publicId: linkId })} replace />;
}
