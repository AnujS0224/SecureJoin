# 💬 SecureJoin — Real-Time Ephemeral Chat Application

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express.js-5.1.0-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/Socket.io-4.8.1-010101?style=for-the-badge&logo=socket.io&logoColor=white" alt="Socket.io" />
  <img src="https://img.shields.io/badge/UI-Cyber--Dark%20Glassmorphism-6366f1?style=for-the-badge" alt="Glassmorphism" />
</p>

**SecureJoin** is a fast, lightweight, and room-based real-time messaging web application. Built with **Node.js**, **Express**, **Socket.IO**, and **Vanilla Web** technologies, it features a sleek **Cyber-Dark Glassmorphic UI** designed for frictionless, disposable communication without sign-ups or persistent database storage.

---

## ✨ Key Features

- ⚡ **Real-Time Communication**: Sub-second instant messaging powered by WebSockets via Socket.IO.
- 🎨 **Modern Cyber-Dark Glassmorphic UI**: High-contrast obsidian dark palette (`#090d16`), frosted glass layers (`backdrop-filter: blur(20px)`), and electric gradients.
- 🔀 **Differentiated Chat Bubbles**: Outgoing messages are styled with radiant gradient bubbles on the right; incoming messages appear in frosted glass on the left; system alerts are centered minimalist pills.
- 📋 **1-Click Room Code Sharing**: Clean room code pill with a single-click copy button and animated toast feedback for easy invite sharing.
- 👥 **Live Active Roster**: Real-time participant counter and sidebar displaying active users with pulsing green online status indicators.
- 📎 **File & Media Sharing**: Upload images and documents (up to 10MB) with auto-formatted image previews and file download cards.
- ✍️ **Typing Wave Indicator**: Animated 3-dot wave indicator displaying when members are actively typing.
- 😊 **Built-in Quick Emoji Drawer**: Lightweight, instant emoji picker with zero external third-party script dependencies.
- 🔒 **Ephemeral & Private by Design**: Rooms and messages exist strictly in server memory during active sessions—leaving no permanent logs or database footprint.

---

## 🛠️ Tech Stack

| Layer | Technology | Description |
|---|---|---|
| **Backend Runtime** | Node.js (v18+) | Asynchronous event-driven JavaScript runtime |
| **Server Framework** | Express.js (^5.1.0) | Static file delivery and HTTP server routing |
| **Real-Time Engine** | Socket.IO (^4.8.1) | Full-duplex WebSocket communication with polling fallback |
| **Frontend** | HTML5, Vanilla CSS3, JS (ES6+) | Frameworkless architecture for lightning-fast load times |
| **Typography** | Plus Jakarta Sans | Modern geometric sans-serif from Google Fonts |
| **Avatars** | DiceBear Bottts API | Dynamic generative robot avatars |

---

## 📂 Project Structure

```text
SecureJoin/
├── public/                  # Frontend static files served by Express
│   ├── index.html           # Single-Page UI (Landing View & Chat Room View)
│   ├── styles.css           # Modern Cyber-Dark Glassmorphism design system
│   └── app.js               # Client-side Socket.IO logic, DOM handling & storage
│
├── server.js                # Express & Socket.IO server entry point
├── package.json             # Project dependencies and start scripts
├── package-lock.json        # Dependency lockfile
├── .gitignore               # Ignored files (node_modules, logs, temp files)
└── README.md                # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites
Make sure you have **Node.js** (v18 or higher) installed on your machine.
- Check with: `node -v`

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/SecureJoin.git
   cd SecureJoin
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the server:**
   ```bash
   npm start
   ```
   *(Alternatively, run `node server.js`)*

4. **Launch the app:**
   Open your browser and navigate to:
   ```
   http://localhost:3000
   ```
   > 💡 **Tip:** Open two separate browser windows (or an Incognito window) to test real-time chat between multiple users!

---

## 🔄 How It Works

1. **Enter Your Name**: Pick a display name and optionally upload a custom profile avatar.
2. **Create or Join a Room**:
   - Click **Create New Room** to generate a random 6-character room code (e.g. `ROOM-AB12`).
   - Or enter an existing room code and click **Join Room**.
3. **Chat in Real-Time**: Share text, emojis, and media. The active members sidebar updates live as users join or leave.
4. **Session Cleanup**: When all users leave or disconnect, the room and its message history vanish automatically from server memory.

---

## 🌐 Deployment

SecureJoin is container and cloud-ready. You can easily deploy it on platforms like **Render**, **Railway**, or **Heroku**:

- **Build Command**: `npm install`
- **Start Command**: `node server.js`
- **Port**: Configured to automatically use `process.env.PORT || 3000`

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).
