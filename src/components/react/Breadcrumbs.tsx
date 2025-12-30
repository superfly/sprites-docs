'use client';

import { Fragment } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

type BreadcrumbData = { title: string; href: string };

type SidebarEntry =
  | { type: 'link'; label: string; href: string }
  | { type: 'group'; label: string; entries: SidebarEntry[] };

// Normalize paths to avoid mismatches due to trailing slashes
function normalizePath(path: string) {
  return path.endsWith('/') ? path : `${path}/`;
}

export function findBreadcrumbTrail(
  sidebarEntry: SidebarEntry[],
  targetPath: string,
  includeCurrentPage: boolean,
  trail: BreadcrumbData[] = [],
): BreadcrumbData[] | null {
  const normalizedTarget = normalizePath(targetPath);

  for (const entry of sidebarEntry) {
    if (entry.type === 'link') {
      const normalizedHref = normalizePath(entry.href);
      if (normalizedHref === normalizedTarget) {
        const fullTrail = [...trail, { title: entry.label, href: entry.href }];
        if (includeCurrentPage || fullTrail.length === 1) {
          return fullTrail;
        } else {
          return fullTrail.slice(0, -1);
        }
      }
    } else if (entry.type === 'group') {
      const groupBreadcrumb: BreadcrumbData = { title: entry.label, href: '' };
      const result = findBreadcrumbTrail(
        entry.entries,
        targetPath,
        includeCurrentPage,
        [...trail, groupBreadcrumb],
      );
      if (result) return result;
    }
  }

  return null;
}

export function ContentBreadcrumbs({
  currentPath,
  sidebar,
}: {
  currentPath: string;
  sidebar: SidebarEntry[];
}) {
  const breadcrumbs = findBreadcrumbTrail(sidebar, currentPath, true);

  if (!breadcrumbs || breadcrumbs.length === 0) {
    return null;
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;

          return (
            <Fragment key={crumb.title}>
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
                ) : crumb.href ? (
                  <BreadcrumbLink href={crumb.href}>
                    {crumb.title}
                  </BreadcrumbLink>
                ) : (
                  <span className="text-muted-foreground">{crumb.title}</span>
                )}
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
