import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { useTranslation } from "react-i18next";
import { Header } from "~/components/layout/Header";
import { Footer } from "~/components/layout/Footer";
import { Newsletter } from "~/components/Newsletter";
import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";
import i18next from "~/lib/i18next.server";

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
    { property: "og:url", content: "https://flow-telligence.com/faq" },
    { property: "og:image", content: "https://flow-telligence.com/og-faq.jpg" },

    // Twitter
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "FAQ - Nebu" },
    { name: "twitter:description", content: "Respuestas a tus preguntas sobre Nebu: funcionamiento, seguridad, edades y más." },
    { name: "twitter:image", content: "https://flow-telligence.com/og-faq.jpg" },
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
    <div className="min-h-screen bg-nebu-bg">
      <Header />

      <section className="pt-32 pb-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-primary/30 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <HelpCircle className="w-4 h-4" />
            {t("faq.badge", "Respuestas a tus Preguntas")}
          </div>

          <motion.h1
            className="text-4xl md:text-6xl font-bold font-gochi mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {t("faq.title")}
          </motion.h1>

          <motion.p
            className="text-xl text-gray-600 max-w-2xl mx-auto mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {t("faq.subtitle")}
          </motion.p>
        </div>

        <div className="max-w-3xl mx-auto px-4">
          <div>

            <Accordion.Root type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <Accordion.Item
                  key={index}
                  value={`item-${index}`}
                  className="card overflow-hidden"
                >
                  <Accordion.Header>
                    <Accordion.Trigger className="flex items-center justify-between w-full p-6 text-left group hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <span className="text-lg font-semibold pr-4">
                        {faq.question}
                      </span>
                      <ChevronDown className="w-5 h-5 text-gray-500 transition-transform group-data-[state=open]:rotate-180" />
                    </Accordion.Trigger>
                  </Accordion.Header>
                  <Accordion.Content className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
                    <div className="px-6 pb-6 text-gray-600 dark:text-gray-400">
                      {faq.answer}
                    </div>
                  </Accordion.Content>
                </Accordion.Item>
              ))}
            </Accordion.Root>

            <div className="mt-12 text-center p-8 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl">
              <h3 className="text-2xl font-bold mb-2">
                {t("faq.stillHaveQuestions")}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {t("faq.hereToHelp")}
              </p>
              <a href="/contact" className="btn-primary">
                {t("faq.contactUs")}
              </a>
            </div>
          </div>
        </div>
      </section>

      <Newsletter />
      <Footer />
    </div>
  );
}
