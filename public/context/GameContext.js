"use client";

import React, { createContext, useEffect, useRef, useState } from "react";
import { SERVICE_URL } from "../constants/appConstants";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

export const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [connected, setConnected] = useState(false);
  const [battleRoom, setBattleRoom] = useState(null);
  const [battleStatus, setBattleStatus] = useState("SEARCHING");
  const [player, setPlayer] = useState(-1);
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
      },

      onStompError: () => setConnected(false),
      onWebSocketClose: () => setConnected(false),
    });

    client.activate();
    stompClient.current = client;
  };

  const subscribeToPlayer = () => {
    if (!stompClient.current) return;

    playerSubscriptionRef.current?.unsubscribe();

    playerSubscriptionRef.current = stompClient.current.subscribe(
      `/topic/player/${player}`,
      (message) => {
        const data = JSON.parse(message.body);
        if (data?.status) {
          setBattleStatus(data?.status);
        }
        if (data?.battleRoom) {
          setBattleRoom(data?.battleRoom);
        }
      }
    )
  }

  const battleRandom = () => {

    if (!player || !stompClient.current) return;

    publishMessage("/battle", { playerId: player, mode })
    subscribeToPlayer();
  };

  const publishMessage = (topic, body) => {
    stompClient.current.publish({
      destination: "/app" + topic,
      body: JSON.stringify(body),
    });
  }

  const rollDice = () => {
    if (!stompClient.current || !player || !battleRoom) return;

    publishMessage("/roll-dice", { playerId: player, roomId: battleRoom?.roomId });
  }

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
      rollDice
    },
    children,
  });
}
