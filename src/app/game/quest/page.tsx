import { GameBar } from "@/components/game/GameBar";

export default function Page() {
  return (
    <div className="h-dvh w-screen flex flex-col overflow-hidden bg-gray-300 select-none">
      {/* Zone principale centrée */}
      <div className="h-[90%] w-full p-2 overflow-hidden flex justify-center items-center">
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-4">Quêtes</h1>
        <p className="text-lg text-gray-700">Pas de quêtes pour le moment, revenez plus tard !</p>
      </div>
    </div>
      </div>

      {/* Barre de navigation en bas */}
      <div className="h-[10%] w-[90%] max-w-md mx-auto mb-4">
        <GameBar />
      </div>
    </div>
  );
}
