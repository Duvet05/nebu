import type { MetaFunction } from "@remix-run/node";
import { useTranslation } from "react-i18next";
import { Header } from "~/components/layout/Header";
import { Footer } from "~/components/layout/Footer";
import { Newsletter } from "~/components/Newsletter";
import { motion } from "framer-motion";
import { Mail, MapPin, Calendar, FileText, Shield, Cookie, Scale, Phone } from "lucide-react";

export const meta: MetaFunction = () => {
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
    { property: "og:url", content: "https://flow-telligence.com/terms" },
  ];
};

export default function TermsOfService() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-nebu-bg relative">
      <Header />
      
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="pt-32 pb-16 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-primary/30 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Calendar className="w-4 h-4" />
              {t('legal.lastUpdated')}: 18 Noviembre 2025
            </div>
            
            <motion.h1 
              className="text-4xl md:text-6xl font-bold font-heading mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {t('legal.title')}
            </motion.h1>
            
            <motion.p 
              className="text-xl text-gray-600 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              {t('legal.subtitle')}
            </motion.p>
          </div>
        </section>

        {/* Legal Content */}
        <section className="pb-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-8">
              
              {/* Terms and Conditions - Main Content */}
              <motion.div 
                className="lg:col-span-2 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-2xl font-bold flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Scale className="w-4 h-4 text-primary" />
                    </div>
                    {t('legal.sections.terms.title')}
                  </h2>
                </div>
                
                <div className="p-6">
                  <div className="h-[600px] overflow-y-auto pr-4 space-y-6">
                    <p className="text-gray-600 leading-relaxed">
                      {t('legal.sections.terms.content.intro')}
                    </p>
                    
                    <hr className="border-gray-200" />
                    
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2 text-lg">
                          {t('legal.sections.terms.content.acceptance.title')}
                        </h4>
                        <p className="text-gray-600 leading-relaxed">
                          Al utilizar Nebu, usted confirma que ha leído, entendido y acepta estar sujeto a estos términos. Si no está de acuerdo con alguna parte de estos términos, no debe usar nuestros servicios.
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2 text-lg">
                          2. Descripción del Producto Nebu
                        </h4>
                        <p className="text-gray-600 leading-relaxed mb-3">
                          Nebu es un juguete IoT educativo diseñado para niños de 4 a 9 años que utiliza inteligencia artificial para crear experiencias de aprendizaje interactivas sin pantallas. El producto incluye:
                        </p>
                        <ul className="list-disc pl-6 space-y-1 text-gray-600">
                          <li>Dispositivo físico Nebu con conectividad WiFi</li>
                          <li>Aplicación móvil para padres (iOS y Android)</li>
                          <li>Servicios de IA en la nube para conversaciones personalizadas</li>
                          <li>Actualizaciones de contenido y funcionalidades</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2 text-lg">
                          3. Cuentas de Usuario y Control Parental
                        </h4>
                        <p className="text-gray-600 leading-relaxed">
                          Para acceder a los servicios de Nebu, debe crear una cuenta de padre/tutor. Usted es responsable de mantener la confidencialidad de su cuenta y contraseña, y acepta la responsabilidad de todas las actividades que ocurran bajo su cuenta y el uso que su hijo haga de Nebu.
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2 text-lg">
                          4. Seguridad Infantil y COPPA
                        </h4>
                        <p className="text-gray-600 leading-relaxed mb-3">
                          Nebu está diseñado específicamente para niños y cumple con todas las regulaciones aplicables de protección infantil:
                        </p>
                        <ul className="list-disc pl-6 space-y-1 text-gray-600">
                          <li>Cumplimiento total con COPPA (Children's Online Privacy Protection Act)</li>
                          <li>Todas las conversaciones son monitoreadas y filtradas por IA</li>
                          <li>Los padres tienen control total sobre las interacciones</li>
                          <li>No se recopila información personal de menores sin consentimiento parental</li>
                          <li>Certificación kidSAFE Seal Program</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2 text-lg">
                          5. Propiedad Intelectual
                        </h4>
                        <p className="text-gray-600 leading-relaxed">
                          Todo el contenido de Nebu, incluyendo software, historias, juegos interactivos y materiales educativos, está protegido por derechos de autor y otros derechos de propiedad intelectual de Flow-telligence.
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2 text-lg">
                          6. Pagos, Pre-órdenes y Política de Devoluciones
                        </h4>
                        <div className="space-y-2 text-gray-600">
                          <p><strong>Pre-órdenes:</strong> Al realizar una pre-orden, usted acepta los términos de entrega estimados de 6-8 semanas.</p>
                          <p><strong>Garantía de Satisfacción:</strong> Ofrecemos una garantía de satisfacción de 30 días desde la recepción del producto.</p>
                          <p><strong>Envío:</strong> Todas las pre-órdenes incluyen envío gratuito dentro de Perú.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Sidebar with Privacy Policy and Cookie Policy */}
              <div className="space-y-6">
                
                {/* Privacy Policy */}
                <motion.div 
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <div className="p-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-accent/10 flex items-center justify-center">
                        <Shield className="w-3 h-3 text-accent" />
                      </div>
                      {t('legal.sections.privacy.title')}
                    </h3>
                  </div>
                  <div className="p-4">
                    <div className="h-[300px] overflow-y-auto pr-2 space-y-3">
                      <p className="text-sm text-gray-600 leading-relaxed">
                        En Flow-telligence, la privacidad de las familias y especialmente de los niños es nuestra máxima prioridad.
                      </p>
                      
                      <div className="space-y-3">
                        <div>
                          <h5 className="font-medium text-sm text-gray-900 mb-1">
                            Información que Recopilamos
                          </h5>
                          <p className="text-xs text-gray-600 leading-relaxed">
                            Solo recopilamos información mínima necesaria con consentimiento parental explícito.
                          </p>
                        </div>
                        
                        <div>
                          <h5 className="font-medium text-sm text-gray-900 mb-1">
                            Cómo Utilizamos la Información
                          </h5>
                          <p className="text-xs text-gray-600 leading-relaxed">
                            Utilizamos la información únicamente para personalizar y mejorar la experiencia de Nebu.
                          </p>
                        </div>
                        
                        <div>
                          <h5 className="font-medium text-sm text-gray-900 mb-1">
                            Seguridad de los Datos
                          </h5>
                          <p className="text-xs text-gray-600 leading-relaxed">
                            Implementamos las más altas medidas de seguridad para proteger la información infantil.
                          </p>
                        </div>
                      </div>
                      
                      <div className="pt-2">
                        <a href="/privacy" className="text-primary hover:text-accent text-sm font-medium transition-colors">
                          Ver política completa →
                        </a>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Cookie Policy */}
                <motion.div 
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <div className="p-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-yellow-500/10 flex items-center justify-center">
                        <Cookie className="w-3 h-3 text-yellow-600" />
                      </div>
                      Política de Cookies
                    </h3>
                  </div>
                  <div className="p-4">
                    <div className="h-[250px] overflow-y-auto pr-2 space-y-3">
                      <p className="text-sm text-gray-600 leading-relaxed">
                        Utilizamos cookies y tecnologías similares para mejorar su experiencia en nuestro sitio web.
                      </p>
                      
                      <div className="space-y-3">
                        <div>
                          <h5 className="font-medium text-sm text-gray-900 mb-1">
                            ¿Qué son las Cookies?
                          </h5>
                          <p className="text-xs text-gray-600 leading-relaxed">
                            Las cookies son pequeños archivos que se almacenan en su dispositivo para mejorar la funcionalidad del sitio.
                          </p>
                        </div>
                        
                        <div>
                          <h5 className="font-medium text-sm text-gray-900 mb-1">
                            Tipos de Cookies
                          </h5>
                          <p className="text-xs text-gray-600 leading-relaxed">
                            Utilizamos cookies esenciales, de rendimiento y funcionales. No utilizamos cookies de seguimiento para niños.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Contact Information */}
                <motion.div 
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  <div className="p-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-secondary/10 flex items-center justify-center">
                        <FileText className="w-3 h-3 text-primary" />
                      </div>
                      Contacto Legal
                    </h3>
                  </div>
                  <div className="p-4 space-y-4">
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Para preguntas sobre términos legales o ejercer sus derechos, contáctenos:
                    </p>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                        <a
                          href="mailto:legal@flow-telligence.com"
                          className="text-primary hover:text-accent transition-colors"
                        >
                          legal@flow-telligence.com
                        </a>
                      </div>

                      <div className="flex items-center gap-3 text-sm">
                        <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                        <a
                          href="tel:+51945012824"
                          className="text-primary hover:text-accent transition-colors"
                        >
                          +51 945 012 824
                        </a>
                      </div>

                      <div className="flex items-center gap-3 text-sm">
                        <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="text-gray-600">
                          Lima, Perú
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Newsletter />
      <Footer />
    </div>
  );
}
