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

   // 1. Logout Handler
   const logout = useCallback(() => {
      localStorage.removeItem("token");
      Cookies.remove("token");

      setToken(null);
      setUser(null);
   }, []);

   // Fetch user function using useCallback
   const fetchCurrentUser = useCallback(
      async (jwt: string) => {
         try {
            const STRAPI_URL =
               process.env.NEXT_PUBLIC_STRAPI_API_URL ||
               process.env.NEXT_PUBLIC_STRAPI_CLOUD_URL ||
               "http://localhost:1337";

            const res = await fetch(`${STRAPI_URL}/api/users/me?populate=*`, {
               headers: {
                  Authorization: `Bearer ${jwt}`,
               },
            });

            if (res.ok) {
               const userData: User = await res.json();
               setUser(userData);
            } else {
               console.warn(
                  "Strapi auth check failed with status:",
                  res.status,
               );
               // ONLY log out if Strapi explicitly tells us the token is bad (401 / 403)
               if (res.status === 401 || res.status === 403) {
                  logout();
               }
            }
         } catch (error) {
            console.error("Failed to fetch current user:", error);
            // DO NOT call logout() here on network errors or URL misconfigurations!
         } finally {
            setLoading(false);
         }
      },
      [logout],
   );

   // 3. Login Handler
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

   // 4. Handle OAuth Callback
   useEffect(() => {
      if (typeof window === "undefined") return;

      const urlParams = new URLSearchParams(window.location.search);
      const accessToken =
         urlParams.get("access_token") || urlParams.get("raw[access_token]");

      if (accessToken) {
         const STRAPI_URL =
            process.env.NEXT_PUBLIC_STRAPI_API_URL ||
            process.env.NEXT_PUBLIC_STRAPI_CLOUD_URL ||
            "http://localhost:1337";

         fetch(
            `${STRAPI_URL}/api/auth/google/callback?access_token=${accessToken}`,
         )
            .then((res) => res.json())
            .then((data) => {
               if (data.jwt && data.user) {
                  // PERSISTENCE FIX: Save token to both Storage & Cookie
                  login(data.jwt, data.user);

                  // Clean URL query params without reloading
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
   }, [login]);

   // 5. Initialize Auth State on Initial Load / Page Refresh
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

   // 6. Refetch Helper
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
