import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { ApiError, authApi } from "../services/api";

type AuthContextValue = { loading: boolean; authenticated: boolean; username: string | null; login: (username: string, password: string) => Promise<void>; logout: () => Promise<void>; refresh: () => Promise<void>; };
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true); const [authenticated, setAuthenticated] = useState(false); const [username, setUsername] = useState<string | null>(null);
  const refresh = async () => { try { const state = await authApi.me(); setAuthenticated(state.authenticated); setUsername(state.username); } catch { setAuthenticated(false); setUsername(null); } finally { setLoading(false); } };
  useEffect(() => {
    void refresh();
    const clearSession = () => { setAuthenticated(false); setUsername(null); setLoading(false); };
    window.addEventListener("scheduling:unauthorized", clearSession);
    return () => window.removeEventListener("scheduling:unauthorized", clearSession);
  }, []);
  const value = useMemo<AuthContextValue>(() => ({ loading, authenticated, username, refresh,
    login: async (nextUsername, password) => { const state = await authApi.login(nextUsername, password); setAuthenticated(state.authenticated); setUsername(state.username); },
    logout: async () => { try { await authApi.logout(); } catch (error) { if (!(error instanceof ApiError) || error.status !== 401) throw error; } setAuthenticated(false); setUsername(null); },
  }), [loading, authenticated, username]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() { const context = useContext(AuthContext); if (!context) throw new Error("useAuth precisa estar dentro de AuthProvider"); return context; }
