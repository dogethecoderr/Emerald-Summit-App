import { Navigate, Route, Routes } from 'react-router-dom';
import WelcomePage from './pages/WelcomePage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ProfileSetupPage from './pages/ProfileSetupPage';
import SchedulePage from './pages/SchedulePage';
import AnnouncementsPage from './pages/AnnouncementsPage';
import ProfilesPage from './pages/ProfilesPage';
import DirectoryPage from './pages/DirectoryPage';
import ResourcesPage from './pages/ResourcesPage';
import JudgingPage from './pages/JudgingPage';
import StudentPage from './pages/StudentPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/login/:role" element={<LoginPage />} />
      <Route path="/profile" element={<ProfileSetupPage />} />
      <Route path="/schedule" element={<SchedulePage />} />
      <Route path="/announcements" element={<AnnouncementsPage />} />
      <Route path="/profiles" element={<ProfilesPage />} />
      <Route path="/directory" element={<DirectoryPage />} />
      <Route path="/resources" element={<ResourcesPage />} />
      <Route path="/judging" element={<JudgingPage />} />
      <Route path="/student" element={<StudentPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
