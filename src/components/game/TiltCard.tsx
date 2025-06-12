'use client';
import React, { useRef } from 'react';

export default function Tilt3DCard({ imageUrl }: { imageUrl: string }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const handleTilt = (x: number, y: number, rect: DOMRect) => {
    const card = cardRef.current;
    const glow = glowRef.current;
    if (!card || !glow) return;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = -((y - centerY) / centerY) * 10;
    const rotateY = ((x - centerX) / centerX) * 10;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    glow.style.opacity = '1';
    glow.style.backgroundImage = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.3), transparent)`;
  };

  const resetTilt = () => {
    const card = cardRef.current;
    const glow = glowRef.current;
    if (!card || !glow) return;

    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
    glow.style.opacity = '0';
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = cardRef.current!.getBoundingClientRect();
    handleTilt(e.clientX - rect.left, e.clientY - rect.top, rect);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const rect = cardRef.current!.getBoundingClientRect();
    const touch = e.touches[0];
    handleTilt(touch.clientX - rect.left, touch.clientY - rect.top, rect);
  };

  return (
    <div className="flex justify-center items-center w-full">
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={resetTilt}
        onTouchMove={handleTouchMove}
        onTouchEnd={resetTilt}
        className="relative w-full max-w-[300px] aspect-[931/1300] rounded-2xl overflow-hidden shadow-2xl transition-transform duration-200 ease-out cursor-pointer"
      >
        <img
          src={imageUrl}
          alt="Carte"
          className="w-full h-full object-cover pointer-events-none"
        />
        <div
          ref={glowRef}
          className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 transition-opacity duration-300"
        />
      </div>
    </div>
  );
}
