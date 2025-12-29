import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import CTAButton from './CTAButton';
import { useState, useEffect } from "react";

interface HeroSectionProps {
  onCTAClick: (action: string) => void;
}

const pelucheImages = [
  "/assets/images/61KUrjx-ybL._SX679_.jpg",
  "/assets/images/App_e4aa52bf-2cb2-4092-a58f-e289f745e745a0ef.png",
  "/assets/images/Kids in Balloon.png",
  // Agrega aquí más imágenes de peluches si tienes
];

export function HeroSection({ onCTAClick }: HeroSectionProps) {
  const { t } = useTranslation("common");
  const [bgIndex, setBgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % pelucheImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="h-[95vh] hero-gradient relative overflow-hidden flex items-center" aria-label="Hero section">
      {/* Fondo de carrusel de imágenes de peluches */}
      <div className="absolute inset-0 z-0 transition-all duration-700">
        {pelucheImages.map((img, i) => (
          <img
            key={img}
            src={img}
            alt="Peluche Nebu"
            className={`object-cover w-full h-full absolute inset-0 transition-opacity duration-700 ${i === bgIndex ? 'opacity-100' : 'opacity-0'}`}
            style={{ filter: 'brightness(0.7) blur(2px)' }}
            draggable={false}
          />
        ))}
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 z-10"></div>
      {/* ...existing code... */}
    </section>
  );
}
