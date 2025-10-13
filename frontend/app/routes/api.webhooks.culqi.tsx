import { json, type ActionFunctionArgs } from "@remix-run/node";
import { processWebhook } from "~/lib/culqi.server";

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const event = await request.json();

    console.log("Culqi webhook received:", event);

    const result = await processWebhook(event);

    if (!result.success) {
      console.error("Webhook processing failed:", result.error);
      return json({ error: "Webhook processing failed" }, { status: 500 });
    }

    // Handle different event types
    switch (result.type) {
      case "charge_succeeded":
        console.log("Payment successful:", result.data);
        // TODO: Update database, send notification, etc.
        break;

      case "charge_failed":
        console.log("Payment failed:", result.data);
        // TODO: Send failure notification
        break;

      case "order_expired":
        console.log("⏰ Order expired:", result.data);
        // TODO: Update order status
        break;

      default:
        console.log("📦 Unknown event type:", result.type);
    }

    return json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return json({ error: "Webhook error" }, { status: 500 });
  }
}
