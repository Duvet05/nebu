import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Star, Sparkles, ShieldCheck, Award } from 'lucide-react';

export default function ValuesGrid() {
  const { t } = useTranslation();

  const values = [
    {
      title: t("about.values.play.title"),
      description: t("about.values.play.description"),
      icon: <Sparkles className="w-6 h-6 text-primary" />
    },
    {
      title: t("about.values.purpose.title"),
      description: t("about.values.purpose.description"),
      icon: <Star className="w-6 h-6 text-primary" />
    },
    {
      title: t("about.values.trust.title"),
      description: t("about.values.trust.description"),
      icon: <ShieldCheck className="w-6 h-6 text-primary" />
    },
    {
      title: t("about.values.design.title"),
      description: t("about.values.design.description"),
      icon: <Award className="w-6 h-6 text-primary" />
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
      {values.map((value, index) => (
        <motion.div
          key={index}
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: index * 0.1 }}
        >
          <div className="mx-auto mb-4 flex items-center justify-center">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-nebu-dark/10 bg-white">
              {value.icon}
            </span>
          </div>
          <h3 className="text-xl font-bold mb-2 text-nebu-dark">{value.title}</h3>
          <p className="text-gray-600">{value.description}</p>
        </motion.div>
      ))}
    </div>
  );
}
