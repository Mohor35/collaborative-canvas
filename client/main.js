class CollaborativeCanvasApp {
    constructor() {
        this.canvas = new DrawingCanvas('mainCanvas', 'cursorCanvas');
        this.ws = new WebSocketManager();
        this.cursors = new Map();
        
        this.setupEventListeners();
        this.setupToolbar();
        this.setupWebSocketHandlers();
    }

    setupEventListeners() {
        const brushSize = document.getElementById('brushSize');
        const brushSizeValue = document.getElementById('brushSizeValue');
        
        brushSize.addEventListener('input', () => {
            const size = parseInt(brushSize.value);
            brushSizeValue.textContent = `${size}px`;
            this.canvas.brushSize = size;
        });

        const colorPicker = document.getElementById('colorPicker');
        colorPicker.addEventListener('input', () => {
            this.canvas.color = colorPicker.value;
        });

        const toolButtons = document.querySelectorAll('.tool-btn');
        toolButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tool = e.target.dataset.tool;
                
                toolButtons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                this.canvas.tool = tool;
            });
        });

        const undoBtn = document.getElementById('undoBtn');
        const redoBtn = document.getElementById('redoBtn');
        const clearBtn = document.getElementById('clearBtn');

        undoBtn.addEventListener('click', () => {
            const stroke = this.canvas.undo();
            if (stroke) {
                this.ws.sendUndo(stroke.id);
            }
        });

        redoBtn.addEventListener('click', () => {
            const stroke = this.canvas.redo();
            if (stroke) {
                this.ws.sendRedo(stroke.id);
            }
        });

        clearBtn.addEventListener('click', () => {
            if (confirm('Clear the entire canvas? This will affect all users.')) {
                this.canvas.clear();
                this.ws.sendClear();
            }
        });
    }

    setupToolbar() {
        const brushBtn = document.querySelector('[data-tool="brush"]');
        if (brushBtn) {
            brushBtn.classList.add('active');
        }
    }

    setupWebSocketHandlers() {
        this.canvas.setOnStroke((event) => {
            this.ws.sendDrawingEvent(event);
        });

        this.canvas.setOnCursorMove((point) => {
            this.ws.sendCursorMove(point);
        });

        this.ws.onDrawingEvent((event) => {
            if (event.userId !== this.ws.getSocketId()) {
                const stroke = {
                    id: Math.random().toString(36).substr(2, 9),
                    points: event.points,
                    color: event.color,
                    brushSize: event.brushSize,
                    tool: event.tool,
                    userId: event.userId,
                    timestamp: event.timestamp
                };
                
                if (event.type === 'start' || event.type === 'move') {
                    this.canvas.drawRemoteStroke(stroke);
                }
            }
        });

        this.ws.onCursorMove((data) => {
            this.updateCursor(data.userId, data.point);
        });

        this.ws.onUndo((data) => {
            if (data.userId !== this.ws.getSocketId()) {
                this.canvas.undo();
            }
        });

        this.ws.onRedo((data) => {
            if (data.userId !== this.ws.getSocketId()) {
                this.canvas.redo();
            }
        });

        this.ws.onClear((userId) => {
            if (userId !== this.ws.getSocketId()) {
                this.canvas.clear();
            }
        });

        this.ws.onCanvasState((strokes) => {
            this.canvas.setStrokes(strokes);
        });

        this.ws.onUsersUpdate((users) => {
            this.cursors.forEach((cursor, userId) => {
                if (!users.find(u => u.id === userId)) {
                    cursor.remove();
                    this.cursors.delete(userId);
                }
            });

            users.forEach(user => {
                if (user.id !== this.ws.getSocketId() && user.cursor) {
                    this.updateCursor(user.id, user.cursor);
                }
            });
        });
    }

    updateCursor(userId, point) {
        let cursor = this.cursors.get(userId);
        
        if (!cursor) {
            cursor = document.createElement('div');
            cursor.className = 'cursor';
            cursor.dataset.userId = userId;
            document.getElementById('cursorOverlay').appendChild(cursor);
            this.cursors.set(userId, cursor);
        }

        cursor.style.left = `${point.x}px`;
        cursor.style.top = `${point.y}px`;
        cursor.style.borderColor = this.getUserColor(userId);
    }

    getUserColor(userId) {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];
        const index = userId.split('').reduce((a, b) => a + b.charCodeAt(0), 0) % colors.length;
        return colors[index];
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new CollaborativeCanvasApp();
});