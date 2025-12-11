import type { ActionFunctionArgs } from "@remix-run/node";
import { data } from "@remix-run/node";
import { createCharge as createCulqiCharge } from "~/lib/culqi.server";

const CULQI_SECRET_KEY = process.env.CULQI_SECRET_KEY || "";
const CULQI_API_URL = "https://api.culqi.com/v2";
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001/api/v1";

interface CheckoutItem {
  productId: string;
  productName: string;
  colorId: string;
  colorName: string;
  quantity: number;
  price: number;
}

interface CheckoutData {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  items: CheckoutItem[];
  subtotal: number;
  shipping: number;
  total: number;
  reserveAmount: number;
  agreeTerms: boolean;
  subscribeNewsletter: boolean;
}

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return data({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const checkoutData: CheckoutData & { culqiToken?: string } = await request.json();

    // Validate required fields
    if (!checkoutData.email || !checkoutData.firstName || !checkoutData.lastName || !checkoutData.phone || !checkoutData.address || !checkoutData.city) {
      return data({ error: "Faltan campos requeridos" }, { status: 400 });
    }

    if (!checkoutData.agreeTerms) {
      return data({ error: "Debes aceptar los términos y condiciones" }, { status: 400 });
    }

    if (!checkoutData.items || checkoutData.items.length === 0) {
      return data({ error: "El carrito está vacío" }, { status: 400 });
    }

    // Generate order ID
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    // Process Culqi payment if token provided
    let culqiChargeId = null;
    if (checkoutData.culqiToken) {
      try {
        // Adapt checkout data to PreOrderData format expected by createCulqiCharge
        const preOrderData = {
          email: checkoutData.email,
          firstName: checkoutData.firstName,
          lastName: checkoutData.lastName,
          phone: checkoutData.phone,
          address: checkoutData.address,
          city: checkoutData.city,
          postalCode: checkoutData.postalCode,
          quantity: checkoutData.items.reduce((sum, item) => sum + item.quantity, 0),
          color: checkoutData.items.map(i => i.colorName).join(", "),
          totalPrice: checkoutData.reserveAmount,
        };
        
        const chargeResult = await createCulqiCharge(
          checkoutData.culqiToken,
          preOrderData
        );

        if (!chargeResult.success) {
          return data(
            {
              error: chargeResult.error || "Error al procesar el pago",
              errorCode: chargeResult.errorCode,
              retryable: chargeResult.retryable,
            },
            { status: 402 }
          );
        }

        culqiChargeId = chargeResult.data?.id;
      } catch (error) {
        console.error("Culqi charge error:", error);
        return data(
          { error: "Error al procesar el pago con Culqi" },
          { status: 402 }
        );
      }
    }

    // Create Culqi Order (for payment link)
    let culqiOrderId = null;
    try {
      const culqiOrder = await createCulqiOrder(checkoutData, orderId);
      culqiOrderId = culqiOrder.id;
    } catch (error) {
      console.error("Error creating Culqi order:", error);
      // Continue even if Culqi order creation fails
    }

    // Send confirmation emails via backend
    try {
      await fetch(`${BACKEND_URL}/email/public/order-confirmation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: checkoutData.email,
          firstName: checkoutData.firstName,
          lastName: checkoutData.lastName,
          orderId,
          items: checkoutData.items,
          subtotal: checkoutData.subtotal,
          shipping: checkoutData.shipping,
          total: checkoutData.total,
          reserveAmount: checkoutData.reserveAmount,
          address: checkoutData.address,
          city: checkoutData.city,
          postalCode: checkoutData.postalCode,
          phone: checkoutData.phone,
        }),
      });
    } catch (error) {
      console.error("Failed to send emails via backend:", error);
      // Continue even if email fails
    }

    // Create order in backend (validates stock and decrements automatically)

    try {
      const orderResponse = await fetch(`${BACKEND_URL}/orders/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: checkoutData.email,
          firstName: checkoutData.firstName,
          lastName: checkoutData.lastName,
          phone: checkoutData.phone,
          address: checkoutData.address,
          city: checkoutData.city,
          postalCode: checkoutData.postalCode,
          items: checkoutData.items,
          subtotal: checkoutData.subtotal,
          shipping: checkoutData.shipping,
          total: checkoutData.total,
          reserveAmount: checkoutData.reserveAmount,
          agreeTerms: checkoutData.agreeTerms,
          subscribeNewsletter: checkoutData.subscribeNewsletter,
          metadata: {
            culqiOrderId,
            culqiChargeId,
          },
        }),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        console.error("Backend order creation failed:", errorData);
        return data(
          {
            error: errorData.message || "Error al crear la orden",
            outOfStock: errorData.message?.includes("stock"),
          },
          { status: 400 }
        );
      }

      const order = await orderResponse.json();

      return data({
        success: true,
        orderId: order.orderNumber || orderId,
        backendOrderId: order.id,
        culqiOrderId,
        message: "Pre-orden procesada exitosamente",
      });

    } catch (error) {
      console.error("Error creating order in backend:", error);
      // If backend fails, still return success but log the error
      // This prevents losing the customer's order information
      return data({
        success: true,
        orderId,
        culqiOrderId,
        message: "Pre-orden procesada exitosamente",
        warning: "La orden se guardó localmente pero hubo un error con el sistema",
      });
    }
  } catch (error) {
    console.error("Error processing checkout:", error);
    return data(
      { error: "Error al procesar la pre-orden" },
      { status: 500 }
    );
  }
}

function generateCustomerConfirmationEmail(data: CheckoutData, orderId: string): string {
  const itemsHtml = data.items
    .map(
      (item) => {
        const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
        return `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
        <strong>${item.productName}</strong><br>
        <span style="color: #6b7280; font-size: 14px;">Color: ${item.colorName}</span>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">
        ${item.quantity}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
        S/ ${price.toFixed(2)}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
        S/ ${(price * item.quantity).toFixed(2)}
      </td>
    </tr>
  `;
      }
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .order-box { background: white; padding: 20px; margin-bottom: 20px; border-radius: 8px; border: 2px solid #6366f1; }
          .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .total-row { font-weight: bold; background: #f3f4f6; }
          .highlight { background: #dbeafe; border: 2px solid #3b82f6; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .button { display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 10px 0; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ ¡Pre-orden Confirmada!</h1>
            <p style="font-size: 18px; margin: 10px 0 0 0;">Pedido #${orderId}</p>
          </div>

          <div class="content">
            <p>Hola <strong>${data.firstName} ${data.lastName}</strong>,</p>

            <p>
              ¡Gracias por tu pre-orden! Hemos recibido tu pedido exitosamente y estamos emocionados de que
              tu nuevo Nebu pronto sea parte de tu familia.
            </p>

            <div class="order-box">
              <h2 style="margin-top: 0; color: #6366f1;">📦 Detalles de tu Pedido</h2>

              <table class="table">
                <thead>
                  <tr style="background: #f3f4f6;">
                    <th style="padding: 12px; text-align: left;">Producto</th>
                    <th style="padding: 12px; text-align: center;">Cant.</th>
                    <th style="padding: 12px; text-align: right;">Precio Unit.</th>
                    <th style="padding: 12px; text-align: right;">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                  <tr>
                    <td colspan="3" style="padding: 12px; text-align: right;"><strong>Subtotal:</strong></td>
                    <td style="padding: 12px; text-align: right;"><strong>S/ ${data.subtotal.toFixed(2)}</strong></td>
                  </tr>
                  <tr>
                    <td colspan="3" style="padding: 12px; text-align: right;"><strong>Envío:</strong></td>
                    <td style="padding: 12px; text-align: right; color: #10b981;"><strong>GRATIS</strong></td>
                  </tr>
                  <tr class="total-row">
                    <td colspan="3" style="padding: 12px; text-align: right; font-size: 18px;"><strong>Total:</strong></td>
                    <td style="padding: 12px; text-align: right; font-size: 18px;"><strong>S/ ${data.total.toFixed(2)}</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="highlight">
              <h3 style="margin-top: 0; color: #1e40af;">💰 Modalidad de Pre-orden (50%)</h3>
              <p style="margin: 10px 0;">
                Has reservado tu pedido con el <strong>50% del valor total</strong>.
              </p>
              <table style="width: 100%; margin: 15px 0;">
                <tr>
                  <td style="padding: 10px; background: white; border-radius: 6px;">
                    <strong>A pagar ahora (50%):</strong>
                  </td>
                  <td style="padding: 10px; background: white; border-radius: 6px; text-align: right;">
                    <span style="font-size: 24px; color: #6366f1;"><strong>S/ ${data.reserveAmount.toFixed(2)}</strong></span>
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="padding: 10px; padding-top: 5px;">
                    <small style="color: #6b7280;">El 50% restante (S/ ${(data.total - data.reserveAmount).toFixed(2)}) se pagará al momento de la entrega</small>
                  </td>
                </tr>
              </table>
            </div>

            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #6366f1;">📍 Dirección de Envío</h3>
              <p style="margin: 5px 0;"><strong>${data.firstName} ${data.lastName}</strong></p>
              <p style="margin: 5px 0;">${data.address}</p>
              <p style="margin: 5px 0;">${data.city}${data.postalCode ? `, ${data.postalCode}` : ""}</p>
              <p style="margin: 5px 0;">📧 ${data.email}</p>
              <p style="margin: 5px 0;">📱 ${data.phone}</p>
            </div>

            <div style="background: #fef3c7; border: 2px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">⏰ ¿Qué sigue?</h3>
              <ol style="margin: 10px 0; padding-left: 20px;">
                <li style="margin: 8px 0;">Te enviaremos un enlace de pago para completar el 50% de reserva</li>
                <li style="margin: 8px 0;">Recibirás actualizaciones sobre el estado de tu pedido</li>
                <li style="margin: 8px 0;">Te notificaremos cuando tu Nebu esté listo para envío</li>
                <li style="margin: 8px 0;">¡Disfrutarás de tu nuevo compañero educativo!</li>
              </ol>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${BUSINESS.website}/productos" class="button">
                Ver Más Productos
              </a>
            </div>

            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #6366f1;">📞 ¿Necesitas Ayuda?</h3>
              <p>Si tienes alguna pregunta sobre tu pedido, no dudes en contactarnos:</p>
              <p>
                📧 Email: <a href="mailto:${CONTACT.email.sales}">${CONTACT.email.sales}</a><br>
                📱 WhatsApp: <a href="${CONTACT.whatsapp.url}">${CONTACT.phone}</a><br>
                🌐 Web: <a href="${BUSINESS.website}">${BUSINESS.name}</a>
              </p>
            </div>

            <p style="margin-top: 30px; color: #666; font-size: 14px;">
              Gracias por confiar en Nebu. ¡Estamos emocionados de ser parte del viaje educativo de tu familia!
            </p>

            <div class="footer">
              <p><strong>${BUSINESS.legalName}</strong></p>
              <p>RUC: ${BUSINESS.ruc}</p>
              <p>${BUSINESS.address.full}</p>
              <p>© ${new Date().getFullYear()} ${BUSINESS.name}. Todos los derechos reservados.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

function generateCompanyNotificationEmail(data: CheckoutData, orderId: string): string {
  const itemsHtml = data.items
    .map(
      (item) => {
        const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
        return `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${item.productName}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${item.colorName}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">S/ ${price.toFixed(2)}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">S/ ${(price * item.quantity).toFixed(2)}</td>
    </tr>
  `;
      }
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 700px; margin: 0 auto; padding: 20px; }
          .header { background: #6366f1; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
          .section { background: white; padding: 15px; margin: 15px 0; border-radius: 6px; border-left: 4px solid #6366f1; }
          .table { width: 100%; border-collapse: collapse; margin: 10px 0; }
          .alert { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🛒 Nueva Pre-orden Recibida</h1>
            <p style="margin: 5px 0;">Pedido #${orderId}</p>
            <p style="margin: 5px 0; font-size: 14px;">${new Date().toLocaleString("es-PE", { timeZone: "America/Lima" })}</p>
          </div>

          <div class="content">
            <div class="section">
              <h3 style="margin-top: 0; color: #6366f1;">👤 Información del Cliente</h3>
              <p><strong>Nombre:</strong> ${data.firstName} ${data.lastName}</p>
              <p><strong>Email:</strong> ${data.email}</p>
              <p><strong>Teléfono:</strong> ${data.phone}</p>
              <p><strong>Dirección:</strong> ${data.address}, ${data.city}${data.postalCode ? `, ${data.postalCode}` : ""}</p>
            </div>

            <div class="section">
              <h3 style="margin-top: 0; color: #6366f1;">📦 Productos Ordenados</h3>
              <table class="table">
                <thead>
                  <tr style="background: #f3f4f6;">
                    <th style="padding: 8px; text-align: left;">Producto</th>
                    <th style="padding: 8px; text-align: left;">Color</th>
                    <th style="padding: 8px; text-align: center;">Cant.</th>
                    <th style="padding: 8px; text-align: right;">Precio</th>
                    <th style="padding: 8px; text-align: right;">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                  <tr style="font-weight: bold; background: #f3f4f6;">
                    <td colspan="4" style="padding: 8px; text-align: right;">TOTAL:</td>
                    <td style="padding: 8px; text-align: right;">S/ ${data.total.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="alert">
              <strong>💰 Modalidad de Pre-orden:</strong><br>
              Adelanto (50%): <strong>S/ ${data.reserveAmount.toFixed(2)}</strong><br>
              Saldo al entregar: S/ ${(data.total - data.reserveAmount).toFixed(2)}
            </div>

            <div class="section">
              <h3 style="margin-top: 0; color: #6366f1;">✅ Acciones Requeridas</h3>
              <ol>
                <li>Enviar link de pago Culqi al cliente</li>
                <li>Confirmar el pago del 50%</li>
                <li>Preparar el pedido para envío</li>
                <li>Actualizar al cliente sobre el estado</li>
              </ol>
            </div>

            <p style="margin-top: 20px; font-size: 12px; color: #666;">
              Newsletter: ${data.subscribeNewsletter ? "✅ Sí" : "❌ No"}
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Create a Culqi Order for payment link
 */
async function createCulqiOrder(data: CheckoutData, orderId: string) {
  const amountInCents = Math.round(data.reserveAmount * 100); // Convert to cents

  const orderData = {
    amount: amountInCents,
    currency_code: "PEN",
    description: `Pre-orden ${orderId} - ${data.items.length} producto(s)`,
    order_number: orderId,
    client_details: {
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      phone_number: data.phone,
    },
    expiration_date: Math.floor(Date.now() / 1000) + 86400 * 7, // 7 days from now
    metadata: {
      order_id: orderId,
      total_amount: data.total,
      reserve_amount: data.reserveAmount,
      items_count: data.items.length,
      customer_address: data.address,
      customer_city: data.city,
    },
  };

  const response = await fetch(`${CULQI_API_URL}/orders`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${CULQI_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(orderData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Culqi API error: ${JSON.stringify(error)}`);
  }

  return await response.json();
}
