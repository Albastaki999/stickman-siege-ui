"use client";

import React, { createContext, useEffect, useRef, useState } from "react";
import { SERVICE_URL } from "../constants/appConstants";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

export const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [connected, setConnected] = useState(false);
  const [battleRoom, setBattleRoom] = useState(null);
  const [battleStatus, setBattleStatus] = useState("NONE");
  const [player, setPlayer] = useState(1);
  const [mode, setMode] = useState("1v1");

  const stompClient = useRef(null);

  const playerSubscriptionRef = useRef(null);

  const wakeServer = async () => {
    try {
      await fetch(`${SERVICE_URL}/ping`);
    } catch (e) {
      console.log("Wake-up failed");
    }
  };

  const connect = () => {
    if (stompClient.current?.active) return;

    const socket = new SockJS(`${SERVICE_URL}/ws`);

    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        console.log("connected");
        setConnected(true);
        retrieveLocalStorage();
      },

      onStompError: () => setConnected(false),
      onWebSocketClose: () => setConnected(false),
    });

    client.activate();
    stompClient.current = client;
  };

  const subscribeToPlayer = (player) => {
    if (!stompClient.current) return;

    playerSubscriptionRef.current?.unsubscribe();

    playerSubscriptionRef.current = stompClient.current.subscribe(
      `/topic/player/${player}`,
      (message) => {
        const data = JSON.parse(message.body);
        if (data?.status) {
          setBattleStatus(data?.status);
          sessionStorage.setItem("battleStatus", data?.status);
        }
        if (data?.battleRoom) {
          setBattleRoom(data?.battleRoom);
          sessionStorage.setItem(
            "battleRoom",
            JSON.stringify(data?.battleRoom),
          );
        }
        sessionStorage.setItem("player", player);
        sessionStorage.setItem("mode", mode);
      },
    );
  };

  const retrieveLocalStorage = () => {
    setBattleRoom(JSON.parse(sessionStorage.getItem("battleRoom")));
    setBattleStatus(sessionStorage.getItem("battleStatus") ?? "SEARCHING");
    setPlayer(sessionStorage.getItem("player") ?? 1);
    setMode(sessionStorage.getItem("mode") ?? "1v1");

    subscribeToPlayer(sessionStorage.getItem("player") ?? 1);
  };

  const battleRandom = () => {
    if (!player || !stompClient.current) return;

    publishMessage("/battle", { playerId: player, mode });
    subscribeToPlayer(player);
  };

  const publishMessage = (topic, body) => {
    stompClient.current.publish({
      destination: "/app" + topic,
      body: JSON.stringify(body),
    });
  };

  const rollDice = () => {
    if (!stompClient.current || !player || !battleRoom) return;

    publishMessage("/roll-dice", {
      playerId: player,
      roomId: battleRoom?.roomId,
    });
  };

  const attackNumber = (attackedNumber, attackedPlayer) => {
    if (!stompClient.current || !player || !battleRoom) return;
    publishMessage("/attack-num", {
      attackedNumber,
      attackedPlayer,
      attackingNumber: battleRoom?.dice - 1,
      attackingPlayer: player,
      roomId: battleRoom?.roomId,
    });
  };

  useEffect(() => {
    const init = async () => {
      await wakeServer();
      setTimeout(connect, 2000);
    };

    init();

    return () => {
      if (stompClient.current) {
        stompClient.current.deactivate();
      }
    };
  }, []);

  return React.createElement(GameContext.Provider, {
    value: {
      connected,
      setConnected,
      battleRandom,
      player,
      setPlayer,
      setMode,
      battleRoom,
      battleStatus,
      rollDice,
      attackNumber,
    },
    children,
  });
}
