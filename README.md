# Real-time Chat Application

A modern real-time chat application built with Next.js, Node.js, and MongoDB.

## Tech Stack

### Frontend

- Next.js 14 (React Framework)
- TypeScript
- TailwindCSS for styling
- Zustand for state management
- React Hook Form with Zod validation
- SWR for data fetching
- Socket.IO client for real-time communication

### Backend

- Node.js with Express
- TypeScript
- MongoDB for database
- Socket.IO for WebSocket communication
- JWT for authentication
- bcrypt for password hashing

## Requirements

- Node.js 18+
- MongoDB 4.4+
- npm or yarn

## Installation

1. Clone the repository:

```bash
git clone https://github.com/khanhlv0175/simulation_webchat_websocket.git
cd simulation_webchat_WS
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

Create `.env` file in backend folder:

```env
PORT=8080
MONGODB_URI=mongodb://localhost:27017/webchat
JWT_SECRET=your_jwt_secret
```

Create `.env.local` file in frontend folder:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## Running the Application

### Development Mode

Run both frontend and backend concurrently:

```bash
npm run dev
```

Or run them separately:

```bash
# Frontend (localhost:3000)
npm run frontend

# Backend (localhost:8080)
npm run backend
```

### Database

MongoDB should be running on default port:

```bash
sudo systemctl start mongodb
```

## Features

- Real-time chat with WebSocket
- User authentication and authorization
- Role-based access control (Admin, Manager, Viewer)
- Location-based hierarchical organization
- Responsive design
- Persistent chat history
- User presence detection

## Project Structure

```
├── frontend/               # Next.js frontend application
│   ├── app/               # Next.js app router
│   ├── components/        # React components
│   ├── stores/           # Zustand stores
│   └── lib/              # Utilities and helpers
├── backend/               # Node.js backend application
│   ├── src/              # Source files
│   ├── models/           # MongoDB models
│   └── routes/           # API routes
```

## API Endpoints

- `POST /api/login` - User authentication
- `GET /api/me/information` - Get current user info
- `POST /api/rooms` - Create chat room
- `GET /api/list-locations` - Get hierarchical locations

## Test Accounts

```
Admin:
- username: admin
- password: admin123

Manager:
- username: manager
- password: manager123

Viewer:
- username: viewer
- password: viewer123
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
