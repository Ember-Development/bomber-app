import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import Home from '@/pages/Home';
import Teams from '@/pages/Teams';
import TeamDetail from '@/pages/TeamDetail';
import About from '@/pages/About';
import Articles from '@/pages/Articles';
import ArticleDetail from '@/pages/ArticleDetail';
import Commitments from '@/pages/Commitments';
import Videos from '@/pages/Videos';
import VideoPlayer from '@/pages/VideoPlayer';
import History from '@/pages/History';
import Alumni from '@/pages/Alumni';
import Academy from '@/pages/Academy';
import Contact from '@/pages/Contact';
import Login from '@/pages/Login';
import BecomeBomber from '@/pages/BecomeBomber';
import NotFound from '@/pages/NotFound';

const qc = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={qc}>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/teams" element={<Teams />} />
              <Route path="/teams/:id" element={<TeamDetail />} />
              <Route path="/about" element={<About />} />
              <Route path="/academy" element={<Academy />} />
              <Route path="/articles" element={<Articles />} />
              <Route path="/articles/:id" element={<ArticleDetail />} />
              <Route path="/commitments" element={<Commitments />} />
              <Route path="/videos" element={<Videos />} />
              <Route path="/videos/:id" element={<VideoPlayer />} />
              <Route path="/history" element={<History />} />
              <Route path="/alumnis" element={<Alumni />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/become-bomber" element={<BecomeBomber />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
