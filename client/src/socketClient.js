import io from 'socket.io-client';

const socket = io('http://localhost:4242');

export default socket;
