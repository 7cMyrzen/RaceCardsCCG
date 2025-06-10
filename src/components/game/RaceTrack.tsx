'use client'

import React, { useEffect, useRef, useState } from 'react'

interface Point {
    x: number
    y: number
}

interface Turn {
    type: string;
    m: string[]; // ["75-100", ...]
}

interface MapWithPlayersProps {
    svgPath: string // d : string du <path>
    mT: number // longueur totale du chemin en mètres
    turns: Turn[]
}


const MapWithPlayers: React.FC<MapWithPlayersProps> = ({ svgPath, mT, turns }) => {
    const pathRef = useRef<SVGPathElement | null>(null)
    const containerRef = useRef<HTMLDivElement | null>(null)

    const [player1Pos, setPlayer1Pos] = useState<Point>({ x: 0, y: 0 })
    const [player2Pos, setPlayer2Pos] = useState<Point>({ x: 0, y: 0 })
    const [actualStartPoint, setActualStartPoint] = useState<Point>({ x: 0, y: 0 })
    const [player1Distance, setPlayer1Distance] = useState<number>(0)
    const [player2Distance, setPlayer2Distance] = useState<number>(0)
    const [pathLength, setPathLength] = useState<number>(0)

    // ViewBox ajusté pour votre tracé spécifique
    const fixedViewBox = "0 0 500 500"

    // Fonction pour extraire le vrai point de départ du tracé SVG
    const extractStartPoint = (pathData: string): Point => {
        const moveMatch = pathData.match(/[Mm]\s*([+-]?\d*\.?\d+)[\s,]+([+-]?\d*\.?\d+)/)
        if (moveMatch) {
            return {
                x: parseFloat(moveMatch[1]),
                y: parseFloat(moveMatch[2])
            }
        }
        return { x: 0, y: 0 }
    }

    // Initialisation après montage du composant
    useEffect(() => {
        const initializePositions = () => {
            if (pathRef.current) {
                try {
                    const totalLength = pathRef.current.getTotalLength()
                    setPathLength(totalLength)

                    const realStartPoint = extractStartPoint(svgPath)
                    setActualStartPoint(realStartPoint)

                    // Positionner les joueurs au début du tracé
                    const startPoint = pathRef.current.getPointAtLength(0)
                    setPlayer1Pos({ x: startPoint.x, y: startPoint.y })
                    setPlayer2Pos({ x: startPoint.x, y: startPoint.y })

                    console.log("Path initialisé:", {
                        totalLength,
                        realStartPoint,
                        startPoint: { x: startPoint.x, y: startPoint.y }
                    })
                } catch (error) {
                    console.error("Erreur lors de l'initialisation:", error)
                }
            }
        }
        // Attendre que le SVG soit rendu
        const timer = setTimeout(initializePositions, 100)
        return () => clearTimeout(timer)
    }, [svgPath])

    const getPointAtDistance = (distance: number): Point => {
        if (!pathRef.current) return actualStartPoint
    
        try {
          const pathTotalLength = pathRef.current.getTotalLength()
          const clampedDistance = Math.min(Math.max(0, distance), pathTotalLength)
          const point = pathRef.current.getPointAtLength(clampedDistance)
          return { x: point.x, y: point.y }
        } catch (error) {
          console.error("Erreur lors du calcul du point:", error)
          return actualStartPoint
        }
      }

      const renderTurnSegments = () => {
        if (!pathRef.current || mT === 0) return null;
      
        const path = pathRef.current;
        const totalLength = path.getTotalLength();
      
        const segments: React.ReactElement[] = [];
      
        turns.forEach((turn, index) => {
          const color =
            turn.type === "PeuSerre"
              ? "yellow"
              : turn.type === "Serre"
              ? "orange"
              : "red";
      
          turn.m.forEach((range) => {
            const [startStr, endStr] = range.split("-");
            const startM = parseFloat(startStr);
            const endM = parseFloat(endStr);
      
            const startRatio = Math.max(0, Math.min(1, startM / mT));
            const endRatio = Math.max(0, Math.min(1, endM / mT));
      
            const startLength = startRatio * totalLength;
            const endLength = endRatio * totalLength;
      
            const segmentLength = endLength - startLength;
      
            const id = `segment-${index}-${range}`;
      
            if (!isNaN(startLength) && !isNaN(endLength)) {
              segments.push(
                <path
                  key={id}
                  d={svgPath} // Le chemin complet, mais masqué sauf le segment
                  stroke={color}
                  strokeWidth="10"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray={`${segmentLength} ${totalLength}`}
                  strokeDashoffset={-startLength}
                />
              );
            }
          });
        });
      
        return segments;
      };

      return (
        <div className="flex flex-col justify-center items-center h-full bg-gray-900 relative">
      {/* Conteneur SVG */}
      <div 
        ref={containerRef}
        className="w-full h-full flex justify-center items-center p-4"
      >
        <svg 
          viewBox={fixedViewBox}
          className="w-full h-full max-w-full max-h-full border border-gray-600 bg-gray-800"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Grille de référence */}
          <defs>
            <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
              <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#374151" strokeWidth="1" opacity="0.3"/>
            </pattern>
          </defs>
          <rect x="0" y="0" width="1600" height="2200" fill="url(#grid)" />

          {/* Chemin principal */}
          <path
            d={svgPath}
            stroke="#10b981"
            strokeWidth="6"
            fill="none"
            ref={pathRef}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

        {renderTurnSegments()}

          {/* Point de départ du tracé SVG (vert) */}
          <circle
            cx={actualStartPoint.x}
            cy={actualStartPoint.y}
            r="16"
            fill="#ffffff"
            stroke="white"
            strokeWidth="2"
          />

          {/* Joueur 1 (rouge) */}
          <circle
            cx={player1Pos.x}
            cy={player1Pos.y}
            r="15"
            fill="#ef4444"
            stroke="white"
            strokeWidth="3"
          />
          <text
            x={player1Pos.x}
            y={player1Pos.y - 25}
            fill="white"
            fontSize="14"
            textAnchor="middle"
            className="font-bold"
          >
            J1
          </text>

          {/* Joueur 2 (bleu) */}
          <circle
            cx={player2Pos.x}
            cy={player2Pos.y}
            r="15"
            fill="#3b82f6"
            stroke="white"
            strokeWidth="3"
          />
          <text
            x={player2Pos.x}
            y={player2Pos.y + 35}
            fill="white"
            fontSize="14"
            textAnchor="middle"
            className="font-bold"
          >
            J2
          </text>
        </svg>
      </div>
    </div>
  );
}

export default MapWithPlayers;