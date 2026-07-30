# Opas - Collaborative Real-Time Whiteboard & Meeting Notes

Opas is a high-performance, real-time collaborative workspace designed to combine the creative freedom of a whiteboard with the structured utility of meeting notes. Built with modern web technologies, it features multi-user cursors, offline persistence, rich-text syncing, and seamless export capabilities.

---

## 🌟 Assignment Features Completed

We have comprehensively completed all requirements from the assignment audit:

- ✅ **Board Search**: Seamlessly search through your active and starred boards by title.
- ✅ **Starred Boards**: Mark essential boards with a star for quick access in the sidebar.
- ✅ **Last Opened Boards**: Dynamic sorting pushes your most recently opened boards to the top.
- ✅ **Version History with Restore**: Snapshots of your whiteboard are saved automatically; restore to previous states with one click, fully synced across clients via sockets.
- ✅ **Export Board as PNG**: One-click native high-quality canvas export.
- ✅ **Export Meeting Notes as PDF**: Instant native PDF generation of your rich-text meeting notes.
- ✅ **Offline IndexedDB Sync**: Continue drawing even when the WiFi drops! Strokes are isolated per board and instantly sync to `idb` in the background. A smart UI badge indicates when you're offline.
- ✅ **AI Action Items**: A mock Express backend service that processes your meeting notes and injects actionable TODOs straight back into the editor!
- ✅ **Integration Tests**: A full suite of Jest & Supertest integration tests running in an isolated `mongodb-memory-server`.
- ✅ **Seed Script**: A robust, idempotent seed script to populate test data (`npm run seed`).
- ✅ **Postman Collection**: A complete REST API postman collection is available in `/backend/postman_collection.json`.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Zustand (State Management), TailwindCSS, Tiptap (Rich Text), Lucide (Icons), idb (IndexedDB).
- **Backend**: Node.js, Express, TypeScript, MongoDB (Mongoose), Socket.io (WebSockets), Yjs (CRDT for rich text).
- **Testing**: Jest, Supertest.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB running locally on `mongodb://localhost:27017/opas` (or update `.env` to point to your cluster)
- Redis running locally on `redis://localhost:6379` (used for socket pub/sub)

### 1. Backend Setup

```bash
cd backend
npm install

# Copy environment variables
cp .env.example .env

# Run the seed script to populate data
npm run seed

# Start the development server
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend
npm install

# Copy environment variables
cp .env.example .env

# Start the development server
npm run dev
```

### 3. Running Integration Tests
Integration tests spin up their own isolated in-memory MongoDB instance using `mongodb-memory-server`, ensuring your local database remains untouched!

```bash
cd backend
npm run test
```

---

## 🐳 Docker Setup (Optional)
If you prefer running everything seamlessly via Docker Compose:

```bash
docker-compose up --build
```
This will automatically spin up MongoDB, Redis, the Backend, and the Frontend.

---

## 💡 Key Highlights

### Yjs & Tiptap
The Meeting Notes feature is powered by Yjs and Tiptap, allowing flawless real-time collaboration. Cursors are synced instantly, and conflict resolution is handled autonomously by the CRDT (Conflict-free Replicated Data Type) engine.

### IndexedDB Offline Sync
The Whiteboard leverages Zustand subscriptions to instantly dump the canvas state into IndexedDB whenever a change is made. If the app is closed or loses connection, the canvas instantly hydrates from local storage the moment it reopens, ensuring zero data loss.

### Mock AI Action Items
Demonstrating advanced editor manipulation, the AI endpoint scans the meeting notes for tasks (like "TODO:") and uses `editor.chain().focus().insertContentAt(...)` to dynamically insert HTML blocks back into the live document without overwriting ongoing edits!
