import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

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
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const data: CheckoutData = await request.json();

    // Validate required fields
    if (!data.email || !data.firstName || !data.lastName || !data.phone || !data.address || !data.city) {
      return json({ error: "Faltan campos requeridos" }, { status: 400 });
    }

    if (!data.agreeTerms) {
      return json({ error: "Debes aceptar los términos y condiciones" }, { status: 400 });
    }

    if (!data.items || data.items.length === 0) {
      return json({ error: "El carrito está vacío" }, { status: 400 });
    }

    // Generate order ID
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Send confirmation email to customer
    const customerEmail = await resend.emails.send({
      from: "Nebu - Flow Telligence <pedidos@flow-telligence.com>",
      to: data.email,
      subject: `Confirmación de Pre-orden - ${orderId}`,
      html: generateCustomerConfirmationEmail(data, orderId),
    });

    // Send notification email to company
    const companyEmail = await resend.emails.send({
      from: "Nebu Orders <noreply@flow-telligence.com>",
      to: "pedidos@flow-telligence.com",
      subject: `Nueva Pre-orden Recibida - ${orderId}`,
      html: generateCompanyNotificationEmail(data, orderId),
    });

    console.log("Order emails sent:", { customerEmail, companyEmail });

    // Here you would typically:
    // 1. Save order to database
    // 2. Process payment with Culqi
    // 3. Update inventory
    // 4. Send to fulfillment system

    return json({
      success: true,
      orderId,
      message: "Pre-orden procesada exitosamente",
    });
  } catch (error) {
    console.error("Error processing checkout:", error);
    return json(
      { error: "Error al procesar la pre-orden" },
      { status: 500 }
    );
  }
}

function generateCustomerConfirmationEmail(data: CheckoutData, orderId: string): string {
  const itemsHtml = data.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
        <strong>${item.productName}</strong><br>
        <span style="color: #6b7280; font-size: 14px;">Color: ${item.colorName}</span>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">
        ${item.quantity}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
        S/ ${item.price.toFixed(2)}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
        S/ ${(item.price * item.quantity).toFixed(2)}
      </td>
    </tr>
  `
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
              <a href="https://flow-telligence.com/productos" class="button">
                Ver Más Productos
              </a>
            </div>

            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #6366f1;">📞 ¿Necesitas Ayuda?</h3>
              <p>Si tienes alguna pregunta sobre tu pedido, no dudes en contactarnos:</p>
              <p>
                📧 Email: <a href="mailto:pedidos@flow-telligence.com">pedidos@flow-telligence.com</a><br>
                📱 WhatsApp: <a href="https://wa.me/51987654321">+51 987 654 321</a><br>
                🌐 Web: <a href="https://flow-telligence.com">flow-telligence.com</a>
              </p>
            </div>

            <p style="margin-top: 30px; color: #666; font-size: 14px;">
              Gracias por confiar en Nebu. ¡Estamos emocionados de ser parte del viaje educativo de tu familia!
            </p>

            <div class="footer">
              <p><strong>Flow Telligence S.A.C.</strong></p>
              <p>RUC: 10703363135</p>
              <p>Lima, Perú</p>
              <p>© ${new Date().getFullYear()} Flow Telligence. Todos los derechos reservados.</p>
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
      (item) => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${item.productName}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${item.colorName}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">S/ ${item.price.toFixed(2)}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">S/ ${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `
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
