# Setlist Builder + Sync

A web application for musicians and bands to create, manage, and synchronize setlists in real-time.

## Overview

Setlist Builder + Sync is designed to help musicians and bands streamline the process of creating and managing setlists for rehearsals and performances. The application enables real-time collaboration, provides tools for organizing songs, and offers features for tracking performance data.

## Key Features

- **User and Band Management**
  - Create secure user accounts and band profiles
  - Invite band members to collaborate
  - Manage permissions and roles within bands

- **Song Management**
  - Build a comprehensive song database with metadata
  - Attach lyrics, chord charts, and audio files
  - Tag and categorize songs for easy organization

- **Setlist Creation and Management**
  - Create and save multiple setlists for different venues/events
  - Calculate total performance duration
  - Add notes between songs for smooth transitions
  - Drag and drop interface for easy reordering

- **Real-time Collaboration**
  - Synchronize changes across all band members instantly
  - See who's currently viewing or editing a setlist
  - Receive notifications when setlists are modified

- **Performance Mode**
  - Distraction-free interface for live use
  - Auto-scrolling lyrics and chord charts
  - Bluetooth pedal support for hands-free navigation
  - Mark songs as completed during a show

- **Analytics and History**
  - Track performance history
  - Generate statistics on most-played songs
  - Rate performances to inform future setlist decisions

- **Export and Sharing**
  - Export setlists as PDF for printing
  - Share setlists with venue staff or sound engineers
  - Create public setlists for fans

## Technology Stack

### Frontend
- React.js with TypeScript
- Redux for state management
- Material-UI for responsive design
- Socket.io for real-time updates
- Howler.js for audio playback

### Backend
- Node.js with Express
- RESTful API with GraphQL support
- Socket.io for bidirectional communication
- JWT authentication

### Database
- PostgreSQL for relational data
- Redis for caching and pub/sub
- AWS S3 for file storage

## Getting Started

### Prerequisites
- Node.js (v16+)
- PostgreSQL (v13+)
- Redis (v6+)
- AWS Account (for S3 storage)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/dxaginfo/setlist-builder-sync-2025.git
   cd setlist-builder-sync-2025
   ```

2. Install dependencies
   ```bash
   # Install backend dependencies
   cd server
   npm install

   # Install frontend dependencies
   cd ../client
   npm install
   ```

3. Configure environment variables
   ```bash
   # Copy example env files
   cp server/.env.example server/.env
   cp client/.env.example client/.env

   # Edit the .env files with your configuration
   ```

4. Initialize the database
   ```bash
   cd server
   npm run db:migrate
   npm run db:seed
   ```

5. Start the application
   ```bash
   # Start the backend server
   cd server
   npm run dev

   # Start the frontend application
   cd ../client
   npm start
   ```

6. Open your browser and navigate to `http://localhost:3000`

## Project Structure

```
├── client/               # Frontend React application
│   ├── public/           # Static assets
│   └── src/              # React source code
│       ├── components/   # UI components
│       ├── context/      # React context providers
│       ├── hooks/        # Custom React hooks
│       ├── pages/        # Page components
│       ├── services/     # API services
│       ├── store/        # Redux store
│       └── utils/        # Utility functions
│
├── server/               # Backend Node.js application
│   ├── src/              # Source code
│   │   ├── config/       # Configuration files
│   │   ├── controllers/  # Route controllers
│   │   ├── middleware/   # Express middleware
│   │   ├── models/       # Database models
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   └── utils/        # Utility functions
│   │
│   ├── migrations/       # Database migrations
│   └── tests/            # Server tests
│
├── docs/                 # Documentation
└── docker/               # Docker configuration
```

## Deployment

The application is configured for deployment with Docker and can be easily deployed to various cloud providers:

- AWS Elastic Beanstalk
- Heroku
- Digital Ocean

Refer to the [deployment documentation](./docs/deployment.md) for detailed instructions.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [React](https://reactjs.org/)
- [Node.js](https://nodejs.org/)
- [PostgreSQL](https://www.postgresql.org/)
- [Redis](https://redis.io/)
- [Socket.io](https://socket.io/)
- [Material-UI](https://material-ui.com/)