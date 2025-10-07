import { Link } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { Facebook, Instagram, Linkedin } from "lucide-react";

export function Footer() {
  const { t } = useTranslation("common");

  return (
    <footer className="w-full relative bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 md:gap-12">

          {/* Logo y descripción */}
          <div className="lg:col-span-4">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">N</span>
              </div>
              <span className="text-2xl font-heading font-bold text-gray-900 dark:text-white">
                Nebu
              </span>
            </Link>
            <p className="text-base text-gray-600 dark:text-gray-300 mb-2">
              {t("footer.description")}
            </p>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-400">
              {t("footer.tagline")}
            </p>
          </div>

          {/* Navegación */}
          <div className="lg:col-span-2">
            <h3 className="text-base font-semibold mb-4 text-gray-900 dark:text-white">
              {t("footer.navigation")}
            </h3>
            <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
              <li>
                <Link to="/" className="hover:text-primary transition-colors">
                  {t("footer.home")}
                </Link>
              </li>
              <li>
                <Link to="/our-story" className="hover:text-primary transition-colors">
                  {t("footer.ourStory")}
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-primary transition-colors">
                  {t("footer.faq")}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-primary transition-colors">
                  {t("footer.contact")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="lg:col-span-2">
            <h3 className="text-base font-semibold mb-4 text-gray-900 dark:text-white">
              {t("footer.legal")}
            </h3>
            <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
              <li>
                <Link to="/terms" className="hover:text-primary transition-colors">
                  {t("footer.links.termsOfService")}
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-primary transition-colors">
                  {t("footer.links.privacyPolicy")}
                </Link>
              </li>
              <li>
                <Link to="/returns" className="hover:text-primary transition-colors">
                  {t("footer.links.returnPolicy")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacto y Redes */}
          <div className="lg:col-span-4">
            <h3 className="text-base font-semibold mb-4 text-gray-900 dark:text-white">
              {t("footer.contactTitle")}
            </h3>
            <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300 mb-4">
              <li>
                <a href="mailto:contacto@flow-telligence.com" className="hover:text-primary transition-colors">
                  contacto@flow-telligence.com
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/51999999999?text=Hola!%20Estoy%20interesado%20en%20Nebu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  +51 999 999 999
                </a>
              </li>
            </ul>

            <h4 className="text-sm font-semibold mb-3 text-gray-900 dark:text-white">
              {t("footer.followUs")}
            </h4>
            <div className="flex gap-4">
              <a
                href="https://pe.linkedin.com/in/galvezc"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
              >
                <Linkedin size={20} />
              </a>
              <a
                href="https://www.instagram.com/flow_.ia/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://www.facebook.com/flowtelligence"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
              >
                <Facebook size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-200 dark:border-gray-700 mt-12 pt-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span>© {new Date().getFullYear()} Flow-telligence. {t("footer.allRightsReserved")}.</span>
            <span className="hidden sm:inline">•</span>
            <span className="text-primary font-medium">{t("footer.madeWith")}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
