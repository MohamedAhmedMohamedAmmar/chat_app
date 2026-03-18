import { io, Socket } from 'socket.io-client';
import { getAuth } from './auth';

let socket: Socket | null = null;

export function initSocket(): Socket {
    if (socket && socket.connected) {
        return socket;
    }

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5001';
    socket = io(socketUrl, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
        console.log('Socket connected:', socket?.id);
        
        // Authenticate after connection
        const auth = getAuth();
        const token = auth.getToken();
        
        if (token) {
            socket?.emit('auth', token);
        }
    });

    socket.on('auth:success', (data) => {
        console.log('Socket authenticated:', data);
    });

    socket.on('auth:error', (error) => {
        console.error('Socket authentication failed:', error);
        getAuth().clearToken();
    });

    socket.on('disconnect', () => {
        console.log('Socket disconnected');
    });

    socket.on('error', (error) => {
        console.error('Socket error:', error);
    });

    return socket;
}

export function getSocket(): Socket | null {
    if (!socket) {
        return initSocket();
    }
    return socket;
}

export function disconnectSocket(): void {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}

export default socket;
