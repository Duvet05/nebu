import { useTranslation } from "react-i18next";

interface ContactFormData {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
}

interface ContactFormProps {
  formData: ContactFormData;
  onInputChange: (field: keyof ContactFormData, value: string) => void;
}

/**
 * ContactForm - Formulario de información de contacto
 */
export default function ContactForm({ formData, onInputChange }: ContactFormProps) {
  const { t } = useTranslation("common");

  return (
    <div className="space-y-6 mb-8">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("preOrder.form.firstName")} *
          </label>
          <input
            type="text"
            required
            value={formData.firstName}
            onChange={(e) => onInputChange("firstName", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder={t("preOrder.form.firstNamePlaceholder")}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("preOrder.form.lastName")} *
          </label>
          <input
            type="text"
            required
            value={formData.lastName}
            onChange={(e) => onInputChange("lastName", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder={t("preOrder.form.lastNamePlaceholder")}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t("preOrder.form.email")} *
        </label>
        <input
          type="email"
          required
          value={formData.email}
          onChange={(e) => onInputChange("email", e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder={t("preOrder.form.emailPlaceholder")}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t("preOrder.form.phone")} *
        </label>
        <input
          type="tel"
          required
          value={formData.phone}
          onChange={(e) => onInputChange("phone", e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder={t("preOrder.form.phonePlaceholder")}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t("preOrder.form.address")} *
        </label>
        <input
          type="text"
          required
          value={formData.address}
          onChange={(e) => onInputChange("address", e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder={t("preOrder.form.addressPlaceholder")}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("preOrder.form.city")} *
          </label>
          <input
            type="text"
            required
            value={formData.city}
            onChange={(e) => onInputChange("city", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder={t("preOrder.form.cityPlaceholder")}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("preOrder.form.postalCode")}
          </label>
          <input
            type="text"
            value={formData.postalCode}
            onChange={(e) => onInputChange("postalCode", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder={t("preOrder.form.postalCodePlaceholder")}
          />
        </div>
      </div>
    </div>
  );
}
