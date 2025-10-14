import { Link } from "@remix-run/react";
import { useTranslation } from "react-i18next";

export function Header() {
  const { t, i18n } = useTranslation("common");

  const toggleLanguage = () => {
    const newLang = i18n.language === "es" ? "en" : "es";
    i18n.changeLanguage(newLang);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-accent/20 bg-gradient-to-r from-accent/90 to-accent/80 backdrop-blur-md shadow-lg shadow-accent/10">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img 
              src="/assets/logos/logo-flow.svg" 
              alt="Flow Logo" 
              className="h-8 md:h-10 w-auto"
            />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/our-story"
              className="text-gray-700 hover:text-gray-900 hover:scale-105 transition-all duration-300 font-medium"
            >
              {t("nav.ourStory")}
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

          <div className="flex items-center gap-4">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-gray-800 hover:text-gray-900 font-medium px-4 py-2 rounded-xl border border-white/30 hover:border-white/50 transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md"
            >
              <div className="relative">
                <img 
                  src={i18n.language === "es" ? "/assets/icons/flags/peru-flag-icon.svg" : "/assets/icons/flags/united-states-flag-icon.svg"} 
                  alt={i18n.language === "es" ? "Español" : "English"}
                  className="w-5 h-4 rounded-sm object-cover border border-gray-300/50"
                />
              </div>
              <span className="text-sm font-semibold">
                {i18n.language === "es" ? "ES" : "EN"}
              </span>
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}
