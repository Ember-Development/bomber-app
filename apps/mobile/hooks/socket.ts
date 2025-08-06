import { io } from 'socket.io-client';
import Constants from 'expo-constants';

const { SOCKET_SERVER_URL } = Constants.expoConfig?.extra ?? {};

const socket = io(SOCKET_SERVER_URL, {
  transports: ['websocket'],
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 2000,
});

socket.on('connect', () => {
  console.log('Connected to socket server');
});

socket.on('disconnect', () => {
  console.log('Disconnected from socket server');
});

socket.on('connect_error', (err) => {
  console.log('Socket connection failed:', err.message);
});

export default socket;
