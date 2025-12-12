import { data, type ActionFunctionArgs } from "@remix-run/node";
import { apiClient } from "~/lib/api-client";
import { z } from "zod";

// Schema for newsletter signup
const NewsletterRequestSchema = z.object({
  email: z.string().email("Email inválido"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return data({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const formData = await request.formData();
    

    const requestData = {
      email: formData.get("email") as string,
      firstName: formData.get("firstName") || undefined,
      lastName: formData.get("lastName") || undefined,
    };

    // Validate with Zod
    const validatedData = NewsletterRequestSchema.parse(requestData);


    // Save lead to backend
    try {
      await apiClient.post('/leads/newsletter', validatedData);
    } catch (error) {
      console.error("[NEWSLETTER] Failed to save newsletter lead to backend:", error);
      // Continue even if backend fails
    }

    // Send welcome email via backend
    try {
      const url = '/email/public/newsletter-welcome';
      const body = { email: validatedData.email };
      console.log(`[NEWSLETTER] Sending welcome email. URL: ${url}, body:`, body);
      const emailResponse = await apiClient.post<{ success: boolean; error?: string }>(url, body);
      console.log('[NEWSLETTER] Email response:', emailResponse);

      if (!emailResponse.success) {
        console.error("[NEWSLETTER] Failed to send email:", emailResponse.error);
        return data(
          { error: "Error al enviar email" },
          { status: 500 }
        );
      }
    } catch (error) {
      console.error("[NEWSLETTER] Failed to send email via backend:", error);
      // Continue even if email fails - don't block the signup
    }

    return data({
      success: true,
      message: "¡Gracias por suscribirte! Revisa tu email.",
    });
  } catch (error) {
    console.error("Newsletter signup error:", error);
    
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return data(
        { error: firstError.message },
        { status: 400 }
      );
    }

    return data(
      { error: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}
