import { useSearchParams, Link } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import CTAButton from "~/components/Sections/CTAButton";

export default function UnsubscribePage() {
  const [params] = useSearchParams();
  const email = params.get("email");
  const { t } = useTranslation("common");

  return (
    <section className="flex flex-col items-center justify-center min-h-[60vh] py-12 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center border border-primary/10">
        <div className="flex items-center justify-center mb-4">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="10" fill="#f8f9ff" />
            <path d="M8.5 9.5l7 7M8.5 16.5l7-7" stroke="#764ba2" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <h1 className="text-3xl font-gochi font-bold text-primary mb-2">
          {t("unsubscribe.title", "Suscripción cancelada")}
        </h1>
        <p className="text-lg text-gray-700 mb-6">
          {email ? (
            <>
              {t("unsubscribe.success", { email })}
              <br />
              {t("unsubscribe.resubscribe")}
            </>
          ) : (
            t("unsubscribe.invalid", "No se encontró un email válido en el enlace.")
          )}
        </p>
        <CTAButton to="/" variant="primary" ariaLabel={t("unsubscribe.goHome", "Volver al inicio") as string}>
          {t("unsubscribe.goHome", "Volver al inicio")}
        </CTAButton>
        <div className="mt-4">
          <Link
            to="/"
            className="text-primary underline text-base hover:text-accent transition-colors"
          >
            {t("unsubscribe.resubscribeCta", "¿Quieres volver a suscribirte? Haz clic aquí")}
          </Link>
        </div>
      </div>
    </section>
  );
}
