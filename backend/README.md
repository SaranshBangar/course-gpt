# CourseGPT Backend

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com/)

## 🚀 Overview

The CourseGPT backend powers the AI course generation platform with robust APIs for content creation, user management, and analytics. It integrates Google's Flan-T5-XXL model via Hugging Face to generate high-quality educational content while providing secure data storage and efficient processing.

## ✨ Key Features

- **AI Content Generation**: Integration with Flan-T5-XXL model for educational content creation
- **RESTful API**: Comprehensive endpoints for course management and user operations
- **JWT Authentication**: Secure token-based authentication with role-based access control
- **MongoDB Integration**: Efficient document storage for courses and user data
- **Real-time Updates**: WebSocket support for collaborative editing features
- **Analytics Engine**: Processing and serving course engagement metrics
- **Caching Layer**: Redis-based caching for improved performance

## 🛠️ Tech Stack

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![JWT](https://img.shields.io/badge/JWT-000000?style=flat&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=flat&logo=socket.io&logoColor=white)](https://socket.io/)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat&logo=redis&logoColor=white)](https://redis.io/)

### AI
[![Hugging Face](https://img.shields.io/badge/Hugging_Face-FFD21E?style=flat&logo=huggingface&logoColor=black)](https://huggingface.co/)
[![Flan-T5-XXL](https://img.shields.io/badge/Flan--T5--XXL-EF4A58?style=flat&logo=google&logoColor=white)](https://huggingface.co/google/flan-t5-xxl)

## 🔧 Installation

### Prerequisites

- Node.js 18+
- MongoDB
- Redis (optional, for caching)

### Clone the repository

```bash
git clone https://github.com/your-username/coursegpt.git
cd coursegpt/backend
```

### Set up environment variables

```bash
cp .env.example .env
# Edit .env with your configuration values
```

### Install dependencies and start the server

```bash
npm install
npm run dev
```

The API will be available at http://localhost:5000

## 📚 API Documentation

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login` | POST | Authenticate user and receive JWT token |
| `/api/courses` | GET | Retrieve all courses for the authenticated user |
| `/api/courses/:id/generate` | POST | Generate content for a specific course using AI |
| `/api/analytics/progress` | GET | Get progress analytics for courses |

## 🔒 Security

- All endpoints (except authentication) require valid JWT tokens
- Passwords are hashed using bcrypt
- Rate limiting is implemented for sensitive endpoints
- Input validation is performed on all requests

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.
