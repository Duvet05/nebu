import type { MetaFunction } from "@remix-run/node";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  Calendar,
  Mail,
  MapPin,
  Truck,
  Shield,
  Clock,
  CheckCircle,
  RefreshCw,
  Package,
  Phone,
  AlertCircle,
  ArrowRight,
  Award,
  HelpCircle,
  FileText,
  Download,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Box,
  CreditCard,
  Send,
  Check,
  X,
  Info,
  Gift,
  Zap,
  Heart,
  Star
} from "lucide-react";
import { Header } from "~/components/layout/Header";
import { Footer } from "~/components/layout/Footer";
import { Newsletter } from "~/components/Newsletter";

export const meta: MetaFunction = () => {
  return [
    { title: "Devoluciones y Garantía - Nebu | 30 Días Garantía de Satisfacción" },
    {
      name: "description",
      content: "Garantía de satisfacción de 30 días. Devolución gratis, reembolso completo. Proceso simple y transparente. 12 meses garantía de hardware. Soporte 24/7."
    },
    {
      name: "keywords",
      content: "devoluciones nebu, garantía nebu, reembolso nebu, política de devolución, garantía 30 días, cambios nebu"
    },

    // Open Graph
    { property: "og:title", content: "Devoluciones y Garantía - Nebu | 30 Días Satisfacción" },
    { property: "og:description", content: "30 días garantía de satisfacción. Devolución gratis y reembolso completo. Sin preguntas." },
    { property: "og:type", content: "website" },
    { property: "og:url", content: "https://flow-telligence.com/returns" },
    { property: "og:image", content: "https://flow-telligence.com/images/returns-hero.jpg" },
  ];
};

interface FAQItem {
  question: string;
  answer: string;
}

export default function ReturnsPolicy() {
  const { t } = useTranslation("common");
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [selectedReason, setSelectedReason] = useState<string>("");

  // FAQs sobre devoluciones
  const faqs: FAQItem[] = [
    {
      question: "¿Cuánto tiempo tengo para devolver Nebu?",
      answer: "Tienes 30 días calendario desde que recibes el producto para solicitar una devolución. Este período te permite probar Nebu con tu familia y asegurarte de que es perfecto para tu hijo."
    },
    {
      question: "¿El envío de devolución es gratuito?",
      answer: "¡Sí! Nosotros cubrimos el 100% del costo de envío de devolución. Te enviaremos una etiqueta prepagada y coordinaremos la recolección en tu domicilio."
    },
    {
      question: "¿En qué condición debe estar el producto?",
      answer: "Nebu debe estar en condición funcional con todos sus accesorios originales. Entendemos que los niños lo habrán usado, por lo que el desgaste normal está bien. Solo pedimos que no tenga daños mayores."
    },
    {
      question: "¿Cuánto tarda el reembolso?",
      answer: "Una vez que recibamos y verifiquemos el producto (1-2 días), procesaremos tu reembolso inmediatamente. Verás el dinero en tu cuenta en 5-10 días hábiles según tu banco."
    },
    {
      question: "¿Puedo devolver Nebu si fue un regalo?",
      answer: "Sí, aceptamos devoluciones de regalos. El reembolso se puede hacer al comprador original o como crédito de tienda para el receptor del regalo."
    },
    {
      question: "¿Qué pasa si Nebu llega dañado?",
      answer: "Si Nebu llega dañado, contáctanos inmediatamente con fotos del daño. Te enviaremos un reemplazo express sin costo adicional o un reembolso completo, lo que prefieras."
    }
  ];

  // Razones comunes de devolución
  const returnReasons = [
    "No cumple expectativas",
    "Mi hijo no se interesó",
    "Problemas técnicos",
    "Regalo duplicado",
    "Cambio de opinión",
    "Otro motivo"
  ];

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 to-purple-50/50 relative">
      <Header />
      
      <div className="relative z-10">
        {/* Hero Section Mejorado */}
        <section className="pt-32 pb-16 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <motion.div 
              className="inline-flex items-center gap-2 bg-green-100 border border-green-300 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Shield className="w-4 h-4" />
              Garantía de Satisfacción Total
            </motion.div>
            
            <motion.h1 
              className="text-5xl md:text-6xl lg:text-7xl font-bold font-gochi mb-6 text-primary leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              30 Días de Garantía
            </motion.h1>
            
            <motion.p 
              className="text-xl text-gray-600 max-w-3xl mx-auto mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Prueba Nebu sin riesgo. Si no estás 100% satisfecho, 
              te devolvemos tu dinero completo. Sin preguntas, sin letra pequeña.
            </motion.p>

            {/* Beneficios destacados */}
            <motion.div 
              className="grid md:grid-cols-4 gap-4 max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="bg-white rounded-xl p-4 shadow-md">
                <RefreshCw className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-900">30 Días</p>
                <p className="text-xs text-gray-600">Para devolver</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-md">
                <Truck className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-900">Envío Gratis</p>
                <p className="text-xs text-gray-600">De devolución</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-md">
                <CreditCard className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-900">100% Reembolso</p>
                <p className="text-xs text-gray-600">Garantizado</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-md">
                <Award className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-900">1 Año</p>
                <p className="text-xs text-gray-600">De garantía</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Contenido Principal */}
        <section className="pb-20 px-4">
          <div className="max-w-7xl mx-auto">
            
            {/* Proceso de Devolución Visual */}
            <motion.div 
              className="bg-white rounded-3xl shadow-xl p-8 mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h2 className="text-3xl font-bold text-center mb-2 text-gray-900">
                Proceso de Devolución Super Simple
              </h2>
              <p className="text-center text-gray-600 mb-10">
                Solo 4 pasos para tu tranquilidad total
              </p>

              <div className="grid md:grid-cols-4 gap-6">
                {[
                  {
                    step: 1,
                    icon: Mail,
                    title: "Contáctanos",
                    description: "Envía un email o llámanos",
                    time: "2 minutos",
                    color: "blue"
                  },
                  {
                    step: 2,
                    icon: Package,
                    title: "Empaca Nebu",
                    description: "Te enviamos etiqueta prepagada",
                    time: "5 minutos",
                    color: "purple"
                  },
                  {
                    step: 3,
                    icon: Truck,
                    title: "Recolección",
                    description: "Recogemos en tu domicilio",
                    time: "Sin costo",
                    color: "green"
                  },
                  {
                    step: 4,
                    icon: CreditCard,
                    title: "Reembolso",
                    description: "100% de tu dinero de vuelta",
                    time: "5-10 días",
                    color: "orange"
                  }
                ].map((item, index) => (
                  <div key={item.step} className="relative">
                    <div className="text-center">
                      <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-${item.color}-100 flex items-center justify-center relative`}>
                        <item.icon className={`w-8 h-8 text-${item.color}-600`} />
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center">
                          <span className="text-sm font-bold text-gray-900">{item.step}</span>
                        </div>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                      <span className={`inline-block px-2 py-1 bg-${item.color}-50 text-${item.color}-700 text-xs rounded-full font-medium`}>
                        {item.time}
                      </span>
                    </div>
                    {index < 3 && (
                      <div className="hidden md:block absolute top-8 left-[60%] w-[80%]">
                        <ArrowRight className="w-6 h-6 text-gray-300" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-10 text-center">
                <motion.button 
                  className="bg-primary hover:bg-accent text-white font-bold py-3 px-8 rounded-full transition-colors inline-flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <RefreshCw className="w-5 h-5" />
                  Iniciar Devolución Ahora
                </motion.button>
                <p className="text-xs text-gray-500 mt-2">Sin complicaciones • Sin preguntas</p>
              </div>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-8">
              
              {/* Contenido Principal */}
              <motion.div 
                className="lg:col-span-2 space-y-8"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                
                {/* Política de 30 Días */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <Heart className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Garantía de Satisfacción de 30 Días</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <p className="text-gray-600">
                      Queremos que estés completamente feliz con Nebu. Por eso te damos 30 días completos 
                      para probarlo con tu familia sin ningún riesgo.
                    </p>
                    
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-5 border border-green-200">
                      <h4 className="font-semibold text-gray-900 mb-3">Lo que incluye:</h4>
                      <div className="space-y-2">
                        {[
                          "30 días calendario desde la entrega",
                          "Reembolso del 100% del precio de compra",
                          "Envío de devolución totalmente gratis",
                          "Sin preguntas ni justificaciones necesarias",
                          "Proceso simple y rápido",
                          "Atención personalizada en español"
                        ].map((item, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-sm text-blue-900">
                        <strong>Consejo:</strong> Usa estos 30 días para que tu hijo explore todas las 
                        funciones de Nebu. La mayoría de los niños se enamoran de él en la primera semana.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Garantía de Hardware */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                      <Award className="w-5 h-5 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Garantía Extendida de 1 Año</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <p className="text-gray-600">
                      Además de los 30 días de satisfacción, Nebu viene con 1 año completo de garantía 
                      que cubre cualquier defecto de fabricación.
                    </p>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-purple-50 rounded-lg p-4">
                        <h4 className="font-semibold text-purple-900 mb-2">
                          <Shield className="w-4 h-4 inline mr-1" />
                          Hardware Cubierto
                        </h4>
                        <ul className="space-y-1 text-sm text-purple-700">
                          <li>• Componentes electrónicos</li>
                          <li>• Batería y carga</li>
                          <li>• Altavoces y micrófono</li>
                          <li>• Conectividad WiFi</li>
                          <li>• Botones y controles</li>
                        </ul>
                      </div>
                      
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-2">
                          <Zap className="w-4 h-4 inline mr-1" />
                          Software Incluido
                        </h4>
                        <ul className="space-y-1 text-sm text-blue-700">
                          <li>• Actualizaciones gratuitas</li>
                          <li>• Corrección de bugs</li>
                          <li>• Nuevas funciones</li>
                          <li>• Soporte técnico 24/7</li>
                          <li>• Contenido educativo</li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                      <p className="text-sm text-yellow-900">
                        <strong>No cubre:</strong> Daños por mal uso, agua, caídas desde más de 1 metro, 
                        modificaciones no autorizadas, o uso de cargadores no oficiales.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Casos Especiales */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-orange-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Casos Especiales</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-blue-900 mb-1">
                        Producto dañado en envío
                      </h4>
                      <p className="text-sm text-blue-700">
                        Reemplazo inmediato sin costo. Solo necesitamos fotos del daño y la caja. 
                        Enviamos el nuevo Nebu por envío express en 24-48 horas.
                      </p>
                    </div>

                    <div className="border-l-4 border-purple-500 bg-purple-50 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-purple-900 mb-1">
                        Defecto de fábrica
                      </h4>
                      <p className="text-sm text-purple-700">
                        Cambio directo por uno nuevo o reembolso completo, lo que prefieras. 
                        Incluimos una disculpa especial y un regalo para tu hijo.
                      </p>
                    </div>

                    <div className="border-l-4 border-green-500 bg-green-50 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-green-900 mb-1">
                        Fue un regalo
                      </h4>
                      <p className="text-sm text-green-700">
                        Podemos hacer el reembolso al comprador original o darte crédito de tienda 
                        con un 10% extra de bonus para tu próxima compra.
                      </p>
                    </div>

                    <div className="border-l-4 border-orange-500 bg-orange-50 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-orange-900 mb-1">
                        Compra internacional
                      </h4>
                      <p className="text-sm text-orange-700">
                        Aplicamos las mismas políticas. Coordinamos el envío de retorno con carriers 
                        internacionales sin costo para ti.
                      </p>
                    </div>
                  </div>
                </div>

                {/* FAQs */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <HelpCircle className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Preguntas Frecuentes</h3>
                  </div>
                  
                  <div className="space-y-3">
                    {faqs.map((faq, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => toggleFAQ(index)}
                          className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between text-left"
                        >
                          <span className="font-medium text-gray-900">{faq.question}</span>
                          {openFAQ === index ? (
                            <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                          )}
                        </button>
                        {openFAQ === index && (
                          <div className="px-4 py-3 bg-white">
                            <p className="text-gray-600 text-sm leading-relaxed">{faq.answer}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

              </motion.div>

              {/* Sidebar Mejorado */}
              <div className="space-y-6">
                
                {/* Formulario Rápido de Devolución */}
                <motion.div 
                  className="bg-white rounded-2xl shadow-lg p-6"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 text-primary" />
                    Iniciar Devolución
                  </h3>
                  
                  <form className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Número de Pedido
                      </label>
                      <input 
                        type="text" 
                        placeholder="Ej: #NEBU-2024-001"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email de Compra
                      </label>
                      <input 
                        type="email" 
                        placeholder="tu@email.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Motivo (Opcional)
                      </label>
                      <select 
                        value={selectedReason}
                        onChange={(e) => setSelectedReason(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="">Selecciona un motivo</option>
                        {returnReasons.map((reason) => (
                          <option key={reason} value={reason}>{reason}</option>
                        ))}
                      </select>
                    </div>
                    
                    <motion.button 
                      type="submit"
                      className="w-full bg-primary hover:bg-accent text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Send className="w-4 h-4" />
                      Solicitar Devolución
                    </motion.button>
                    
                    <p className="text-xs text-gray-500 text-center">
                      Responderemos en menos de 2 horas
                    </p>
                  </form>
                </motion.div>

                {/* Contacto Directo */}
                <motion.div 
                  className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                >
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    ¿Prefieres hablar con nosotros?
                  </h3>
                  
                  <div className="space-y-3">
                    <a href="tel:+51945012824" className="flex items-center gap-3 bg-white/20 rounded-lg p-3 hover:bg-white/30 transition-colors">
                      <Phone className="w-5 h-5" />
                      <div>
                        <p className="font-semibold">+51 945 012 824</p>
                        <p className="text-xs opacity-90">Lun-Dom 8AM-8PM</p>
                      </div>
                    </a>
                    
                    <a href="https://wa.me/51945012824" className="flex items-center gap-3 bg-white/20 rounded-lg p-3 hover:bg-white/30 transition-colors">
                      <MessageCircle className="w-5 h-5" />
                      <div>
                        <p className="font-semibold">WhatsApp</p>
                        <p className="text-xs opacity-90">Respuesta en minutos</p>
                      </div>
                    </a>
                    
                    <a href="mailto:devoluciones@flow-telligence.com" className="flex items-center gap-3 bg-white/20 rounded-lg p-3 hover:bg-white/30 transition-colors">
                      <Mail className="w-5 h-5" />
                      <div>
                        <p className="font-semibold">Email</p>
                        <p className="text-xs opacity-90">24 horas respuesta</p>
                      </div>
                    </a>
                  </div>
                </motion.div>

                {/* Testimonios */}
                <motion.div 
                  className="bg-white rounded-2xl shadow-lg p-6"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                >
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    Lo que dicen los padres
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="border-l-4 border-yellow-400 pl-4">
                      <p className="text-sm text-gray-600 italic mb-2">
                        "El proceso de devolución fue increíblemente fácil. Aunque al final 
                        decidimos quedarnos con Nebu porque mi hijo lo adora."
                      </p>
                      <p className="text-xs font-semibold text-gray-900">María G. - Lima</p>
                    </div>
                    
                    <div className="border-l-4 border-yellow-400 pl-4">
                      <p className="text-sm text-gray-600 italic mb-2">
                        "Excelente servicio. Tuve que cambiar por un problema técnico y 
                        en 3 días tenía el nuevo Nebu funcionando perfectamente."
                      </p>
                      <p className="text-xs font-semibold text-gray-900">Carlos P. - Arequipa</p>
                    </div>
                  </div>
                </motion.div>

                {/* Descargas */}
                <motion.div 
                  className="bg-gray-50 rounded-2xl shadow-lg p-6"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.9 }}
                >
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-gray-700" />
                    Documentos Útiles
                  </h3>
                  
                  <div className="space-y-2">
                    <a href="#" className="flex items-center justify-between bg-white rounded-lg p-3 hover:shadow-md transition-shadow">
                      <span className="text-sm text-gray-700">Política Completa PDF</span>
                      <Download className="w-4 h-4 text-primary" />
                    </a>
                    <a href="#" className="flex items-center justify-between bg-white rounded-lg p-3 hover:shadow-md transition-shadow">
                      <span className="text-sm text-gray-700">Formulario de Devolución</span>
                      <Download className="w-4 h-4 text-primary" />
                    </a>
                    <a href="#" className="flex items-center justify-between bg-white rounded-lg p-3 hover:shadow-md transition-shadow">
                      <span className="text-sm text-gray-700">Guía de Empaque</span>
                      <Download className="w-4 h-4 text-primary" />
                    </a>
                  </div>
                </motion.div>

                {/* Trust Badges */}
                <motion.div 
                  className="bg-white rounded-2xl shadow-lg p-6"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 1.0 }}
                >
                  <h3 className="text-lg font-bold mb-4 text-center">
                    Compra Protegida
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <Shield className="w-8 h-8 text-green-500 mx-auto mb-2" />
                      <p className="text-xs font-medium text-gray-700">Pago Seguro</p>
                    </div>
                    <div className="text-center">
                      <Award className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                      <p className="text-xs font-medium text-gray-700">Garantía 1 Año</p>
                    </div>
                    <div className="text-center">
                      <Truck className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                      <p className="text-xs font-medium text-gray-700">Envío Gratis</p>
                    </div>
                    <div className="text-center">
                      <RefreshCw className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                      <p className="text-xs font-medium text-gray-700">30 Días</p>
                    </div>
                  </div>
                </motion.div>

              </div>
            </div>

            {/* CTA Final */}
            <motion.div 
              className="mt-12 bg-gradient-to-r from-primary to-accent rounded-3xl p-8 text-center text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.1 }}
            >
              <h2 className="text-3xl font-bold mb-4">
                Prueba Nebu Sin Riesgo Durante 30 Días
              </h2>
              <p className="text-xl mb-6 opacity-90">
                Miles de familias felices. Únete a ellas con total tranquilidad.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button 
                  className="bg-white text-primary hover:bg-gray-100 font-bold py-3 px-8 rounded-full transition-colors inline-flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Gift className="w-5 h-5" />
                  Comprar Nebu Ahora
                </motion.button>
                <motion.button 
                  className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary font-bold py-3 px-8 rounded-full transition-colors inline-flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Info className="w-5 h-5" />
                  Más Información
                </motion.button>
              </div>
              <p className="text-sm mt-4 opacity-75">
                ⭐⭐⭐⭐⭐ 4.9/5 basado en 500+ reseñas
              </p>
            </motion.div>

          </div>
        </section>
      </div>

      <Newsletter />
      <Footer />
    </div>
  );
}