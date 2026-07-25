'use client'
import React, { useReducer } from 'react'
import { useGame } from '../hooks/useGame'
import { useRouter } from 'next/navigation';

const Battle = () => {
  const { battleStatus, battleRoom, rollDice, player } = useGame();
  const router = useRouter();

  if (!battleRoom && battleStatus != "SEARCHING") {
    router.push("/");
  }

  return (
    <div>
      {
        battleStatus == "SEARCHING" && <div>Searching...</div>
      }
      {
        battleStatus == "STARTED" &&
        <div className='flex flex-col gap-2'>
          <div className='flex flex-col gap-4'>
            {
              battleRoom?.players?.map((player, idx) => (
                <div key={player} className={`border p-4 flex gap-2 ${battleRoom?.turn == idx && 'border-red-500'} `}>
                  <div>
                    Player: {player}
                  </div>
                  <div className='flex gap-1'>
                    <div className='flex gap-1'>
                      {battleRoom.armies?.[player]?.map((number, idx) => (
                        <div key={idx} className='border p-2'>
                          <div>
                            {idx + 1}
                          </div>
                          <div>
                            Stickmen: x{number?.stickmen}
                          </div>
                          <div>
                            Level: {number?.level}
                          </div>
                          <div>
                            Status: {number?.status}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            }
          </div>
          <div>
            Dice: {battleRoom?.dice}
            <div>
              You: {player}
            </div>
            <div className='border p-2 cursor-pointer w-fit' onClick={rollDice}>
              Roll Dice
            </div>
          </div>
        </div>
      }
    </div>
  )
}

export default Battle
