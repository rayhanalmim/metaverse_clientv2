import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const AuthLayout = () => {
  const { isLogin } = useAuth();

  if (isLogin) {
    return <Navigate to="/" />;
  }
  return (
    <div className="page-auth">
      <Outlet />
    </div>
  );
};

export default AuthLayout;
