"use client";
import React from "react";
import { useGame } from "../hooks/useGame";
import { useRouter } from "next/navigation";

const BattleMenuPage = () => {
  const { battleRandom, setMode } = useGame();
  const router = useRouter();
  const playerModes = [
    {
      mode: "1v1",
    },
    {
      mode: "2v2",
    },
    {
      mode: "3v3",
    },
    {
      mode: "3",
    },
    {
      mode: "4",
    },
    {
      mode: "5",
    },
    {
      mode: "6",
    },
  ];

  const onPlayerModeSelect = (mode) => {
    switch (mode) {
      case "1v1":
        console.log("Battle random");
        setMode(mode);
        battleRandom();
        router.push('/battle');
        break;
      default:
        break;
    }
  };

  return (
    <div>
      <div>
        {playerModes.map((playerMode) => (
          <div
            key={playerMode.mode}
            onClick={() => {
              onPlayerModeSelect(playerMode.mode);
            }}
          >
            {playerMode.mode}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BattleMenuPage;
