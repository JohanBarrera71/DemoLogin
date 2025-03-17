import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Signup from "./authentication/pages/SignUp/Signup.tsx";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router";
import AuthenticationLayout from "./authentication/AuthenticationLayout/AuthenticationLayout.tsx";
import AuthContextProvider from "./authentication/context/AuthContextProvider.tsx";
import Login from "./authentication/pages/Login/Login.tsx";
import ApplicationLayout from "./components/ApplicationLayout/ApplicationLayout.tsx";
import Home from "./Home.tsx";

const router = createBrowserRouter([
  {
    element: <AuthContextProvider />,
    children: [
      {
        path: "/",
        element: <ApplicationLayout />,
        children: [
          {
            index: true,
            element: <Home />,
          },
        ],
      },
      {
        path: "/authentication",
        element: <AuthenticationLayout />,
        children: [
          {
            path: "login",
            element: <Login />,
          },
          {
            path: "signup",
            element: <Signup />,
          },
        ],
      },
      {
        path: "*",
        element: <Navigate to="/" />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
