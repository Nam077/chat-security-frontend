/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useSocket } from '../hooks/useSocket';
import { useAuth } from '../context/useAuth';
import axios from 'axios';
import { decryptWithAES, decryptWithRSA, encryptWithAES } from '../utils/generateKeyPair';

interface Message {
    userId: number;
    content: string;
    timestamp: string;
}

const getDecryptedAESKey = async (senderId: number): Promise<any | null> => {
    try {
        const response = await axios.get(import.meta.env.VITE_HOST+ `/rooms/get-room-by-user/${senderId}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
        });


        if (response.data) {
            const roomId = response.data.id;

            const responseKey = await axios.get(import.meta.env.VITE_HOST+ `/rooms/get-eas-key/${roomId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                },
            });

            const encryptedKey = responseKey.data;
            const privateKey = localStorage.getItem('privateKey') || '';
            
            if (encryptedKey && privateKey) {
                // Giải mã khóa AES sử dụng khóa RSA riêng
                return {
                    roomId,
                    aesKey: decryptWithRSA(encryptedKey, privateKey),
                }
            }
        }
    } catch (error) {
        console.error('Lỗi khi lấy và giải mã khóa AES:', error);
    }
    return null;
};


const getMessagesByRoom = async (roomId: number, aesKey: string): Promise<Message[]> => {
    try {
        const response = await axios.get(import.meta.env.VITE_HOST+ `/messages/room/${roomId}?page=1&limit=10`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
        });
        return response.data.map((msg: any) => {
            msg.content = decryptWithAES(msg.content, aesKey);
            msg.userId = parseInt(msg.user.id);
            return msg;
        })
    } catch (error) {
        console.error('Lỗi khi lấy tin nhắn:', error);
        return [];
    }
}


const Chat = ({ userReceiveId }: { userReceiveId: number }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [message, setMessage] = useState<string>('');
    const { user } = useAuth();
    const [idRoom, setIdRoom] = useState<number | null>(null);
    const [aesKey, setAesKey] = useState<string | null>(null);
    const { sendMessage, receiveMessage, socket } = useSocket(user?.id || 0);

    useEffect(() => {
        setMessages([]);
    }, [userReceiveId]);
        
    useEffect(() => {
        const fetchData = async () => {
            const key = await getDecryptedAESKey(userReceiveId);
            setAesKey(key?.aesKey || null);
            if (key?.roomId && key.aesKey) {
                setIdRoom(key.roomId);
                const messages = await getMessagesByRoom(key.roomId, key.aesKey);
                setMessages(messages);
            }
        };
        fetchData();
    }, [userReceiveId]);

    useEffect(() => {
        const handleNewMessage = (newMessage: Message) => {
            if (aesKey) {
                newMessage.content = decryptWithAES(newMessage.content, aesKey);
            }
            setMessages((prevMessages) => [...prevMessages, newMessage]);
        };

        if (socket) {
            socket.on('message', handleNewMessage);

            return () => {
                socket.off('message', handleNewMessage);
            };
        }
    }, [aesKey, socket]);

    const handleSendMessage = () => {
        if (message && aesKey) {
            const messageEncrypted = encryptWithAES(message, aesKey);
            sendMessage(messageEncrypted, 'roomId123', 'single', userReceiveId);
            setMessage('');
        } else {
            console.warn('Không thể gửi tin nhắn: AES key chưa được thiết lập');
        }
    };

    return (
        <div className="flex flex-col h-full p-4 space-y-4 bg-gray-50">
            <p className="text-lg font-semibold">
                {aesKey && <span className="text-sm text-gray-600"> (Key: {aesKey.substring(0, 20)}...)</span>}
            </p>
            <div className="flex-1 overflow-y-auto space-y-4 bg-white p-4 rounded-lg shadow">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`flex items-start mb-2 ${msg.userId === user?.id ? 'justify-end' : 'justify-start'
                            }`}
                    >
                        <div
                            className={`max-w-xs md:max-w-sm lg:max-w-md p-3 rounded-lg shadow-lg ${msg.userId === user?.id ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'
                                }`}
                        >
                            <span>{msg.content}</span>
                            <div className="text-xs text-gray-500 mt-1 text-right">
                                {new Date(msg.timestamp).toLocaleString()}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex items-center space-x-2">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="border p-2 flex-1 rounded-lg focus:outline-none focus:ring focus:border-blue-300"
                    placeholder="Nhập tin nhắn"
                />
                <button
                    onClick={handleSendMessage}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
                    disabled={!aesKey}
                >
                    Gửi
                </button>
            </div>
        </div>
    );
};

export default Chat;