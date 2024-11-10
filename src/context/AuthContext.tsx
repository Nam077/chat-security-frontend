import { createContext, } from 'react';

export interface User {
    id: number;
    username: string;
}
// Định nghĩa kiểu cho context
interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    login: (token: string) => void;
    logout: () => void;
    setUser: (user: User) => void;
    
}

// Tạo context với giá trị mặc định là undefined
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider để cung cấp context
