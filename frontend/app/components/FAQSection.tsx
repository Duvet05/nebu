/**
 * FAQ Section Component
 *
 * Componente de sección de preguntas frecuentes con:
 * - Radix UI Accordion para accesibilidad y animaciones
 * - Schema.org markup para SEO
 * - Soporte para i18n
 * - Animaciones con Framer Motion
 *
 * @example
 * <FAQSection
 *   faqs={[
 *     { question: "¿Pregunta?", answer: "Respuesta" }
 *   ]}
 *   title="Preguntas Frecuentes"
 * />
 */

import { memo } from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import clsx from 'clsx';

export interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSchemaProps {
  faqs: FAQItem[];
}

// Schema.org structured data para SEO
export const FAQSchema = memo(function FAQSchema({ faqs }: FAQSchemaProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
});

interface FAQSectionProps {
  faqs: FAQItem[];
  title?: string;
  className?: string;
  /** Permitir múltiples items abiertos simultáneamente */
  allowMultiple?: boolean;
  /** Valor(es) inicial(es) abierto(s) */
  defaultValue?: string | string[];
}

export const FAQSection = memo(function FAQSection({
  faqs,
  title = "Preguntas Frecuentes",
  className = "",
  allowMultiple = false,
  defaultValue,
}: FAQSectionProps) {
  const items = faqs.map((faq, index) => (
    <motion.div
      key={index}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Accordion.Item
        value={`item-${index}`}
        itemScope
        itemProp="mainEntity"
        itemType="https://schema.org/Question"
        className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow duration-300"
      >
        <Accordion.Header>
          <Accordion.Trigger
            className={clsx(
              "w-full px-6 py-4 text-left flex items-center justify-between",
              "hover:bg-gray-50 transition-colors duration-200",
              "group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            )}
          >
            <h3
              itemProp="name"
              className="text-lg font-semibold text-gray-900 pr-8"
            >
              {faq.question}
            </h3>
            <ChevronDown
              className={clsx(
                "w-5 h-5 text-gray-500 flex-shrink-0",
                "transition-transform duration-300 ease-out",
                "group-data-[state=open]:rotate-180"
              )}
              aria-hidden="true"
            />
          </Accordion.Trigger>
        </Accordion.Header>

        <Accordion.Content
          className={clsx(
            "overflow-hidden",
            "data-[state=open]:animate-accordion-down",
            "data-[state=closed]:animate-accordion-up"
          )}
          itemScope
          itemProp="acceptedAnswer"
          itemType="https://schema.org/Answer"
        >
          <div className="px-6 pb-4 pt-2">
            <p
              itemProp="text"
              className="text-gray-600 leading-relaxed"
            >
              {faq.answer}
            </p>
          </div>
        </Accordion.Content>
      </Accordion.Item>
    </motion.div>
  ));

  return (
    <>
      <FAQSchema faqs={faqs} />
      <section
        className={clsx("py-16", className)}
        itemScope
        itemType="https://schema.org/FAQPage"
      >
        <div className="max-w-4xl mx-auto px-4">
          {/* Título */}
          <motion.h2
            className="text-4xl font-bold font-heading text-center mb-12 text-gray-900"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {title}
          </motion.h2>

          {/* Accordion - Renderizado condicional basado en allowMultiple */}
          {allowMultiple ? (
            <Accordion.Root
              type="multiple"
              defaultValue={defaultValue as string[] | undefined}
              className="space-y-4"
            >
              {items}
            </Accordion.Root>
          ) : (
            <Accordion.Root
              type="single"
              defaultValue={defaultValue as string | undefined}
              collapsible
              className="space-y-4"
            >
              {items}
            </Accordion.Root>
          )}
        </div>
      </section>
    </>
  );
});

export default FAQSection;
