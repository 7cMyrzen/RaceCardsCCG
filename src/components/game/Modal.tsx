'use client';

import { ReactNode, useEffect, useState , useRef } from 'react';




export function Modal({ isOpen, onClose, title }: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-sm text-center relative">
        <button onClick={onClose} className="absolute top-2 right-4 text-gray-500 text-xl font-bold">&times;</button>
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>
    </div>
  );
}

interface ModalProps {
  onClose: () => void;
  children: ReactNode;
}

export function Modal2({ onClose, children }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm custom-scroll">
      <div className="relative bg-white rounded-xl shadow-lg max-w-lg w-[90%] max-h-[90vh] overflow-y-auto p-6 custom-scroll">
        {/* Bouton de fermeture SVG */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-red-500"
          aria-label="Fermer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {children}
      </div>
    </div>
  );
}

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
};

export const NewDeckModal = ({ isOpen, onClose, onCreate }: Props) => {
  const [name, setName] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSubmit = () => {
    if (!name.trim()) return;
    onCreate(name.trim());
    setName("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-md relative"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-red-500"
          aria-label="Fermer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-lg text-gray-950 font-semibold mb-4">Créer un nouveau deck</h2>

        <input
          type="text"
          placeholder="Nom du deck"
          className="w-full text-gray-950 border border-gray-300 px-3 py-2 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-gray-800"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-gray-950 text-white rounded hover:bg-gray-800"
          >
            Créer
          </button>
        </div>
      </div>
    </div>
  );
};



import Tilt3DCard from './TiltCard';

interface CardData {
  id: string;
  imageUrl: string;
  cost: number;
}

interface CardModalCarouselProps {
  isOpen: boolean;
  onClose: () => void;
  cards: CardData[];
  onUseCard: (card: CardData) => void;
}

export default function CardModalCarousel({
  isOpen,
  onClose,
  cards,
  onUseCard,
}: CardModalCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!isOpen) return null;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? cards.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === cards.length - 1 ? 0 : prev + 1));
  };

  const currentCard = cards[currentIndex];

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center px-4">
      <div className="bg-gray-950 rounded-xl shadow-lg max-w-[90%] w-full max-h-[95%] p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-4 text-2xl font-bold text-gray-500 hover:text-black"
        >
          &times;
        </button>

        <div className="flex flex-col items-center gap-6">
          <Tilt3DCard imageUrl={currentCard.imageUrl} />

          <div className="flex gap-6 mt-4">
            <button
              onClick={handlePrev}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-600 text-gray-950"
            >
              ◀
            </button>
            <button
              onClick={handleNext}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-600 text-gray-950"
            >
              ▶
            </button>
          </div>

          <button
            onClick={() => onUseCard(currentCard)}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
          >
            Utiliser la carte (coût {currentCard.cost})
          </button>
        </div>
      </div>
    </div>
  );
}


interface AbilityData {
  id: string;
  imageUrl: string;
  cost: number;
  name: string;
  description: string;
}

interface AbilityModalCarouselProps {
  isOpen: boolean;
  onClose: () => void;
  abilities: AbilityData[]; // 1 ou 2 éléments max
  onUseAbility: (ability: AbilityData) => void;
}

export function AbilityModalCarousel({
  isOpen,
  onClose,
  abilities,
  onUseAbility,
}: AbilityModalCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!isOpen || abilities.length === 0) return null;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? abilities.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === abilities.length - 1 ? 0 : prev + 1));
  };

  const currentAbility = abilities[currentIndex];

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center px-4">
      <div className="bg-gray-950 rounded-xl shadow-lg max-w-[90%] w-full max-h-[95%] p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-4 text-2xl font-bold text-gray-500 hover:text-black"
        >
          &times;
        </button>

        <div className="flex flex-col items-center gap-4">
          <Tilt3DCard imageUrl={currentAbility.imageUrl} />

          <div className="text-center mt-2 px-4">
            <h2 className="text-lg font-bold">{currentAbility.name}</h2>
            <p className="text-sm text-gray-700">{currentAbility.description}</p>
          </div>

          {abilities.length > 1 && (
            <div className="flex gap-6 mt-3">
              <button
                onClick={handlePrev}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-600 text-gray-950"
              >
                ◀
              </button>
              <button
                onClick={handleNext}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-600 text-gray-950"
              >
                ▶
              </button>
            </div>
          )}

          <button
            onClick={() => onUseAbility(currentAbility)}
            className="mt-4 bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 transition"
          >
            Utiliser la capacité (coût {currentAbility.cost})
          </button>
        </div>
      </div>
    </div>
  );
}