import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const rooms = new Map();

app.use(express.static(path.join(__dirname, '../client')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

// Socket.io connection
io.on('connection', (socket) => {
    console.log('✅ User connected:', socket.id);
    
    const userColor = getRandomColor();
    const userName = `User${Math.floor(Math.random() * 1000)}`;

    // Auto-join default room
    socket.join('default');
    addUserToRoom('default', socket.id, userColor, userName);
    
    // Send current users list
    const users = getRoomUsers('default');
    socket.emit('users-update', users);
    socket.broadcast.emit('user-joined', { id: socket.id, color: userColor, name: userName });
    
    console.log(`📊 Total users in room: ${users.length}`);

    // Handle drawing events
    socket.on('drawing-event', (event) => {
        socket.broadcast.emit('drawing-event', { ...event, userId: socket.id });
    });

    socket.on('cursor-move', (point) => {
        socket.broadcast.emit('cursor-move', { userId: socket.id, point });
    });

    socket.on('disconnect', () => {
        console.log('❌ User disconnected:', socket.id);
        removeUserFromRoom('default', socket.id);
        socket.broadcast.emit('user-left', socket.id);
    });
});

function getRandomColor() {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];
    return colors[Math.floor(Math.random() * colors.length)];
}

function getRoomState(roomId) {
    if (!rooms.has(roomId)) {
        rooms.set(roomId, {
            strokes: [],
            undoStack: [],
            users: new Map()
        });
    }
    return rooms.get(roomId);
}

function addUserToRoom(roomId, userId, color, name) {
    const room = getRoomState(roomId);
    room.users.set(userId, { id: userId, color, name });
    console.log(`👤 User ${userId} added to room ${roomId}`);
}

function removeUserFromRoom(roomId, userId) {
    const room = rooms.get(roomId);
    if (room) {
        room.users.delete(userId);
        console.log(`👤 User ${userId} removed from room ${roomId}`);
    }
}

function getRoomUsers(roomId) {
    const room = rooms.get(roomId);
    if (room) {
        return Array.from(room.users.values());
    }
    return [];
}

const PORT = 3001;
server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`🔌 WebSocket server ready for connections`);
});