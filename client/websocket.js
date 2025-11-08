class WebSocketManager {
    constructor() {
        this.socket = io({
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });

        this.roomId = 'default';
        this.users = new Map();

        this.setupEventListeners();
    }

    setupEventListeners() {
        this.socket.on('connect', () => {
            console.log('Connected to server');
            this.joinRoom(this.roomId);
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from server');
        });

        this.socket.on('user-joined', (user) => {
            this.users.set(user.id, user);
            this.updateUserList();
        });

        this.socket.on('user-left', (userId) => {
            this.users.delete(userId);
            this.removeCursor(userId);
            this.updateUserList();
        });

        this.socket.on('users-update', (users) => {
            this.users = new Map(users.map(user => [user.id, user]));
            this.updateUserList();
        });
    }

    joinRoom(roomId) {
        this.roomId = roomId;
        this.socket.emit('join-room', roomId);
    }

    sendDrawingEvent(event) {
        this.socket.emit('drawing-event', event);
    }

    sendCursorMove(point) {
        this.socket.emit('cursor-move', point);
    }

    sendUndo(strokeId) {
        this.socket.emit('undo', strokeId);
    }

    sendRedo(strokeId) {
        this.socket.emit('redo', strokeId);
    }

    sendClear() {
        this.socket.emit('clear');
    }

    onDrawingEvent(callback) {
        this.socket.on('drawing-event', callback);
    }

    onCursorMove(callback) {
        this.socket.on('cursor-move', callback);
    }

    onUndo(callback) {
        this.socket.on('undo-event', callback);
    }

    onRedo(callback) {
        this.socket.on('redo-event', callback);
    }

    onClear(callback) {
        this.socket.on('clear-event', callback);
    }

    onCanvasState(callback) {
        this.socket.on('canvas-state', callback);
    }

    onUsersUpdate(callback) {
        this.socket.on('users-update', callback);
    }

    updateUserList() {
        const userList = document.getElementById('userList');
        const userCount = document.getElementById('userCount');
        
        if (userList && userCount) {
            userCount.textContent = `${this.users.size} users online`;
            userList.innerHTML = '';
            
            this.users.forEach(user => {
                const indicator = document.createElement('div');
                indicator.className = 'user-indicator';
                indicator.style.backgroundColor = user.color;
                indicator.title = user.name;
                userList.appendChild(indicator);
            });
        }
    }

    removeCursor(userId) {
        const cursor = document.querySelector(`[data-user-id="${userId}"]`);
        if (cursor) {
            cursor.remove();
        }
    }

    getSocketId() {
        return this.socket.id || '';
    }

    isConnected() {
        return this.socket.connected;
    }
}