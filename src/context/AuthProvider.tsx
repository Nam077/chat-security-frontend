import { ReactNode, useState } from "react";
import { AuthContext } from "./AuthContext";
import { generateRSAKeys } from "../utils/generateKeyPair";

const sendPublicKey = async (publicKey: string, accessToken: string) => {
    try {
        await fetch(import.meta.env.VITE_HOST+ '/users/public-key', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ publicKey }),
        });
    } catch (error) {
        console.error('Failed to send public key', error);
    }
}

const getProfile = async (accessToken: string) => {
    try {
        const response = await fetch(import.meta.env.VITE_HOST+  '/auth/me', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Failed to fetch profile', error);
    }
}
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
        Boolean(localStorage.getItem('accessToken'))
    );

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const login = async (token: string) => {
        localStorage.setItem('accessToken', token);
        const { publicKeyPem, privateKeyPem } = generateRSAKeys()
        localStorage.setItem('publicKey', publicKeyPem);
        localStorage.setItem('privateKey', privateKeyPem);
        await sendPublicKey(publicKeyPem, token);
        
        await setUser();
        setIsAuthenticated(true);
    };

    const setUser = async () => {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
            const profile = await getProfile(accessToken);
            localStorage.setItem('user', JSON.stringify(profile));
        }
    }

    const logout = () => {
        localStorage.removeItem('accessToken');
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout , setUser, user }}>
            {children}
        </AuthContext.Provider>
    );
};
