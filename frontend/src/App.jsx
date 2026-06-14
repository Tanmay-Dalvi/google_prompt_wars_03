import { useState, useEffect, createContext, useContext, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import ActionNudge from './components/ActionNudge';
import { auth, googleProvider, trackEvent } from './firebase/config';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';

const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage'));
const Profile = lazy(() => import('./pages/Profile'));

const PageLoader = () => (
  <div className="min-h-screen bg-[#0a0f0a] flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"/>
      <p className="text-green-400 font-semibold tracking-wide">Loading EcoSense...</p>
    </div>
  </div>
);


// Auth Context
export const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('ecosense_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const u = {
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
        };
        setUser(u);
        localStorage.setItem('ecosense_user', JSON.stringify(u));
      } else {
        const currentSaved = localStorage.getItem('ecosense_user');
        if (currentSaved) {
          const parsed = JSON.parse(currentSaved);
          if (parsed.uid !== 'demo-user-001') {
            setUser(null);
            localStorage.removeItem('ecosense_user');
          }
        } else {
          setUser(null);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('ecosense_user', JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Sign-out failed, clearing local state:', err);
    }
    setUser(null);
    localStorage.removeItem('ecosense_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}


function AnimatedRoutes() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isLoginPage = location.pathname === '/login';

  useEffect(() => {
    trackEvent('page_view', { page_path: location.pathname });
  }, [location]);

  useEffect(() => {
    if (user && isLoginPage) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, isLoginPage, navigate]);

  return (
    <>
      {!isLoginPage && <Navbar />}
      <Suspense fallback={<PageLoader />}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </AnimatePresence>
      </Suspense>
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
