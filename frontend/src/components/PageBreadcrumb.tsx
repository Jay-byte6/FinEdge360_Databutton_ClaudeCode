import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/extensions/shadcn/components/breadcrumb';

export interface BreadcrumbItem {
  label: string;
  path?: string; // If path is not provided, it's the current page
}

interface PageBreadcrumbProps {
  items: BreadcrumbItem[];
}

/**
 * PageBreadcrumb - A reusable breadcrumb component for navigation
 *
 * Usage example:
 * <PageBreadcrumb
 *   items={[
 *     { label: 'Home', path: '/' },
 *     { label: 'Dashboard', path: '/dashboard' },
 *     { label: 'Portfolio' }  // Current page, no path
 *   ]}
 * />
 */
const PageBreadcrumb: React.FC<PageBreadcrumbProps> = ({ items }) => {
  const navigate = useNavigate();

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="mb-4">
      <Breadcrumb>
        <BreadcrumbList>
          {items.map((item, index) => {
            const isLast = index === items.length - 1;

            return (
              <React.Fragment key={index}>
                <BreadcrumbItem>
                  {isLast || !item.path ? (
                    // Current page - not clickable
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  ) : (
                    // Clickable link
                    <BreadcrumbLink
                      className="cursor-pointer"
                      onClick={() => item.path && navigate(item.path)}
                    >
                      {item.label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!isLast && <BreadcrumbSeparator />}
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};

export default PageBreadcrumb;
