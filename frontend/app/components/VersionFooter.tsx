import { useTranslation } from "react-i18next";

interface VersionFooterProps {
  version?: string;
  className?: string;
}

/**
 * VersionFooter - Muestra la versión del frontend
 * Componente reutilizable para mostrar información de versión
 */
export default function VersionFooter({ version = "1.0.0", className = "" }: VersionFooterProps) {
  const { t } = useTranslation("common");

  return (
    <div className={`text-center text-xs text-gray-400 py-4 ${className}`}>
      {t("footer.version", { version })}
    </div>
  );
}
