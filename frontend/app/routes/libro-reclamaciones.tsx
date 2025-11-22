import type { MetaFunction } from "@remix-run/node";
import { useTranslation } from "react-i18next";
import { Header } from "~/components/layout/Header";
import { Footer } from "~/components/layout/Footer";
import { motion } from "framer-motion";
import { FileText, AlertCircle, Send, Clock, CheckCircle } from "lucide-react";
import { useState, type FormEvent } from "react";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import { InfoBox } from "~/components/ui/InfoBox";

export const meta: MetaFunction = () => {
  return [
    { title: "Libro de Reclamaciones - Flow Telligence | Nebu" },
    {
      name: "description",
      content: "Libro de Reclamaciones Virtual de Flow Telligence. Conforme a la Ley N° 29571 - Código de Protección y Defensa del Consumidor.",
    },
    {
      name: "keywords",
      content: "libro de reclamaciones, reclamos nebu, quejas flow telligence, indecopi, consumidor peru",
    },
    // Open Graph
    { property: "og:title", content: "Libro de Reclamaciones - Flow Telligence" },
    { property: "og:description", content: "Presenta tu reclamo o queja de forma virtual." },
    { property: "og:type", content: "website" },
    { property: "og:url", content: "https://flow-telligence.com/libro-reclamaciones" },
  ];
};

interface ComplaintFormData {
  // Datos del consumidor
  tipoDocumento: string;
  numeroDocumento: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  direccion: string;
  departamento: string;

  // Datos del producto/servicio
  tipoReclamo: "reclamo" | "queja";
  producto: string;
  monto: string;
  descripcion: string;
  pedido: string;

  // Datos del padre/tutor (si el consumidor es menor)
  menorEdad: boolean;
  tutorNombres?: string;
  tutorApellidos?: string;
  tutorDocumento?: string;
}

export default function LibroReclamacionesPage() {
  const { t } = useTranslation("common");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [hojaNumber, setHojaNumber] = useState<string>("");

  const [formData, setFormData] = useState<ComplaintFormData>({
    tipoDocumento: "DNI",
    numeroDocumento: "",
    nombres: "",
    apellidos: "",
    email: "",
    telefono: "",
    direccion: "",
    departamento: "Lima",
    tipoReclamo: "reclamo",
    producto: "",
    monto: "",
    descripcion: "",
    pedido: "",
    menorEdad: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus("idle");

    try {
      const response = await fetch("/api/complaints", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setHojaNumber(data.hojaNumber);
        // Reset form
        setFormData({
          tipoDocumento: "DNI",
          numeroDocumento: "",
          nombres: "",
          apellidos: "",
          email: "",
          telefono: "",
          direccion: "",
          departamento: "Lima",
          tipoReclamo: "reclamo",
          producto: "",
          monto: "",
          descripcion: "",
          pedido: "",
          menorEdad: false,
        });
      } else {
        setStatus("error");
      }
    } catch (error) {
      console.error("Error submitting complaint:", error);
      setStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-nebu-bg">
      <Header />

      <div className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 text-primary px-6 py-3 rounded-full text-sm font-medium mb-6">
              <FileText className="w-4 h-4" />
              <span>{t('libroReclamaciones.law')}</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold font-heading mb-6 text-gray-900">
              {t('libroReclamaciones.title')}
            </h1>

            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('libroReclamaciones.description')}
            </p>
          </motion.div>

          {/* Info Cards */}
          <motion.div
            className="grid md:grid-cols-2 gap-6 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <InfoBox
              variant="info"
              title={t('libroReclamaciones.reclamo.title')}
              icon={<AlertCircle className="w-6 h-6" />}
            >
              <p className="text-sm">
                {t('libroReclamaciones.reclamo.description')}
              </p>
            </InfoBox>

            <InfoBox
              variant="warning"
              title={t('libroReclamaciones.queja.title')}
              icon={<FileText className="w-6 h-6" />}
            >
              <p className="text-sm">
                {t('libroReclamaciones.queja.description')}
              </p>
            </InfoBox>
          </motion.div>

          {/* Success Message */}
          {status === "success" && (
            <motion.div
              className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-green-900 mb-2">
                    {t('libroReclamaciones.success.title')}
                  </h3>
                  <p className="text-sm text-green-700 mb-2">
                    {t('libroReclamaciones.success.code')} <strong>{hojaNumber}</strong>
                  </p>
                  <p className="text-sm text-green-700">
                    {t('libroReclamaciones.success.response')}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Error Message */}
          {status === "error" && (
            <motion.div
              className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-red-900 mb-2">
                    {t('libroReclamaciones.error.title')}
                  </h3>
                  <p className="text-sm text-red-700">
                    {t('libroReclamaciones.error.description')}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Form */}
          <motion.div
            className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Datos del Consumidor */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                  {t('libroReclamaciones.consumerData.title')}
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('libroReclamaciones.consumerData.documentType')}
                    </label>
                    <select
                      name="tipoDocumento"
                      value={formData.tipoDocumento}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="DNI">{t('libroReclamaciones.documentTypes.dni')}</option>
                      <option value="CE">{t('libroReclamaciones.documentTypes.ce')}</option>
                      <option value="Pasaporte">{t('libroReclamaciones.documentTypes.passport')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('libroReclamaciones.consumerData.documentNumber')}
                    </label>
                    <input
                      type="text"
                      name="numeroDocumento"
                      value={formData.numeroDocumento}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="12345678"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('libroReclamaciones.consumerData.firstName')}
                    </label>
                    <input
                      type="text"
                      name="nombres"
                      value={formData.nombres}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Juan Carlos"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('libroReclamaciones.consumerData.lastName')}
                    </label>
                    <input
                      type="text"
                      name="apellidos"
                      value={formData.apellidos}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Pérez García"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('libroReclamaciones.consumerData.email')}
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="correo@ejemplo.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('libroReclamaciones.consumerData.phone')}
                    </label>
                    <input
                      type="tel"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="+51 987 654 321"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('libroReclamaciones.consumerData.address')}
                    </label>
                    <input
                      type="text"
                      name="direccion"
                      value={formData.direccion}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Av. Principal 123, Distrito"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('libroReclamaciones.consumerData.department')}
                    </label>
                    <select
                      name="departamento"
                      value={formData.departamento}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="Lima">{t('libroReclamaciones.departments.lima')}</option>
                      <option value="Arequipa">{t('libroReclamaciones.departments.arequipa')}</option>
                      <option value="Cusco">{t('libroReclamaciones.departments.cusco')}</option>
                      <option value="Piura">{t('libroReclamaciones.departments.piura')}</option>
                      <option value="Otro">{t('libroReclamaciones.departments.other')}</option>
                    </select>
                  </div>
                </div>

                {/* Menor de edad */}
                <div className="mt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="menorEdad"
                      checked={formData.menorEdad}
                      onChange={handleChange}
                      className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700">
                      {t('libroReclamaciones.consumerData.minorAge')}
                    </span>
                  </label>
                </div>

                {formData.menorEdad && (
                  <div className="grid md:grid-cols-2 gap-6 mt-6 p-4 bg-gray-50 rounded-xl">
                    <div className="md:col-span-2">
                      <h3 className="text-sm font-semibold text-gray-900 mb-4">
                        {t('libroReclamaciones.consumerData.tutorData.title')}
                      </h3>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('libroReclamaciones.consumerData.tutorData.firstName')}
                      </label>
                      <input
                        type="text"
                        name="tutorNombres"
                        value={formData.tutorNombres || ""}
                        onChange={handleChange}
                        required={formData.menorEdad}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('libroReclamaciones.consumerData.tutorData.lastName')}
                      </label>
                      <input
                        type="text"
                        name="tutorApellidos"
                        value={formData.tutorApellidos || ""}
                        onChange={handleChange}
                        required={formData.menorEdad}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('libroReclamaciones.consumerData.tutorData.document')}
                      </label>
                      <input
                        type="text"
                        name="tutorDocumento"
                        value={formData.tutorDocumento || ""}
                        onChange={handleChange}
                        required={formData.menorEdad}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Detalle del Reclamo */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                  {t('libroReclamaciones.complaintDetails.title')}
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('libroReclamaciones.complaintDetails.type')}
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <label className={`flex items-center justify-center gap-2 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        formData.tipoReclamo === "reclamo"
                          ? "border-primary bg-primary/5"
                          : "border-gray-300 hover:border-gray-400"
                      }`}>
                        <input
                          type="radio"
                          name="tipoReclamo"
                          value="reclamo"
                          checked={formData.tipoReclamo === "reclamo"}
                          onChange={handleChange}
                          className="w-5 h-5 text-primary"
                        />
                        <span className="font-medium">{t('libroReclamaciones.reclamo.title')}</span>
                      </label>

                      <label className={`flex items-center justify-center gap-2 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        formData.tipoReclamo === "queja"
                          ? "border-primary bg-primary/5"
                          : "border-gray-300 hover:border-gray-400"
                      }`}>
                        <input
                          type="radio"
                          name="tipoReclamo"
                          value="queja"
                          checked={formData.tipoReclamo === "queja"}
                          onChange={handleChange}
                          className="w-5 h-5 text-primary"
                        />
                        <span className="font-medium">{t('libroReclamaciones.queja.title')}</span>
                      </label>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('libroReclamaciones.complaintDetails.product')}
                      </label>
                      <select
                        name="producto"
                        value={formData.producto}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="">{t('libroReclamaciones.complaintDetails.selectProduct')}</option>
                        <option value="Nebu Dino">{t('libroReclamaciones.products.nebuDino')}</option>
                        <option value="Nebu Gato">{t('libroReclamaciones.products.nebuGato')}</option>
                        <option value="Nebu Conejo">{t('libroReclamaciones.products.nebuConejo')}</option>
                        <option value="Plan Family">{t('libroReclamaciones.products.planFamily')}</option>
                        <option value="Plan Premium">{t('libroReclamaciones.products.planPremium')}</option>
                        <option value="Otro">{t('libroReclamaciones.products.other')}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('libroReclamaciones.complaintDetails.amount')}
                      </label>
                      <input
                        type="number"
                        name="monto"
                        value={formData.monto}
                        onChange={handleChange}
                        required
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="380.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('libroReclamaciones.complaintDetails.orderNumber')}
                      </label>
                      <input
                        type="text"
                        name="pedido"
                        value={formData.pedido}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="ORD-2024-001"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('libroReclamaciones.complaintDetails.description')}
                    </label>
                    <textarea
                      name="descripcion"
                      value={formData.descripcion}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                      placeholder={t('libroReclamaciones.complaintDetails.descriptionPlaceholder')}
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      {t('libroReclamaciones.complaintDetails.descriptionHint')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Información Legal */}
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gray-600 flex-shrink-0 mt-1" />
                  <div className="text-sm text-gray-700">
                    <p className="font-medium mb-2">{t('libroReclamaciones.legalInfo.title')}</p>
                    <p>
                      {t('libroReclamaciones.legalInfo.description')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-primary to-accent text-white py-4 px-8 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <LoadingSpinner size="sm" message="" className="!mb-0" />
                      <span className="ml-2">{t('libroReclamaciones.submit.sending')}</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      {t('libroReclamaciones.submit.button')}
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs text-gray-500 text-center">
                {t('libroReclamaciones.submit.privacy')}{" "}
                <a href="/privacy" className="text-primary hover:underline">
                  {t('libroReclamaciones.submit.privacyLink')}
                </a>
                {" "}{t('libroReclamaciones.submit.andRegulation')}
              </p>
            </form>
          </motion.div>

          {/* Información Adicional */}
          <motion.div
            className="mt-12 bg-white rounded-2xl shadow-lg border border-gray-200 p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {t('libroReclamaciones.companyInfo.title')}
            </h2>

            <div className="space-y-4 text-sm text-gray-700">
              <div>
                <span className="font-semibold">{t('libroReclamaciones.companyInfo.businessName')}</span> Flow  S.A.C.S
              </div>
              <div>
                <span className="font-semibold">{t('libroReclamaciones.companyInfo.ruc')}</span> 10703363135
              </div>
              <div>
                <span className="font-semibold">{t('libroReclamaciones.companyInfo.address')}</span> Lima, Perú
              </div>
              <div>
                <span className="font-semibold">{t('libroReclamaciones.companyInfo.email')}</span> contacto@flow-telligence.com
              </div>
              <div>
                <span className="font-semibold">{t('libroReclamaciones.companyInfo.phone')}</span> +51 987 654 321
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
