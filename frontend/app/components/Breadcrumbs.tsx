import React from 'react';
import { Link } from '@remix-run/react';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = '' }) => {
  const allItems = [{ label: 'Inicio', href: '/' }, ...items];

  return (
    <nav 
      aria-label="Breadcrumb" 
      className={`py-4 ${className}`}
      itemScope 
      itemType="https://schema.org/BreadcrumbList"
    >
      <ol className="flex items-center gap-2 text-sm flex-wrap">
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1;
          const position = index + 1;

          return (
            <li 
              key={item.href}
              itemProp="itemListElement" 
              itemScope 
              itemType="https://schema.org/ListItem"
              className="flex items-center gap-2"
            >
              {index === 0 ? (
                <Link
                  to={item.href}
                  itemProp="item"
                  className="flex items-center gap-1 text-gray-600 hover:text-primary transition-colors"
                  aria-label="Volver al inicio"
                >
                  <Home className="w-4 h-4" />
                  <span itemProp="name">{item.label}</span>
                </Link>
              ) : isLast ? (
                <span 
                  itemProp="name"
                  className="text-gray-900 font-medium"
                  aria-current="page"
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.href}
                  itemProp="item"
                  className="text-gray-600 hover:text-primary transition-colors"
                >
                  <span itemProp="name">{item.label}</span>
                </Link>
              )}
              <meta itemProp="position" content={position.toString()} />
              
              {!isLast && (
                <ChevronRight className="w-4 h-4 text-gray-400" aria-hidden="true" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
