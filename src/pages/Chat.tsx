import { useState } from 'react';
import UserList from '../components/UserList';
import Chat from '../components/Chat';

export const ChatPage = () => {
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

    return (
        <div className="flex flex-col md:flex-row h-screen">
            {/* Danh sách người dùng ở bên trái */}
            <div className="w-full md:w-1/3 border-r border-gray-300">
                <UserList onSelectUser={setSelectedUserId} />
            </div>

            {/* Khu vực chat ở bên phải */}
            <div className="w-full md:w-2/3 flex-grow">
                {selectedUserId && (
                    <Chat userReceiveId={selectedUserId} />
                )}
            </div>
        </div>
    );
};
