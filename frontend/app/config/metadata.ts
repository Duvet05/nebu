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
  
  return (
    <>
      {/* Core Meta Tags */}
      <meta name="author" content="Flow-Telligence" />
      <meta name="company" content="FLOW SACS" />
      <meta name="rating" content="General" />
      <meta name="distribution" content="Global" />
      <meta name="revisit-after" content="7 days" />
      <meta name="classification" content="Business" />
      <meta name="target" content="all" />
      <meta name="audience" content="all" />
      <meta name="coverage" content="Worldwide" />
      
      {/* Open Graph Tags */}
      <meta property="og:site_name" content="Flow-Telligence" />
      <meta property="og:type" content="website" />
      <meta property="og:locale" content={isSpanish ? "es_PE" : "en_US"} />
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@flowtelligence" />
      <meta name="twitter:creator" content="@flowtelligence" />
      
      {/* Business information */}
      <meta property="business:contact_data:street_address" content="Lima, Perú" />
      <meta property="business:contact_data:locality" content="Lima" />
      <meta property="business:contact_data:country_name" content="Peru" />
      <meta property="business:contact_data:email" content="contacto@flow-telligence.com" />
      <meta property="business:contact_data:phone_number" content="+51945012824" />
      
      {/* Additional SEO Tags */}
      <meta name="robots" content="index, follow, max-image-preview:large" />
      <meta name="googlebot" content="index, follow" />
      <meta name="bingbot" content="index, follow" />
      
      {/* Verification Tags (añadir cuando tengas los códigos) */}
      {/* <meta name="google-site-verification" content="YOUR_GOOGLE_VERIFICATION_CODE" /> */}
      {/* <meta name="facebook-domain-verification" content="YOUR_FACEBOOK_VERIFICATION_CODE" /> */}
    </>
  );
}