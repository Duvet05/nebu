import { data, type ActionFunctionArgs } from "@remix-run/node";
import { processWebhook } from "~/lib/culqi.server";

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return data({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const event = await request.json();

    const result = await processWebhook(event);

    if (!result.success) {
      console.error("Webhook processing failed:", result.error);
      return data({ error: "Webhook processing failed" }, { status: 500 });
    }

    // Handle different event types
    switch (result.type) {
      case "charge_succeeded":
        // TODO: Update database, send notification, etc.
        break;

      case "charge_failed":
        // TODO: Send failure notification
        break;

      case "order_expired":
        // TODO: Update order status
        break;

      default:
        break;
    }

    return data({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return data({ error: "Webhook error" }, { status: 500 });
  }
}
