# Collaborative Real-Time Whiteboard & Meeting Notes Platform

Welcome to the Opas Software Task! This is a production-ready, full-stack application featuring a real-time collaborative canvas, synchronized meeting notes, anonymous public sharing, workspaces, and robust authentication.

## 🚀 Key Features
- **Real-Time Canvas**: Multi-player drawing with shapes, text, images, and sticky notes using React Konva and Socket.IO.
- **Meeting Notes**: Collaborative rich-text meeting notes synchronized in real-time via Yjs.
- **Live Cursors**: See where your teammates are pointing in real-time, complete with user tags.
- **Public Link Sharing**: Share a unique URL to let anyone join the board anonymously without needing an account.
- **Workspaces & Roles**: Organize boards into workspaces and manage permissions (Owner, Editor, Viewer).
- **Infinite Undo/Redo**: Fully featured history stack built with Zustand.
- **Canvas Export**: Export your masterpiece directly to PNG.
- **Dockerized**: Fully containerized with Nginx, Node.js, MongoDB, and Redis.

---

## 🛠 Tech Stack

### Frontend
- **React 18** (Vite)
- **TypeScript**
- **TailwindCSS** (Custom Design System)
- **React Konva** (Canvas Rendering)
- **Zustand** (State Management)
- **Yjs** & **TipTap** (Collaborative Rich Text)
- **Socket.IO Client** (Real-Time Comm)

### Backend
- **Node.js** & **Express**
- **TypeScript**
- **MongoDB** (Mongoose)
- **Redis** (Socket.IO Adapter / Scalability)
- **Socket.IO** (WebSockets)
- **JWT** (Authentication)
- **Swagger** (API Documentation)

---

## 🐳 Running with Docker (Recommended)

The easiest way to run the entire stack (Frontend, Backend, MongoDB, Redis) is using Docker Compose.

1. Ensure you have **Docker** and **Docker Compose** installed.
2. Clone this repository.
3. Run the following command in the root directory:
   ```bash
   docker-compose up --build
   ```
4. Open your browser and navigate to `http://localhost`.

---

## 💻 Running Locally for Development

If you prefer to run the servers natively for active development:

### 1. Prerequisites
- **Node.js** (v18 or v20)
- **MongoDB** running locally on port 27017 (or update `MONGODB_URI` in `.env`)
- **Redis** running locally on port 6379 (or update `REDIS_URL` in `.env`)

### 2. Backend Setup
```bash
cd backend
npm install
npm run dev
```
*(The backend runs on `http://localhost:5001`)*

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*(The frontend runs on `http://localhost:5173`)*

---

## 📖 API Documentation & Postman

The backend features a fully interactive Swagger documentation UI.
When the backend server is running, navigate to:
👉 **[http://localhost:5001/api-docs](http://localhost:5001/api-docs)**

### Import into Postman
You don't need to manually create a Postman collection! You can instantly generate one using the Swagger JSON:
1. Open **Postman**.
2. Click **Import** in the top left corner.
3. Select the **Link** tab.
4. Paste this URL: `http://localhost:5001/api-docs.json`
5. Click **Import**. Postman will automatically generate all the endpoints, folders, and request bodies!

---

## 🧪 Testing

The backend includes a Jest testing suite for unit tests.
```bash
cd backend
npm test
```

---

## 🏗 Architecture & Design Decisions
- **Mono-repo Structure**: Keeps the frontend and backend tightly coupled for this specific task, making it easy to share types and configurations.
- **Anonymous Token Generation**: To protect the WebSocket firewall, anonymous users accessing public boards are issued temporary "Anonymous JWTs". This keeps the socket gateway completely secure while allowing seamless public access.
- **Multi-stage Docker Builds**: The frontend uses a lightweight Nginx alpine image to serve static assets, while the backend compiles TypeScript and drops the heavy `devDependencies` for the final production image.

---

> Built for the Opash Software task by a very tired but happy developer. Enjoy the whiteboard! 🎉
