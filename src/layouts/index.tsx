import { AuthProvider } from 'src/hooks/useAuth';
import { SocketProvider } from 'src/hooks/useSocket';
import { Outlet } from 'react-router-dom';
import { MetaMaskProvider } from '../hooks/useMetamaskProvider';

const Layout = () => {
  return (
    <AuthProvider>
      <SocketProvider>
        <MetaMaskProvider>
          <Outlet />
        </MetaMaskProvider>
      </SocketProvider>
    </AuthProvider>
  );
};

export default Layout;
