import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const formData = await request.json();

    // Generate unique complaint number
    const timestamp = Date.now();
    const hojaNumber = `LR-${timestamp.toString().slice(-8)}`;

    // Email to company
    const companyEmail = await resend.emails.send({
      from: "Libro de Reclamaciones <contacto@flow-telligence.com>",
      to: "contacto@flow-telligence.com",
      subject: `Nuevo ${formData.tipoReclamo === "reclamo" ? "Reclamo" : "Queja"} - ${hojaNumber}`,
      html: generateCompanyEmail(formData, hojaNumber),
    });

    // Email to customer
    const customerEmail = await resend.emails.send({
      from: "Flow Telligence <contacto@flow-telligence.com>",
      to: formData.email,
      subject: `Confirmación de ${formData.tipoReclamo === "reclamo" ? "Reclamo" : "Queja"} - ${hojaNumber}`,
      html: generateCustomerEmail(formData, hojaNumber),
    });

    console.log("Complaint emails sent:", { companyEmail, customerEmail });

    return json({
      success: true,
      hojaNumber,
      message: "Reclamo registrado exitosamente",
    });
  } catch (error) {
    console.error("Error processing complaint:", error);
    return json(
      { error: "Error al procesar el reclamo" },
      { status: 500 }
    );
  }
}

function generateCompanyEmail(data: any, hojaNumber: string): string {
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
          .section { background: white; padding: 20px; margin-bottom: 20px; border-radius: 8px; border-left: 4px solid #6366f1; }
          .section h3 { margin-top: 0; color: #6366f1; }
          .field { margin-bottom: 15px; }
          .label { font-weight: bold; color: #666; }
          .value { color: #333; }
          .alert { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📋 Nuevo ${data.tipoReclamo === "reclamo" ? "Reclamo" : "Queja"}</h1>
            <p style="font-size: 18px; margin: 10px 0 0 0;">Hoja N° ${hojaNumber}</p>
          </div>

          <div class="content">
            <div class="section">
              <h3>👤 Datos del Consumidor</h3>
              <div class="field">
                <span class="label">Nombre Completo:</span>
                <span class="value">${data.nombres} ${data.apellidos}</span>
              </div>
              <div class="field">
                <span class="label">${data.tipoDocumento}:</span>
                <span class="value">${data.numeroDocumento}</span>
              </div>
              <div class="field">
                <span class="label">Email:</span>
                <span class="value">${data.email}</span>
              </div>
              <div class="field">
                <span class="label">Teléfono:</span>
                <span class="value">${data.telefono}</span>
              </div>
              <div class="field">
                <span class="label">Dirección:</span>
                <span class="value">${data.direccion}, ${data.departamento}</span>
              </div>
              ${
                data.menorEdad
                  ? `
              <div class="field">
                <span class="label">Tutor:</span>
                <span class="value">${data.tutorNombres} ${data.tutorApellidos} (DNI: ${data.tutorDocumento})</span>
              </div>
              `
                  : ""
              }
            </div>

            <div class="section">
              <h3>📦 Detalle del ${data.tipoReclamo === "reclamo" ? "Reclamo" : "Queja"}</h3>
              <div class="field">
                <span class="label">Tipo:</span>
                <span class="value">${data.tipoReclamo === "reclamo" ? "RECLAMO" : "QUEJA"}</span>
              </div>
              <div class="field">
                <span class="label">Producto/Servicio:</span>
                <span class="value">${data.producto}</span>
              </div>
              <div class="field">
                <span class="label">Monto:</span>
                <span class="value">S/ ${data.monto}</span>
              </div>
              ${
                data.pedido
                  ? `
              <div class="field">
                <span class="label">N° Pedido:</span>
                <span class="value">${data.pedido}</span>
              </div>
              `
                  : ""
              }
              <div class="field">
                <span class="label">Descripción:</span>
                <div class="value" style="margin-top: 10px; padding: 15px; background: #f9fafb; border-radius: 6px; white-space: pre-wrap;">${data.descripcion}</div>
              </div>
            </div>

            <div class="alert">
              <strong>⏰ Plazo de respuesta:</strong> 30 días calendario según Ley N° 29571
            </div>

            <p style="margin-top: 20px; color: #666; font-size: 14px;">
              Fecha de registro: ${new Date().toLocaleString("es-PE", {
                timeZone: "America/Lima",
              })}
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}

function generateCustomerEmail(data: any, hojaNumber: string): string {
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
          .success-box { background: #d1fae5; border: 2px solid #10b981; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center; }
          .info-box { background: white; padding: 20px; margin-bottom: 20px; border-radius: 8px; border-left: 4px solid #6366f1; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ ${data.tipoReclamo === "reclamo" ? "Reclamo" : "Queja"} Registrado</h1>
            <p style="font-size: 18px; margin: 10px 0 0 0;">Flow Telligence</p>
          </div>

          <div class="content">
            <div class="success-box">
              <h2 style="margin: 0 0 10px 0; color: #059669;">Tu ${data.tipoReclamo} ha sido registrado</h2>
              <p style="margin: 0; font-size: 24px; font-weight: bold; color: #047857;">
                Hoja N° ${hojaNumber}
              </p>
            </div>

            <p>Estimado/a <strong>${data.nombres} ${data.apellidos}</strong>,</p>

            <p>
              Hemos recibido tu ${data.tipoReclamo} y lo hemos registrado en nuestro Libro de Reclamaciones
              Virtual con el número de hoja indicado arriba.
            </p>

            <div class="info-box">
              <h3 style="margin-top: 0; color: #6366f1;">📋 Resumen</h3>
              <p><strong>Tipo:</strong> ${data.tipoReclamo === "reclamo" ? "Reclamo" : "Queja"}</p>
              <p><strong>Producto/Servicio:</strong> ${data.producto}</p>
              <p><strong>Monto:</strong> S/ ${data.monto}</p>
              <p><strong>Fecha:</strong> ${new Date().toLocaleDateString("es-PE")}</p>
            </div>

            <div class="info-box">
              <h3 style="margin-top: 0; color: #6366f1;">⏰ ¿Qué sigue?</h3>
              <p>
                De acuerdo al Código de Protección y Defensa del Consumidor (Ley N° 29571),
                nos comprometemos a responder tu ${data.tipoReclamo} en un plazo no mayor a
                <strong>30 días calendario</strong>.
              </p>
              <p>
                Te contactaremos al correo <strong>${data.email}</strong> con la respuesta y
                solución correspondiente.
              </p>
            </div>

            <div class="info-box">
              <h3 style="margin-top: 0; color: #6366f1;">📞 ¿Necesitas más ayuda?</h3>
              <p>Si tienes alguna consulta adicional, puedes contactarnos:</p>
              <p>
                📧 Email: <a href="mailto:contacto@flow-telligence.com">contacto@flow-telligence.com</a><br>
                📱 WhatsApp: +51 987 654 321<br>
                🌐 Web: <a href="https://flow-telligence.com">flow-telligence.com</a>
              </p>
            </div>

            <p style="margin-top: 30px; color: #666; font-size: 14px;">
              Este es un correo automático. Por favor, conserva este email como comprobante
              de tu ${data.tipoReclamo}.
            </p>

            <div class="footer">
              <p><strong>Flow Telligence S.A.C.</strong></p>
              <p>Lima, Perú</p>
              <p>© ${new Date().getFullYear()} Flow Telligence. Todos los derechos reservados.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}
