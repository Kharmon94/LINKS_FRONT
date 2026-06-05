import { type ReactNode } from 'react';
import { Link } from 'react-router';
import { Construction } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../ui/breadcrumb';

export interface BreadcrumbItemDef {
  label: string;
  href?: string;
}

interface AdminPlaceholderProps {
  title: string;
  description: string;
  icon?: ReactNode;
  items?: string[];
  breadcrumbs?: BreadcrumbItemDef[];
}

export function AdminPlaceholder({
  title,
  description,
  icon,
  items = [],
  breadcrumbs = [{ label: 'Admin', href: '/admin/overview' }],
}: AdminPlaceholderProps) {
  return (
    <div className="space-y-6">
      {breadcrumbs.length > 0 && (
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((crumb, i) => (
              <BreadcrumbItem key={`${crumb.label}-${i}`}>
                {i > 0 && <BreadcrumbSeparator />}
                {crumb.href && i < breadcrumbs.length - 1 ? (
                  <BreadcrumbLink asChild>
                    <Link to={crumb.href}>{crumb.label}</Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      )}

      <div className="bg-card/50 backdrop-blur-md rounded-lg border border-border/30 p-8 max-w-2xl">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-full bg-muted">
            {icon ?? <Construction className="w-6 h-6 text-muted-foreground" />}
          </div>
          <div>
            <h1 className="text-2xl font-semibold mb-2">{title}</h1>
            <p className="text-muted-foreground mb-6">{description}</p>
            {items.length > 0 && (
              <ul className="space-y-2 text-sm text-muted-foreground">
                {items.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
