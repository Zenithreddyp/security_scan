import React, { createContext, useState, useEffect, useContext } from "react";

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            // Decode JWT token to get user info if needed, or simply assume logged in.
            // Usually, we'd verify the token with the backend.
            // For now, we'll just mock user info to prevent waiting for a `/me` endpoint
            setUser({ token });
        } else {
            setUser(null);
        }
        setLoading(false);
    }, [token]);

    const login = async (email, password) => {
        try {
            const resp = await fetch("http://localhost:5000/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email, password }),
            });
            const data = await resp.json();
            if (resp.ok && data.accessToken) {
                setToken(data.accessToken);
                setUser(data.user);
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
            const resp = await fetch("http://localhost:5000/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });
            const data = await resp.json();
            if (resp.ok && data.token) {
                setToken(data.token);
                return true;
            }
            return false;
        } catch (err) {
            console.error("Register error:", err);
            return false;
        }
    };

    const logout = async () => {
        await fetch("http://localhost:5000/api/auth/logout", {
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
