import { CONTACT, BUSINESS } from './constants';

export interface OrganizationSchema {
  "@context": string;
  "@type": string;
  name: string;
  legalName: string;
  url: string;
  logo: string;
  foundingDate: string;
  founders: Array<{
    "@type": string;
    name: string;
  }>;
  address: {
    "@type": string;
    streetAddress: string;
    addressLocality: string;
    addressCountry: string;
  };
  contactPoint: Array<{
    "@type": string;
    telephone?: string;
    email?: string;
    contactType: string;
    areaServed?: string;
    availableLanguage?: string[];
  }>;
  sameAs: string[];
  taxID: string;
  vatID: string;
}

export function getStructuredData(): OrganizationSchema {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: BUSINESS.name,
    legalName: BUSINESS.legalName,
    url: BUSINESS.website,
    logo: `${BUSINESS.website}/assets/logo.png`,
    foundingDate: "2024",
    founders: [
      {
        "@type": "Person",
        name: `${BUSINESS.name} Team`
      }
    ],
    address: {
      "@type": "PostalAddress",
      streetAddress: BUSINESS.address.full,
      addressLocality: BUSINESS.address.city,
      addressCountry: BUSINESS.address.country
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: CONTACT.phone,
        contactType: "customer service",
        areaServed: "PE",
        availableLanguage: ["Spanish", "English"]
      },
      {
        "@type": "ContactPoint",
        email: CONTACT.email.main,
        contactType: "customer service"
      }
    ],
    sameAs: [
      CONTACT.social.facebook,
      CONTACT.social.instagram,
      CONTACT.social.tiktok,
      CONTACT.social.twitter,
      CONTACT.social.youtube
    ],
    taxID: BUSINESS.ruc,
    vatID: BUSINESS.ruc
  };
}

export function getMetaTags(_locale: string = 'es') {
  // Solo meta tags globales que NO se definen en páginas individuales
  // Las páginas definen: title, description, canonical, og:*, twitter:*
  
  return [
    // Core Meta Tags (información de la empresa)
    { name: "author", content: BUSINESS.name },
    { name: "company", content: BUSINESS.legalName },
    { name: "rating", content: "General" },
    { name: "distribution", content: "Global" },
    { name: "revisit-after", content: "7 days" },
    { name: "classification", content: "Business" },
    { name: "target", content: "all" },
    { name: "audience", content: "all" },
    { name: "coverage", content: "Worldwide" },
    
    // Business contact information (para rich snippets)
    { property: "business:contact_data:street_address", content: BUSINESS.address.full },
    { property: "business:contact_data:locality", content: BUSINESS.address.city },
    { property: "business:contact_data:country_name", content: BUSINESS.address.countryName },
    { property: "business:contact_data:email", content: CONTACT.email.main },
    { property: "business:contact_data:phone_number", content: CONTACT.phone },
    
    // SEO Bot Instructions (global para todo el sitio)
    { name: "robots", content: "index, follow, max-image-preview:large" },
    { name: "googlebot", content: "index, follow" },
    { name: "bingbot", content: "index, follow" },
  ];
}