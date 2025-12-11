import { useState } from 'react';

interface ProductImageProps {
  images: string[];
  name: string;
  slug: string;
  gradient?: string;
}

const emojiMap: Record<string, string> = {
  dino: '🦕',
  capibara: '🦦',
  gato: '🐱',
  conejo: '🐰',
  oso: '🐻',
  dragon: '🐉',
  star: '⭐',
  chaos: '🐱',
  kosmik: '👾',
  pup: '🐶',
  gruñon: '👹',
  arms: '🤗',
  kitty: '😺',
  bunny: '🐰',
  jester: '🤡',
  sawbite: '🪚',
};

function getEmojiForSlug(slug: string): string {
  for (const [key, emoji] of Object.entries(emojiMap)) {
    if (slug.includes(key)) {
      return emoji;
    }
  }
  return '🎁';
}

export function ProductImage({ images, name, slug, gradient = 'from-gray-200 to-gray-300' }: ProductImageProps) {
  const [imageError, setImageError] = useState(false);
  const hasImages = images && images.length > 0 && images[0];

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {hasImages && !imageError ? (
        // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
        <img
          src={images[0]}
          alt={name}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={() => setImageError(true)}
        />
      ) : (
        <>
          <div className={`w-48 h-48 rounded-full bg-gradient-to-br ${gradient} opacity-50`}></div>
          <div className="absolute text-6xl">{getEmojiForSlug(slug)}</div>
        </>
      )}
    </div>
  );
}
