import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export default function RequireAdmin() {
  const { isLoading, isAdmin } = useAuth();

  if (isLoading) return null;
  if (!isAdmin) return <Navigate to="/login" replace />;

  return <Outlet />;
}
