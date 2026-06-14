import { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import ActionNudge from './components/ActionNudge';
import Home from './pages/Home';
import Login from './pages/Login';
import DashboardPage from './pages/DashboardPage';
import LeaderboardPage from './pages/LeaderboardPage';
import Profile from './pages/Profile';
import { auth, googleProvider, trackEvent } from './firebase/config';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';

// Auth Context
export const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error('Google Sign-In failed, using demo fallback:', err);
      const demoUser = {
        uid: 'demo-user-001',
        displayName: 'Tanmay Sharma',
        email: 'tanmay@ecosense.dev',
        photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tanmay',
      };
      setUser(demoUser);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Sign-out failed, clearing local state:', err);
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  useEffect(() => {
    trackEvent('page_view', { page_path: location.pathname });
  }, [location]);

  return (
    <>
      {!isLoginPage && <Navbar />}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </AnimatePresence>
      {!isLoginPage && <ActionNudge />}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-eco-dark font-sans text-gray-100">
          <AnimatedRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}
