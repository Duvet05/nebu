import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export default function VideoSection() {
  const { t } = useTranslation();

  return (
    <motion.div
      className="mb-16"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.7 }}
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold font-gochi text-primary">
          {t("about.videos.title")}
        </h2>
      </div>

      <div className="flex justify-center">
        <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-200 max-w-md w-full">
          <div className="relative overflow-hidden rounded-xl" style={{ paddingBottom: '177.78%' }}>
            <iframe
              title="Video de presentación de Nebu"
              src="https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F1538072024288534&show_text=false&width=267&t=0"
              className="absolute top-0 left-0 w-full h-full"
              style={{ border: 'none', overflow: 'hidden' }}
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              allowFullScreen={true}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
