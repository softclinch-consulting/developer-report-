import { useState, useEffect } from 'react';
import { User } from './types/record';
import { LoginScreen } from './components/LoginScreen';
import { AdminDashboard } from './components/AdminDashboard';
import { DeveloperDashboard } from './components/DeveloperDashboard';

const USER_STORAGE_KEY = 'data_entry_user';

export default function App() {
  const [user, setUser] = useState<User | null>(null);

  // Load user from session storage on mount
  useEffect(() => {
    const stored = sessionStorage.getItem(USER_STORAGE_KEY);
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {
        sessionStorage.removeItem(USER_STORAGE_KEY);
      }
    }
  }, []);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loggedInUser));
  };

  const handleLogout = () => {
    setUser(null);
    sessionStorage.removeItem(USER_STORAGE_KEY);
  };

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  if (user.role === 'admin') {
    return <AdminDashboard user={user} onLogout={handleLogout} />;
  }

  return <DeveloperDashboard user={user} onLogout={handleLogout} />;
}
