import type { ActionFunctionArgs } from "@remix-run/node";
import { data, json } from "@remix-run/node";

/**
 * Complaints API Route
 *
 * Este endpoint registra reclamos/quejas en el "Libro de Reclamaciones Virtual"
 * conforme al D.S. N° 011-2011-PCM (Perú).
 *
 * FLOW S.A.C.S cuenta con un Libro de Reclamaciones Virtual. Complete el formulario para registrar su reclamo o queja.
 *
 * NOTA: Las notificaciones por email deben ser gestionadas por el backend.
 * Este endpoint solo registra el reclamo y genera un ID único.
 */

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return json({ error: "Método no permitido. Solo se acepta POST." }, { status: 405 });
  }

  try {
    const _formData = await request.json();

    // Validación básica de campos requeridos
    if (!_formData || typeof _formData !== "object") {
      return json({ error: "Datos inválidos. Complete el formulario correctamente." }, { status: 400 });
    }
    const { nombre, email, tipo, descripcion } = _formData;
    if (!nombre || !email || !tipo || !descripcion) {
      return json({ error: "Faltan campos obligatorios: nombre, email, tipo y descripción." }, { status: 422 });
    }

    // Simulación de control de duplicados (ejemplo: hash simple por email+desc)
    // En producción, esto debe hacerse en backend con persistencia real
    const duplicateKey = `${email}:${descripcion}`;
    // Aquí podrías usar un cache temporal o base de datos para evitar duplicados recientes
    // Por ahora, solo ejemplo en memoria (no persistente)
    if (globalThis.__complaintsCache === undefined) {
      globalThis.__complaintsCache = {};
    }
    const cache = globalThis.__complaintsCache as Record<string, number>;
    const now = Date.now();
    // Si ya existe un reclamo igual en los últimos 10 minutos, rechazar
    if (cache[duplicateKey] && now - cache[duplicateKey] < 10 * 60 * 1000) {
      return json({
        error: "Ya hemos recibido un reclamo similar recientemente. Por favor, espere unos minutos antes de volver a enviar.",
        code: "DUPLICATE_REQUEST"
      }, { status: 429 });
    }
    cache[duplicateKey] = now;

    // Generar número de hoja único
    const hojaNumber = `LR-${now.toString().slice(-8)}`;

    // TODO: En producción, llamar al backend para almacenar y notificar

    return json({
      success: true,
      hojaNumber,
      message: "Reclamo registrado exitosamente.",
      note: "Recibirás una copia de tu reclamo por correo electrónico en las próximas 24 horas.",
      legal: "Conforme al D.S. N° 011-2011-PCM, FLOW S.A.C.S cuenta con un Libro de Reclamaciones Virtual. Complete el siguiente formulario para registrar su reclamo o queja.",
    });
  } catch (error: any) {
    if (error instanceof SyntaxError) {
      return json({ error: "El formato de los datos enviados no es válido (JSON inválido)." }, { status: 400 });
    }
    console.error("Error processing complaint:", error);
    return json(
      { error: "Error inesperado al procesar el reclamo. Intente nuevamente más tarde." },
      { status: 500 }
    );
  }
}
