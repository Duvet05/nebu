import { useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ChatBubbleProps {
  className?: string;
}

export function ChatBubble({ className = "" }: ChatBubbleProps) {
  const { t } = useTranslation("common");
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      // Aquí se integraría con el sistema de chat
      // TODO: Integrar con backend de chat
      // console.log("Mensaje enviado:", message);
      // Simular respuesta automática
      setTimeout(() => {
        // console.log("Respuesta automática de Nebu");
      }, 1000);
      setMessage("");
    }
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="mb-4 w-80 h-96 bg-white rounded-2xl shadow-2xl border-0 overflow-hidden backdrop-blur-sm"
            style={{
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1), 0 8px 16px rgba(0, 0, 0, 0.06)"
            }}
          >
            {/* Chat Header */}
            <motion.div 
              className="bg-gradient-to-r from-primary via-accent to-secondary p-4 text-white relative overflow-hidden"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-2 left-4 w-16 h-16 rounded-full bg-white/20 blur-sm"></div>
                <div className="absolute bottom-2 right-8 w-12 h-12 rounded-full bg-white/10 blur-sm"></div>
              </div>
              
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <motion.div 
                    className="w-10 h-10 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center shadow-lg"
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <span className="text-white font-bold text-lg">N</span>
                  </motion.div>
                  <div>
                    <h3 className="font-bold text-base">{t("chat.title", "Chat with Nebu")}</h3>
                    <motion.div
                      className="flex items-center gap-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <p className="text-xs text-white/90">{t("chat.subtitle", "Always here to help")}</p>
                    </motion.div>
                  </div>
                </div>
                <motion.button
                  onClick={toggleChat}
                  className="text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/20"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
            </motion.div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 h-64 overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
              <div className="space-y-4">
                {/* Welcome Message */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-start gap-3"
                >
                  <motion.div 
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0 mt-1 shadow-lg"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
                  >
                    <span className="text-white font-bold text-sm">N</span>
                  </motion.div>
                  <motion.div 
                    className="bg-white rounded-2xl rounded-tl-sm p-4 shadow-sm max-w-xs border border-gray-100"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <p className="text-sm text-gray-800 leading-relaxed">
                      {t("chat.welcomeMessage", "¡Hola! Soy Nebu, tu asistente inteligente")} 
                    </p>
                  </motion.div>
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-3 mt-4"
                >
                  <p className="text-xs font-medium text-gray-600 px-2 mb-2">
                    {t("chat.quickActionsPrompt", "¿En qué puedo ayudarte?")}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <motion.button 
                      className="bg-gradient-to-r from-primary/10 to-primary/5 text-primary px-4 py-2 rounded-full text-xs font-medium hover:from-primary/20 hover:to-primary/10 transition-all duration-200 border border-primary/20 hover:border-primary/30"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {t("chat.buttons.preOrder", "Pre-ordenar Nebu")}
                    </motion.button>
                    <motion.button 
                      className="bg-gradient-to-r from-accent/10 to-accent/5 text-accent px-4 py-2 rounded-full text-xs font-medium hover:from-accent/20 hover:to-accent/10 transition-all duration-200 border border-accent/20 hover:border-accent/30"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {t("chat.buttons.pricing", "Ver precios")}
                    </motion.button>
                    <motion.button 
                      className="bg-gradient-to-r from-gold/10 to-gold/5 text-gray-700 px-4 py-2 rounded-full text-xs font-medium hover:from-gold/20 hover:to-gold/10 transition-all duration-200 border border-gold/20 hover:border-gold/30"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {t("chat.buttons.faq", "FAQ")}
                    </motion.button>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Chat Input */}
            <motion.form 
              onSubmit={handleSendMessage} 
              className="p-4 border-t border-gray-100 bg-white/80 backdrop-blur-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t("chat.placeholder", "Escribe tu mensaje...")}
                    className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 bg-white/90 backdrop-blur-sm shadow-sm"
                  />
                </div>
                <motion.button
                  type="submit"
                  disabled={!message.trim()}
                  className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-accent text-white flex items-center justify-center hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Send className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Button */}
      <motion.button
        onClick={toggleChat}
        className={`w-16 h-16 rounded-full bg-gradient-to-br from-primary via-accent to-secondary text-white shadow-xl hover:shadow-2xl flex items-center justify-center group relative overflow-hidden ${
          isOpen ? "rotate-0" : ""
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          rotate: isOpen ? 180 : 0,
        }}
        transition={{ duration: 0.3 }}
        style={{
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15), 0 4px 8px rgba(0, 0, 0, 0.1)"
        }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ opacity: 0, rotate: -180 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 180 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="message"
              initial={{ opacity: 0, rotate: 180 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: -180 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              <MessageCircle className="w-6 h-6" />
              {/* Notification Dot */}
              <motion.div
                className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [1, 0.7, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Floating Animation Ring */}
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/30 via-accent/20 to-secondary/30 -z-10"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.4, 0.1, 0.4]
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Secondary Animation Ring */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-primary/20 -z-10"
        animate={{
          scale: [1, 1.3],
          opacity: [0.3, 0]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeOut"
        }}
      />
    </div>
  );
}
