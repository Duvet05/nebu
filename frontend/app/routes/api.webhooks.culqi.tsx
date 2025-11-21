import { data, type ActionFunctionArgs } from "@remix-run/node";
import { processWebhook } from "~/lib/culqi.server";

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return data({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const event = await request.json();

    // Development log - remove in production
    // console.log("Culqi webhook received:", event);

    const result = await processWebhook(event);

    if (!result.success) {
      console.error("Webhook processing failed:", result.error);
      return data({ error: "Webhook processing failed" }, { status: 500 });
    }

    // Handle different event types
    switch (result.type) {
      case "charge_succeeded":
        // TODO: Update database, send notification, etc.
        // console.log("Payment successful:", result.data);
        break;

      case "charge_failed":
        // TODO: Send failure notification
        // console.log("Payment failed:", result.data);
        break;

      case "order_expired":
        // TODO: Update order status
        // console.log("Order expired:", result.data);
        break;

      default:
        // console.log("Unknown event type:", result.type);
        break;
    }

    return data({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return data({ error: "Webhook error" }, { status: 500 });
  }
}
