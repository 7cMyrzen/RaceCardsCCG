import React from "react";
import {
  IconHome,
  IconUser,
  IconDoorExit,
  IconHistory,
} from "@tabler/icons-react";

export function GameBar() {
  return (
    <div className="px-7 bg-white shadow-lg rounded-2xl">
      <div className="flex justify-center items-center">
        <div className="flex-1 group">
          <a
            href="/game"
            className="flex items-end justify-center text-center mx-auto px-4 pt-2 w-full text-gray-400 group-hover:text-indigo-500"
          >
            <span className="block px-1 pt-1 pb-1">
              <IconHome size={24} className="mx-auto mb-1 block" />
              <span className="block text-xs pb-2">Accueil</span>
              <span className="block w-5 mx-auto h-1 group-hover:bg-indigo-500 rounded-full"></span>
            </span>
          </a>
        </div>
        <div className="flex-1 group">
          <a
            href="/game/profile"
            className="flex items-end justify-center text-center mx-auto px-4 pt-2 w-full text-gray-400 group-hover:text-indigo-500"
          >
            <span className="block px-1 pt-1 pb-1">
              <IconUser size={24} className="mx-auto mb-1 block" />
              <span className="block text-xs pb-2">Profil</span>
              <span className="block w-5 mx-auto h-1 group-hover:bg-indigo-500 rounded-full"></span>
            </span>
          </a>
        </div>
        <div className="flex-1 group">
          <a
            href="/game/history"
            className="flex items-end justify-center text-center mx-auto px-4 pt-2 w-full text-gray-400 group-hover:text-indigo-500"
          >
            <span className="block px-1 pt-1 pb-1">
              <IconHistory size={24} className="mx-auto mb-1 block" />
              <span className="block text-xs pb-2">Historique</span>
              <span className="block w-5 mx-auto h-1 group-hover:bg-indigo-500 rounded-full"></span>
            </span>
          </a>
        </div>
        <div className="flex-1 group">
          <a
            href="/"
            className="flex items-end justify-center text-center mx-auto px-4 pt-2 w-full text-gray-400 group-hover:text-red-500"
          >
            <span className="block px-1 pt-1 pb-1">
              <IconDoorExit size={24} className="mx-auto mb-1 block" />
              <span className="block text-xs pb-2">Quitter</span>
              <span className="block w-5 mx-auto h-1 group-hover:bg-red-500 rounded-full"></span>
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}
