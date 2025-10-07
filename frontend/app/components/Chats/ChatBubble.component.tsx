import { motion } from "framer-motion";

interface ChatBubbleProps {
    message: string;
    position: "left" | "right";
    delay: number;
    className?: string;
    icon?: string;
    onClick?: () => void;
}

export const ChatBubble = ({
    message,
    position,
    delay,
    className,
    icon,
    onClick,
}: ChatBubbleProps) => {
    const isLeft = position === "left";

    return (
        <motion.div
            className={`${className} absolute z-10 hidden sm:hidden md:block lg:block xl:block`}
            initial={{ opacity: 0, y: 20, x: isLeft ? -20 : 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
            transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: delay * 0.2 + 0.5,
            }}
        >
            <div
                onClick={onClick}
                className={`relative scale-75 sm:scale-75 md:scale-100 lg:scale-100 xl:scale-100 max-w-[150px] sm:max-w-[150px] md:max-w-[190px] lg:max-w-[190px] xl:max-w-[190px] px-4 py-4 rounded-3xl bg-white/90 backdrop-blur-sm text-gray-900 border border-gray-100 shadow-md opacity-95 hover:scale-90 sm:hover:scale-90 md:hover:scale-105 lx:hover:scale-105 xl:hover:scale-105 hover:bg-gray-50 cursor-pointer transition-all duration-300 ease-in-out ${isLeft ? "rounded-br-md" : "rounded-bl-md"}`}
                style={{ animationDelay: `${delay * 0.2}s` }}
            >
                <span className="text-xs sm:text-xs md:text-sm lg:text-sm xl:text-sm font-medium leading-snug text-gray-700 flex items-center gap-2">
                    {icon && <span className="text-base">{icon}</span>}
                    {message}
                </span>
            </div>
        </motion.div>
    );
};

