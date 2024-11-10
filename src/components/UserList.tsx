import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/useAuth';

interface User {
    id: number;
    username: string;
}

interface UserListProps {
    onSelectUser: (userId: number) => void;
}

const UserList: React.FC<UserListProps> = ({ onSelectUser }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const { user } = useAuth();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get(import.meta.env.VITE_HOST + '/users', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                    },
                });
                if (user) {
                    setUsers(response.data.filter((u: User) => u.id !== user.id));
                }
            } catch (error) {
                console.error('Lỗi khi fetch người dùng:', error);
            }
        };
        fetchUsers();
    }, []);

    const handleSelectUser = (userId: number) => {
        setSelectedUserId(userId);
        onSelectUser(userId);
    };

    return (
        <div className="p-4 bg-gray-50 border-r border-gray-200 overflow-y-auto h-full space-y-4">
            {user && (
                <div className="mb-4 p-2 bg-blue-100 rounded-lg">
                    <p className="text-lg font-semibold">Người dùng hiện tại: {user.username}</p>
                </div>
            )}
            <h2 className="text-xl font-bold mb-4">Danh sách người dùng</h2>
            {users.map((user) => (
                <button
                    key={user.id}
                    onClick={() => handleSelectUser(user.id)}
                    className={`w-full text-left p-2 mb-2 rounded-lg shadow-md transition-colors duration-200 ${
                        user.id === selectedUserId ? 'bg-blue-500 text-white' : 'bg-white text-black'
                    } hover:bg-gray-200`}
                >
                    {user.username}
                </button>
            ))}
        </div>
    );
};

export default UserList;
