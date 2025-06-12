import Image from 'next/image';
import { useState, useEffect } from 'react';

type Card = {
  imageUrl: string;
  alt: string;
};

export default function CardCarousel({ cards, onCardClick }: {
  cards: Card[];
  onCardClick: (alt: string) => void;
}) {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true); // true = visible

  const next = () => {
    setFade(false); // début du fade out
    setTimeout(() => {
      setIndex((index + 1) % cards.length);
      setFade(true); // fade in après changement
    }, 300);
  };

  const prev = () => {
    setFade(false);
    setTimeout(() => {
      setIndex((index - 1 + cards.length) % cards.length);
      setFade(true);
    }, 300);
  };

  return (
    <div style={{ position: 'relative', width: '220px', textAlign: 'center' }}>
      <button onClick={prev} style={{ position: 'absolute', left: -50, top: '45%', fontWeight: 'bold', fontSize: '24px', cursor: 'pointer', color: 'black' }}>&#8592;</button>


      <div style={{ opacity: fade ? 1 : 0, transition: 'opacity 300ms ease-in-out', cursor: 'pointer', display: 'inline-block' }} onClick={() => onCardClick(cards[index].alt)}>
        <Image
          src={cards[index].imageUrl}
          alt={cards[index].alt}
          width={200}
          height={300}
          style={{ objectFit: 'contain', borderRadius: '12px' }}
        />
      </div>

      <button onClick={next} style={{ position: 'absolute', right: -50, top: '45%', fontWeight: 'bold', fontSize: '24px', cursor: 'pointer', color: 'black' }}>&#8594;</button>
    </div>
  );
}
