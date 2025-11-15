// Google Analytics 4 event tracking utility

declare global {
  interface Window {
    gtag?: (
      command: string,
      targetId: string,
      config?: Record<string, any>
    ) => void;
  }
}

export const trackEvent = (
  eventName: string,
  eventParams?: Record<string, any>
) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, eventParams);
  }
};

// Pre-defined events for common actions
export const analytics = {
  // Pre-order events
  preOrderStart: (color?: string, quantity?: number) => {
    trackEvent("begin_checkout", {
      currency: "PEN",
      value: 380 * (quantity || 1),
      items: [
        {
          item_id: "nebu-001",
          item_name: "Nebu IoT Companion",
          item_variant: color,
          quantity: quantity || 1,
          price: 380,
        },
      ],
    });
  },

  preOrderComplete: (
    email: string,
    quantity: number,
    color: string,
    totalValue: number
  ) => {
    trackEvent("purchase", {
      currency: "PEN",
      value: totalValue,
      transaction_id: `pre-order-${Date.now()}`,
      items: [
        {
          item_id: "nebu-001",
          item_name: "Nebu IoT Companion",
          item_variant: color,
          quantity,
          price: 380,
        },
      ],
    });
  },

  // Newsletter events
  newsletterSignup: (email: string, source: string) => {
    trackEvent("sign_up", {
      method: "newsletter",
      source,
    });
  },

  // Contact events
  contactFormSubmit: (subject: string) => {
    trackEvent("generate_lead", {
      form_type: "contact",
      subject,
    });
  },

  // WhatsApp click
  whatsappClick: (source: string) => {
    trackEvent("contact", {
      method: "whatsapp",
      source,
    });
  },

  // Page view (already tracked automatically by GA4)
  pageView: (pagePath: string, pageTitle: string) => {
    trackEvent("page_view", {
      page_path: pagePath,
      page_title: pageTitle,
    });
  },

  // Product interaction
  viewProduct: (productId: string, productName: string) => {
    trackEvent("view_item", {
      currency: "PEN",
      value: 380,
      items: [
        {
          item_id: productId,
          item_name: productName,
          price: 380,
        },
      ],
    });
  },

  // Add to cart (for future e-commerce)
  addToCart: (quantity: number, color: string) => {
    trackEvent("add_to_cart", {
      currency: "PEN",
      value: 380 * quantity,
      items: [
        {
          item_id: "nebu-001",
          item_name: "Nebu IoT Companion",
          item_variant: color,
          quantity,
          price: 380,
        },
      ],
    });
  },

  // FAQ interaction
  faqClick: (question: string) => {
    trackEvent("faq_interaction", {
      question,
    });
  },

  // Language change
  languageChange: (language: string) => {
    trackEvent("language_change", {
      language,
    });
  },
};
