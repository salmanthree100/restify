"use client";

import {
   createContext,
   useContext,
   useState,
   useEffect,
   ReactNode,
   useCallback,
} from "react";
import Cookies from "js-cookie";

export interface UserRole {
   id: number;
   name: string;
   description?: string;
   type?: string;
}

export interface User {
   id: number;
   username: string;
   email: string;
   phoneNumber?: string;
   role?: UserRole | Record<string, unknown>;
}

interface AuthContextType {
   user: User | null;
   token: string | null;
   loading: boolean;
   login: (token: string, user: User) => void;
   logout: () => void;
   refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
   const [user, setUser] = useState<User | null>(null);
   const [token, setToken] = useState<string | null>(null);
   const [loading, setLoading] = useState<boolean>(true);

   // 1. Declare logout first using useCallback so it can safely be referenced inside fetchCurrentUser
   const logout = useCallback(() => {
      localStorage.removeItem("token");
      Cookies.remove("token");

      setToken(null);
      setUser(null);
   }, []);

   // 2. Fetch user function using useCallback
   const fetchCurrentUser = useCallback(
      async (jwt: string) => {
         try {
            const res = await fetch(
               `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/users/me?populate=*`,
               {
                  headers: {
                     Authorization: `Bearer ${jwt}`,
                  },
               },
            );

            if (res.ok) {
               const userData: User = await res.json();
               setUser(userData);
            } else {
               // Token invalid or expired
               logout();
            }
         } catch (error) {
            console.error("Failed to fetch current user:", error);
            logout();
         } finally {
            setLoading(false);
         }
      },
      [logout],
   );

   // 3. Login handler
   const login = useCallback((newToken: string, newUser: User) => {
      localStorage.setItem("token", newToken);
      Cookies.set("token", newToken, {
         expires: 30,
         secure: true,
         sameSite: "strict",
      });

      setToken(newToken);
      setUser(newUser);
   }, []);

   // Initialize Auth State
   useEffect(() => {
      let isMounted = true;

      const initAuth = async () => {
         const savedToken =
            localStorage.getItem("token") || Cookies.get("token");

         if (savedToken) {
            setToken(savedToken);
            await fetchCurrentUser(savedToken);
         } else if (isMounted) {
            setLoading(false);
         }
      };

      initAuth();

      return () => {
         isMounted = false;
      };
   }, [fetchCurrentUser]);

   // In AuthContext.tsx
   useEffect(() => {
      const urlParams = new URLSearchParams(window.location.search);
      const accessToken =
         urlParams.get("access_token") || urlParams.get("raw[access_token]");

      if (accessToken) {
         const STRAPI_URL =
            process.env.NEXT_PUBLIC_STRAPI_CLOUD_URL || "http://localhost:1337";

         fetch(
            `${STRAPI_URL}/api/auth/google/callback?access_token=${accessToken}`,
         )
            .then((res) => res.json())
            .then((data) => {
               if (data.jwt && data.user) {
                  localStorage.setItem("token", data.jwt);
                  setUser(data.user);
                  // Remove query params from browser bar smoothly
                  window.history.replaceState(
                     {},
                     document.title,
                     window.location.pathname,
                  );
               }
            })
            .catch((err) =>
               console.error("Error exchanging OAuth token:", err),
            );
      }
   }, []);

   // 5. Refetch Helper
   const refetchUser = useCallback(async () => {
      if (token) {
         await fetchCurrentUser(token);
      }
   }, [token, fetchCurrentUser]);

   return (
      <AuthContext.Provider
         value={{
            user,
            token,
            loading,
            login,
            logout,
            refetchUser,
         }}
      >
         {children}
      </AuthContext.Provider>
   );
}

export function useAuth() {
   const context = useContext(AuthContext);
   if (!context) {
      throw new Error("useAuth must be used within an AuthProvider");
   }
   return context;
}
