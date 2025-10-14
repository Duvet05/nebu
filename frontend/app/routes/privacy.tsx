import type { MetaFunction } from "@remix-run/node";
import { useTranslation } from "react-i18next";
import { Header } from "~/components/layout/Header";
import { Footer } from "~/components/layout/Footer";
import { Newsletter } from "~/components/Newsletter";
import { motion } from "framer-motion";
import { Mail, Calendar, FileText, Shield, Cookie } from "lucide-react";

export const meta: MetaFunction = () => {
  return [
    { title: "Política de Privacidad - Nebu | Flow-telligence" },
    {
      name: "description",
      content: "Política de privacidad y protección de datos para usuarios de Nebu. Seguridad infantil prioritaria, certificada por kidSAFE. COPPA compliant.",
    },
    { name: "robots", content: "noindex, follow" },

    // Open Graph
    { property: "og:title", content: "Política de Privacidad - Nebu" },
    { property: "og:description", content: "Protección de datos y privacidad infantil. kidSAFE certified." },
    { property: "og:type", content: "website" },
    { property: "og:url", content: "https://flow-telligence.com/privacy" },
  ];
};

export default function PrivacyPolicy() {
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
              {t('legal.lastUpdated')}: Octubre 2025
            </div>
            
            <motion.h1 
              className="text-4xl md:text-6xl font-bold font-heading mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {t('legal.sections.privacy.title')}
            </motion.h1>
            
            <motion.p 
              className="text-xl text-gray-600 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              {t('legal.sections.privacy.content.intro')}
            </motion.p>
          </div>
        </section>

        {/* Legal Content */}
        <section className="pb-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-8">
              
              {/* Privacy Policy - Main Content */}
              <motion.div 
                className="lg:col-span-2 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-2xl font-bold flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Shield className="w-4 h-4 text-primary" />
                    </div>
                    {t('legal.sections.privacy.title')}
                  </h2>
                </div>
                
                <div className="p-6">
                  <div className="h-[600px] overflow-y-auto pr-4 space-y-6">
                    <p className="text-gray-600 leading-relaxed">
                      {t('legal.sections.privacy.content.intro')}
                    </p>
                    
                    <hr className="border-gray-200" />
                    
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2 text-lg">
                          {t('legal.sections.privacy.content.collection.title')}
                        </h4>
                        <p className="text-gray-600 leading-relaxed mb-3">
                          {t('legal.sections.privacy.content.collection.content')}
                        </p>
                        <ul className="list-disc pl-6 space-y-1 text-gray-600">
                          <li>{t('legal.sections.privacy.content.collection.item1', 'Consentimiento parental verificable antes de recopilar información de menores de 13 años')}</li>
                          <li>{t('legal.sections.privacy.content.collection.item2', 'Control parental total para revisar, modificar o eliminar información')}</li>
                          <li>{t('legal.sections.privacy.content.collection.item3', 'Recopilación mínima de datos necesarios para el funcionamiento')}</li>
                          <li>{t('legal.sections.privacy.content.collection.item4', 'Prohibición absoluta de compartir información infantil con terceros')}</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2 text-lg">
                          {t('legal.sections.privacy.content.use.title')}
                        </h4>
                        <p className="text-gray-600 leading-relaxed">
                          {t('legal.sections.privacy.content.use.content')}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2 text-lg">
                          {t('legal.sections.privacy.content.sharing.title')}
                        </h4>
                        <p className="text-gray-600 leading-relaxed">
                          {t('legal.sections.privacy.content.sharing.content')}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2 text-lg">
                          {t('legal.sections.privacy.content.security.title')}
                        </h4>
                        <p className="text-gray-600 leading-relaxed">
                          {t('legal.sections.privacy.content.security.content')}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2 text-lg">
                          {t('legal.sections.privacy.content.rights.title')}
                        </h4>
                        <p className="text-gray-600 leading-relaxed">
                          {t('legal.sections.privacy.content.rights.content')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Sidebar with Terms and Cookie Policy */}
              <div className="space-y-6">
                
                {/* Terms and Conditions */}
                <motion.div 
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <div className="p-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center">
                        <FileText className="w-3 h-3 text-blue-600" />
                      </div>
                      {t('legal.sections.terms.title')}
                    </h3>
                  </div>
                  
                  <div className="p-4">
                    <p className="text-sm text-gray-600 mb-4">
                      {t('legal.sections.terms.content.intro')}
                    </p>
                    
                    <div className="space-y-3">
                      <div>
                        <h5 className="font-medium text-gray-900 text-sm mb-2">{t('legal.sections.terms.content.acceptance.title')}</h5>
                        <p className="text-xs text-gray-600">
                          {t('legal.sections.terms.content.acceptance.content')}
                        </p>
                      </div>
                      
                      <div>
                        <h5 className="font-medium text-gray-900 text-sm mb-2">{t('legal.sections.terms.content.services.title')}</h5>
                        <p className="text-xs text-gray-600">
                          {t('legal.sections.terms.content.services.content')}
                        </p>
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
                      <div className="w-6 h-6 rounded-lg bg-yellow-100 flex items-center justify-center">
                        <Cookie className="w-3 h-3 text-yellow-600" />
                      </div>
                      {t('legal.sections.cookies.title')}
                    </h3>
                  </div>
                  
                  <div className="p-4">
                    <p className="text-sm text-gray-600 mb-4">
                      {t('legal.sections.cookies.content.intro')}
                    </p>
                    
                    <div className="space-y-3">
                      <div>
                        <h5 className="font-medium text-gray-900 text-sm mb-2">{t('legal.sections.cookies.content.what.title')}</h5>
                        <p className="text-xs text-gray-600">
                          {t('legal.sections.cookies.content.what.content')}
                        </p>
                      </div>
                      
                      <div>
                        <h5 className="font-medium text-gray-900 text-sm mb-2">{t('legal.sections.cookies.content.types.title')}</h5>
                        <p className="text-xs text-gray-600">
                          {t('legal.sections.cookies.content.types.content')}
                        </p>
                      </div>
                      
                      <div>
                        <h5 className="font-medium text-gray-900 text-sm mb-2">{t('legal.sections.cookies.content.control.title')}</h5>
                        <p className="text-xs text-gray-600">
                          {t('legal.sections.cookies.content.control.content')}
                        </p>
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
                      <div className="w-6 h-6 rounded-lg bg-green-100 flex items-center justify-center">
                        <Mail className="w-3 h-3 text-green-600" />
                      </div>
                      {t('legal.contact.title')}
                    </h3>
                  </div>
                  
                  <div className="p-4">
                    <p className="text-sm text-gray-600 mb-4">
                      {t('legal.contact.description')}
                    </p>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs font-medium text-gray-700">{t('legal.contact.email')}</p>
                      </div>
                      
                      <div>
                        <p className="text-xs text-gray-600">{t('legal.contact.address')}</p>
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
