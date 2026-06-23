import React, { createContext, useContext, useEffect, useState } from "react";
import { wsService } from "../socket/websocket.service";
import { useAuth } from "./AuthContext";
import { WS_BASE_URL } from "../constants/config";

interface WebSocketContextValue {
    send: (data: any) => void;
    connected: boolean;
}

const WebSocketContext = createContext<WebSocketContextValue>({
    send: () => { },
    connected: false,
});

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [connected, setConnected] = useState(false);
    const { userId, token } = useAuth();

    useEffect(() => {
        if (userId && token) {
            const url = `${WS_BASE_URL}?role=user&userId=${userId}&token=${token}`;
            wsService.connect(url);

            wsService.on("system", (msg) => {
                if (msg.type === "connected") setConnected(true);
                if (msg.type === "disconnected") setConnected(false);
            });

            return () => wsService.close();
        }
    }, [userId, token]);

    return (
        <WebSocketContext.Provider value={{ send: wsService.send.bind(wsService), connected }}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => useContext(WebSocketContext);
