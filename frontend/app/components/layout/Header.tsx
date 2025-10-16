import { Link } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { useState } from "react";

export function Header() {
  const { t, i18n } = useTranslation("common");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleLanguage = () => {
    const newLang = i18n.language === "es" ? "en" : "es";
    i18n.changeLanguage(newLang);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-accent/20 bg-gradient-to-r from-accent/90 to-accent/80 backdrop-blur-md shadow-lg shadow-accent/10">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center gap-8 flex-1 justify-center">
            <Link
              to="/"
              className="text-gray-700 hover:text-gray-900 hover:scale-105 transition-all duration-300 font-medium"
            >
              {t("nav.home")}
            </Link>
            <Link
              to="/our-story"
              className="text-gray-700 hover:text-gray-900 hover:scale-105 transition-all duration-300 font-medium"
            >
              {t("nav.ourStory")}
            </Link>
            <Link
              to="/pre-order"
              className="text-gray-700 hover:text-gray-900 hover:scale-105 transition-all duration-300 font-medium"
            >
              {t("nav.preOrder")}
            </Link>
            <Link
              to="/faq"
              className="text-gray-700 hover:text-gray-900 hover:scale-105 transition-all duration-300 font-medium"
            >
              {t("nav.faq")}
            </Link>
            <Link
              to="/contact"
              className="text-gray-700 hover:text-gray-900 hover:scale-105 transition-all duration-300 font-medium"
            >
              {t("nav.contact")}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-gray-700 hover:text-gray-900 p-2"
            aria-label="Toggle menu"
            type="button"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>

          {/* Language Switcher */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleLanguage}
              type="button"
              aria-label={i18n.language === "es" ? "Cambiar idioma a English" : "Cambiar idioma a Español"}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-gray-800 hover:text-gray-900 font-medium px-4 py-2 rounded-xl border border-white/30 hover:border-white/50 transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md"
            >
              <div className="relative">
                <img 
                  src={i18n.language === "es" ? "/assets/icons/flags/peru-flag-icon.svg" : "/assets/icons/flags/united-states-flag-icon.svg"} 
                  alt=""
                   className="w-5 h-4 rounded-sm object-cover border border-gray-300/50"
                   aria-hidden="true"
                />
              </div>
              <span className="text-sm font-semibold">
                {i18n.language === "es" ? "ES" : "EN"}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-3">
            <Link
              to="/"
              onClick={() => setIsMenuOpen(false)}
              className="block text-gray-700 hover:text-gray-900 hover:bg-white/20 px-4 py-2 rounded-lg transition-all duration-300 font-medium"
            >
              {t("nav.home")}
            </Link>
            <Link
              to="/our-story"
              onClick={() => setIsMenuOpen(false)}
              className="block text-gray-700 hover:text-gray-900 hover:bg-white/20 px-4 py-2 rounded-lg transition-all duration-300 font-medium"
            >
              {t("nav.ourStory")}
            </Link>
            <Link
              to="/pre-order"
              onClick={() => setIsMenuOpen(false)}
              className="block text-gray-700 hover:text-gray-900 hover:bg-white/20 px-4 py-2 rounded-lg transition-all duration-300 font-medium"
            >
              {t("nav.preOrder")}
            </Link>
            <Link
              to="/faq"
              onClick={() => setIsMenuOpen(false)}
              className="block text-gray-700 hover:text-gray-900 hover:bg-white/20 px-4 py-2 rounded-lg transition-all duration-300 font-medium"
            >
              {t("nav.faq")}
            </Link>
            <Link
              to="/contact"
              onClick={() => setIsMenuOpen(false)}
              className="block text-gray-700 hover:text-gray-900 hover:bg-white/20 px-4 py-2 rounded-lg transition-all duration-300 font-medium"
            >
              {t("nav.contact")}
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
