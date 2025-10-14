import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { Header } from "~/components/layout/Header";
import { Footer } from "~/components/layout/Footer";
import { Newsletter } from "~/components/Newsletter";
import { motion } from "framer-motion";
import { ArrowRight, MessageCircle, Mail, Clock, HelpCircle, Send, Phone, MapPin } from "lucide-react";

export const meta: MetaFunction = () => {
  return [
    { title: "Contacto - Nebu | Compañero IoT Educativo" },
    {
      name: "description",
      content: "Ponte en contacto con el equipo de Nebu. Respondemos en menos de 24 horas. Consultas sobre pre-órdenes, soporte técnico y más.",
    },
    {
      name: "keywords",
      content: "contacto nebu, soporte nebu, pre-orden nebu, ayuda chatbot educativo, flow-telligence contacto",
    },

    // Open Graph
    { property: "og:title", content: "Contacto - Nebu | Compañero IoT Educativo" },
    { property: "og:description", content: "Ponte en contacto con el equipo de Nebu. Respondemos en menos de 24 horas." },
    { property: "og:type", content: "website" },
    { property: "og:url", content: "https://flow-telligence.com/contact" },
    { property: "og:image", content: "https://flow-telligence.com/og-contact.jpg" },

    // Twitter
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "Contacto - Nebu" },
    { name: "twitter:description", content: "Ponte en contacto con el equipo de Nebu. Respondemos en menos de 24 horas." },
    { name: "twitter:image", content: "https://flow-telligence.com/og-contact.jpg" },
  ];
};

type ActionData =
  | { success: true }
  | { error: string };

export async function action({ request }: ActionFunctionArgs): Promise<Response> {
  const formData = await request.formData();

  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const email = formData.get("email") as string;
  const subject = formData.get("subject") as string;
  const message = formData.get("message") as string;

  if (!firstName || !lastName || !email || !subject || !message) {
    return Response.json({ error: "contact.form.errors.required" } as ActionData, { status: 400 });
  }

  try {
    // TODO: Implementar sendContactEmail para Nebu
    // await sendContactEmail({ firstName, lastName, email, subject, message });
    console.log('Contact form submitted:', { firstName, lastName, email, subject, message });
    return Response.json({ success: true } as ActionData);
  } catch (error) {
    console.error("Error al enviar email:", error);
    return Response.json({ error: "contact.form.errors.send" } as ActionData, { status: 500 });
  }
}

export default function ContactPage() {
  const { t } = useTranslation("common");
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  if (actionData && "success" in actionData && actionData.success) {
    return (
      <div className="min-h-screen bg-nebu-bg">
        <Header />
        <div className="relative z-10 pt-32 pb-20 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {t('contact.success.title')}
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              {t('contact.success.message')}
            </p>
            <a href="/" className="bg-gradient-to-r from-primary to-accent text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all">
              {t('contact.success.backHome')}
            </a>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-nebu-bg relative">
      <Header />
      
      {/* Fondo de partículas mejorado */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `
            radial-gradient(circle at 25% 25%, #6366f120 1px, transparent 1px),
            radial-gradient(circle at 75% 25%, #6366f115 1px, transparent 1px),
            radial-gradient(circle at 25% 75%, #6366f110 1px, transparent 1px),
            radial-gradient(circle at 75% 75%, #6366f125 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px, 80px 80px, 60px 60px, 70px 70px',
          backgroundPosition: '0 0, 30px 30px, 10px 10px, 40px 40px'
        }}></div>
      </div>
      
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="pt-32 pb-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/20 to-accent/20 backdrop-blur-sm border border-primary/30 text-primary dark:text-primary px-6 py-3 rounded-full text-sm font-medium mb-6">
                <div className="w-2 h-2 bg-primary dark:bg-primary rounded-full animate-pulse"></div>
                <span className="font-mono">{t('contact.badge')}</span>
              </div>
              
              <motion.h1 
                className="text-4xl md:text-6xl font-bold font-heading mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                {t('contact.title')}
              </motion.h1>
              
              <motion.p 
                className="text-xl text-gray-600 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                {t('contact.subtitle')}
              </motion.p>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="pb-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              
              {/* Contact Form - Left Column */}
              <motion.div 
                className="xl:col-span-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="bg-white rounded-2xl shadow-lg p-8 md:p-10">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg">
                      <Send className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {t('contact.form.title')}
                      </h2>
                      <p className="text-gray-600 text-sm">
                        {t('contact.form.subtitle')}
                      </p>
                    </div>
                  </div>

                  {actionData && "error" in actionData && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-600">{t(actionData.error)}</p>
                    </div>
                  )}

                  <Form method="post" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700">
                          {t('contact.form.firstName')} *
                        </label>
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-gray-900 placeholder-gray-500"
                          placeholder={t('contact.form.firstNamePlaceholder')}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700">
                          {t('contact.form.lastName')} *
                        </label>
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-gray-900 placeholder-gray-500"
                          placeholder={t('contact.form.lastNamePlaceholder')}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                        {t('contact.form.email')} *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-gray-900 placeholder-gray-500"
                        placeholder={t('contact.form.emailPlaceholder')}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="subject" className="block text-sm font-semibold text-gray-700">
                        {t('contact.form.subject')} *
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-gray-900"
                        required
                      >
                        <option value="">{t('contact.form.subjectPlaceholder')}</option>
                        <option value="general">{t('contact.form.subjects.general')}</option>
                        <option value="preorder">{t('contact.form.subjects.preorder')}</option>
                        <option value="technical">{t('contact.form.subjects.technical')}</option>
                        <option value="partnership">{t('contact.form.subjects.partnership')}</option>
                        <option value="media">{t('contact.form.subjects.media')}</option>
                        <option value="other">{t('contact.form.subjects.other')}</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="message" className="block text-sm font-semibold text-gray-700">
                        {t('contact.form.message')} *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={5}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-gray-900 placeholder-gray-500 resize-none"
                        placeholder={t('contact.form.messagePlaceholder')}
                        required
                      ></textarea>
                    </div>
                    
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-primary to-accent text-white py-4 px-6 rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isSubmitting ? t('contact.form.submitting') : t('contact.form.submit')}
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </Form>
                </div>
              </motion.div>
              
              {/* Right Column */}
              <motion.div 
                className="space-y-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                {/* Información de contacto rápida */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                      <Phone className="w-6 h-6 text-white" />
                    </div>
{t('contact.info.directContact')}
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                      <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {t('contact.info.email')}
                      </h4>
                      <p className="text-sm text-green-700">contact@flow-telligence.com</p>
                    </div>
                    
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                        <MessageCircle className="w-4 h-4" />
                        {t('contact.info.whatsapp')}
                      </h4>
                      <p className="text-sm text-blue-700">{t('contact.info.whatsappSoon')}</p>
                    </div>
                    
                    <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                      <h4 className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {t('contact.info.schedule')}
                      </h4>
                      <p className="text-sm text-purple-700">{t('contact.info.scheduleTime')}</p>
                    </div>

                    <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                      <h4 className="font-semibold text-orange-800 mb-2 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {t('contact.info.location')}
                      </h4>
                      <p className="text-sm text-orange-700">{t('contact.info.locationName')}</p>
                    </div>
                  </div>
                </div>

                {/* AI Assistant Preview */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                        <HelpCircle className="w-6 h-6 text-white" />
                      </div>
                      {t('contact.assistant.title')}
                    </h3>
                  </div>
                  
                  <div className="h-64 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mb-4 mx-auto">
                        <MessageCircle className="w-10 h-10 text-white" />
                      </div>
                      <p className="text-gray-600 font-medium">{t('contact.assistant.comingSoon')}</p>
                      <p className="text-sm text-gray-500 mt-1">{t('contact.assistant.subtitle')}</p>
                    </div>
                  </div>
                  
                  <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50">
                    <p className="text-sm text-gray-700 text-center">
{t('contact.assistant.description')}
                    </p>
                  </div>
                </div>

                {/* FAQ Quick Links */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {t('contact.faq.title')}
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                      <p className="text-sm font-medium text-gray-800">{t('contact.faq.questions.availability')}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                      <p className="text-sm font-medium text-gray-800">{t('contact.faq.questions.preorder')}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                      <p className="text-sm font-medium text-gray-800">{t('contact.faq.questions.safety')}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                      <p className="text-sm font-medium text-gray-800">{t('contact.faq.questions.ages')}</p>
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
