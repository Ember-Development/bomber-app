import { io } from 'socket.io-client';

const API_BASE = 'http://192.168.1.76:3000';

const socket = io(`${API_BASE}`, {
  transports: ['websocket'],
  autoConnect: false,
});

export default socket;
