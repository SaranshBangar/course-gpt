# CourseGPT

[![Demo Video](https://img.shields.io/badge/Demo-Video-red)](https://drive.google.com/file/d/1cTQFw2RQcT3s_NtSfggxdYdtqyJOhYGf/view?usp=sharing) 

## 🚀 Overview

CourseGPT is an AI-powered platform that streamlines the course creation process for educators. It leverages advanced language models to generate curriculum content, assessments, and learning materials while providing robust tools for tracking progress and managing course versions.

## ✨ Key Features

- **AI-Powered Content Generation**: Automatically create lesson plans, quizzes, and learning materials
- **Intelligent Progress Tracking**: Monitor student engagement and performance with detailed analytics
- **Version Control System**: Manage course iterations and track changes over time
- **JWT Authentication**: Secure user sessions and role-based access control
- **Responsive UI**: Seamless experience across desktop and mobile devices
- **Real-time Updates**: Collaborative editing with instant synchronization

## 🛠️ Tech Stack

### Frontend
[![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![shadcn/ui](https://img.shields.io/badge/shadcn/ui-000000?style=flat&logo=shadcnui&logoColor=white)](https://ui.shadcn.com/)

### Backend
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com/)

### AI
[![Hugging Face](https://img.shields.io/badge/Hugging_Face-FFD21E?style=flat&logo=huggingface&logoColor=black)](https://huggingface.co/)
[![Flan-T5-XXL](https://img.shields.io/badge/Flan--T5--XXL-EF4A58?style=flat&logo=google&logoColor=white)](https://huggingface.co/google/flan-t5-xxl)

## 🔧 Installation

### Clone the repository

```bash
git clone https://github.com/your-username/coursegpt.git
cd coursegpt
```

### Set up environment variables

```bash
cp .env.example .env
# Edit .env with your configuration values
```

### Install dependencies and start the application

```bash
# Install dependencies for both frontend and backend
npm run install:all

# Start the development environment
npm run dev
```

## 📚 API Documentation

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/courses` | GET | Retrieve all courses for the authenticated user |
| `/api/courses/:id/generate` | POST | Generate content for a specific course using AI |
| `/api/analytics/progress` | GET | Get progress analytics for students enrolled in a course |

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
