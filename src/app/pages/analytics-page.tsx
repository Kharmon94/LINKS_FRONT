import { Navigate, useParams } from 'react-router';

export function AnalyticsPage() {
  const { linkId } = useParams();
  if (!linkId) {
    return <Navigate to="/analytics" replace />;
  }
  return <Navigate to={`/links/${linkId}`} replace />;
}
