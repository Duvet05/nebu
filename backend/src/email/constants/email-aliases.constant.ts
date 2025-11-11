/**
 * Flow-Telligence Email Aliases Configuration
 * Account: admin@flow-telligence.com
 * Aliases usados: 6/50
 */
export const FLOW_TELLIGENCE_EMAILS = {
  /**
   * Email principal de administración
   */
  ADMIN: 'admin@flow-telligence.com',

  /**
   * Email de contacto general para clientes
   */
  CONTACTO: 'contacto@flow-telligence.com',

  /**
   * Email para facturación y temas de pagos
   */
  FACTURACION: 'facturacion@flow-telligence.com',

  /**
   * Email de información general
   */
  INFO: 'info@flow-telligence.com',

  /**
   * Email de soporte técnico
   */
  SOPORTE: 'soporte@flow-telligence.com',

  /**
   * Email del equipo de ventas
   */
  VENTAS: 'ventas@flow-telligence.com',
} as const;

/**
 * Tipo para los emails disponibles
 */
export type FlowTelligenceEmail = typeof FLOW_TELLIGENCE_EMAILS[keyof typeof FLOW_TELLIGENCE_EMAILS];

/**
 * Helper para obtener el email según el propósito
 */
export const getEmailByPurpose = (purpose: keyof typeof FLOW_TELLIGENCE_EMAILS): string => {
  return FLOW_TELLIGENCE_EMAILS[purpose];
};

/**
 * Configuración de emails por tipo de notificación
 */
export const EMAIL_ROUTING = {
  // Notificaciones de órdenes van a admin y ventas
  orders: {
    from: FLOW_TELLIGENCE_EMAILS.VENTAS,
    to: [FLOW_TELLIGENCE_EMAILS.ADMIN, FLOW_TELLIGENCE_EMAILS.VENTAS],
  },
  // Facturas van a facturación
  billing: {
    from: FLOW_TELLIGENCE_EMAILS.FACTURACION,
    to: [FLOW_TELLIGENCE_EMAILS.FACTURACION],
  },
  // Soporte técnico
  support: {
    from: FLOW_TELLIGENCE_EMAILS.SOPORTE,
    to: [FLOW_TELLIGENCE_EMAILS.SOPORTE],
  },
  // Contacto general
  contact: {
    from: FLOW_TELLIGENCE_EMAILS.CONTACTO,
    to: [FLOW_TELLIGENCE_EMAILS.CONTACTO, FLOW_TELLIGENCE_EMAILS.ADMIN],
  },
  // Información general
  info: {
    from: FLOW_TELLIGENCE_EMAILS.INFO,
    to: [FLOW_TELLIGENCE_EMAILS.INFO],
  },
  // Admin general (para notificaciones del sistema)
  admin: {
    from: FLOW_TELLIGENCE_EMAILS.ADMIN,
    to: [FLOW_TELLIGENCE_EMAILS.ADMIN],
  },
} as const;
