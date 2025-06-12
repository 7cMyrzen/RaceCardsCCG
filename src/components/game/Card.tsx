"use client";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type CardProps = {
  id: string;
  name: string;
  carNumber: number;
  upgradeNumber: number;
};

export function Card({ id, name, carNumber, upgradeNumber }: CardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/game/deck/${id}`);
  };

  return (
    <div className="max-w-md w-full group/card">
      <div
        onClick={handleClick}
        className={cn(
          "cursor-pointer overflow-hidden relative card h-96 rounded-md shadow-xl max-w-sm mx-auto backgroundImage flex flex-col justify-between p-4",
          "bg-[url(https://fr.gamewallpapers.com/img_script/mobile_dir/img.php?src=wallpaper_assetto_corsa_01.jpg&width=253&height=450&crop-to-fit&sharpen)] bg-cover"
        )}
      >
        <div className="absolute w-full h-full top-0 left-0 transition duration-300 group-hover/card:bg-black opacity-60"></div>
        <div className="flex flex-row items-center space-x-4 z-10">
          <div className="flex flex-col">
            <p className="text-sm text-gray-400">Deck ID: {id}</p>
          </div>
        </div>
        <div className="text content">
          <h1 className="font-bold text-xl md:text-2xl text-gray-50 relative z-10">
            {name}
          </h1>
          <p className="font-normal text-sm text-gray-50 relative z-10 my-4">
            Véhicule : {carNumber}
            <br />
            Amélioration : {upgradeNumber}
          </p>
        </div>
      </div>
    </div>
  );
}
