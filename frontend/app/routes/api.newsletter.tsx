import { data, type ActionFunctionArgs } from "@remix-run/node";
import { sendNewsletterWelcome } from "~/lib/resend.server";

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return data({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const formData = await request.formData();
    const email = formData.get("email") as string;

    if (!email || !email.includes("@")) {
      return data(
        { error: "Email inválido" },
        { status: 400 }
      );
    }

    // Send welcome email via Resend
    const result = await sendNewsletterWelcome(email);

    if (!result.success) {
      console.error("Failed to send email:", result.error);
      return data(
        { error: "Error al enviar email" },
        { status: 500 }
      );
    }

    return data({
      success: true,
      message: "¡Gracias por suscribirte! Revisa tu email.",
    });
  } catch (error) {
    console.error("Newsletter signup error:", error);
    return data(
      { error: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}
