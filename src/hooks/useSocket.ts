import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

export function useSocket(url: string, onEvents?: any) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(url, { transports: ["websocket"] });
    socketRef.current = socket;

    // đăng ký các sự kiện từ server
    if (onEvents) {
      Object.entries(onEvents).forEach(([event, handler]) => {
        socket.on(event, handler);
      });
    }

    return () => {
      socket.disconnect();
    };
  }, [url]);

  return socketRef.current;
}
