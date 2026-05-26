"use client";

import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { SOCKET_EVENTS } from "@/sockets/events";
import type { Task } from "@/types/task";

interface SocketHandlers {
  onTaskCreated?: (payload: { task: Task }) => void;
  onTaskUpdated?: (payload: { task: Task }) => void;
  onTaskDeleted?: (payload: { id: string }) => void;
  onTasksReordered?: (payload: { tasks: Task[] }) => void;
}

export function useSocket(handlers: SocketHandlers) {
  const socketRef = useRef<Socket | null>(null);
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    const socket = io({
      path: "/api/socketio",
      addTrailingSlash: false,
    });

    socketRef.current = socket;

    socket.on(SOCKET_EVENTS.TASK_CREATED, (payload) => {
      handlersRef.current.onTaskCreated?.(payload);
    });

    socket.on(SOCKET_EVENTS.TASK_UPDATED, (payload) => {
      handlersRef.current.onTaskUpdated?.(payload);
    });

    socket.on(SOCKET_EVENTS.TASK_DELETED, (payload) => {
      handlersRef.current.onTaskDeleted?.(payload);
    });

    socket.on(SOCKET_EVENTS.TASKS_REORDERED, (payload) => {
      handlersRef.current.onTasksReordered?.(payload);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  return socketRef;
}
