import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/theme.css'
import App from './App.jsx'
import { RouterProvider, createBrowserRouter, Navigate } from 'react-router-dom'
import Home from './pages/Home.jsx'
import { store } from "./store/store.js";
import { Provider } from 'react-redux'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import { useSelector } from 'react-redux'
import Feed from './pages/Feed.jsx'
import PostDoubt from './pages/PostDoubt.jsx'
import Profile from './pages/Profile.jsx'

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector(state => state.auth);
  console.log("Auth status in protected route:", isAuthenticated);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Auth Guard Component
const AuthGuard = ({ children }) => {
  const { isAuthenticated } = useSelector(state => state.auth);
  console.log("Auth status in auth guard:", isAuthenticated);
  
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
      {
        path: "/feed",
        element: (
          <ProtectedRoute>
            <Feed />
          </ProtectedRoute>
        ),
      },
      {
        path: "/postdoubt",
        element: (
          <ProtectedRoute>
            <PostDoubt />
          </ProtectedRoute>
        ),
      },
      {
        path: "/profile",
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
    },
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
  console.log("Auth status in redirect:", isAuthenticated);
  return <Navigate to={isAuthenticated ? "/" : "/login"} replace />;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router}/>
    </Provider>
  </StrictMode>,
)
