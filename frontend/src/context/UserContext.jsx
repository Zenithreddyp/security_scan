import React, { createContext, useState, useEffect, useContext } from "react";

const UserContext = createContext();

export const useUser = () => useContext(UserContext);
const API_URL = import.meta.env.VITE_API_URL || "";

async function readJson(resp) {
    try {
        return await resp.json();
    } catch {
        return {};
    }
}

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        async function restoreSession() {
            try {
                const resp = await fetch(`${API_URL}/api/auth/refresh`, {
                    method: "POST",
                    credentials: "include",
                });
                const data = await readJson(resp);

                if (mounted && resp.ok && data.accessToken && data.user) {
                    setToken(data.accessToken);
                    setUser({ ...data.user, userId: data.user.id });
                }
            } catch (err) {
                console.error("Session restore error:", err);
            } finally {
                if (mounted) setLoading(false);
            }
        }

        restoreSession();

        return () => {
            mounted = false;
        };
    }, []);

    const login = async (email, password) => {
        try {
            const resp = await fetch(`${API_URL}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email, password }),
            });
            const data = await readJson(resp);
            if (resp.ok && data.accessToken) {
                setToken(data.accessToken);
                setUser({ ...data.user, userId: data.user.id });
                return { ok: true };
            }
            return { ok: false, message: data.message || "Unable to sign in" };
        } catch (err) {
            console.error("Login error:", err);
            return { ok: false, message: "Unable to reach the server" };
        }
    };

    const register = async (name, email, password) => {
        try {
            const resp = await fetch(`${API_URL}/api/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ full_name: name, email, password }),
            });
            const data = await readJson(resp);
            if (resp.ok && data.accessToken) {
                setToken(data.accessToken);
                setUser({ ...data.user, userId: data.user.id });
                return { ok: true };
            }
            return { ok: false, message: data.message || "Unable to create account" };
        } catch (err) {
            console.error("Register error:", err);
            return { ok: false, message: "Unable to reach the server" };
        }
    };

    const requestPasswordReset = async (email) => {
        try {
            const resp = await fetch(`${API_URL}/api/auth/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await readJson(resp);
            return {
                ok: resp.ok,
                message: data.message || "Unable to start password reset",
                resetToken: data.resetToken,
            };
        } catch (err) {
            console.error("Password reset request error:", err);
            return { ok: false, message: "Unable to reach the server" };
        }
    };

    const resetPassword = async (resetToken, password) => {
        try {
            const resp = await fetch(`${API_URL}/api/auth/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: resetToken, password }),
            });
            const data = await readJson(resp);
            return {
                ok: resp.ok,
                message: data.message || "Unable to reset password",
            };
        } catch (err) {
            console.error("Password reset error:", err);
            return { ok: false, message: "Unable to reach the server" };
        }
    };

    const logout = async () => {
        if (token) {
            await fetch(`${API_URL}/api/auth/logout`, {
                method: "POST",
                credentials: "include",
                headers: { Authorization: `Bearer ${token}` },
            });
        }

        setToken(null);
        setUser(null);
    };

    return (
        <UserContext.Provider value={{
            user,
            token,
            loading,
            login,
            register,
            requestPasswordReset,
            resetPassword,
            logout,
        }}>
            {!loading && children}
        </UserContext.Provider>
    );
};
