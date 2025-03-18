import { createContext, useContext, useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import Loader from "../../components/Loader/Loader";

export interface User {
  id?: string;
  email: string;
  fullname: string;
  photoProfile: string;
}

interface AuthenticationContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    email: string,
    password: string,
    fullname: string,
    confirmPassword: string,
    photoProfile: File
  ) => Promise<void>;
  logout: () => void;
}

const AuthenticationContext = createContext<AuthenticationContextType | null>(
  null
);

export function useAuthentication() {
  return useContext(AuthenticationContext);
}

export default function AuthContextProvider() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  const isOnAuthPage =
    location.pathname === "/authentication/login" ||
    location.pathname === "/authentication/signup";

  const login = async (email: string, password: string) => {
    const response = await fetch(
      import.meta.env.VITE_API_URL + "/api/Authentication/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      }
    );

    if (response.ok) {
      const data = await response.json();
      if (data.flag) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("refreshToken", data.refreshToken);
      } else {
        throw new Error(data.message);
      }
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }
  };

  const signup = async (
    email: string,
    password: string,
    fullname: string,
    confirmPassword: string,
    photoProfile: File
  ) => {
    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    formData.append("fullname", fullname);
    formData.append("confirmPassword", confirmPassword);
    formData.append("photoProfile", photoProfile);

    const response = await fetch(
      import.meta.env.VITE_API_URL + "/api/Authentication/register",
      {
        method: "POST",

        body: formData,
      }
    );
    if (response.ok) {
      const data = await response.json();
      if (!data.flag) throw new Error(data.message);
    } else {
      const { message } = await response.json();
      throw new Error(message);
    }
  };

  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) throw new Error("No refresh token found");

      const response = await fetch(
        import.meta.env.VITE_API_URL + "/api/Authentication/refresh-token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ refreshToken }),
        }
      );
      if (response.ok) {
        const data = await response.json();
        if (data.flag) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("refreshToken", data.refreshToken);
        } else {
          throw new Error(data.message);
        }
        return data.token;
      } else {
        throw new Error("Faailed to refresh token");
      }
    } catch (e) {
      console.log("Error refreshing token: ", e);
      logout();
    }
  };

  const logout = async () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    setUser(null);
  };

  const fetchUser = async () => {
    try {
      const response = await fetch(
        import.meta.env.VITE_API_URL + "/api/Authentication/user",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.status === 401) {
        // Si el token ha expirado
        console.log("Token expirado, intentando refrescar...");
        const newToken = await refreshToken();
        if (newToken) {
          // Reintenta la solicitud con el nuevo token
          const retryResponse = await fetch(
            import.meta.env.VITE_API_URL + "/api/Authentication/user",
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${newToken}`,
              },
            }
          );

          if (retryResponse.ok) {
            const user = await retryResponse.json();
            if (user.flag) {
              setUser(user);
            } else throw new Error(user.message);
          } else {
            throw new Error("Authentication failed");
          }
        }
      } else if (response.ok) {
        const user = await response.json();
        setUser(user);
      } else {
        throw new Error("Authentication failed");
      }
    } catch (e) {
      console.error(e);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      return;
    }
    fetchUser();
  }, [user, location.pathname]);

  if (isLoading) {
    return <Loader />;
  }

  if (!isLoading && !user && !isOnAuthPage) {
    return <Navigate to="/authentication/login" />;
  }

  if (user && isOnAuthPage) {
    return <Navigate to="/" />;
  }

  return (
    <AuthenticationContext.Provider value={{ user, login, signup, logout }}>
      <Outlet />
    </AuthenticationContext.Provider>
  );
}
