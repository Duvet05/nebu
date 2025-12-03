import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Video } from "lucide-react";

export default function TikTokShowcase() {
  const { t } = useTranslation();

  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <motion.div
            className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md mb-4"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1, margin: "0px 0px -100px 0px" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <Video className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold text-gray-700">
              {t("tiktokShowcase.badge", "¡Míranos en acción!")}
            </span>
          </motion.div>

          <motion.h2
            className="text-4xl md:text-5xl lg:text-6xl font-bold font-gochi text-primary mb-4"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1, margin: "0px 0px -100px 0px" }}
            transition={{ duration: 0.3, delay: 0.1, ease: "easeOut" }}
          >
            {t("tiktokShowcase.title", "Descubre Nebu en TikTok")}
          </motion.h2>

          <motion.p
            className="text-xl text-gray-600 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1, margin: "0px 0px -100px 0px" }}
            transition={{ duration: 0.3, delay: 0.2, ease: "easeOut" }}
          >
            {t("tiktokShowcase.subtitle", "Mira cómo Nebu transforma cada momento en una aventura educativa")}
          </motion.p>
        </div>

        <motion.div
          className="max-w-md mx-auto"
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.1, margin: "0px 0px -100px 0px" }}
          transition={{ duration: 0.3, delay: 0.3, ease: "easeOut" }}
        >
          <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden">
            <div className="relative" style={{ paddingBottom: "177.78%" }}>
              <iframe
                src="https://customer-6wol0f3dx3u8wuhd.cloudflarestream.com/87848b56dbe4f7e7e92a0e5a8fe56b4f/iframe?poster=https%3A%2F%2Fcustomer-6wol0f3dx3u8wuhd.cloudflarestream.com%2F87848b56dbe4f7e7e92a0e5a8fe56b4f%2Fthumbnails%2Fthumbnail.jpg%3Ftime%3D%26height%3D600"
                loading="lazy"
                className="absolute top-0 left-0 w-full h-full border-0"
                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                allowFullScreen
                title="Video - Nebu en acción"
              />
            </div>
          </div>

          <div className="mt-6 text-center">
            <a
              href="https://www.tiktok.com/@flow_.ia/video/7563090924025203976"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary hover:text-accent transition-colors font-semibold"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
              {t("tiktokShowcase.followUs", "Síguenos en TikTok @flow_.ia")}
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
