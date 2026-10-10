# Document Sharing Management System (DSMS)

A full-stack web application for secure document sharing and management using IPFS (Pinata) and Firebase.

## Features

- **Document Upload**: Upload documents to IPFS via Pinata for decentralized storage
- **Authentication**: Secure Firebase authentication (email/password)
- **Private Sharing**: Share documents with specific users by email
- **Public Sharing**: Generate public share links for documents
- **Access Control**: Owner-based permissions and access management
- **Activity Logs**: Track all document actions and sharing activities
- **Modern UI**: Responsive interface built with React and Tailwind CSS

## Tech Stack

### Backend
- Node.js + Express
- Firebase Admin SDK (Authentication & Firestore)
- Pinata (IPFS storage)
- CORS & Helmet (Security)

### Frontend
- React 18
- Vite
- React Router
- Firebase SDK
- Tailwind CSS
- Lucide Icons
- React Hot Toast

## Project Structure

```
DSMS-VS/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── uploadController.js
│   │   │   ├── fileController.js
│   │   │   ├── shareController.js
│   │   │   └── logsController.js
│   │   ├── middlewares/
│   │   │   ├── authFirebase.js
│   │   │   └── logger.js
│   │   ├── routes/
│   │   │   ├── uploadRoutes.js
│   │   │   ├── fileRoutes.js
│   │   │   ├── shareRoutes.js
│   │   │   └── logsRoutes.js
│   │   ├── utils/
│   │   │   └── ipfsClient.js
│   │   └── index.js
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Documents.jsx
    │   │   ├── SharedDocuments.jsx
    │   │   └── AccessShared.jsx
    │   ├── contexts/
    │   │   └── AuthContext.jsx
    │   ├── services/
    │   │   ├── firebase.js
    │   │   └── api.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── .env.example
```

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- Firebase Project
- Pinata Account (for IPFS)

### Backend Setup

1. Navigate to backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY="your-private-key"
PINATA_JWT=your-pinata-jwt-token
PORT=5001
NODE_ENV=development
```

5. Start the backend server:
```bash
npm start
```

Backend will run on `http://localhost:5001`

### Frontend Setup

1. Navigate to frontend folder:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_API_URL=http://localhost:5001
```

5. Start the development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:3000`

## Firebase Configuration

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Email/Password authentication
3. Create a Firestore database
4. Generate a service account key for the backend
5. Get your web app configuration for the frontend

## Pinata Configuration

1. Sign up at https://www.pinata.cloud
2. Generate an API JWT token
3. Add the token to your backend `.env` file

## API Endpoints

### Upload
- `POST /api/upload` - Upload a document

### Files
- `GET /api/file` - Get user's documents
- `GET /api/file/shared-with-me` - Get documents shared with user
- `GET /api/file/:id` - Get document by ID
- `DELETE /api/file/:id` - Delete document

### Sharing
- `POST /api/share` - Share a document
- `GET /api/share/:shareId` - Access shared document
- `GET /api/share/users/autocomplete` - Search users for sharing
- `GET /api/share/my-shares` - Get user's shares

### Logs
- `GET /api/logs` - Get activity logs
- `GET /api/logs/stats` - Get log statistics

## License

MIT

## Author

Built with ❤️ for secure document sharing
