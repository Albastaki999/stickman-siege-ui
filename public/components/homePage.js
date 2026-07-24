"use client";
import { useRouter } from "next/navigation";
import React from "react";
import { useGame } from "../hooks/useGame";

const HomePage = () => {
  const router = useRouter();
  const { player, setPlayer } = useGame();

  const onBattle = () => {
    router.push("/modemenu");
  };

  return (
    <div className="w-full h-full flex justify-between items-center">
      <div className="flex flex-col gap-2">
        <div>
          <input
            type="text"
            value={player}
            onChange={(e) => {
              setPlayer(e.target.value);
            }}
          />
        </div>
        <div onClick={() => onBattle()}>Battle</div>
        <div>Join a room</div>
        <div>Create a room</div>
      </div>
    </div>
  );
};

export default HomePage;
