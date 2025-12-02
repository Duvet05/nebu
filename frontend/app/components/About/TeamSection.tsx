import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Award } from 'lucide-react';

export default function TeamSection() {
  const { t } = useTranslation();

  const teamMembers = [
    {
      emoji: "🔬",
      name: "Richard Castillo Leguía",
      degree: "Ingeniería Mecatrónica PUCP",
      description: "Fundador de Flow. Visión de IA aplicada a salud mental infantil."
    },
    {
      emoji: "💻",
      name: "Gonzalo Gálvez Cortez",
      degree: "Ingeniería Informática PUCP",
      description: "Arquitectura del sistema y app móvil con control parental."
    },
    {
      emoji: "⚙️",
      name: "Bryan Bastidas",
      degree: "Ingeniería Mecatrónica PUCP",
      description: "Diseño e integración de hardware. Robótica aplicada."
    },
    {
      emoji: "🤖",
      name: "Mitshell Ramos",
      degree: "Ingeniería Mecatrónica PUCP",
      description: "Expansión de funcionalidades y desarrollo de nuevos productos."
    }
  ];

  return (
    <motion.div
      className="mb-16"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
    >
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-6 py-3 mb-4">
          <Award className="w-6 h-6 text-primary" />
          <span className="font-bold text-primary">Egresados PUCP</span>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          {t("about.story.team.description")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {teamMembers.map((member, index) => (
          <div 
            key={index}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200"
          >
            <div className="text-4xl mb-3">{member.emoji}</div>
            <h4 className="font-bold text-lg text-nebu-dark mb-1">{member.name}</h4>
            <p className="text-sm text-gray-600 mb-2">{member.degree}</p>
            <p className="text-sm text-gray-700">{member.description}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
