import type { MetaFunction } from "@remix-run/node";
import { useTranslation } from "react-i18next";
import { Header } from "~/components/layout/Header";
import { Footer } from "~/components/layout/Footer";
import { Newsletter } from "~/components/Newsletter";
import { motion } from "framer-motion";
import { CONTACT, BUSINESS } from "~/config/constants";
import { 
  Mail, Calendar, FileText, Shield, Scale, Phone, 
  AlertCircle, Check, Clock, Package, RefreshCw, Users, Heart, Lock,
  Smartphone, Wifi, Award
} from "lucide-react";

export const meta: MetaFunction = () => {
  const url = `${BUSINESS.website}/terms`;
  return [
    { title: "Términos y Condiciones - Nebu | Flow-telligence" },
    {
      name: "description",
      content: "Términos y condiciones de uso para Nebu y Flow-telligence. Lee nuestras políticas de uso, privacidad y responsabilidad del servicio.",
    },
    { name: "robots", content: "noindex, follow" },

    // Open Graph
    { property: "og:title", content: "Términos y Condiciones - Nebu" },
    { property: "og:description", content: "Términos y condiciones de uso de Nebu y Flow-telligence." },
    { property: "og:type", content: "website" },
    { property: "og:url", content: url },
  ];
};

export default function TermsOfService() {
  const _t = useTranslation();

  // Tabla de contenidos para navegación rápida
  const sections = [
    { id: "general", title: "1. Información General", icon: FileText },
    { id: "aceptacion", title: "2. Aceptación de Términos", icon: Check },
    { id: "registro", title: "3. Registro y Cuenta", icon: Users },
    { id: "productos", title: "4. Productos y Servicios", icon: Package },
    { id: "precios", title: "5. Precios y Pagos", icon: Scale },
    { id: "compra", title: "6. Proceso de Compra", icon: Package },
    { id: "envios", title: "7. Envíos y Entrega", icon: Package },
    { id: "garantia", title: "8. Garantía y Devoluciones", icon: Award },
    { id: "seguridad-infantil", title: "9. Seguridad Infantil", icon: Heart },
    { id: "datos", title: "10. Protección de Datos", icon: Shield },
    { id: "software", title: "11. Software y Actualizaciones", icon: RefreshCw },
    { id: "propiedad", title: "12. Propiedad Intelectual", icon: Lock },
    { id: "responsabilidad", title: "13. Responsabilidad", icon: AlertCircle },
    { id: "resolucion", title: "14. Resolución de Conflictos", icon: Scale },
  ];

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-nebu-bg relative">
      <Header />
      
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="pt-32 pb-16 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-primary/30 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Calendar className="w-4 h-4" />
              Última actualización: 18 Noviembre 2025
            </div>
            
            <motion.h1 
              className="text-5xl md:text-6xl lg:text-7xl font-bold font-gochi mb-6 text-primary leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Términos y Condiciones
            </motion.h1>
            
            <motion.p 
              className="text-xl text-gray-600 max-w-2xl mx-auto mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Condiciones legales para el uso de Nebu y los servicios de Flow-telligence
            </motion.p>

            {/* Aviso Importante */}
            <motion.div 
              className="max-w-3xl mx-auto bg-primary/5 border border-primary/20 rounded-xl p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="text-left">
                  <p className="text-sm text-gray-700">
                    <strong>Importante:</strong> Nebu es un producto diseñado para niños de 4 a 9 años. 
                    El uso del producto debe realizarse siempre bajo supervisión de un adulto responsable. 
                    Al adquirir Nebu, usted acepta estos términos y se compromete a supervisar su uso adecuado.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Legal Content */}
        <section className="pb-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-4 gap-8">
              
              {/* Tabla de Contenidos - Sticky Sidebar */}
              <motion.div 
                className="lg:col-span-1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="bg-white rounded-2xl shadow-lg p-4 sticky top-24">
                  <h3 className="font-bold text-gray-900 mb-4">Contenido</h3>
                  <nav className="space-y-1">
                    {sections.map((section) => (
                      <button
                        key={section.id}
                        onClick={() => scrollToSection(section.id)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors text-left"
                      >
                        <section.icon className="w-4 h-4 flex-shrink-0" />
                        <span>{section.title}</span>
                      </button>
                    ))}
                  </nav>
                </div>
              </motion.div>

              {/* Terms and Conditions - Main Content */}
              <motion.div 
                className="lg:col-span-3 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-2xl font-bold flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Scale className="w-4 h-4 text-primary" />
                    </div>
                    Términos y Condiciones de Uso
                  </h2>
                </div>
                
                <div className="p-6">
                  <div className="space-y-8">

                    {/* 1. INFORMACIÓN GENERAL DEL COMERCIO */}
                    <div id="general">
                      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary" />
                        1. Información General del Comercio
                      </h3>
                      <div className="bg-gray-50 rounded-xl p-5 space-y-3">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Razón Social</p>
                            <p className="font-semibold text-gray-900">{BUSINESS.legalName}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 mb-1">RUC</p>
                            <p className="font-semibold text-gray-900">{BUSINESS.ruc}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Nombre Comercial</p>
                            <p className="font-semibold text-gray-900">{BUSINESS.name}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Dirección</p>
                            <p className="font-semibold text-gray-900">Lima, Perú</p>
                          </div>
                        </div>
                        <div className="border-t pt-3 mt-3">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-500 mb-1">Teléfono de Contacto</p>
                              <a href={`tel:${CONTACT.phone}`} className="font-semibold text-primary hover:text-accent transition-colors">
                                {CONTACT.whatsapp.display}
                              </a>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 mb-1">Correo Electrónico</p>
                              <a href={`mailto:${CONTACT.email.main}`} className="font-semibold text-primary hover:text-accent transition-colors">
                                {CONTACT.email.main}
                              </a>
                            </div>
                          </div>
                          <div className="mt-3">
                            <p className="text-sm text-gray-500 mb-1">Horario de Atención al Cliente</p>
                            <p className="font-semibold text-gray-900">Lunes a Domingo • 8:00 AM - 10:00 PM (Hora Perú)</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <hr className="border-gray-200" />

                    {/* 2. ACEPTACIÓN DE TÉRMINOS Y CONDICIONES */}
                    <div id="aceptacion">
                      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Check className="w-5 h-5 text-primary" />
                        2. Aceptación de Términos y Condiciones
                      </h3>
                      <div className="space-y-4">
                        <p className="text-gray-600 leading-relaxed">
                          El uso de esta plataforma, la adquisición del producto Nebu y el acceso a nuestros servicios 
                          implica la aceptación plena y sin reservas de los presentes Términos y Condiciones.
                        </p>
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                          <p className="text-sm text-blue-900">
                            <strong>Importante para padres y tutores:</strong> Al adquirir Nebu, usted confirma que es 
                            mayor de edad y acepta supervisar el uso del dispositivo por parte del menor a su cargo.
                          </p>
                        </div>
                        <p className="text-gray-600 leading-relaxed">
                          {BUSINESS.legalName} se reserva el derecho de actualizar estos términos. Los cambios serán notificados 
                          por correo electrónico con al menos 15 días de anticipación. El uso continuado constituye 
                          aceptación de los nuevos términos.
                        </p>
                      </div>
                    </div>

                    <hr className="border-gray-200" />

                    {/* 3. REGISTRO Y CUENTA DE USUARIO */}
                    <div id="registro">
                      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary" />
                        3. Registro y Cuenta de Usuario
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Requisitos de Registro:</h4>
                          <ul className="space-y-2">
                            <li className="flex items-start gap-2">
                              <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-600">Ser mayor de 18 años con capacidad legal para contratar</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-600">Proporcionar información veraz y actualizada</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-600">Mantener la confidencialidad de credenciales de acceso</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-600">Notificar inmediatamente cualquier uso no autorizado</span>
                            </li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Cuenta Familiar Nebu:</h4>
                          <p className="text-gray-600 mb-2">
                            La cuenta familiar permite gestionar múltiples perfiles de niños bajo una sola cuenta de adulto:
                          </p>
                          <ul className="space-y-1 text-gray-600 list-disc pl-5">
                            <li>Hasta 4 perfiles de niños por cuenta</li>
                            <li>Control parental completo sobre contenido y horarios</li>
                            <li>Acceso a reportes de progreso educativo</li>
                            <li>Gestión de privacidad y datos por perfil</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <hr className="border-gray-200" />

                    {/* 4. PRODUCTOS Y SERVICIOS */}
                    <div id="productos">
                      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Package className="w-5 h-5 text-primary" />
                        4. Productos y Servicios
                      </h3>
                      <div className="space-y-4">
                        <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl p-5">
                          <h4 className="font-bold text-gray-900 mb-3">Nebu - Compañero Educativo Inteligente</h4>
                          <p className="text-gray-600 mb-4">
                            Juguete IoT educativo con IA diseñado para niños de 4 a 9 años, que ofrece aprendizaje 
                            interactivo sin pantallas.
                          </p>
                          
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <p className="font-semibold text-gray-900 mb-2">Incluye en la caja:</p>
                              <ul className="space-y-1 text-sm text-gray-600">
                                <li>• Dispositivo Nebu</li>
                                <li>• Cable de carga USB-C</li>
                                <li>• Guía de inicio rápido</li>
                                <li>• Manual de seguridad</li>
                                <li>• Stickers decorativos</li>
                              </ul>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 mb-2">Servicios incluidos:</p>
                              <ul className="space-y-1 text-sm text-gray-600">
                                <li>• App móvil para padres</li>
                                <li>• 2 años de actualizaciones</li>
                                <li>• Contenido educativo ilimitado</li>
                                <li>• Soporte técnico prioritario</li>
                                <li>• Garantía de 1 año</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Especificaciones Técnicas:</h4>
                          <div className="grid md:grid-cols-3 gap-3">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Wifi className="w-4 h-4 text-primary" />
                              WiFi 2.4GHz/5GHz
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Smartphone className="w-4 h-4 text-primary" />
                              iOS 13+ / Android 8+
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Clock className="w-4 h-4 text-primary" />
                              Batería 8+ horas
                            </div>
                          </div>
                        </div>

                        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg">
                          <p className="text-sm text-yellow-900">
                            <strong>Pre-orden:</strong> Actualmente en fase de pre-venta. Tiempo estimado de entrega: 
                            6 semanas desde la confirmación del pedido. Los primeros 100 clientes recibirán 
                            accesorios exclusivos de edición limitada.
                          </p>
                        </div>
                      </div>
                    </div>

                    <hr className="border-gray-200" />

                    {/* 5. PRECIOS Y FORMAS DE PAGO */}
                    <div id="precios">
                      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Scale className="w-5 h-5 text-primary" />
                        5. Precios y Formas de Pago
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Información de Precios:</h4>
                          <ul className="space-y-2">
                            <li className="flex items-start gap-2">
                              <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-600">Precios en Soles (PEN) con IGV incluido (18%)</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-600">Precio de pre-venta con 20% de descuento</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-600">Opción de pago en 3 cuotas sin interés</span>
                            </li>
                          </ul>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-3">Métodos de Pago Aceptados:</h4>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-2">Tarjetas</p>
                              <div className="flex flex-wrap gap-2">
                                <span className="px-2 py-1 bg-white rounded text-xs">Visa</span>
                                <span className="px-2 py-1 bg-white rounded text-xs">Mastercard</span>
                                <span className="px-2 py-1 bg-white rounded text-xs">Amex</span>
                                <span className="px-2 py-1 bg-white rounded text-xs">Diners</span>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-2">Billeteras Digitales</p>
                              <div className="flex flex-wrap gap-2">
                                <span className="px-2 py-1 bg-white rounded text-xs">Yape</span>
                                <span className="px-2 py-1 bg-white rounded text-xs">Plin</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Seguridad en Pagos:</h4>
                          <div className="flex items-start gap-3">
                            <Shield className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-gray-600 text-sm">
                                Procesamiento seguro mediante Culqi con certificación PCI DSS. 
                                No almacenamos datos de tarjetas. Todas las transacciones están encriptadas 
                                con SSL de 256 bits.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <hr className="border-gray-200" />

                    {/* 6. PROCESO DE COMPRA */}
                    <div id="compra">
                      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Package className="w-5 h-5 text-primary" />
                        6. Proceso de Compra
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Pasos para Comprar:</h4>
                          <div className="space-y-3">
                            {[
                              { step: 1, title: "Selecciona", desc: "Elige Nebu y agrégalo al carrito" },
                              { step: 2, title: "Personaliza", desc: "Selecciona color y accesorios opcionales" },
                              { step: 3, title: "Información", desc: "Completa datos de envío y facturación" },
                              { step: 4, title: "Pago", desc: "Elige método de pago y confirma" },
                              { step: 5, title: "Confirmación", desc: "Recibe email con detalles del pedido" }
                            ].map((item) => (
                              <div key={item.step} className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                  <span className="text-sm font-semibold text-primary">{item.step}</span>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{item.title}</p>
                                  <p className="text-sm text-gray-600">{item.desc}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Cancelación de Pedidos:</h4>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-700 mb-2">
                              <strong>Por el cliente:</strong> Puede cancelar sin costo hasta 24 horas después 
                              de realizar el pedido. Posterior a este plazo, aplican cargos del 10% por gastos 
                              administrativos.
                            </p>
                            <p className="text-sm text-gray-700">
                              <strong>Por {BUSINESS.legalName}:</strong> Nos reservamos el derecho de cancelar por falta 
                              de stock, problemas de pago o detección de fraude. Reembolso completo en 5-10 
                              días hábiles.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <hr className="border-gray-200" />

                    {/* 7. ENVÍOS Y ENTREGA */}
                    <div id="envios">
                      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Package className="w-5 h-5 text-primary" />
                        7. Envíos y Entrega
                      </h3>
                      <div className="space-y-4">
                        <div className="bg-blue-50 rounded-xl p-4">
                          <div className="flex items-start gap-3">
                            <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-semibold text-blue-900">Tiempo de Entrega Estimado</p>
                              <p className="text-blue-700 text-sm mt-1">
                                Pre-orden: 6 semanas desde la confirmación del pedido. 
                                Este tiempo incluye fabricación personalizada y control de calidad.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Cobertura y Costos:</h4>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="border rounded-lg p-3">
                              <p className="font-medium text-gray-900 mb-1">Lima Metropolitana</p>
                              <p className="text-sm text-gray-600">S/ 15 - Entrega en 1-2 días*</p>
                            </div>
                            <div className="border rounded-lg p-3">
                              <p className="font-medium text-gray-900 mb-1">Provincias</p>
                              <p className="text-sm text-gray-600">S/ 25 - Entrega en 3-5 días*</p>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            *Después del despacho desde nuestro almacén
                          </p>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Seguimiento del Pedido:</h4>
                          <ul className="space-y-1 text-sm text-gray-600">
                            <li>• Notificación por email en cada etapa del proceso</li>
                            <li>• Código de seguimiento cuando se despache el producto</li>
                            <li>• Opción de reprogramar entrega si no hay nadie en casa</li>
                            <li>• WhatsApp para coordinaciones de última milla</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <hr className="border-gray-200" />

                    {/* 8. GARANTÍA Y DEVOLUCIONES */}
                    <div id="garantia">
                      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Award className="w-5 h-5 text-primary" />
                        8. Garantía y Devoluciones
                      </h3>
                      <div className="space-y-4">
                        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                          <p className="font-semibold text-green-900 mb-2">Garantía de 1 año</p>
                          <p className="text-sm text-green-700">
                            Cubrimos defectos de fabricación y fallas de hardware por 12 meses desde la fecha de compra.
                          </p>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Política de Devolución (30 días):</h4>
                          <p className="text-gray-600 mb-3">
                            Tienes 30 días desde la recepción para devolver Nebu si no estás satisfecho.
                          </p>
                          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                            <p className="text-sm text-gray-700">
                              <strong>Condiciones para devolución:</strong>
                            </p>
                            <ul className="space-y-1 text-sm text-gray-600 list-disc pl-5">
                              <li>Producto en su empaque original</li>
                              <li>Todos los accesorios incluidos</li>
                              <li>Sin daños por mal uso</li>
                              <li>Comprobante de compra</li>
                            </ul>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Proceso de Garantía:</h4>
                          <ol className="space-y-2">
                            <li className="flex items-start gap-2">
                              <span className="font-semibold text-primary">1.</span>
                              <span className="text-gray-600 text-sm">Contacta a {CONTACT.email.support}</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="font-semibold text-primary">2.</span>
                              <span className="text-gray-600 text-sm">Describe el problema con fotos/videos</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="font-semibold text-primary">3.</span>
                              <span className="text-gray-600 text-sm">Recibe autorización de devolución (RMA)</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="font-semibold text-primary">4.</span>
                              <span className="text-gray-600 text-sm">Envía el producto (costo cubierto por nosotros)</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="font-semibold text-primary">5.</span>
                              <span className="text-gray-600 text-sm">Recibe reemplazo o reembolso en 10 días</span>
                            </li>
                          </ol>
                        </div>

                        <div className="bg-gray-100 rounded-lg p-4">
                          <p className="text-sm text-gray-700">
                            <strong>No cubre la garantía:</strong> Daños por líquidos, caídas, modificaciones 
                            no autorizadas, uso de cargadores no oficiales, o desgaste normal por uso.
                          </p>
                        </div>
                      </div>
                    </div>

                    <hr className="border-gray-200" />

                    {/* 9. SEGURIDAD INFANTIL Y USO RESPONSABLE */}
                    <div id="seguridad-infantil">
                      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Heart className="w-5 h-5 text-primary" />
                        9. Seguridad Infantil y Uso Responsable
                      </h3>
                      <div className="space-y-4">
                        <div className="bg-purple-50 border border-purple-200 rounded-xl p-5">
                          <h4 className="font-bold text-purple-900 mb-3">
                            Compromiso con la Seguridad Infantil
                          </h4>
                          <p className="text-purple-800 text-sm mb-3">
                            Nebu está diseñado siguiendo los más altos estándares de seguridad infantil, 
                            cumpliendo con normativas internacionales de protección de menores.
                          </p>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Certificaciones de Seguridad:</h4>
                          <ul className="space-y-2">
                            <li className="flex items-start gap-2">
                              <Shield className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-600 text-sm">
                                <strong>COPPA Compliant:</strong> Cumple con la Ley de Protección de Privacidad 
                                Infantil en Línea
                              </span>
                            </li>
                            <li className="flex items-start gap-2">
                              <Shield className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-600 text-sm">
                                <strong>CE Certified:</strong> Certificación europea de seguridad de juguetes
                              </span>
                            </li>
                            <li className="flex items-start gap-2">
                              <Shield className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-600 text-sm">
                                <strong>Sin publicidad:</strong> Entorno libre de anuncios y contenido comercial
                              </span>
                            </li>
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Recomendaciones de Uso:</h4>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-blue-50 rounded-lg p-3">
                              <p className="font-medium text-blue-900 mb-2">Tiempo de Uso Diario</p>
                              <ul className="space-y-1 text-sm text-blue-700">
                                <li>• 4-5 años: Máximo 30 minutos</li>
                                <li>• 6-7 años: Máximo 45 minutos</li>
                                <li>• 8-9 años: Máximo 60 minutos</li>
                              </ul>
                            </div>
                            <div className="bg-green-50 rounded-lg p-3">
                              <p className="font-medium text-green-900 mb-2">Mejores Prácticas</p>
                              <ul className="space-y-1 text-sm text-green-700">
                                <li>• Usar en espacios comunes</li>
                                <li>• Participación activa de padres</li>
                                <li>• Revisar reportes semanales</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Control Parental Incluido:</h4>
                          <ul className="space-y-2 text-sm text-gray-600">
                            <li className="flex items-start gap-2">
                              <Check className="w-4 h-4 text-primary mt-0.5" />
                              <span>Horarios de uso personalizables</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <Check className="w-4 h-4 text-primary mt-0.5" />
                              <span>Filtros de contenido por edad</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <Check className="w-4 h-4 text-primary mt-0.5" />
                              <span>Modo silencioso para horario escolar</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <Check className="w-4 h-4 text-primary mt-0.5" />
                              <span>Reportes de actividad y progreso</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <Check className="w-4 h-4 text-primary mt-0.5" />
                              <span>Apagado remoto desde la app</span>
                            </li>
                          </ul>
                        </div>

                        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg">
                          <p className="text-sm text-yellow-900">
                            <strong>Advertencia:</strong> Nebu no es un sustituto de la interacción humana. 
                            Debe usarse como complemento educativo bajo supervisión adulta. No recomendado 
                            para niños menores de 4 años debido a piezas pequeñas.
                          </p>
                        </div>
                      </div>
                    </div>

                    <hr className="border-gray-200" />

                    {/* 10. PROTECCIÓN DE DATOS PERSONALES */}
                    <div id="datos">
                      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-primary" />
                        10. Protección de Datos Personales
                      </h3>
                      <div className="space-y-4">
                        <div className="bg-gray-50 rounded-xl p-5">
                          <p className="text-gray-700 mb-3">
                            En cumplimiento de la <strong>Ley N° 29733 - Ley de Protección de Datos Personales</strong> 
                            y el <strong>Reglamento General de Protección de Datos (GDPR)</strong> para usuarios internacionales.
                          </p>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Datos del Adulto Responsable:</h4>
                          <div className="grid md:grid-cols-2 gap-3 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Check className="w-4 h-4 text-green-500" />
                              Nombre completo y DNI/CE
                            </div>
                            <div className="flex items-center gap-2">
                              <Check className="w-4 h-4 text-green-500" />
                              Dirección de envío
                            </div>
                            <div className="flex items-center gap-2">
                              <Check className="w-4 h-4 text-green-500" />
                              Email y teléfono
                            </div>
                            <div className="flex items-center gap-2">
                              <Check className="w-4 h-4 text-green-500" />
                              Información de pago
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Datos del Menor (con consentimiento):</h4>
                          <div className="bg-blue-50 rounded-lg p-4">
                            <p className="text-sm text-blue-900 mb-2">
                              Solo recopilamos con autorización expresa del padre/tutor:
                            </p>
                            <ul className="space-y-1 text-sm text-blue-700">
                              <li>• Nombre o apodo del niño</li>
                              <li>• Edad (no fecha de nacimiento completa)</li>
                              <li>• Preferencias educativas</li>
                              <li>• Grabaciones de voz para interacción (opcional)</li>
                            </ul>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Medidas de Seguridad:</h4>
                          <ul className="space-y-2">
                            <li className="flex items-start gap-2">
                              <Lock className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                              <span className="text-gray-600 text-sm">
                                Encriptación AES-256 para todos los datos sensibles
                              </span>
                            </li>
                            <li className="flex items-start gap-2">
                              <Lock className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                              <span className="text-gray-600 text-sm">
                                Servidores seguros con certificación ISO 27001
                              </span>
                            </li>
                            <li className="flex items-start gap-2">
                              <Lock className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                              <span className="text-gray-600 text-sm">
                                Auditorías de seguridad trimestrales
                              </span>
                            </li>
                            <li className="flex items-start gap-2">
                              <Lock className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                              <span className="text-gray-600 text-sm">
                                Eliminación automática de grabaciones después de 30 días
                              </span>
                            </li>
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Tus Derechos ARCO:</h4>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="border rounded-lg p-3">
                              <p className="font-medium text-gray-900">Acceso</p>
                              <p className="text-xs text-gray-600">Conocer qué datos tenemos</p>
                            </div>
                            <div className="border rounded-lg p-3">
                              <p className="font-medium text-gray-900">Rectificación</p>
                              <p className="text-xs text-gray-600">Corregir datos incorrectos</p>
                            </div>
                            <div className="border rounded-lg p-3">
                              <p className="font-medium text-gray-900">Cancelación</p>
                              <p className="text-xs text-gray-600">Eliminar tus datos</p>
                            </div>
                            <div className="border rounded-lg p-3">
                              <p className="font-medium text-gray-900">Oposición</p>
                              <p className="text-xs text-gray-600">Oponerte al tratamiento</p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mt-3">
                            Para ejercer estos derechos: <a href={`mailto:${CONTACT.email.privacy}`} className="text-primary hover:underline">{CONTACT.email.privacy}</a>
                          </p>
                        </div>
                      </div>
                    </div>

                    <hr className="border-gray-200" />

                    {/* 11. SOFTWARE Y ACTUALIZACIONES */}
                    <div id="software">
                      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <RefreshCw className="w-5 h-5 text-primary" />
                        11. Software y Actualizaciones
                      </h3>
                      <div className="space-y-4">
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-5">
                          <h4 className="font-bold text-gray-900 mb-3">
                            Plan de Actualizaciones Incluido
                          </h4>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <p className="font-medium text-gray-900 mb-2">Primeros 2 años:</p>
                              <ul className="space-y-1 text-sm text-gray-600">
                                <li>• Actualizaciones automáticas gratuitas</li>
                                <li>• Nuevo contenido educativo mensual</li>
                                <li>• Mejoras de IA y funcionalidades</li>
                                <li>• Parches de seguridad prioritarios</li>
                              </ul>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 mb-2">Después de 2 años:</p>
                              <ul className="space-y-1 text-sm text-gray-600">
                                <li>• Actualizaciones de seguridad gratuitas</li>
                                <li>• Plan Premium opcional (S/ 9.90/mes)</li>
                                <li>• Acceso a contenido premium</li>
                                <li>• Soporte técnico extendido</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Requisitos del Sistema:</h4>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="grid md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="font-medium text-gray-900 mb-1">Aplicación Móvil:</p>
                                <ul className="space-y-1 text-gray-600">
                                  <li>• iOS 13.0 o superior</li>
                                  <li>• Android 8.0 (API 26) o superior</li>
                                  <li>• 100 MB de espacio disponible</li>
                                </ul>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 mb-1">Conectividad:</p>
                                <ul className="space-y-1 text-gray-600">
                                  <li>• WiFi 2.4GHz o 5GHz</li>
                                  <li>• Velocidad mínima 5 Mbps</li>
                                  <li>• Router compatible con WPA2</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Proceso de Actualización:</h4>
                          <p className="text-gray-600 text-sm mb-2">
                            Las actualizaciones se descargan automáticamente cuando Nebu está conectado al WiFi 
                            y no está en uso. Puedes configurar horarios específicos desde la app.
                          </p>
                        </div>
                      </div>
                    </div>

                    <hr className="border-gray-200" />

                    {/* 12. PROPIEDAD INTELECTUAL */}
                    <div id="propiedad">
                      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Lock className="w-5 h-5 text-primary" />
                        12. Propiedad Intelectual
                      </h3>
                      <div className="space-y-4">
                        <p className="text-gray-600">
                          Todo el contenido, diseño, software y materiales relacionados con Nebu y Flow-telligence 
                          están protegidos por derechos de autor, marcas registradas y otras leyes de propiedad 
                          intelectual.
                        </p>

                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Propiedad de {BUSINESS.legalName}:</h4>
                          <ul className="space-y-2 text-sm text-gray-600">
                            <li>• Marca registrada "Nebu" y logotipos asociados</li>
                            <li>• Diseño industrial del dispositivo Nebu</li>
                            <li>• Software y algoritmos de IA propietarios</li>
                            <li>• Contenido educativo y metodología de aprendizaje</li>
                            <li>• Interfaz de usuario y experiencia (UX/UI)</li>
                          </ul>
                        </div>

                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                          <p className="text-sm text-red-900">
                            <strong>Prohibido:</strong> Ingeniería inversa, descompilación, modificación no autorizada, 
                            distribución comercial o copia del software/hardware de Nebu. Violaciones serán 
                            perseguidas legalmente.
                          </p>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Licencia de Uso:</h4>
                          <p className="text-gray-600 text-sm">
                            Al adquirir Nebu, se otorga una licencia personal, no transferible y no exclusiva 
                            para usar el dispositivo y software asociado únicamente para fines personales y educativos 
                            no comerciales.
                          </p>
                        </div>
                      </div>
                    </div>

                    <hr className="border-gray-200" />

                    {/* 13. RESPONSABILIDAD Y LIMITACIONES */}
                    <div id="responsabilidad">
                      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-primary" />
                        13. Responsabilidad y Limitaciones
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Limitaciones de Responsabilidad:</h4>
                          <ul className="space-y-2 text-sm text-gray-600">
                            <li className="flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                              <span>No garantizamos resultados educativos específicos</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                              <span>No somos responsables por interrupciones del servicio por fallas de internet</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                              <span>No cubrimos daños por uso inadecuado o negligencia</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                              <span>Límite de responsabilidad: precio pagado por el producto</span>
                            </li>
                          </ul>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-2">Uso Bajo Su Responsabilidad:</h4>
                          <p className="text-sm text-gray-600">
                            El usuario asume la responsabilidad de supervisar el uso de Nebu por parte de menores, 
                            verificar la idoneidad del contenido para su hijo y establecer límites de tiempo apropiados.
                          </p>
                        </div>
                      </div>
                    </div>

                    <hr className="border-gray-200" />

                    {/* 14. LEGISLACIÓN APLICABLE Y RESOLUCIÓN DE CONFLICTOS */}
                    <div id="resolucion">
                      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Scale className="w-5 h-5 text-primary" />
                        14. Legislación Aplicable y Resolución de Conflictos
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Marco Legal:</h4>
                          <p className="text-gray-600 mb-3">
                            Estos términos se rigen por las leyes de la República del Perú:
                          </p>
                          <ul className="space-y-1 text-sm text-gray-600 list-disc pl-5">
                            <li>Código de Protección y Defensa del Consumidor (Ley N° 29571)</li>
                            <li>Ley de Protección de Datos Personales (Ley N° 29733)</li>
                            <li>Normativa de comercio electrónico vigente</li>
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Proceso de Resolución:</h4>
                          <div className="space-y-3">
                            {[
                              { 
                                step: "1", 
                                title: "Contacto Directo", 
                                desc: "Intenta resolver con nuestro equipo de soporte",
                                time: "24-48 horas respuesta"
                              },
                              { 
                                step: "2", 
                                title: "Libro de Reclamaciones", 
                                desc: "Disponible en nuestra web y app",
                                time: "Respuesta en 30 días"
                              },
                              { 
                                step: "3", 
                                title: "INDECOPI", 
                                desc: "Presenta tu reclamo ante la autoridad",
                                time: "Según procedimiento"
                              },
                              { 
                                step: "4", 
                                title: "Vía Judicial", 
                                desc: "Tribunales de Lima, Perú",
                                time: "Última instancia"
                              }
                            ].map((item) => (
                              <div key={item.step} className="flex items-start gap-3 bg-gray-50 rounded-lg p-3">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                  <span className="text-sm font-semibold text-primary">{item.step}</span>
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900">{item.title}</p>
                                  <p className="text-sm text-gray-600">{item.desc}</p>
                                  <p className="text-xs text-gray-500 mt-1">{item.time}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <hr className="border-gray-200" />

                    {/* CONTACTO Y SOPORTE */}
                    <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Phone className="w-5 h-5 text-primary" />
                        Contacto y Soporte
                      </h3>
                      
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <p className="font-semibold text-gray-900 mb-3">Canales de Atención:</p>
                          <div className="space-y-2">
                            <a href={`mailto:${CONTACT.email.main}`} className="flex items-center gap-2 text-primary hover:text-accent transition-colors">
                              <Mail className="w-4 h-4" />
                              <span className="text-sm">{CONTACT.email.main}</span>
                            </a>
                            <a href={`tel:${CONTACT.phone}`} className="flex items-center gap-2 text-primary hover:text-accent transition-colors">
                              <Phone className="w-4 h-4" />
                              <span className="text-sm">{CONTACT.whatsapp.display}</span>
                            </a>
                            <a href={CONTACT.whatsapp.url} className="flex items-center gap-2 text-primary hover:text-accent transition-colors">
                              <MessageCircle className="w-4 h-4" />
                              <span className="text-sm">WhatsApp Business</span>
                            </a>
                          </div>
                        </div>
                        
                        <div>
                          <p className="font-semibold text-gray-900 mb-3">Horarios de Atención:</p>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p>Lunes a Viernes: 8:00 AM - 8:00 PM</p>
                            <p>Sábados: 9:00 AM - 6:00 PM</p>
                            <p>Domingos: 10:00 AM - 4:00 PM</p>
                            <p className="text-xs text-gray-500 mt-2">Hora de Perú (UTC-5)</p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 p-4 bg-white/50 rounded-lg">
                        <p className="text-sm text-gray-700">
                          <strong>Compromiso de respuesta:</strong> Email en 24 horas hábiles • 
                          WhatsApp en 2 horas • Llamadas atendidas inmediatamente en horario de atención
                        </p>
                      </div>
                    </div>

                    {/* DECLARACIÓN FINAL */}
                    <div className="bg-gray-900 text-white rounded-xl p-6 mt-8">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold mb-2">Aceptación de Términos</p>
                          <p className="text-sm text-gray-300">
                            Al realizar una compra o utilizar nuestros servicios, confirmas haber leído, 
                            comprendido y aceptado estos Términos y Condiciones en su totalidad. 
                            Si no estás de acuerdo con alguna parte, no debes usar nuestros servicios.
                          </p>
                          <p className="text-xs text-gray-400 mt-3">
                            Última actualización: 18 de Noviembre de 2025 • Versión 2.0
                          </p>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </motion.div>

            </div>
          </div>
        </section>
      </div>

      <Newsletter />
      <Footer />
    </div>
  );
}

// Add MessageCircle import at the top with other lucide icons
import { MessageCircle } from "lucide-react";