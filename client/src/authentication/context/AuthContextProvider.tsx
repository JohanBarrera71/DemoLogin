import { createContext, useContext, useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import Loader from "../../components/Loader/Loader";

export interface User {
  id?: string;
  email: string;
  fullname: string;
}

interface AuthenticationContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    email: string,
    password: string,
    fullname: string,
    confirmPassword: string
  ) => Promise<void>;
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
    confirmPassword: string
  ) => {
    const response = await fetch(
      import.meta.env.VITE_API_URL + "/api/Authentication/register",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, fullname, confirmPassword }),
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

  const logout = async () => {
    localStorage.removeItem("token");
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
      if (!response.ok) {
        throw new Error("Authentication failed");
      }
      const user = await response.json();
      setUser(user);
    } catch (e) {
      console.log(e);
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
    <AuthenticationContext.Provider value={{ user, login, signup }}>
      <Outlet />
    </AuthenticationContext.Provider>
  );
}
