class DrawingCanvas {
    constructor(canvasId, cursorCanvasId) {
        this.canvas = document.getElementById(canvasId);
        this.cursorCanvas = document.getElementById(cursorCanvasId);
        
        this.ctx = this.canvas.getContext('2d');
        this.cursorCtx = this.cursorCanvas.getContext('2d');
        
        this.isDrawing = false;
        this.currentStroke = null;
        this.strokes = [];
        this.redoStack = [];
        
        this.color = '#000000';
        this.brushSize = 5;
        this.tool = 'brush';
        
        this.onStrokeCallback = null;
        this.onCursorMoveCallback = null;

        this.setupEventListeners();
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    setupEventListeners() {
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.canvas.addEventListener('mouseout', this.handleMouseOut.bind(this));

        this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this));
        this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this));
        this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this));
    }

    resizeCanvas() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.cursorCanvas.width = rect.width;
        this.cursorCanvas.height = rect.height;
        this.redraw();
    }

    getCanvasPoint(clientX, clientY) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    }

    handleMouseDown(e) {
        e.preventDefault();
        const point = this.getCanvasPoint(e.clientX, e.clientY);
        this.startStroke(point);
    }

    handleMouseMove(e) {
        const point = this.getCanvasPoint(e.clientX, e.clientY);
        
        if (this.onCursorMoveCallback) {
            this.onCursorMoveCallback(point);
        }

        if (this.isDrawing && this.currentStroke) {
            this.currentStroke.points.push(point);
            this.drawStrokeSegment(this.currentStroke);
            
            if (this.onStrokeCallback) {
                this.onStrokeCallback({
                    type: 'move',
                    points: [point],
                    color: this.currentStroke.color,
                    brushSize: this.currentStroke.brushSize,
                    tool: this.currentStroke.tool,
                    timestamp: Date.now()
                });
            }
        }
    }

    handleMouseUp() {
        this.endStroke();
    }

    handleMouseOut() {
        if (this.isDrawing) {
            this.endStroke();
        }
    }

    handleTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const point = this.getCanvasPoint(touch.clientX, touch.clientY);
        this.startStroke(point);
    }

    handleTouchMove(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const point = this.getCanvasPoint(touch.clientX, touch.clientY);
        
        if (this.onCursorMoveCallback) {
            this.onCursorMoveCallback(point);
        }

        if (this.isDrawing && this.currentStroke) {
            this.currentStroke.points.push(point);
            this.drawStrokeSegment(this.currentStroke);
            
            if (this.onStrokeCallback) {
                this.onStrokeCallback({
                    type: 'move',
                    points: [point],
                    color: this.currentStroke.color,
                    brushSize: this.currentStroke.brushSize,
                    tool: this.currentStroke.tool,
                    timestamp: Date.now()
                });
            }
        }
    }

    handleTouchEnd(e) {
        e.preventDefault();
        this.endStroke();
    }

    startStroke(point) {
        this.isDrawing = true;
        this.currentStroke = {
            id: Math.random().toString(36).substr(2, 9),
            points: [point],
            color: this.tool === 'eraser' ? '#FFFFFF' : this.color,
            brushSize: this.brushSize,
            tool: this.tool,
            userId: 'local',
            timestamp: Date.now()
        };

        if (this.onStrokeCallback) {
            this.onStrokeCallback({
                type: 'start',
                points: [point],
                color: this.currentStroke.color,
                brushSize: this.currentStroke.brushSize,
                tool: this.currentStroke.tool,
                timestamp: this.currentStroke.timestamp
            });
        }
    }

    endStroke() {
        if (this.isDrawing && this.currentStroke) {
            this.strokes.push(this.currentStroke);
            this.currentStroke = null;
            this.isDrawing = false;
            this.redoStack = [];
            
            if (this.onStrokeCallback) {
                this.onStrokeCallback({
                    type: 'end',
                    points: [],
                    color: this.color,
                    brushSize: this.brushSize,
                    tool: this.tool,
                    timestamp: Date.now()
                });
            }
        }
    }

    drawStrokeSegment(stroke) {
        const points = stroke.points;
        if (points.length < 2) return;

        this.ctx.globalCompositeOperation = stroke.tool === 'eraser' ? 'destination-out' : 'source-over';
        this.ctx.strokeStyle = stroke.tool === 'eraser' ? 'rgba(0,0,0,1)' : stroke.color;
        this.ctx.lineWidth = stroke.brushSize;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        this.ctx.beginPath();
        this.ctx.moveTo(points[points.length - 2].x, points[points.length - 2].y);
        this.ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
        this.ctx.stroke();
    }

    drawRemoteStroke(stroke) {
        this.strokes.push(stroke);
        this.redraw();
    }

    redraw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.strokes.forEach(stroke => {
            this.ctx.globalCompositeOperation = stroke.tool === 'eraser' ? 'destination-out' : 'source-over';
            this.ctx.strokeStyle = stroke.tool === 'eraser' ? 'rgba(0,0,0,1)' : stroke.color;
            this.ctx.lineWidth = stroke.brushSize;
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';

            this.ctx.beginPath();
            if (stroke.points.length > 0) {
                this.ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
                stroke.points.forEach(point => {
                    this.ctx.lineTo(point.x, point.y);
                });
            }
            this.ctx.stroke();
        });
    }

    undo() {
        if (this.strokes.length > 0) {
            const stroke = this.strokes.pop();
            this.redoStack.push(stroke);
            this.redraw();
            return stroke;
        }
        return null;
    }

    redo() {
        if (this.redoStack.length > 0) {
            const stroke = this.redoStack.pop();
            this.strokes.push(stroke);
            this.redraw();
            return stroke;
        }
        return null;
    }

    clear() {
        this.strokes = [];
        this.redoStack = [];
        this.redraw();
    }

    setOnStroke(callback) {
        this.onStrokeCallback = callback;
    }

    setOnCursorMove(callback) {
        this.onCursorMoveCallback = callback;
    }

    getStrokes() {
        return [...this.strokes];
    }

    setStrokes(strokes) {
        this.strokes = strokes;
        this.redraw();
    }
}