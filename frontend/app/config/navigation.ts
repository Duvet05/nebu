// app/config/navigation.ts
// Configuración centralizada de navegación

export interface NavigationItem {
  path: string;
  labelKey: string;
  icon?: string;
  children?: NavigationItem[];
  external?: boolean;
  requiresAuth?: boolean;
  badge?: string;
}

export interface NavigationConfig {
  mainNav: NavigationItem[];
  footerNav: NavigationItem[];
  userNav: NavigationItem[];
  socialLinks: NavigationItem[];
}

export const navigationConfig: NavigationConfig = {
  // Main navigation items
  mainNav: [
    {
      path: '/',
      labelKey: 'nav.home',
    },
    {
      path: '/productos',
      labelKey: 'nav.products',
      children: [
        {
          path: '/productos/nebu',
          labelKey: 'nav.products.nebu',
        },
        {
          path: '/productos/accesorios',
          labelKey: 'nav.products.accessories',
        },
        {
          path: '/productos/bundles',
          labelKey: 'nav.products.bundles',
          badge: 'new',
        },
      ],
    },
    {
      path: '/our-story',
      labelKey: 'nav.ourStory',
    },
    {
      path: '/pre-order',
      labelKey: 'nav.preOrder',
      badge: 'hot',
    },
    {
      path: '/faq',
      labelKey: 'nav.faq',
    },
    {
      path: '/contact',
      labelKey: 'nav.contact',
    },
  ],
  
  // Footer navigation
  footerNav: [
    {
      path: '/about',
      labelKey: 'footer.about',
    },
    {
      path: '/privacy',
      labelKey: 'footer.privacy',
    },
    {
      path: '/terms',
      labelKey: 'footer.terms',
    },
    {
      path: '/shipping',
      labelKey: 'footer.shipping',
    },
    {
      path: '/returns',
      labelKey: 'footer.returns',
    },
    {
      path: '/blog',
      labelKey: 'footer.blog',
    },
  ],
  
  // User account navigation
  userNav: [
    {
      path: '/account',
      labelKey: 'user.account',
      requiresAuth: true,
    },
    {
      path: '/account/orders',
      labelKey: 'user.orders',
      requiresAuth: true,
    },
    {
      path: '/account/wishlist',
      labelKey: 'user.wishlist',
      requiresAuth: true,
    },
    {
      path: '/account/settings',
      labelKey: 'user.settings',
      requiresAuth: true,
    },
  ],
  
  // Social media links
  socialLinks: [
    {
      path: 'https://facebook.com/flowtelligence',
      labelKey: 'social.facebook',
      external: true,
      icon: 'facebook',
    },
    {
      path: 'https://instagram.com/flowtelligence',
      labelKey: 'social.instagram',
      external: true,
      icon: 'instagram',
    },
    {
      path: 'https://tiktok.com/@flowtelligence',
      labelKey: 'social.tiktok',
      external: true,
      icon: 'tiktok',
    },
    {
      path: 'https://twitter.com/flowtelligence',
      labelKey: 'social.twitter',
      external: true,
      icon: 'twitter',
    },
    {
      path: 'https://youtube.com/@flowtelligence',
      labelKey: 'social.youtube',
      external: true,
      icon: 'youtube',
    },
  ],
};

// Helper function to get navigation item by path
export function getNavigationItemByPath(path: string): NavigationItem | undefined {
  const searchInItems = (items: NavigationItem[]): NavigationItem | undefined => {
    for (const item of items) {
      if (item.path === path) {
        return item;
      }
      if (item.children) {
        const found = searchInItems(item.children);
        if (found) return found;
      }
    }
    return undefined;
  };
  
  return searchInItems([
    ...navigationConfig.mainNav,
    ...navigationConfig.footerNav,
    ...navigationConfig.userNav,
  ]);
}

// Helper function to get breadcrumb path
export function getBreadcrumbPath(pathname: string): NavigationItem[] {
  const parts = pathname.split('/').filter(Boolean);
  const breadcrumbs: NavigationItem[] = [];
  
  let currentPath = '';
  for (const part of parts) {
    currentPath += `/${part}`;
    const item = getNavigationItemByPath(currentPath);
    if (item) {
      breadcrumbs.push(item);
    }
  }
  
  return breadcrumbs;
}

// Helper function to check if path requires authentication
export function requiresAuth(path: string): boolean {
  const item = getNavigationItemByPath(path);
  return item?.requiresAuth || false;
}