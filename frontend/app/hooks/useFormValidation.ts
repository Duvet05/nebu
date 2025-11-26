// app/hooks/useFormValidation.ts
import { useState } from 'react';
import { z } from 'zod';

interface ValidationErrors {
  [key: string]: string | undefined;
}

/**
 * Hook para validar formularios con Zod
 * @param schema Schema de Zod para validación
 * @returns Utilidades de validación
 * 
 * @example
 * const { validate, validateField, errors, clearError } = useFormValidation(preOrderSchema);
 * 
 * // Validar todo el formulario
 * const result = validate(formData);
 * if (result.success) {
 *   // Submit
 * }
 * 
 * // Validar un campo individual
 * const handleBlur = (e) => {
 *   validateField(e.target.name, e.target.value);
 * };
 */
export function useFormValidation<T extends z.ZodTypeAny>(schema: T) {
  const [errors, setErrors] = useState<ValidationErrors>({});

  /**
   * Valida todo el formulario
   */
  const validate = (data: unknown): { success: boolean; data?: z.infer<T>; errors?: ValidationErrors } => {
    try {
      const validData = schema.parse(data);
      setErrors({});
      return { success: true, data: validData };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: ValidationErrors = {};
        error.issues.forEach((issue) => {
          const path = issue.path.join('.');
          fieldErrors[path] = issue.message;
        });
        setErrors(fieldErrors);
        return { success: false, errors: fieldErrors };
      }
      return { success: false, errors: { _form: 'Error de validación desconocido' } };
    }
  };

  /**
   * Valida un campo individual
   */
  const validateField = (fieldName: string, value: unknown): boolean => {
    try {
      // Obtener el schema del campo específico
      const fieldSchema = (schema as any).shape[fieldName];
      
      if (!fieldSchema) {
        console.warn(`Campo "${fieldName}" no encontrado en el schema`);
        return true;
      }

      fieldSchema.parse(value);
      
      // Limpiar error si la validación pasa
      setErrors((prev) => {
        const next = { ...prev };
        delete next[fieldName];
        return next;
      });
      
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.issues[0]?.message || 'Error de validación';
        setErrors((prev) => ({
          ...prev,
          [fieldName]: errorMessage,
        }));
        return false;
      }
      return false;
    }
  };

  /**
   * Limpia un error específico
   */
  const clearError = (fieldName: string) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[fieldName];
      return next;
    });
  };

  /**
   * Limpia todos los errores
   */
  const clearErrors = () => {
    setErrors({});
  };

  /**
   * Obtiene el error de un campo
   */
  const getError = (fieldName: string): string | undefined => {
    return errors[fieldName];
  };

  /**
   * Verifica si hay errores
   */
  const hasErrors = (): boolean => {
    return Object.keys(errors).length > 0;
  };

  return {
    validate,
    validateField,
    clearError,
    clearErrors,
    getError,
    hasErrors,
    errors,
  };
}
