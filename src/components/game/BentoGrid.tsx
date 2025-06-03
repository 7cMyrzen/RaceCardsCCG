import React from "react";
import Image from "next/image";

export function BentoGridDemo2() {
  const commonClasses =
    "relative overflow-hidden rounded-xl shadow-md p-4 flex items-center justify-center text-center text-md font-medium transition-transform duration-200 ease-in-out hover:scale-[1.02] active:scale-95 cursor-pointer select-none";

  return (
    <div className="grid grid-cols-2 gap-4 h-full w-full p-2 transition-all duration-300 ease-in-out auto-rows-[minmax(100px,_auto)]">
      
      {/* Large Box 1 */}
      <div className="col-span-2 row-span-2 bg-white/70 backdrop-blur-sm rounded-xl shadow-lg p-6 flex items-center justify-center text-center transition-transform duration-200 ease-in-out hover:scale-[1.01] active:scale-95 cursor-pointer select-none relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/racebg.jpg"
            alt="Garage Background"
            fill
            className="object-cover blur-md scale-110"
          />
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center">
          <Image
            src="/images/race.png"
            alt="Garage"
            width={160}
            height={160}
            className="w-full h-[100px] sm:h-[140px] object-contain rounded-lg pointer-events-none"
          />
          <span className="text-white font-semibold text-lg mt-2">Lancer une course</span>
        </div>
      </div>

      {/* Mid Box 1 */}
      <div className={`${commonClasses} bg-white/70 backdrop-blur-sm`}>
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/questbg.jpg"
            alt="Background Blur"
            fill
            className="object-cover blur-md scale-110"
          />
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center">
          <Image
            src="/images/quest.png"
            alt="Demo"
            width={100}
            height={100}
            className="w-full h-[60px] sm:h-[80px] object-contain rounded-lg pointer-events-none"
          />
          <span className="text-white font-bold mt-2">Quêtes</span>
        </div>
      </div>

      {/* Mid Box 2 */}
      <div className={`${commonClasses} bg-white/70 backdrop-blur-sm`}>
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/shopbg.jpg"
            alt="Background Blur"
            fill
            className="object-cover blur-md scale-110"
          />
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center">
          <Image
            src="/images/shop.png"
            alt="Demo"
            width={100}
            height={100}
            className="w-full h-[60px] sm:h-[80px] object-contain rounded-lg pointer-events-none"
          />
          <span className="text-white font-bold mt-2">Boutique</span>
        </div>
      </div>

      {/* Large Box 2 */}
      <div className="col-span-2 row-span-2 bg-white/70 backdrop-blur-sm rounded-xl shadow-lg p-6 flex items-center justify-center text-center transition-transform duration-200 ease-in-out hover:scale-[1.01] active:scale-95 cursor-pointer select-none relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/deckbg.webp"
            alt="Garage Background"
            fill
            className="object-cover blur-md scale-110"
          />
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center">
          <Image
            src="/images/deck.png"
            alt="Garage"
            width={160}
            height={160}
            className="w-full h-[100px] sm:h-[140px] object-contain rounded-lg pointer-events-none"
          />
          <span className="text-white font-semibold text-lg mt-2">Mes Decks</span>
        </div>
      </div>
    </div>
  );
}
