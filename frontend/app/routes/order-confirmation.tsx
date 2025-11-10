import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { Header } from "~/components/layout/Header";
import { Footer } from "~/components/layout/Footer";
import { motion } from "framer-motion";
import { CheckCircle, Package, Truck, Mail, Phone, Home, ArrowRight } from "lucide-react";

export const meta: MetaFunction = () => {
  return [
    { title: "Pedido Confirmado - Gracias por tu Compra | Nebu" },
    { name: "description", content: "Tu pedido ha sido confirmado exitosamente" },
    { name: "robots", content: "noindex, nofollow" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const orderId = url.searchParams.get("orderId");

  if (!orderId) {
    throw new Response("Order ID not found", { status: 404 });
  }

  // Here you would typically fetch order details from database
  // For now, we'll return the orderId
  return json({ orderId });
}

export default function OrderConfirmationPage() {
  const { orderId } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-nebu-bg">
      <Header />

      <div className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Success Animation */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, type: "spring" }}
          >
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full mb-6 shadow-lg">
              <CheckCircle className="w-16 h-16 text-white" />
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              ¡Pedido Confirmado!
            </h1>

            <p className="text-xl text-gray-600 mb-2">
              Tu pre-orden ha sido procesada exitosamente
            </p>

            <div className="inline-flex items-center gap-2 bg-white px-6 py-3 rounded-full border-2 border-primary shadow-md">
              <span className="text-sm text-gray-600">Número de Pedido:</span>
              <span className="text-lg font-bold text-primary">{orderId}</span>
            </div>
          </motion.div>

          {/* Confirmation Details */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Email Sent */}
            <motion.div
              className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Correo de Confirmación Enviado
                  </h3>
                  <p className="text-sm text-gray-600">
                    Hemos enviado un correo con los detalles de tu pedido y las instrucciones
                    para completar el pago del 50%.
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    💡 Revisa tu bandeja de entrada y spam
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Next Steps */}
            <motion.div
              className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="flex items-start gap-4">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Package className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Procesando tu Pedido
                  </h3>
                  <p className="text-sm text-gray-600">
                    Nuestro equipo está preparando tu pedido. Te notificaremos cuando
                    esté listo para envío.
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    ⏱️ Tiempo estimado: 2-3 días hábiles
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* What's Next Timeline */}
          <motion.div
            className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              ¿Qué Sigue Ahora?
            </h2>

            <div className="space-y-6">
              {/* Step 1 */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                    1
                  </div>
                  <div className="w-0.5 h-full bg-gradient-to-b from-primary to-transparent mt-2"></div>
                </div>
                <div className="flex-1 pb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Completa el Pago (50%)
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Recibirás un enlace de pago por correo para completar el 50% de adelanto.
                    Puedes pagar con tarjeta o Yape a través de Culqi.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                    2
                  </div>
                  <div className="w-0.5 h-full bg-gradient-to-b from-primary to-transparent mt-2"></div>
                </div>
                <div className="flex-1 pb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Preparación del Pedido
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Una vez confirmado tu pago, prepararemos tu Nebu con mucho cuidado.
                    Te enviaremos actualizaciones por correo.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                    3
                  </div>
                  <div className="w-0.5 h-full bg-gradient-to-b from-primary to-transparent mt-2"></div>
                </div>
                <div className="flex-1 pb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    <Truck className="w-5 h-5 inline mr-2" />
                    Envío Gratis
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Tu pedido será enviado sin costo adicional a la dirección que proporcionaste.
                    Recibirás el código de seguimiento.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                    4
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    ¡Recibe tu Nebu!
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Al recibir tu pedido, pagarás el 50% restante. ¡Y listo! Tu familia puede
                    empezar a disfrutar de aventuras educativas sin pantallas.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border-2 border-primary/20 p-8 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
              ¿Tienes Preguntas sobre tu Pedido?
            </h3>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-white p-4 rounded-xl shadow-md inline-block mb-3">
                  <Mail className="w-8 h-8 text-primary" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Email</h4>
                <a
                  href="mailto:pedidos@flow-telligence.com"
                  className="text-sm text-primary hover:underline"
                >
                  pedidos@flow-telligence.com
                </a>
              </div>

              <div className="text-center">
                <div className="bg-white p-4 rounded-xl shadow-md inline-block mb-3">
                  <Phone className="w-8 h-8 text-primary" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">WhatsApp</h4>
                <a
                  href="https://wa.me/51987654321"
                  className="text-sm text-primary hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  +51 987 654 321
                </a>
              </div>

              <div className="text-center">
                <div className="bg-white p-4 rounded-xl shadow-md inline-block mb-3">
                  <Home className="w-8 h-8 text-primary" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Horario</h4>
                <p className="text-sm text-gray-600">
                  Lun - Vie: 9:00 - 18:00
                </p>
              </div>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/productos"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-accent text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              Seguir Comprando
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 bg-white text-gray-900 border-2 border-gray-300 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300"
            >
              <Home className="w-5 h-5" />
              Volver al Inicio
            </Link>
          </div>

          {/* Thank You Message */}
          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <p className="text-lg text-gray-600 mb-2">
              Gracias por confiar en <strong>Nebu</strong>
            </p>
            <p className="text-sm text-gray-500">
              Estamos emocionados de ser parte del viaje educativo de tu familia 🎉
            </p>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
