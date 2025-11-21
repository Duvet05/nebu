import type { LoaderFunctionArgs } from "@remix-run/node";
import { data } from "@remix-run/node";

export async function loader({ request }: LoaderFunctionArgs) {
  const host = request.headers.get("X-Forwarded-Host") ?? request.headers.get("host");
  
  try {
    return data(
      {
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        host,
        environment: process.env.NODE_ENV,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-cache",
        },
      }
    );
  } catch (error) {
    console.error("Health check failed:", error);
    return data(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      },
      {
        status: 500,
      }
    );
  }
}
