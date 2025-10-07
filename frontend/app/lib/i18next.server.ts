import { resolve } from "node:path";
import { RemixI18Next } from "remix-i18next/server";
import Backend from "i18next-fs-backend";

const i18next = new RemixI18Next({
  detection: {
    supportedLanguages: ["es", "en"],
    fallbackLanguage: "es",
  },
  i18next: {
    backend: {
      loadPath: resolve("./public/locales/{{lng}}/{{ns}}.json"),
    },
  },
  backend: Backend,
});

export default i18next;
