'use client'
import React from 'react'
import { useGame } from '../hooks/useGame'
import { useRouter } from 'next/navigation';

const Battle = () => {
  const { battleStatus, battleRoom, rollDice, player, attackNumber } = useGame();
  const router = useRouter();
  const players = battleRoom?.players;
  const armies = battleRoom?.armies;
  const turn = battleRoom?.turn;
  const dice = battleRoom?.dice;
  const canAttack = battleRoom?.players?.[turn]?.canAttack;

  const canRoll = (players?.[turn].playerId == player) && !canAttack;

  const onRollDice = () => {
    if (!canRoll) return;

    rollDice();
  }

  const isNumberAttackable = (number, playerId) => number?.status == "ACTIVE" && playerId != player && canAttack && battleRoom?.players?.[turn].playerId == player;

  const onAttackNumber = (number, playerId, idx) => {
    if (isNumberAttackable(number, playerId)) {
      attackNumber(idx, playerId);
    }
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
              players?.map((p, idx) => (
                <div key={p.playerId} className={`border p-4 flex gap-2 ${turn == idx && 'border-red-500'} `}>
                  <div>
                    Player: {p.playerId}
                  </div>
                  <div className='flex gap-1'>
                    <div className='flex gap-1'>
                      {armies?.[p.playerId]?.map((number, idx) => (
                        <div key={idx} className={`border p-2 ${isNumberAttackable(number, p?.playerId) && "hover:border-red-500"} duration-75 cursor-pointer`} onClick={() => onAttackNumber(number, p.playerId, idx)}>
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
            Dice: {dice}
            <div>
              You: {player}
            </div>
            <div className='border p-2 cursor-pointer w-fit' onClick={onRollDice}>
              Roll Dice
            </div>
          </div>
        </div>
      }
    </div>
  )
}

export default Battle
