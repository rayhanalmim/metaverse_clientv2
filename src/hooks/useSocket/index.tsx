import io from 'socket.io-client';
import React, { createContext, useContext, useMemo } from 'react';
import { SOCKET_URL } from 'src/config';
import { getToken, useAuth } from 'src/hooks/useAuth';
import { Socket } from 'socket.io-client/build/esm/socket';

interface ISocketProvider {
  socket: Socket;
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const SocketContext = createContext<ISocketProvider>();
export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const socket = io(SOCKET_URL, {
    auth: {
      token: getToken(),
    },
    autoConnect: false,
    transports: ['websocket', 'polling'],
  });
  const { isLogin } = useAuth();

  const value = useMemo(
    () => ({
      socket,
    }),
    [socket],
  );
  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export const useSocket = () => {
  return useContext(SocketContext);
};
