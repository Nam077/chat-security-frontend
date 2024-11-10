import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth(); // Lấy trạng thái đăng nhập từ AuthContext
  const location = useLocation();

  // Nếu người dùng đã đăng nhập và đang cố gắng truy cập vào trang login, chuyển hướng đến trang dashboard
  if (isAuthenticated && location.pathname === '/login') {
    return <Navigate to="/chat" replace />;
  }

  // Nếu chưa đăng nhập, chuyển hướng đến trang login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>; // Nếu đã đăng nhập, hiển thị nội dung con
};

export default PrivateRoute;
