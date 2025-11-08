# 🎨 Real-Time Collaborative Drawing Canvas

A multi-user drawing application where multiple people can draw simultaneously on the same canvas with real-time synchronization. Built with vanilla JavaScript, HTML5 Canvas, and WebSockets.

## ✨ Features

- **🎨 Real-time Drawing** - See other users' drawings instantly
- **👥 Multi-user Support** - Multiple users can draw simultaneously  
- **🛠️ Multiple Tools** - Brush and eraser with adjustable size and color
- **👀 User Indicators** - See where other users are currently drawing
- **↩️ Global Undo/Redo** - Undo and redo actions across all users
- **📱 Mobile Support** - Touch-enabled for mobile devices
- **🎯 Live Cursors** - See other users' cursor positions

## 🚀 Live Demo

# Live Demo: https://collaborative-canvas-production-c7a8.up.railway.app

## 🛠️ Technology Stack

- **Frontend**: HTML5 Canvas, Vanilla JavaScript, CSS3
- **Backend**: Node.js, Express.js, Socket.io
- **Real-time**: WebSockets with Socket.io

## 📦 Installation

### Prerequisites
- Node.js 16.0 or higher
- npm package manager

### Local Development

1. **Clone the repository**
```bash
git clone https://github.com/Mohor35/collaborative-canvas.git
cd collaborative-canvas
Install dependencies

bash
npm install
Start the development server

bash
npm run dev
Open your browser

text
http://localhost:3000
Testing with Multiple Users
Open multiple browser tabs to http://localhost:3000

Start drawing in one tab - drawings appear instantly in other tabs

Test different tools, colors, and brush sizes

Try undo/redo functionality across multiple users

Observe cursor positions of other users

🎮 How to Use
Select Tool: Brush (✏️) or Eraser (🧽)

Choose Color: Use color picker

Adjust Size: Slider from 1px to 50px

Start Drawing: Click and drag on canvas

Collaborate: Open multiple tabs for real-time sync

📁 Project Structure
text
collaborative-canvas/
├── client/
│   ├── index.html          # Main interface
│   ├── style.css           # Styling
│   ├── canvas.js           # Drawing logic
│   ├── websocket.js        # Real-time communication
│   └── main.js            # App initialization
├── server/
│   └── server.js          # Express + Socket.io server
├── package.json           # Dependencies
├── README.md             # Documentation
└── ARCHITECTURE.md       # Technical details
🔧 Available Scripts
npm run dev - Start development server

npm run server - Start only server

npm start - Start production server

🛠️ Step-by-Step Development
Phase 1: Project Setup (1 hour)
Initialize project structure

Install dependencies

Set up basic server

Phase 2: Backend Development (4 hours)
Create Express server with Socket.io

Implement room management

Handle real-time events

Phase 3: Frontend Development (6 hours)
HTML5 Canvas implementation

Drawing tools and event handling

Responsive UI design

Phase 4: Real-time Features (4 hours)
Multi-user synchronization

User management and cursors

Global undo/redo system

Phase 5: Testing & Polish (3 hours)
Cross-browser testing

Mobile responsiveness

Performance optimization

Phase 6: Deployment (2 hours)
GitHub repository setup

Live deployment preparation

Documentation

⏱️ Development Timeline
Core Architecture: 4 hours

Canvas Implementation: 6 hours

WebSocket Sync: 4 hours

UI/UX Polish: 2 hours

Testing & Bugs: 2 hours

Documentation: 2 hours

Total: 20 hours

🐛 Known Limitations
No drawing persistence (resets on server restart)

Single room only

No user authentication

Limited to ~100 concurrent users

🚀 Future Enhancements
Room system for multiple canvases

Drawing persistence with database

User authentication

Shape tools and text

Export functionality

👨‍💻 Author
Adrija Adhikary

GitHub: @Mohor35

