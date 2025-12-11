import { data, type ActionFunctionArgs } from "@remix-run/node";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001/api/v1";

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return data({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const formData = await request.formData();
    const email = formData.get("email") as string;
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;

    if (!email || !email.includes("@")) {
      return data(
        { error: "Email inválido" },
        { status: 400 }
      );
    }

    // Save lead to backend
    try {
      await fetch(`${BACKEND_URL}/leads/newsletter`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, firstName, lastName }),
      });
    } catch (error) {
      console.error("Failed to save newsletter lead to backend:", error);
      // Continue even if backend fails
    }

    // Send welcome email via backend
    try {
      const emailResponse = await fetch(`${BACKEND_URL}/email/public/newsletter-welcome`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const emailResult = await emailResponse.json();

      if (!emailResult.success) {
        console.error("Failed to send email:", emailResult.error);
        return data(
          { error: "Error al enviar email" },
          { status: 500 }
        );
      }
    } catch (error) {
      console.error("Failed to send email via backend:", error);
      // Continue even if email fails - don't block the signup
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
