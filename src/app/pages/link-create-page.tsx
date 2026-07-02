import { useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { AppLayout } from '../components/app-layout';
import { FeatureGate, RequirePermission } from '../components/feature-gate';
import { usePermissions } from '@/hooks/use-permissions';
import { Button } from '../components/ui/button';
import { LinkCreatorForm } from '../components/link-creator-form';
import { linkPath } from '@/lib/resource-paths';

export function LinkCreatePage() {
  const navigate = useNavigate();
  const { can } = usePermissions();

  return (
    <FeatureGate allowed={can.createLinks} featureName="Links">
      <RequirePermission allowed={can.createLinks}>
        <AppLayout>
          <div className="min-h-screen bg-background relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />

            <div className="px-4 py-8 max-w-2xl mx-auto relative">
              <div className="mb-8">
                <Button variant="ghost" onClick={() => navigate('/links')} className="mb-6">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Links
                </Button>

                <h1 className="text-[32px] text-center mb-2">Create Link</h1>
                <p className="text-muted-foreground text-center">
                  Shorten a URL or set up a randomizer link
                </p>
              </div>

              <LinkCreatorForm
                idPrefix="link-create-page"
                onCreated={(link) => navigate(linkPath(link))}
              />
            </div>
          </div>
        </AppLayout>
      </RequirePermission>
    </FeatureGate>
  );
}
