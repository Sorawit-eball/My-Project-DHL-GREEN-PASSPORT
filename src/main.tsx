import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import App from './App.tsx'
import Login from './Login.tsx'
import Register from './Register.tsx'
import OTPVerification from './OTPVerification.tsx'
import History from './History.tsx'
import Reports from './Reports.tsx'
import More from './More.tsx'
import CalculateFee from './CalculateFee.tsx'
import RegisterPackage from './RegisterPackage.tsx'
import MapPage from './MapPage.tsx'
import GreenPassport from './GreenPassport.tsx'
import IntlShipping from './IntlShipping.tsx'
import Profile from './Profile.tsx'
import './index.css'


const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/home" replace />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/otp",
    element: <OTPVerification />,
  },
  {
    path: "/home",
    element: <App />,
  },
  {
    path: "/history",
    element: <History />,
  },
  {
    path: "/reports",
    element: <Reports />,
  },
  {
    path: "/more",
    element: <More />,
  },
  {
    path: "/calculate",
    element: <CalculateFee />,
  },
  {
    path: "/register-package",
    element: <RegisterPackage />,
  },
  {
    path: "/map",
    element: <MapPage />,
  },
  {
    path: "/green-passport",
    element: <GreenPassport />,
  },
  {
    path: "/green-passport/ship",
    element: <IntlShipping />,
  },
  {
    path: "/profile",
    element: <Profile />,
  },

]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
