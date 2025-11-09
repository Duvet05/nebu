interface NebuImageProps {
  color?: string;
  className?: string;
}

export default function NebuImage({ className = "" }: NebuImageProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="w-full h-64 md:h-96 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center p-8">
        <img
          src="/models/nebu-dino/shaded_00.png"
          alt="Nebu Dino"
          className="w-full h-full object-contain drop-shadow-2xl"
        />
      </div>
    </div>
  );
}
