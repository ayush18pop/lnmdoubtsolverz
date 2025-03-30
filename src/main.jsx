import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { RouterProvider, createBrowserRouter, Navigate, useNavigate } from 'react-router-dom'
import Home from './pages/Home.jsx'

import { MantineProvider } from '@mantine/core'
import { store } from "./store/store.js";
import { Provider } from 'react-redux'
import LoginPage from './pages/LoginPage.jsx'
import  RegisterPage  from './pages/RegisterPage.jsx'
import { useSelector } from 'react-redux'

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector(state => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Auth Guard Component (prevents authenticated users from accessing auth pages)
const AuthGuard = ({ children }) => {
  const { isAuthenticated } = useSelector(state => state.auth);
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: (
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        ),
      },
      {
        path: "/login",
        element: (
          <AuthGuard>
            <LoginPage />
          </AuthGuard>
        ),
      },
      {
        path: "/signup",
        element: (
          <AuthGuard>
            <RegisterPage />
          </AuthGuard>
        ),
      },
      // Catch all route - redirect to appropriate page based on auth state
      {
        path: "*",
        element: <AuthStateRedirect />
      }
    ],
  },
]);

// Component to redirect based on auth state
function AuthStateRedirect() {
  const { isAuthenticated } = useSelector(state => state.auth);
  return <Navigate to={isAuthenticated ? "/" : "/login"} replace />;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <MantineProvider>
        <RouterProvider router={router}/>
      </MantineProvider>
    </Provider>
  </StrictMode>,
)
