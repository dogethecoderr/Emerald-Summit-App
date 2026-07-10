import { Navigate, Route, Routes } from 'react-router-dom';
import { isConfigured, setupMessage } from './lib/supabase';
import WelcomePage from './pages/WelcomePage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ProfileSetupPage from './pages/ProfileSetupPage';

export default function App() {
  if (!isConfigured) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          padding: 24,
        }}
      >
        <pre
          style={{
            whiteSpace: 'pre-wrap',
            fontFamily: 'inherit',
            maxWidth: 460,
            lineHeight: 1.5,
          }}
        >
          {setupMessage}
        </pre>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/login/:role" element={<LoginPage />} />
      <Route path="/profile" element={<ProfileSetupPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
