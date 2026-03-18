# Chat Application Backend

A real-time chat application backend built with Node.js, Express, TypeScript, MongoDB, and Socket.IO.

## Features

- User authentication with JWT
- One-to-one messaging
- Group messaging with invites
- Real-time communication via WebSocket
- User profiles and friends list
- Message history and management

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file from `.env.example`:
```bash
cp .env.example .env
```

3. Configure your environment variables in `.env`:
   - `MONGO_URL`: MongoDB connection string
   - `JWT_SECRET_KEY`: Secret key for JWT tokens
   - `CLIENT_URL`: Frontend application URL
   - `PORT`: Server port (default: 5001)

## Running the Server

Development mode (with hot reload):
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

Start production server:
```bash
npm start
```

## API Routes

### Users
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `GET /api/users/profile` - Get user profile (protected)
- `PUT /api/users/profile` - Update user profile (protected)
- `GET /api/users/friends` - Get user's friends (protected)
- `POST /api/users/friends/add` - Add friend (protected)

### Chats
- `POST /api/chats` - Create new chat (protected)
- `GET /api/chats` - Get user's chats (protected)
- `GET /api/chats/:chatId/messages` - Get chat messages (protected)
- `DELETE /api/chats/:chatId` - Delete chat (protected)

### Messages
- `POST /api/messages` - Send message (protected)
- `PUT /api/messages/:messageId` - Edit message (protected)
- `DELETE /api/messages/:messageId` - Delete message (protected)

### Groups
- `POST /api/groups` - Create group (protected)
- `GET /api/groups/:groupId` - Get group details (protected)
- `POST /api/groups/join` - Join group with invite code (protected)
- `POST /api/groups/:groupId/leave` - Leave group (protected)
- `PUT /api/groups/:groupId` - Update group (protected)
- `POST /api/groups/member/remove` - Remove group member (protected)

## Socket.IO Events

### Client to Server
- `auth` - Authenticate user with token
- `message:send` - Send a message
- `typing` - User is typing
- `stop-typing` - User stopped typing

### Server to Client
- `auth:success` - Authentication successful
- `auth:error` - Authentication failed
- `message:receive` - New message received
- `user:typing` - User is typing
- `user:stop-typing` - User stopped typing

## Database Models

All models and types are fully typed with TypeScript interfaces.

- **User**: Standard user with profile, password, and friends list
- **Chat**: One-to-one or group chats with participants
- **Message**: Messages within chats with timestamps
- **Group**: Group information with members and admin controls
- **Invite**: Group invitations with expiration support

## Project Structure

```
backend/
├── config/
│   ├── db.ts          # MongoDB connection
│   ├── event.ts       # Socket.IO event handlers
│   └── storage.ts     # In-memory socket storage
├── controller/
│   ├── userController.ts
│   ├── chatController.ts
│   ├── messageController.ts
│   ├── groupController.ts
│   └── parseCookies.ts
├── middleware/
│   └── auth.ts        # JWT authentication middleware
├── models/
│   ├── User.ts
│   ├── Chat.ts
│   ├── Message.ts
│   ├── Group.ts
│   └── Invite.ts
├── routes/
│   ├── userRoutes.ts
│   ├── chatRoutes.ts
│   ├── messageRoutes.ts
│   └── groupRoutes.ts
├── types/
│   ├── user.ts
│   ├── chat.ts
│   ├── message.ts
│   ├── group.ts
│   ├── invite.ts
│   └── index.ts
├── utils/
│   ├── jwt.ts         # JWT utility functions
│   └── errors.ts      # Error handling utilities
├── index.ts           # Main server file
├── package.json
├── tsconfig.json
└── .env.example
```

## Requirements

- Node.js 14+
- MongoDB
- npm or yarn

## License

ISC
