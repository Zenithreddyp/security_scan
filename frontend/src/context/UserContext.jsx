import React, { createContext, useState, useEffect, useContext } from "react";

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

// Decode JWT payload without external library
function decodeJwtPayload(token) {
    try {
        const base64Payload = token.split(".")[1];
        const decoded = JSON.parse(atob(base64Payload));
        return decoded;
    } catch {
        return null;
    }
}

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            // Decode JWT to extract userId so SocketContext can register the connection
            const payload = decodeJwtPayload(token);
            const userId = payload?.userId || null;
            setUser((prev) => {
                // If we already have a full user object (from login/register), keep it but ensure userId
                if (prev && prev.id) return { ...prev, userId: prev.id };
                // Fallback: build a minimal user from the token
                return { token, userId };
            });
        } else {
            setUser(null);
        }
        setLoading(false);
    }, [token]);

    const login = async (email, password) => {
        try {
            const resp = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email, password }),
            });
            const data = await resp.json();
            if (resp.ok && data.accessToken) {
                setToken(data.accessToken);
                // Ensure user object always has a userId field for socket registration
                setUser({ ...data.user, userId: data.user.id });
                return true;
            }
            return false;
        } catch (err) {
            console.error("Login error:", err);
            return false;
        }
    };

    const register = async (name, email, password) => {
        try {
            const resp = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ full_name: name, email, password }),
            });
            const data = await resp.json();
            // Backend returns `accessToken` on registration (not `token`)
            if (resp.ok && data.accessToken) {
                setToken(data.accessToken);
                setUser({ ...data.user, userId: data.user.id });
                return true;
            }
            return false;
        } catch (err) {
            console.error("Register error:", err);
            return false;
        }
    };

    const logout = async () => {
        await fetch(`${import.meta.env.VITE_API_URL}/api/auth/logout`, {
            method: "POST",
            credentials: "include",
        });

        setToken(null);
        setUser(null);
    };

    return (
        <UserContext.Provider value={{ user, token, loading, login, register, logout }}>
            {!loading && children}
        </UserContext.Provider>
    );
};
