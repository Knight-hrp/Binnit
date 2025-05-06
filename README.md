# Binnit - Community Forum Platform

Binnit is a modern community forum platform that allows users to create communities, share posts, interact through comments, and engage with content through upvotes and downvotes.

## Features

- 🔐 User Authentication
  - Email/Password login
  - Google OAuth integration
  - Session management
  - JWT token support

- 👥 Community Management
  - Create and join communities
  - Community roles and permissions
  - Community-specific content

- 📝 Content Interaction
  - Create and edit posts
  - Comment system
  - Upvote/Downvote functionality
  - Rich text formatting

- 🔔 Notifications
  - Real-time notifications
  - Activity tracking
  - User mentions

- 🖼️ Media Support
  - Image uploads
  - Profile pictures
  - Community banners

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Frontend**: EJS Templates
- **Authentication**: Passport.js, JWT
- **Real-time**: Socket.IO
- **File Upload**: Multer
- **Styling**: CSS

## Prerequisites

- Node.js (v18 or higher)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/binnit.git
cd binnit
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
# Server Configuration
PORT=8000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://127.0.0.1:27017/communityForum

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# Session Configuration
SESSION_SECRET=your_session_secret_here

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:8000/auth/google/callback
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:8000`

## Project Structure

```
binnit/
├── Assets/              # Static assets (icons, images)
├── controllers/         # Route controllers
├── css/                # Stylesheets
├── middleware/         # Custom middleware
├── models/            # Database models
├── public/            # Public assets
├── routes/            # Route definitions
├── service/           # Business logic
├── Uploads/           # User uploads
├── views/             # EJS templates
├── .env               # Environment variables
├── .gitignore         # Git ignore file
├── connect.js         # Database connection
├── index.js           # Application entry point
├── package.json       # Project dependencies
├── Procfile           # Deployment configuration
└── socketHandler.js   # WebSocket handling
```

## Deployment

### Local Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Versal Deployment
1. Connect your GitHub repository to Versal
2. Set up environment variables in Versal dashboard
3. Deploy using the Procfile configuration

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 8000 |
| NODE_ENV | Environment | development |
| MONGODB_URI | MongoDB connection string | mongodb://127.0.0.1:27017/communityForum |
| JWT_SECRET | JWT signing key | - |
| JWT_EXPIRES_IN | JWT expiration time | 7d |
| SESSION_SECRET | Session secret key | - |
| GOOGLE_CLIENT_ID | Google OAuth client ID | - |
| GOOGLE_CLIENT_SECRET | Google OAuth client secret | - |
| GOOGLE_CALLBACK_URL | Google OAuth callback URL | http://localhost:8000/auth/google/callback |

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Support

For support, please open an issue in the GitHub repository or contact the maintainers.