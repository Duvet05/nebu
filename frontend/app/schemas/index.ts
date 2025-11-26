// app/schemas/preorder.schema.ts
import { z } from 'zod';
import { LIMITS } from '~/config/constants';

/**
 * Schema de validación para el formulario de pre-orden
 */
export const preOrderSchema = z.object({
  // Información personal
  firstName: z
    .string()
    .min(LIMITS.form.name.min, `Nombre debe tener al menos ${LIMITS.form.name.min} caracteres`)
    .max(LIMITS.form.name.max, `Nombre debe tener máximo ${LIMITS.form.name.max} caracteres`)
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'Nombre solo puede contener letras'),

  lastName: z
    .string()
    .min(LIMITS.form.name.min, `Apellido debe tener al menos ${LIMITS.form.name.min} caracteres`)
    .max(LIMITS.form.name.max, `Apellido debe tener máximo ${LIMITS.form.name.max} caracteres`)
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'Apellido solo puede contener letras'),

  email: z
    .string()
    .email('Email inválido')
    .max(LIMITS.form.email.max, `Email debe tener máximo ${LIMITS.form.email.max} caracteres`)
    .toLowerCase()
    .trim(),

  phone: z
    .string()
    .regex(/^\+?[0-9]{9,15}$/, 'Teléfono debe tener entre 9 y 15 dígitos')
    .trim(),

  // Dirección
  address: z
    .string()
    .min(LIMITS.form.address.min, `Dirección debe tener al menos ${LIMITS.form.address.min} caracteres`)
    .max(LIMITS.form.address.max, `Dirección debe tener máximo ${LIMITS.form.address.max} caracteres`)
    .trim(),

  city: z
    .string()
    .min(2, 'Ciudad debe tener al menos 2 caracteres')
    .max(50, 'Ciudad debe tener máximo 50 caracteres')
    .trim(),

  postalCode: z
    .string()
    .regex(/^[0-9]{5}$/, 'Código postal debe tener 5 dígitos')
    .optional()
    .or(z.literal('')),

  // Términos y condiciones
  agreeTerms: z
    .boolean()
    .refine(val => val === true, {
      message: 'Debes aceptar los términos y condiciones',
    }),

  newsletter: z.boolean().optional().default(false),
});

export type PreOrderInput = z.infer<typeof preOrderSchema>;

/**
 * Schema para el formulario de contacto
 */
export const contactSchema = z.object({
  firstName: z
    .string()
    .min(LIMITS.form.name.min, `Nombre debe tener al menos ${LIMITS.form.name.min} caracteres`)
    .max(LIMITS.form.name.max, `Nombre debe tener máximo ${LIMITS.form.name.max} caracteres`),

  lastName: z
    .string()
    .min(LIMITS.form.name.min, `Apellido debe tener al menos ${LIMITS.form.name.min} caracteres`)
    .max(LIMITS.form.name.max, `Apellido debe tener máximo ${LIMITS.form.name.max} caracteres`),

  email: z
    .string()
    .email('Email inválido')
    .max(LIMITS.form.email.max)
    .toLowerCase()
    .trim(),

  subject: z
    .string()
    .min(1, 'Debes seleccionar un asunto'),

  message: z
    .string()
    .min(LIMITS.form.message.min, `Mensaje debe tener al menos ${LIMITS.form.message.min} caracteres`)
    .max(LIMITS.form.message.max, `Mensaje debe tener máximo ${LIMITS.form.message.max} caracteres`)
    .trim(),
});

export type ContactInput = z.infer<typeof contactSchema>;

/**
 * Schema para el newsletter
 */
export const newsletterSchema = z.object({
  email: z
    .string()
    .email('Email inválido')
    .max(LIMITS.form.email.max)
    .toLowerCase()
    .trim(),
});

export type NewsletterInput = z.infer<typeof newsletterSchema>;

/**
 * Schema para el libro de reclamaciones
 */
export const complaintSchema = z.object({
  // Datos del consumidor
  documentType: z.enum(['dni', 'ce', 'passport'], {
    message: 'Tipo de documento inválido',
  }),

  documentNumber: z
    .string()
    .min(8, 'Número de documento debe tener al menos 8 caracteres')
    .max(12, 'Número de documento debe tener máximo 12 caracteres')
    .regex(/^[0-9A-Z]+$/, 'Número de documento inválido'),

  firstName: z
    .string()
    .min(LIMITS.form.name.min)
    .max(LIMITS.form.name.max),

  lastName: z
    .string()
    .min(LIMITS.form.name.min)
    .max(LIMITS.form.name.max),

  email: z
    .string()
    .email('Email inválido')
    .toLowerCase()
    .trim(),

  phone: z
    .string()
    .regex(/^\+?[0-9]{9,15}$/),

  address: z
    .string()
    .min(LIMITS.form.address.min)
    .max(LIMITS.form.address.max),

  department: z.string().min(1, 'Debes seleccionar un departamento'),

  // Menor de edad
  menorEdad: z.boolean().optional().default(false),
  
  tutorFirstName: z.string().optional(),
  tutorLastName: z.string().optional(),
  tutorDocument: z.string().optional(),

  // Detalles del reclamo
  type: z.enum(['reclamo', 'queja'], {
    message: 'Tipo de reclamo inválido',
  }),

  product: z.string().min(1, 'Debes seleccionar un producto'),

  amount: z
    .number()
    .positive('Monto debe ser positivo')
    .max(100000, 'Monto muy alto'),

  orderNumber: z.string().optional().or(z.literal('')),

  description: z
    .string()
    .min(LIMITS.form.complaint.min, `Descripción debe tener al menos ${LIMITS.form.complaint.min} caracteres`)
    .max(LIMITS.form.complaint.max, `Descripción debe tener máximo ${LIMITS.form.complaint.max} caracteres`)
    .trim(),
}).refine(
  (data) => {
    // Si es menor de edad, los datos del tutor son requeridos
    if (data.menorEdad) {
      return (
        data.tutorFirstName &&
        data.tutorLastName &&
        data.tutorDocument &&
        data.tutorFirstName.length >= LIMITS.form.name.min &&
        data.tutorLastName.length >= LIMITS.form.name.min &&
        data.tutorDocument.length >= 8
      );
    }
    return true;
  },
  {
    message: 'Los datos del tutor son requeridos para menores de edad',
    path: ['tutorFirstName'],
  }
);

export type ComplaintInput = z.infer<typeof complaintSchema>;

/**
 * Schema para waitlist/back in stock
 */
export const waitlistSchema = z.object({
  email: z
    .string()
    .email('Email inválido')
    .toLowerCase()
    .trim(),

  productId: z.string().min(1, 'ID de producto requerido'),
  
  productName: z.string().optional(),
});

export type WaitlistInput = z.infer<typeof waitlistSchema>;
