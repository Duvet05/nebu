import type { ActionFunctionArgs } from "@remix-run/node";
import { data } from "@remix-run/node";

/**
 * Complaints API Route
 *
 * This endpoint registers complaints/claims in the "Libro de Reclamaciones"
 * (Complaint Book) as required by Peruvian law.
 *
 * NOTE: Email notifications should be handled by the backend API.
 * This frontend endpoint only registers the complaint and generates a unique ID.
 */

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return data({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const formData = await request.json();

    // Generate unique complaint number
    const timestamp = Date.now();
    const hojaNumber = `LR-${timestamp.toString().slice(-8)}`;

    // Log the complaint for audit purposes
    console.log(`[Complaint Registered] ${hojaNumber}`, {
      type: formData.tipoReclamo,
      customer: `${formData.nombres} ${formData.apellidos}`,
      email: formData.email,
      timestamp: new Date().toISOString(),
    });

    // TODO: In production, this should call the backend API to:
    // 1. Store the complaint in the database
    // 2. Send email notifications to both customer and company
    // Example: await fetch(`${process.env.BACKEND_URL}/complaints`, { ... })

    return data({
      success: true,
      hojaNumber,
      message: "Reclamo registrado exitosamente",
      note: "Recibirás una copia de tu reclamo por correo electrónico en las próximas 24 horas.",
    });
  } catch (error) {
    console.error("Error processing complaint:", error);
    return data(
      { error: "Error al procesar el reclamo" },
      { status: 500 }
    );
  }
}
