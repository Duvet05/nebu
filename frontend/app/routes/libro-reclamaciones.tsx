import type { MetaFunction } from "@remix-run/node";
import { useTranslation } from "react-i18next";
import { Header } from "~/components/layout/Header";
import { Footer } from "~/components/layout/Footer";
import { motion } from "framer-motion";
import { FileText, AlertCircle, Send, Clock, CheckCircle } from "lucide-react";
import { useState, type FormEvent } from "react";

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
              <span>Conforme a Ley N° 29571</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold font-heading mb-6 text-gray-900">
              Libro de Reclamaciones
            </h1>

            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              En cumplimiento del Código de Protección y Defensa del Consumidor,
              ponemos a tu disposición nuestro Libro de Reclamaciones Virtual.
            </p>
          </motion.div>

          {/* Info Cards */}
          <motion.div
            className="grid md:grid-cols-2 gap-6 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="bg-blue-500 text-white p-3 rounded-lg">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Reclamo</h3>
                  <p className="text-sm text-gray-600">
                    Disconformidad relacionada con los productos o servicios adquiridos.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="bg-amber-500 text-white p-3 rounded-lg">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Queja</h3>
                  <p className="text-sm text-gray-600">
                    Disconformidad no relacionada con los productos o servicios, sino con la atención al cliente.
                  </p>
                </div>
              </div>
            </div>
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
                    Reclamo registrado exitosamente
                  </h3>
                  <p className="text-sm text-green-700 mb-2">
                    Tu reclamo ha sido registrado con el código: <strong>{hojaNumber}</strong>
                  </p>
                  <p className="text-sm text-green-700">
                    Responderemos a tu correo electrónico en un plazo máximo de 30 días calendario,
                    conforme a la normativa vigente.
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
                    Error al enviar el reclamo
                  </h3>
                  <p className="text-sm text-red-700">
                    Hubo un problema al procesar tu reclamo. Por favor, intenta nuevamente o
                    contáctanos directamente a: contacto@flow-telligence.com
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
                  Datos del Consumidor
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Documento *
                    </label>
                    <select
                      name="tipoDocumento"
                      value={formData.tipoDocumento}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="DNI">DNI</option>
                      <option value="CE">Carné de Extranjería</option>
                      <option value="Pasaporte">Pasaporte</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Número de Documento *
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
                      Nombres *
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
                      Apellidos *
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
                      Correo Electrónico *
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
                      Teléfono *
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
                      Dirección *
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
                      Departamento *
                    </label>
                    <select
                      name="departamento"
                      value={formData.departamento}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="Lima">Lima</option>
                      <option value="Arequipa">Arequipa</option>
                      <option value="Cusco">Cusco</option>
                      <option value="Piura">Piura</option>
                      <option value="Otro">Otro</option>
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
                      Soy menor de edad (requiere datos del padre/tutor)
                    </span>
                  </label>
                </div>

                {formData.menorEdad && (
                  <div className="grid md:grid-cols-2 gap-6 mt-6 p-4 bg-gray-50 rounded-xl">
                    <div className="md:col-span-2">
                      <h3 className="text-sm font-semibold text-gray-900 mb-4">
                        Datos del Padre/Tutor
                      </h3>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombres del Tutor *
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
                        Apellidos del Tutor *
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
                        DNI del Tutor *
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
                  Detalle del Reclamo o Queja
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo *
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
                        <span className="font-medium">Reclamo</span>
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
                        <span className="font-medium">Queja</span>
                      </label>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Producto o Servicio *
                      </label>
                      <select
                        name="producto"
                        value={formData.producto}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="">Selecciona un producto</option>
                        <option value="Nebu Dino">Nebu Dino</option>
                        <option value="Nebu Gato">Nebu Gato</option>
                        <option value="Nebu Conejo">Nebu Conejo</option>
                        <option value="Plan Family">Plan Family</option>
                        <option value="Plan Premium">Plan Premium</option>
                        <option value="Otro">Otro</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Monto Reclamado (S/) *
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
                        Número de Pedido (opcional)
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
                      Descripción del Reclamo o Queja *
                    </label>
                    <textarea
                      name="descripcion"
                      value={formData.descripcion}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                      placeholder="Describe detalladamente tu reclamo o queja..."
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Mínimo 50 caracteres. Incluye detalles como fecha de compra,
                      descripción del problema, y solución esperada.
                    </p>
                  </div>
                </div>
              </div>

              {/* Información Legal */}
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gray-600 flex-shrink-0 mt-1" />
                  <div className="text-sm text-gray-700">
                    <p className="font-medium mb-2">Plazo de respuesta:</p>
                    <p>
                      De acuerdo al Código de Protección y Defensa del Consumidor (Ley N° 29571),
                      responderemos a tu reclamo en un plazo no mayor a 30 días calendario.
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
                      <span className="animate-spin">⏳</span>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Enviar Reclamo
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs text-gray-500 text-center">
                Al enviar este formulario, aceptas que tus datos sean procesados conforme a nuestra{" "}
                <a href="/privacy" className="text-primary hover:underline">
                  Política de Privacidad
                </a>
                {" "}y la normativa vigente.
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
              Información de la Empresa
            </h2>

            <div className="space-y-4 text-sm text-gray-700">
              <div>
                <span className="font-semibold">Razón Social:</span> Flow Telligence S.A.C.
              </div>
              <div>
                <span className="font-semibold">RUC:</span> 10703363135
              </div>
              <div>
                <span className="font-semibold">Dirección:</span> Lima, Perú
              </div>
              <div>
                <span className="font-semibold">Correo:</span> contacto@flow-telligence.com
              </div>
              <div>
                <span className="font-semibold">Teléfono:</span> +51 987 654 321
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
