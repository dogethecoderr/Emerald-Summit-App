import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { ScheduleProvider } from './context/ScheduleContext';
import { Toaster } from '@/components/ui/sonner';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <AuthProvider>
        <ScheduleProvider>
          <App />
          <Toaster position="bottom-center" />
        </ScheduleProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
