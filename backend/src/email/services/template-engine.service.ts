import { Injectable } from '@nestjs/common';

export interface TemplateVariable {
  name: string;
  description: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array';
  required: boolean;
  defaultValue?: any;
  example?: string;
  category: 'user' | 'order' | 'product' | 'system' | 'payment' | 'custom';
}

export interface TemplateContext {
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    avatar?: string;
    role: string;
    status: string;
    createdAt: Date;
    lastLoginAt?: Date;
  };
  order?: {
    id: string;
    orderNumber: string;
    status: string;
    totalAmount: number;
    createdAt: Date;
    trackingNumber?: string;
  };
  product?: {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    image?: string;
    url: string;
  };
  system?: {
    siteName: string;
    siteUrl: string;
    supportEmail: string;
    currentDate: Date;
    currentYear: number;
  };
  payment?: {
    amount: number;
    currency: string;
    method: string;
    transactionId: string;
    status: string;
    paidAt: Date;
  };
  custom?: Record<string, any>;
}

@Injectable()
export class TemplateEngineService {
  private readonly availableVariables: TemplateVariable[] = [
    // User variables
    {
      name: 'user.firstName',
      description: 'Nombre del usuario',
      type: 'string',
      required: true,
      example: 'Juan',
      category: 'user',
    },
    {
      name: 'user.lastName',
      description: 'Apellido del usuario',
      type: 'string',
      required: true,
      example: 'Pérez',
      category: 'user',
    },
    {
      name: 'user.email',
      description: 'Email del usuario',
      type: 'string',
      required: true,
      example: 'juan@example.com',
      category: 'user',
    },
    {
      name: 'user.username',
      description: 'Nombre de usuario',
      type: 'string',
      required: false,
      example: 'juan_perez',
      category: 'user',
    },
    {
      name: 'user.fullName',
      description: 'Nombre completo del usuario',
      type: 'string',
      required: false,
      example: 'Juan Pérez',
      category: 'user',
    },
    {
      name: 'user.role',
      description: 'Rol del usuario',
      type: 'string',
      required: false,
      example: 'student',
      category: 'user',
    },
    {
      name: 'user.avatar',
      description: 'URL del avatar del usuario',
      type: 'string',
      required: false,
      example: 'https://example.com/avatar.jpg',
      category: 'user',
    },

    // Order variables
    {
      name: 'order.orderNumber',
      description: 'Número de pedido',
      type: 'string',
      required: false,
      example: 'ORD-2024-001',
      category: 'order',
    },
    {
      name: 'order.status',
      description: 'Estado del pedido',
      type: 'string',
      required: false,
      example: 'confirmed',
      category: 'order',
    },
    {
      name: 'order.totalAmount',
      description: 'Monto total del pedido',
      type: 'number',
      required: false,
      example: '380.00',
      category: 'order',
    },
    {
      name: 'order.trackingNumber',
      description: 'Número de seguimiento',
      type: 'string',
      required: false,
      example: 'TRK123456789',
      category: 'order',
    },

    // Product variables
    {
      name: 'product.name',
      description: 'Nombre del producto',
      type: 'string',
      required: false,
      example: 'Star Hunters',
      category: 'product',
    },
    {
      name: 'product.description',
      description: 'Descripción del producto',
      type: 'string',
      required: false,
      example: 'Aventureros cósmicos que viajan entre galaxias',
      category: 'product',
    },
    {
      name: 'product.price',
      description: 'Precio del producto',
      type: 'number',
      required: false,
      example: '380.00',
      category: 'product',
    },
    {
      name: 'product.image',
      description: 'URL de la imagen del producto',
      type: 'string',
      required: false,
      example: 'https://example.com/product.jpg',
      category: 'product',
    },
    {
      name: 'product.url',
      description: 'URL del producto',
      type: 'string',
      required: false,
      example: 'https://nebu.store/products/star-hunters',
      category: 'product',
    },

    // System variables
    {
      name: 'system.siteName',
      description: 'Nombre del sitio',
      type: 'string',
      required: true,
      defaultValue: 'Nebu',
      example: 'Nebu',
      category: 'system',
    },
    {
      name: 'system.siteUrl',
      description: 'URL del sitio',
      type: 'string',
      required: true,
      defaultValue: 'https://nebu.academy',
      example: 'https://nebu.academy',
      category: 'system',
    },
    {
      name: 'system.supportEmail',
      description: 'Email de soporte',
      type: 'string',
      required: true,
      defaultValue: 'support@nebu.academy',
      example: 'support@nebu.academy',
      category: 'system',
    },
    {
      name: 'system.currentDate',
      description: 'Fecha actual',
      type: 'date',
      required: true,
      example: '2025-09-16',
      category: 'system',
    },
    {
      name: 'system.currentYear',
      description: 'Año actual',
      type: 'number',
      required: true,
      example: '2025',
      category: 'system',
    },
    {
      name: 'system.currentTime',
      description: 'Hora actual',
      type: 'string',
      required: false,
      example: '14:30:00',
      category: 'system',
    },

    // Payment variables
    {
      name: 'payment.amount',
      description: 'Monto del pago',
      type: 'number',
      required: false,
      example: '99.99',
      category: 'payment',
    },
    {
      name: 'payment.currency',
      description: 'Moneda del pago',
      type: 'string',
      required: false,
      example: 'USD',
      category: 'payment',
    },
    {
      name: 'payment.method',
      description: 'Método de pago',
      type: 'string',
      required: false,
      example: 'Tarjeta de crédito',
      category: 'payment',
    },
    {
      name: 'payment.transactionId',
      description: 'ID de la transacción',
      type: 'string',
      required: false,
      example: 'txn_123456789',
      category: 'payment',
    },
    {
      name: 'payment.status',
      description: 'Estado del pago',
      type: 'string',
      required: false,
      example: 'completed',
      category: 'payment',
    },
    {
      name: 'payment.paidAt',
      description: 'Fecha del pago',
      type: 'date',
      required: false,
      example: '2025-09-16',
      category: 'payment',
    },
  ];

  getAvailableVariables(): TemplateVariable[] {
    return this.availableVariables;
  }

  getVariablesByCategory(category: string): TemplateVariable[] {
    return this.availableVariables.filter(v => v.category === category);
  }

  getRequiredVariables(): TemplateVariable[] {
    return this.availableVariables.filter(v => v.required);
  }

  validateVariables(variables: Record<string, any>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const requiredVars = this.getRequiredVariables();

    // Check required variables
    for (const requiredVar of requiredVars) {
      if (!this.hasVariable(variables, requiredVar.name)) {
        errors.push(`Variable requerida faltante: ${requiredVar.name}`);
      }
    }

    // Check variable types
    for (const [key, value] of Object.entries(variables)) {
      const variableDef = this.availableVariables.find(v => v.name === key);
      if (variableDef && !this.validateVariableType(value, variableDef.type)) {
        errors.push(`Tipo incorrecto para ${key}: esperado ${variableDef.type}, recibido ${typeof value}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  private hasVariable(variables: Record<string, any>, variableName: string): boolean {
    const parts = variableName.split('.');
    let current = variables;

    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return false;
      }
    }

    return current !== undefined && current !== null;
  }

  private validateVariableType(value: any, expectedType: string): boolean {
    switch (expectedType) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'date':
        return value instanceof Date || !isNaN(Date.parse(value));
      case 'object':
        return typeof value === 'object' && value !== null;
      case 'array':
        return Array.isArray(value);
      default:
        return true;
    }
  }

  renderTemplate(template: string, context: TemplateContext): string {
    let rendered = template;

    // Replace variables in the format {{variable.path}}
    const variableRegex = /\{\{([^}]+)\}\}/g;
    const matches = template.match(variableRegex);

    if (matches) {
      for (const match of matches) {
        const variableName = match.slice(2, -2).trim(); // Remove {{ and }}
        const value = this.getVariableValue(context, variableName);
        
        if (value !== undefined) {
          rendered = rendered.replace(match, this.formatValue(value));
        } else {
          // If variable is not found, keep the original placeholder
          // eslint-disable-next-line no-console
          console.warn(`Variable not found: ${variableName}`);
        }
      }
    }

    return rendered;
  }

  private getVariableValue(context: TemplateContext, variableName: string): any {
    const parts = variableName.split('.');
    
    if (parts.length === 1) {
      // Handle special cases like user.fullName
      if (variableName === 'user.fullName') {
        return context.user ? `${context.user.firstName} ${context.user.lastName}` : undefined;
      }
      return context[variableName as keyof TemplateContext];
    }

    const [category, ...pathParts] = parts;
    const categoryData = context[category as keyof TemplateContext];

    if (!categoryData || typeof categoryData !== 'object') {
      return undefined;
    }

    let current = categoryData;
    for (const part of pathParts) {
      if (current && typeof current === 'object' && part in current) {
        current = (current as any)[part];
      } else {
        return undefined;
      }
    }

    return current;
  }

  private formatValue(value: any): string {
    if (value === null || value === undefined) {
      return '';
    }

    if (value instanceof Date) {
      return value.toLocaleDateString('es-ES');
    }

    if (typeof value === 'number') {
      return value.toString();
    }

    if (typeof value === 'boolean') {
      return value ? 'Sí' : 'No';
    }

    return String(value);
  }

  extractVariablesFromTemplate(template: string): string[] {
    const variableRegex = /\{\{([^}]+)\}\}/g;
    const matches = template.match(variableRegex);
    
    if (!matches) {
      return [];
    }

    return matches.map(match => match.slice(2, -2).trim());
  }

  generateTemplatePreview(template: string, context: TemplateContext): {
    rendered: string;
    usedVariables: string[];
    missingVariables: string[];
  } {
    const usedVariables = this.extractVariablesFromTemplate(template);
    const missingVariables: string[] = [];

    for (const variable of usedVariables) {
      const value = this.getVariableValue(context, variable);
      if (value === undefined) {
        missingVariables.push(variable);
      }
    }

    const rendered = this.renderTemplate(template, context);

    return {
      rendered,
      usedVariables,
      missingVariables,
    };
  }
}
