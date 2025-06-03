import { GameBar } from "@/components/game/GameBar";
import { BentoGridDemo2 } from "@/components/game/BentoGrid";

export default function Page() {
  return (
    <div className="h-dvh w-screen flex flex-col overflow-hidden bg-gray-300 select-none">
      {/* Zone principale centrée */}
      <div className="h-[90%] w-full p-2 overflow-hidden flex justify-center items-center">
        <div className="scale-[0.9] sm:scale-100 origin-top h-full w-full max-w-4xl">
          <BentoGridDemo2 />
        </div>
      </div>

      {/* Barre de navigation en bas */}
      <div className="h-[10%] w-[90%] max-w-md mx-auto mb-4">
        <GameBar />
      </div>
    </div>
  );
}
