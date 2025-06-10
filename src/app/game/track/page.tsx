'use client';

import { GameBar } from "@/components/game/GameBar";
import React, { useState, useEffect } from 'react';
import MapWithPlayers from "@/components/game/RaceTrack";
import { trackPath3 } from "@/data/map";


export default function Page() {
  return (
    <div className="h-dvh w-screen flex flex-col overflow-hidden bg-gray-300 select-none">
      {/* Zone principale centrée */}
      <div className="h-[90%] w-full p-2 overflow-hidden flex justify-center items-center">
        <MapWithPlayers 
            svgPath={trackPath3.svg}
            mT={trackPath3.len}
            turns={trackPath3.turns}
        />
    
    </div>
      {/* Barre de navigation en bas */}
      <div className="h-[10%] w-[90%] max-w-md mx-auto mb-4">
        <GameBar />
      </div>
    </div>
  );
}
