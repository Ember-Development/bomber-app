import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';

import Dashboard from '@/pages/Dashboard';
import Teams from '@/pages/Teams';
import Events from '@/pages/Events';
import Media from '@/pages/Media';
import MessageLogs from '@/pages/Messages';
import Users from './pages/User';
import Legacy from './pages/Legacy';
import Notifications from './pages/Notifications';
import Sponsor from './pages/Sponsor';
import Players from './pages/Player';
import TeamDetails from './components/TeamDetails';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import RequireAdmin from './components/RequireAdmin';
import { ToastProvider } from './context/ToastProvider';
import Coaches from './pages/Coaches';
import Portal from './pages/Portal';

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<RequireAdmin />}>
              <Route path="/" element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="teams" element={<Teams />} />
                <Route path="teams/:id" element={<TeamDetails />} />
                <Route path="users" element={<Users />} />
                <Route path="players" element={<Players />} />
                <Route path="coaches" element={<Coaches />} />
                <Route path="portal" element={<Portal />} />
                <Route path="events" element={<Events />} />
                <Route path="media" element={<Media />} />
                <Route path="legacy" element={<Legacy />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="sponsor" element={<Sponsor />} />
                <Route path="logs" element={<MessageLogs />} />
              </Route>
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ToastProvider>
  );
}
