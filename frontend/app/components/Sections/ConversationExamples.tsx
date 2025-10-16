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
  educational: 'from-primary to-accent',
  creative: 'from-accent to-secondary', 
  fun: 'from-gold to-primary',
  daily: 'from-secondary to-accent',
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
    try {
      return t(`conversationExamples.categories.${category}`);
    } catch {
      // Fallback labels
      const fallbackLabels = {
        educational: "Educativo",
        creative: "Creativo", 
        fun: "Divertido",
        daily: "Día a día"
      };
      return fallbackLabels[category];
    }
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
    <section className="min-h-[80vh] py-24 bg-gradient-to-br from-primary/5 via-white to-accent/5 flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center mb-16"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 bg-accent/10 px-4 py-2 rounded-full border border-accent/20 mb-6">
            <MessageSquare className="w-6 h-6 text-accent" aria-hidden="true" />
            <span className="text-accent-dark font-semibold text-sm">
              {t("conversationExamples.badge")}
            </span>
          </motion.div>
          
          <motion.h2 
            variants={itemVariants}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
          >
            {t("conversations.title")}
          </motion.h2>
          
          <motion.p 
            variants={itemVariants}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            {t("conversations.subtitle")}
          </motion.p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-wrap justify-center gap-4 mb-12"
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
                  flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300
                  ${isSelected 
                    ? `bg-gradient-to-r ${categoryColors[category]} text-white shadow-lg transform scale-105` 
                    : 'bg-white text-gray-600 hover:bg-primary/5 shadow-md hover:shadow-lg border border-primary/20 hover:border-primary/30'
                  }
                `}
                whileHover={{ scale: isSelected ? 1.05 : 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <IconComponent className="w-5 h-5" />
                <span>{getCategoryLabel(category)}</span>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Conversation Examples Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedCategory}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="grid md:grid-cols-2 lg:grid-cols-2 gap-6 max-w-4xl mx-auto"
          >
            {getExamples(selectedCategory).length > 0 ? (
              getExamples(selectedCategory).map(
                (example: ConversationExample, index: number) => (
                <motion.div
                  key={`${selectedCategory}-${index}`}
                  variants={cardVariants}
                  className="group"
                >
                  <div className={`
                    relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300
                    border-l-4 bg-gradient-to-r ${categoryColors[selectedCategory]} 
                    hover:transform hover:-translate-y-1
                  `}>
                    <div className="bg-white rounded-xl p-6 ml-1">
                      <div className="flex items-start gap-4">
                        <div className={`
                          flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r ${categoryColors[selectedCategory]}
                          flex items-center justify-center
                        `}>
                          <MessageSquare className="w-6 h-6 text-white" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="bg-gray-50 rounded-lg p-3 mb-3">
                            <p className="text-gray-800 font-medium">
                              "{example.question}"
                            </p>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className={`
                              inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                              bg-gradient-to-r ${categoryColors[selectedCategory]} text-white
                            `}>
                              {example.category}
                            </span>
                            
                            <div className="flex items-center gap-1 text-accent">
                              <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                              <div className="w-2 h-2 bg-accent rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                              <div className="w-2 h-2 bg-accent rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            )) : (
              <div className="col-span-2 text-center py-12">
                <p className="text-gray-500 text-lg">No hay ejemplos disponibles para esta categoría</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Call to Action */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="text-center mt-16"
        >
          <motion.div
            className="inline-flex items-center gap-4 bg-gradient-to-r from-primary to-accent text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <MessageSquare className="w-6 h-6" />
            <span>{t("conversationExamples.cta")}</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
