import type { MetaFunction } from "@remix-run/node";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { 
  Calendar, 
  Mail, 
  MapPin, 
  Truck, 
  Shield, 
  Clock,
  CheckCircle,
  RefreshCw,
  Package
} from "lucide-react";
import { Header } from "~/components/layout/Header";
import { Footer } from "~/components/layout/Footer";
import { Newsletter } from "~/components/Newsletter";

export const meta: MetaFunction = () => {
  return [
    { title: "Devoluciones y Garantía - Nebu | 30 Días Garantía" },
    {
      name: "description",
      content: "Garantía de satisfacción de 30 días. Devolución gratis, reembolso completo. Proceso simple y transparente. 12 meses garantía de hardware."
    },
    {
      name: "keywords",
      content: "devoluciones nebu, garantía nebu, reembolso nebu, política de devolución, garantía 30 días"
    },

    // Open Graph
    { property: "og:title", content: "Devoluciones y Garantía - Nebu" },
    { property: "og:description", content: "30 días garantía de satisfacción. Devolución gratis y reembolso completo." },
    { property: "og:type", content: "website" },
    { property: "og:url", content: "https://flow-telligence.com/returns" },
  ];
};

export default function ReturnsPolicy() {
  const { t } = useTranslation("common");

  return (
    <div className="min-h-screen bg-nebu-bg relative">
      <Header />
      
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="pt-32 pb-16 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-primary/30 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Calendar className="w-4 h-4" />
              Última actualización: Octubre 2025
            </div>
            
            <motion.h1 
              className="text-4xl md:text-6xl font-bold font-heading mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {t('returns.title')}
            </motion.h1>
            
            <motion.p 
              className="text-xl text-gray-600 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              {t('returns.subtitle')}
            </motion.p>
          </div>
        </section>

        {/* Legal Content */}
        <section className="pb-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-8">
              
              {/* Main Content */}
              <motion.div 
                className="lg:col-span-2 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-2xl font-bold flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <RefreshCw className="w-4 h-4 text-primary" />
                    </div>
                    {t('returns.mainContent.title')}
                  </h2>
                </div>
                
                <div className="p-6">
                  <div className="h-[600px] overflow-y-auto pr-4 space-y-6">
                    <p className="text-gray-600 leading-relaxed">
                      {t('returns.mainContent.intro')}
                    </p>
                    
                    <hr className="border-gray-200" />
                    
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2 text-lg">
                          {t('returns.mainContent.guarantee.title')}
                        </h4>
                        <p className="text-gray-600 leading-relaxed">
                          {t('returns.mainContent.guarantee.description')}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2 text-lg">
                          {t('returns.mainContent.process.title')}
                        </h4>
                        <ol className="list-decimal pl-6 space-y-2 text-gray-600">
                          <li>{t('returns.mainContent.process.step1')}</li>
                          <li>{t('returns.mainContent.process.step2')}</li>
                          <li>{t('returns.mainContent.process.step3')}</li>
                          <li>{t('returns.mainContent.process.step4')}</li>
                          <li>{t('returns.mainContent.process.step5')}</li>
                        </ol>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2 text-lg">
                          {t('returns.mainContent.conditions.title')}
                        </h4>
                        <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                          <p className="text-sm text-green-800 mb-2">
                            <strong>Aceptamos devoluciones en las siguientes condiciones:</strong>
                          </p>
                          <ul className="list-disc pl-6 text-sm text-green-700 space-y-1">
                            <li>{t('returns.mainContent.conditions.condition1')}</li>
                            <li>{t('returns.mainContent.conditions.condition2')}</li>
                            <li>{t('returns.mainContent.conditions.condition3')}</li>
                            <li>{t('returns.mainContent.conditions.condition4')}</li>
                          </ul>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2 text-lg">
                          {t('returns.mainContent.warranty.title')}
                        </h4>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs font-medium text-gray-700 mb-2">{t('returns.mainContent.warranty.hardware')}</p>
                            <ul className="list-disc pl-4 text-xs text-gray-600 space-y-1">
                              <li>{t('returns.mainContent.warranty.hardwareItems.defects')}</li>
                              <li>{t('returns.mainContent.warranty.hardwareItems.components')}</li>
                              <li>{t('returns.mainContent.warranty.hardwareItems.connectivity')}</li>
                            </ul>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-700 mb-2">{t('returns.mainContent.warranty.software')}</p>
                            <ul className="list-disc pl-4 text-xs text-gray-600 space-y-1">
                              <li>{t('returns.mainContent.warranty.softwareItems.updates')}</li>
                              <li>{t('returns.mainContent.warranty.softwareItems.bugs')}</li>
                              <li>{t('returns.mainContent.warranty.softwareItems.support')}</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2 text-lg">
                          {t('returns.mainContent.refundMethods.title')}
                        </h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-green-500"></span>
                            <span className="text-sm text-gray-600">{t('returns.mainContent.refundMethods.original')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-green-500"></span>
                            <span className="text-sm text-gray-600">{t('returns.mainContent.refundMethods.transfer')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-green-500"></span>
                            <span className="text-sm text-gray-600">{t('returns.mainContent.refundMethods.credit')}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2 text-lg">
                          {t('returns.mainContent.specialCases.title')}
                        </h4>
                        <div className="space-y-3">
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm font-medium text-blue-800 mb-1">Producto dañado en envío:</p>
                            <p className="text-xs text-blue-700">{t('returns.mainContent.specialCases.damaged')}</p>
                          </div>
                          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-sm font-medium text-yellow-800 mb-1">Producto defectuoso:</p>
                            <p className="text-xs text-yellow-700">{t('returns.mainContent.specialCases.defective')}</p>
                          </div>
                          <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                            <p className="text-sm font-medium text-purple-800 mb-1">Partes faltantes:</p>
                            <p className="text-xs text-purple-700">{t('returns.mainContent.specialCases.missing')}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2 text-lg">
                          {t('returns.mainContent.contact.title')}
                        </h4>
                        <p className="text-gray-600 leading-relaxed mb-4">
                          {t('returns.mainContent.contact.description')}
                        </p>
                        <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
                          <div className="flex items-center gap-3 mb-2">
                            <Mail className="w-4 h-4 text-primary" />
                            <a href="mailto:devoluciones@flow-telligence.com" className="text-primary font-medium">
                              devoluciones@flow-telligence.com
                            </a>
                          </div>
                          <div className="flex items-center gap-3">
                            <Package className="w-4 h-4 text-primary" />
                            <span className="text-gray-700 text-sm">
                              Incluye tu número de pedido y motivo de la devolución
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Sidebar */}
              <div className="space-y-6">
                
                {/* Shipping Info */}
                <motion.div 
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <div className="p-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-green-500/10 flex items-center justify-center">
                        <Truck className="w-3 h-3 text-green-600" />
                      </div>
                      {t('returns.sidebar.shipping.title')}
                    </h3>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-gray-600">{t('returns.sidebar.shipping.free')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-gray-600">{t('returns.sidebar.shipping.fast')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-gray-600">{t('returns.sidebar.shipping.tracking')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-gray-600">{t('returns.sidebar.shipping.peru')}</span>
                    </div>
                  </div>
                </motion.div>

                {/* Customer Support */}
                <motion.div 
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <div className="p-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-blue-500/10 flex items-center justify-center">
                        <Shield className="w-3 h-3 text-blue-600" />
                      </div>
                      {t('returns.sidebar.support.title')}
                    </h3>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      <span className="text-gray-600">{t('returns.sidebar.support.available')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      <span className="text-gray-600">{t('returns.sidebar.support.hours')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      <span className="text-gray-600">{t('returns.sidebar.support.response')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      <span className="text-gray-600">{t('returns.sidebar.support.satisfaction')}</span>
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
                        <Mail className="w-3 h-3 text-primary" />
                      </div>
                      {t('returns.sidebar.contact.title')}
                    </h3>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                      <a 
                        href="mailto:devoluciones@flow-telligence.com"
                        className="text-primary hover:text-accent transition-colors"
                      >
                        devoluciones@flow-telligence.com
                      </a>
                    </div>
                    
                    <div className="flex items-center gap-3 text-sm">
                      <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-gray-600">
                        Lima, Perú
                      </span>
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
