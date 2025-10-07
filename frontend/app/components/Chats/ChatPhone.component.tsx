import type React from "react";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ChartNoAxesCombined, Send } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useFeatureFlags } from '@/lib/features';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  loading?: boolean;
}

interface PhoneChatProps {
  inputRefExternal?: React.RefObject<HTMLInputElement>;
}

export const PhoneChat = ({ inputRefExternal }: PhoneChatProps) => {
  const features = useFeatureFlags();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: crypto.randomUUID(),
      text: "¡Hola! Soy tu asistente de IA. ¿En qué puedo ayudarte hoy?",
      isUser: false,
      loading: false,
    },
  ]);
  const { t } = useTranslation();

  const [inputValue, setInputValue] = useState("");
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const defaultInputRef = useRef<HTMLInputElement>(null);
  const inputRef = inputRefExternal || defaultInputRef;

  const [nyTime, setNyTime] = useState("");

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "America/New_York",
      };
      const timeString = new Intl.DateTimeFormat("en-US", options).format(now);
      setNyTime(timeString);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Don't render chat if feature is disabled
  if (!features.chat) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400">
            Chat Feature Disabled
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Chat functionality is currently disabled in the system configuration.
          </p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userId = crypto.randomUUID();
    const newUserMessage: Message = {
      id: userId,
      text: inputValue,
      isUser: true,
      loading: false,
    };

    const botId = crypto.randomUUID();
    const placeholderBotMessage: Message = {
      id: botId,
      text: "",
      isUser: false,
      loading: true,
    };

    setMessages((prev) => [...prev, newUserMessage, placeholderBotMessage]);
    setInputValue("");

    // Simulate AI response for demo purposes
    setTimeout(() => {
      const responses = [
        "¡Excelente pregunta! Nuestro equipo de IA puede ayudarte con eso.",
        "Entiendo tu necesidad. Te puedo conectar con un especialista.",
        "Esa es una gran oportunidad para automatizar procesos.",
        "Perfecto, podemos desarrollar una solución personalizada para ti.",
      ];
      const randomResponse =
        responses[Math.floor(Math.random() * responses.length)];

      setMessages((prev) =>
        prev.map((m) =>
          m.id === botId ? { ...m, loading: false, text: randomResponse } : m
        )
      );
    }, 1500);
  };

  return (
    <main className="w-full flex items-center justify-center text-gray-600 dark:text-gray-300 leading-relaxed">
      <div className="w-full max-w-md">
        <motion.div
          className="relative mx-auto w-[250px] sm:w-[340px] h-[550px] sm:h-[680px] bg-[#1a1a1a] rounded-[40px] p-3 shadow-xl overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Otros elementos del marco omitidos para brevedad */}

          {/* Botones del marco */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            <div className="absolute right-[-2px] top-[120px] w-[4px] h-[60px] bg-[#2a2a2a] rounded-l-md" />
            <div className="absolute left-[-2px] top-[150px] w-[4px] h-[30px] bg-[#2a2a2a] rounded-r-md" />
            <div className="absolute left-[-2px] top-[200px] w-[4px] h-[60px] bg-[#2a2a2a] rounded-r-md" />
          </div>

          <div className="w-full h-full rounded-[32px] overflow-hidden bg-white flex flex-col relative">
            {/* Notch superior */}
            <div className="absolute top-0 left-0 w-full h-[30px] bg-white z-10">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[120px] h-[30px] bg-[#1a1a1a] rounded-b-[14px] flex justify-center items-center">
                <div className="w-[8px] h-[8px] bg-[#333] rounded-full mr-2" />
                <div className="w-[40px] h-[4px] bg-[#333] rounded-full" />
              </div>
            </div>

            {/* Barra de estado */}
            <div className="flex justify-between items-center px-6 pt-8 pb-2 bg-white z-0 text-xs text-gray-600">
              <div>{nyTime}</div>{" "}
              {/* Aquí ahora estará la hora dinámica de Nueva York */}
              <div className="flex space-x-2">
                <div>5G</div>
                <div>100%</div>
              </div>
            </div>

            {/* Cabecera del chat */}
            <div className="bg-white px-4 py-3 border-b border-gray-200 flex items-center">
              <div className="mr-3">
                <img src="/assets/icons/logo.png" alt="Logo" className="h-8 w-auto" />
              </div>
              <div>
                <h1 className="text-md font-medium text-gray-800">
                  Outliers Solutions
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-300">
                  {t("ai_agents.chat_phone_section.phone.chat_status")}
                </p>
              </div>
            </div>

            {/* Cabecera y barra de estado omitidas por brevedad */}

            <div
              ref={chatContainerRef}
              className="flex-1 p-4 overflow-y-auto bg-white space-y-4"
            >
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  className={`flex ${
                    message.isUser ? "justify-end" : "items-start"
                  }`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {!message.isUser && (
                    <div className="w-8 h-8 rounded-full text-white flex items-center justify-center mr-2 flex-shrink-0">
                      <img
                        src="/assets/icons/logo.png"
                        alt="Logo"
                        className="h-6 w-auto"
                      />
                    </div>
                  )}
                  {message.loading ? (
                    <div className="max-w-[80%] rounded-lg px-2 py-1 bg-white text-gray-800 border border-gray-200">
                      <div className="typing-indicator">
                        <span className="text-2xl animate-pulse">.</span>
                        <span className="text-2xl ml-0.5 animate-pulse delay-150">
                          .
                        </span>
                        <span className="text-2xl ml-0.5 animate-pulse delay-300">
                          .
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.isUser
                          ? "bg-gray-100"
                          : "bg-white border border-gray-200"
                      } text-gray-800`}
                    >
                      <p className="text-sm">{message.text}</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Input */}
            <div className="p-3 bg-white border-t border-gray-200">
              <form
                onSubmit={handleSubmit}
                className="flex flex-nowrap items-center"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={t(
                    "ai_agents.chat_phone_section.phone.placeholder_input"
                  )}
                  className="flex-grow bg-white text-gray-800 rounded-md border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f05252] focus:border-transparent"
                />
                <button
                  type="submit"
                  className="ml-2 bg-coral text-white rounded-md w-9 h-9 flex items-center justify-center"
                  disabled={!inputValue.trim()}
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>

            <div className="py-2 bg-white flex justify-center">
              <div className="w-32 h-1 bg-gray-300 rounded-full" />
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
};
