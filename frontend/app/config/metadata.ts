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
    name: "Flow-Telligence",
    legalName: "FLOW SACS",
    url: "https://flow-telligence.com",
    logo: "https://flow-telligence.com/assets/logo.png",
    foundingDate: "2024",
    founders: [
      {
        "@type": "Person",
        name: "Flow-Telligence Team"
      }
    ],
    address: {
      "@type": "PostalAddress",
      streetAddress: "Lima",
      addressLocality: "Lima",
      addressCountry: "PE"
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: "+51-945-012-824",
        contactType: "customer service",
        areaServed: "PE",
        availableLanguage: ["Spanish", "English"]
      },
      {
        "@type": "ContactPoint",
        email: "contacto@flow-telligence.com",
        contactType: "customer service"
      }
    ],
    sameAs: [
      "https://www.facebook.com/flowtelligence",
      "https://www.instagram.com/flowtelligence",
      "https://www.tiktok.com/@flowtelligence",
      "https://twitter.com/flowtelligence",
      "https://www.youtube.com/@flowtelligence"
    ],
    taxID: "10703363135",
    vatID: "10703363135"
  };
}

export function getMetaTags(locale: string = 'es') {
  const isSpanish = locale === 'es';
  
  return [
    // Core Meta Tags
    { name: "author", content: "Flow-Telligence" },
    { name: "company", content: "FLOW SACS" },
    { name: "rating", content: "General" },
    { name: "distribution", content: "Global" },
    { name: "revisit-after", content: "7 days" },
    { name: "classification", content: "Business" },
    { name: "target", content: "all" },
    { name: "audience", content: "all" },
    { name: "coverage", content: "Worldwide" },
    
    // Open Graph Tags
    { property: "og:site_name", content: "Flow-Telligence" },
    { property: "og:type", content: "website" },
    { property: "og:locale", content: isSpanish ? "es_PE" : "en_US" },
    
    // Twitter Card Tags
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:site", content: "@flowtelligence" },
    { name: "twitter:creator", content: "@flowtelligence" },
    
    // Business information
    { property: "business:contact_data:street_address", content: "Lima, Perú" },
    { property: "business:contact_data:locality", content: "Lima" },
    { property: "business:contact_data:country_name", content: "Peru" },
    { property: "business:contact_data:email", content: "contacto@flow-telligence.com" },
    { property: "business:contact_data:phone_number", content: "+51945012824" },
    
    // Additional SEO Tags
    { name: "robots", content: "index, follow, max-image-preview:large" },
    { name: "googlebot", content: "index, follow" },
    { name: "bingbot", content: "index, follow" },
  ];
}