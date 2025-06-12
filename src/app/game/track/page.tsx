'use client';

import { GameBar } from "@/components/game/GameBar";
import React, { useState, useEffect } from 'react';
import MapWithPlayers from "@/components/game/RaceTrack";
import { trackPath3 } from "@/data/map";
import TiltCard from "@/components/game/TiltCard";


export default function Page() {
  return (
    <div className="h-dvh w-screen flex flex-col overflow-hidden bg-gray-300 select-none">
      {/* Zone principale centrée */}
      <div className="h-[90%] w-full p-2 overflow-hidden flex justify-center items-center">
      <TiltCard
        imageUrl={"/images/cards/car/911_GT3_RS.png"}
        />
      <TiltCard
        imageUrl={"/images/cards/car/911_GT3_RS.png"}
        />
      <TiltCard
        imageUrl={"/images/cards/car/911_GT3_RS.png"}
        />
    
      </div>
      {/* Barre de navigation en bas */}
      <div className="h-[10%] w-[90%] max-w-md mx-auto mb-4">
        <GameBar />
      </div>
    </div>
  );
}
