import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { MessageSquare, BookOpen, Palette, Gamepad2, Home } from 'lucide-react';

type ConversationExample = {
  question: string;
  category: string;
};

type CategoryKey = 'educational' | 'creative' | 'fun' | 'daily';

const categoryIcons = {
  educational: BookOpen,
  creative: Palette,
  fun: Gamepad2,
  daily: Home,
};

const categoryColors = {
  educational: 'bg-primary',
  creative: 'bg-accent', 
  fun: 'bg-gold',
  daily: 'bg-secondary',
};

// Static data as fallback
const conversationData = {
  educational: [
    { question: "Nebu, ¿por qué el cielo es azul?", category: "Ciencias" },
    { question: "Nebu, ayúdame con mis tablas de multiplicar", category: "Matemáticas" },
    { question: "Nebu, ¿cómo crecen las plantas?", category: "Biología" },
    { question: "Nebu, ¿qué son los planetas?", category: "Astronomía" }
  ],
  creative: [
    { question: "Nebu, cuéntame un cuento de dragones", category: "Cuentos" },
    { question: "Nebu, inventemos una canción juntos", category: "Música" },
    { question: "Nebu, vamos a crear un personaje mágico", category: "Creatividad" },
    { question: "Nebu, hagamos una historia de aventuras", category: "Narrativa" }
  ],
  fun: [
    { question: "Nebu, vamos a jugar adivinanzas", category: "Juegos" },
    { question: "Nebu, ¿conoces chistes divertidos?", category: "Humor" },
    { question: "Nebu, cantemos una canción juntos", category: "Música" },
    { question: "Nebu, hagamos mímica de animales", category: "Actividades" }
  ],
  daily: [
    { question: "Nebu, ¿qué puedo hacer después del colegio?", category: "Rutina" },
    { question: "Nebu, ayúdame a ordenar mis juguetes", category: "Organización" },
    { question: "Nebu, quiero aprender algo nuevo", category: "Aprendizaje" },
    { question: "Nebu, cuéntame sobre mi día", category: "Reflexión" }
  ]
};



export default function ConversationExamples() {
  const { t } = useTranslation("common");
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>('educational');

  const categories: CategoryKey[] = ['educational', 'creative', 'fun', 'daily'];

  // Get conversation examples with static fallback
  const getExamples = (category: CategoryKey): ConversationExample[] => {
    try {
      const examples = t(`conversations.examples.${category}`, { returnObjects: true });
      if (Array.isArray(examples) && examples.length > 0) {
        return examples as ConversationExample[];
      }
      // Use static fallback if translation fails
      return conversationData[category] || [];
    } catch (error) {
      console.error('Error loading conversation examples:', error);
      return conversationData[category] || [];
    }
  };

  const getCategoryLabel = (category: CategoryKey): string => {
    return t(`conversationExamples.categories.${category}`);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3 }
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      transition: { duration: 0.2 }
    }
  };

  return (
    <section className="min-h-[80vh] py-24 bg-nebu-bg relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center mb-20"
        >
          <motion.h2 
            variants={itemVariants}
            className="text-5xl md:text-6xl lg:text-7xl font-bold font-gochi mb-6 text-primary leading-tight"
          >
            {t("conversations.title")}
          </motion.h2>
          
          <motion.p 
            variants={itemVariants}
            className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
          >
            {t("conversations.subtitle")}
          </motion.p>
        </motion.div>

        {/* Category Filter - Redesigned */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-wrap justify-center gap-3 mb-16"
        >
          {categories.map((category) => {
            const IconComponent = categoryIcons[category];
            const isSelected = selectedCategory === category;
            
            return (
              <motion.button
                key={category}
                variants={itemVariants}
                onClick={() => setSelectedCategory(category)}
                className={`
                  relative flex items-center gap-2.5 px-8 py-3.5 rounded-2xl font-semibold text-sm transition-all duration-300 overflow-hidden
                  ${isSelected 
                    ? `${categoryColors[category]} text-white shadow-xl` 
                    : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:text-primary shadow-lg hover:shadow-xl border-2 border-gray-200 hover:border-primary/40'
                  }
                `}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
              >
                {isSelected && (
                  <motion.div
                    className="absolute inset-0 bg-white/10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
                <IconComponent className={`w-5 h-5 relative z-10 ${isSelected ? 'text-white' : 'text-primary'}`} />
                <span className="relative z-10">{getCategoryLabel(category)}</span>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Conversation Examples Grid - Premium Design */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedCategory}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto min-h-[450px]"
          >
            {getExamples(selectedCategory).length > 0 ? (
              getExamples(selectedCategory).map(
                (example: ConversationExample, index: number) => (
                <motion.div
                  key={`${selectedCategory}-${index}`}
                  variants={cardVariants}
                  className="group h-full"
                >
                  <div className="relative h-full bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-gray-300">
                    {/* Question - Clean layout */}
                    <div className="mb-5 flex-1">
                      <p className="text-gray-800 font-medium text-[15px] leading-relaxed">
                        "{example.question}"
                      </p>
                    </div>
                    
                    {/* Footer - Simple and clean */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <span className={`
                        inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wide
                        ${categoryColors[selectedCategory]} text-white
                      `}>
                        {example.category}
                      </span>
                      
                      <MessageSquare className={`w-4 h-4 ${categoryColors[selectedCategory]} opacity-30`} />
                    </div>
                  </div>
                </motion.div>
              )
            )) : (
              <div className="col-span-2 text-center py-12">
                <p className="text-gray-500 text-lg">{t('conversationExamples.noExamples')}</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Call to Action - Premium Design */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="text-center mt-20"
        >
          <motion.button
            className="relative inline-flex items-center justify-center gap-3 font-gochi font-bold text-lg px-6 py-4 rounded-full min-w-[280px] md:min-w-[320px] bg-primary text-white shadow-[0_6px_20px_rgba(255,181,74,0.3)] hover:shadow-[0_10px_30px_rgba(255,181,74,0.45)] transition-all duration-200 ease-out"
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.98 }}
          >
            <MessageSquare className="w-5 h-5" />
            <span>{t("conversationExamples.cta")}</span>
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
