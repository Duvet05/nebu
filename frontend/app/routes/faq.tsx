import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { useTranslation } from "react-i18next";
import { Header } from "~/components/layout/Header";
import { Footer } from "~/components/layout/Footer";
import { Newsletter } from "~/components/Newsletter";
import { FAQSchema } from "~/components/FAQSection";
import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { Divider } from "~/components/Divider";
import i18next from "~/lib/i18next.server";
import { BUSINESS } from "~/config/constants";

export const meta: MetaFunction = () => {
  return [
    { title: "Preguntas Frecuentes - Nebu | Chatbot Educativo para Niños" },
    {
      name: "description",
      content: "Respuestas a tus preguntas sobre Nebu: ¿Qué es? ¿Cómo funciona? Seguridad, edades, envío, garantías y más. Todo lo que necesitas saber.",
    },
    {
      name: "keywords",
      content: "nebu faq, preguntas frecuentes nebu, chatbot educativo preguntas, nebu seguridad, nebu edad, precio nebu, envío nebu",
    },

    // Open Graph
    { property: "og:title", content: "Preguntas Frecuentes - Nebu | Chatbot Educativo" },
    { property: "og:description", content: "Respuestas a tus preguntas sobre Nebu: funcionamiento, seguridad, edades, envío y más." },
    { property: "og:type", content: "website" },
    { property: "og:url", content: `${BUSINESS.website}/faq` },
    { property: "og:image", content: `${BUSINESS.website}/og-faq.jpg` },

    // Twitter
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "FAQ - Nebu" },
    { name: "twitter:description", content: "Respuestas a tus preguntas sobre Nebu: funcionamiento, seguridad, edades y más." },
    { name: "twitter:image", content: `${BUSINESS.website}/og-faq.jpg` },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const locale = await i18next.getLocale(request);
  return ({
    locale,
  });
}

export default function FAQ() {
  const { t } = useTranslation();

  const faqs = [
    {
      question: t("faq.questions.whatIsNebu.question"),
      answer: t("faq.questions.whatIsNebu.answer"),
    },
    {
      question: t("faq.questions.howItWorks.question"),
      answer: t("faq.questions.howItWorks.answer"),
    },
    {
      question: t("faq.questions.isSafe.question"),
      answer: t("faq.questions.isSafe.answer"),
    },
    {
      question: t("faq.questions.ageRange.question"),
      answer: t("faq.questions.ageRange.answer"),
    },
    {
      question: t("faq.questions.shipping.question"),
      answer: t("faq.questions.shipping.answer"),
    },
    {
      question: t("faq.questions.whatsIncluded.question"),
      answer: t("faq.questions.whatsIncluded.answer"),
    },
    {
      question: t("faq.questions.needsInternet.question"),
      answer: t("faq.questions.needsInternet.answer"),
    },
    {
      question: t("faq.questions.returns.question"),
      answer: t("faq.questions.returns.answer"),
    },
    {
      question: t("faq.questions.languages.question"),
      answer: t("faq.questions.languages.answer"),
    },
    {
      question: t("faq.questions.charging.question"),
      answer: t("faq.questions.charging.answer"),
    },
  ];

  return (
    <div className="min-h-screen bg-nebu-bg relative">
      <FAQSchema faqs={faqs} />
      <Header />

      {/* Background Effects */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `
            radial-gradient(circle at 20% 20%, #6366f115 1px, transparent 1px),
            radial-gradient(circle at 80% 20%, #6366f110 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px, 90px 90px',
          backgroundPosition: '0 0, 40px 40px'
        }}></div>
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <motion.h1 
              className="text-5xl md:text-6xl lg:text-7xl font-bold font-gochi mb-6 text-primary leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {t("faq.title")}
            </motion.h1>
            
            <motion.p
              className="text-xl text-gray-600 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              {t("faq.subtitle")}
            </motion.p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div>

              <Accordion.Root type="single" collapsible className="space-y-4">
                {faqs.map((faq, index) => (
                  <Accordion.Item
                    key={index}
                    value={`item-${index}`}
                    className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300"
                  >
                    <Accordion.Header>
                      <Accordion.Trigger className="flex items-center justify-between w-full p-6 text-left group hover:bg-gray-50 transition-colors">
                        <span className="text-lg font-semibold pr-4 text-gray-900">
                          {faq.question}
                        </span>
                        <ChevronDown className="w-5 h-5 text-gray-500 transition-transform group-data-[state=open]:rotate-180 flex-shrink-0" />
                      </Accordion.Trigger>
                    </Accordion.Header>
                    <Accordion.Content className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
                      <div className="px-6 pb-6 text-gray-600">
                        {faq.answer}
                      </div>
                    </Accordion.Content>
                  </Accordion.Item>
                ))}
              </Accordion.Root>

              <Divider variant="solid" color="gray" spacing="xl" opacity={0.1} />

              <motion.div 
                className="text-center p-8 bg-gradient-to-br from-primary to-accent rounded-2xl text-white shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <h3 className="text-2xl font-bold mb-2">
                  {t("faq.stillHaveQuestions")}
                </h3>
                <p className="text-white/90 mb-6">
                  {t("faq.hereToHelp")}
                </p>
                <a 
                  href="/contact" 
                  className="inline-block bg-white text-primary px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                  {t("faq.contactUs")}
                </a>
              </motion.div>
            </div>
          </div>
        </section>
      </div>

      <Divider variant="solid" color="gray" spacing="xl" opacity={0.1} />

      <Newsletter />
      <Footer />
    </div>
  );
}
