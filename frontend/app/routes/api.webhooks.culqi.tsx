import { data, type ActionFunctionArgs } from "@remix-run/node";

/**
 * Webhook de Culqi - Proxy al Backend
 *
 * Este endpoint redirige los webhooks de Culqi al backend de NestJS
 * donde se procesa toda la lógica de negocio.
 *
 * Configuración en Culqi:
 * - URL: https://tu-dominio.com/api/webhooks/culqi
 * - Eventos: charge.succeeded, charge.failed, order.expired, refund.succeeded
 */
export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return data({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const event = await request.json();

    console.log("[Culqi Webhook] Received event:", event.object);

    // Reenviar al backend
    const backendUrl = process.env.BACKEND_URL || "http://localhost:3001/api/v1";
    const response = await fetch(`${backendUrl}/webhooks/culqi`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      console.error("[Culqi Webhook] Backend processing failed:", response.statusText);
      // Retornar 200 para que Culqi no reintente
      return data({ received: true, processed: false });
    }

    const result = await response.json();
    console.log("[Culqi Webhook] Backend processed successfully:", result);

    return data({ received: true, processed: true });
  } catch (error) {
    console.error("[Culqi Webhook] Error:", error);
    // Retornar 200 para que Culqi no reintente
    return data({ received: true, error: true });
  }
}
