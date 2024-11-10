/* eslint-disable @typescript-eslint/no-explicit-any */
// src/hooks/useSocket.ts
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

// URL của WebSocket server (thay đổi tùy theo cấu hình của bạn)
const SOCKET_URL = import.meta.env.VITE_HOST

export const useSocket = (userId: number) => {
    const [socket, setSocket] = useState<Socket | null>(null);

    // Kết nối với WebSocket server khi component mount
    useEffect(() => {
        const socketConnection = io(SOCKET_URL, {
            query: { userId: String(userId) }, // Truyền userId qua query string
        });

        setSocket(socketConnection);

        // Cleanup khi component unmount
        return () => {
            socketConnection.disconnect();
        };
    }, [userId]);

    // Hàm gửi tin nhắn tới server
    const sendMessage = (content: string, roomId: string | number, type: 'single' | 'group', userReceiveId?: number) => {
        if (socket) {
            socket.emit('send_message', {
                userId,
                content,
                roomId,
                type,
                userReceiveId,
            });
        }
    };

    // Hàm lắng nghe tin nhắn từ server
    const receiveMessage = (callback: (message: any) => void) => {
        if (socket) {
            socket.on('message', callback);
        }
    };

    return { socket, sendMessage, receiveMessage };
};
