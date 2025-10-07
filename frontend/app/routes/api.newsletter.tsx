import { json, type ActionFunctionArgs } from "@remix-run/node";
import { sendNewsletterWelcome } from "~/lib/resend.server";

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const formData = await request.formData();
    const email = formData.get("email") as string;

    if (!email || !email.includes("@")) {
      return json(
        { error: "Email inválido" },
        { status: 400 }
      );
    }

    // Send welcome email via Resend
    const result = await sendNewsletterWelcome(email);

    if (!result.success) {
      console.error("Failed to send email:", result.error);
      return json(
        { error: "Error al enviar email" },
        { status: 500 }
      );
    }

    return json({
      success: true,
      message: "¡Gracias por suscribirte! Revisa tu email.",
    });
  } catch (error) {
    console.error("Newsletter signup error:", error);
    return json(
      { error: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}
