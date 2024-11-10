import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

const Login = () => {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string>('');
    const { isAuthenticated, login } = useAuth(); // Lấy trạng thái đăng nhập từ AuthContext
    const navigate = useNavigate();

    // Nếu đã đăng nhập rồi, chuyển hướng ngay lập tức đến trang dashboard
    useEffect(() => {
       


        if (isAuthenticated) {
            navigate('/chat');
        }
    }, [isAuthenticated, navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(''); // Reset error trước khi gửi yêu cầu

        try {
            // Gửi yêu cầu login tới server
            const response = await axios.post(import.meta.env.VITE_HOST+ '/auth/login', {
                username,
                password,
            });

            // Lưu access token vào AuthContext và localStorage
            login(response.data.access_token);



            // Điều hướng tới trang dashboard
            navigate('/chat');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            // Xử lý lỗi nếu có
            if (error.response && error.response.data) {
                setError('Đăng nhập thất bại. ' + error.response.data.message);
            } else {
                setError('Đăng nhập thất bại. Vui lòng thử lại.');
            }
            console.log(import.meta.env.VITE_HOST);
            
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white shadow-lg rounded-lg">
                <h2 className="text-2xl font-bold text-center">Đăng Nhập</h2>
                {error && <p className="text-red-500 text-center">{error}</p>}
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label htmlFor="username" className="block text-sm font-semibold text-gray-700">Tên người dùng</label>
                        <input
                            type="text"
                            id="username"
                            className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Tên người dùng"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-semibold text-gray-700">Mật khẩu</label>
                        <input
                            type="password"
                            id="password"
                            className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Mật khẩu"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-2 mt-4 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none"
                    >
                        Đăng Nhập
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
