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
import { useRouter } from "next/navigation";

export interface UserRole {
   id: number;
   name: string;
   description?: string;
   type?: string;
}

export interface User {
   id: number;
   documentId?: string;
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
   const router = useRouter();

   // 1. Logout Handler
   const logout = useCallback(() => {
      localStorage.removeItem("token");
      Cookies.remove("token");

      setToken(null);
      setUser(null);
      router.push("/");
   }, [router]);

   // 2. Fetch User Profile
   const fetchCurrentUser = useCallback(
      async (jwt: string) => {
         if (!jwt || jwt === "undefined" || jwt === "null") {
            setLoading(false);
            return;
         }

         try {
            const STRAPI_URL =
               process.env.NEXT_PUBLIC_STRAPI_API_URL ||
               "http://localhost:1337";

            const res = await fetch(`${STRAPI_URL}/api/users/me?populate=*`, {
               headers: {
                  Authorization: `Bearer ${jwt.trim()}`,
               },
            });

            if (res.ok) {
               const userData: User = await res.json();
               setUser(userData);
            } else if (res.status === 401 || res.status === 403) {
               console.warn(
                  "Session expired or token invalid. Clearing auth state.",
               );
               logout();
            }
         } catch (error) {
            console.error("Failed to fetch current user:", error);
         } finally {
            setLoading(false);
         }
      },
      [logout],
   );

   // 3. Login Handler
   const login = useCallback(
      (newToken: string, newUser: User) => {
         const isProduction = process.env.NODE_ENV === "production";

         localStorage.setItem("token", newToken);

         Cookies.set("token", newToken, {
            expires: 30,
            secure: isProduction,
            sameSite: "lax",
         });

         setToken(newToken);
         setUser(newUser);
         router.push("/dashboard/trips");
      },
      [router],
   );

   // 4. Handle OAuth Callback (UPDATED REDIRECT LOGIC)
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
                  login(data.jwt, data.user);
                  // Explicitly route to dashboard/trips and clear URL parameters
                  router.push("/dashboard/trips");
               }
            })
            .catch((err) =>
               console.error("Error exchanging OAuth token:", err),
            );
      }
   }, [login, router]);

   // 5. Initialize Auth State
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
