# ChatBotPlatform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.9+](https://img.shields.io/badge/python-3.9+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-green.svg)](https://fastapi.tiangolo.com/)

A comprehensive, enterprise-grade chatbot platform with multi-user support, JWT authentication, PostgreSQL database, and integrated RAG engine for document-based question answering.

## ✨ Features

- 👥 **Multi-User Support**: Hierarchical user roles (admin/manager/user) with access control
- 🔐 **JWT Authentication**: Secure token-based authentication with refresh tokens
- 🗄️ **PostgreSQL Database**: Robust data persistence with async SQLAlchemy
- 📄 **Document Processing**: Upload and process PDF, TXT, MD, and DOCX files
- 🧠 **RAG Engine**: Integrated retrieval-augmented generation with FAISS vector search
- 🤖 **Bot Management**: Create and manage multiple chatbots per user
- 💬 **Real-time Chat**: Conversational AI with citation support
- 🐳 **Docker Ready**: Complete containerization with docker-compose
- 📚 **API Documentation**: Automatic OpenAPI/Swagger documentation
- 🧪 **Comprehensive Testing**: Full test suite with pytest
- 🔒 **Security First**: bcrypt hashing, encrypted API keys, CORS protection

## 🏗️ Architecture

```
ChatBotPlatform/
├── app/                    # FastAPI application
│   ├── auth/              # Authentication & JWT
│   ├── bots/              # Bot management
│   ├── chat/              # Chat conversations
│   ├── documents/         # Document upload/processing
│   ├── rag_engine/        # RAG pipeline integration
│   ├── users/             # User management
│   ├── models/            # SQLAlchemy models
│   ├── schemas/           # Pydantic schemas
│   └── core/              # Configuration & utilities
├── web/                   # React/TypeScript frontend
├── alembic/               # Database migrations
├── tests/                 # Test suite
└── docker-compose.yml     # Multi-service setup
```

## 🚀 Quick Start

### Prerequisites

- Python 3.9+
- PostgreSQL (optional, SQLite for development)
- OpenAI API key
- Docker & Docker Compose (for containerized deployment)

### 1. Environment Setup

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/chatbot.git
cd chatbot

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```env
# Database Configuration
DATABASE_URL=postgresql+asyncpg://user:password@localhost/chatbot_db
# For development with SQLite:
# DATABASE_URL=sqlite+aiosqlite:///./chatbot.db

# JWT Security
JWT_SECRET_KEY=your-super-secret-jwt-key-here-change-this-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# OpenAI API
OPENAI_API_KEY=your-openai-api-key-here

# Application Settings
DEBUG=true
CORS_ORIGINS=["http://localhost:3000", "http://localhost:8000"]

# Encryption (for API key storage)
ENCRYPTION_KEY=your-32-character-encryption-key-here
```

### 3. Database Setup

```bash
# Run database migrations
alembic upgrade head

# Or use the Makefile
make db-upgrade
```

### 4. Start the Application

```bash
# Development mode
python run.py

# Or with uvicorn directly
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Visit:
- **Web Interface**: `http://127.0.0.1:8000/`
- **API Documentation**: `http://127.0.0.1:8000/docs`
- **Alternative Docs**: `http://127.0.0.1:8000/redoc`

## 🐳 Docker Deployment

For production deployment:

```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d --build

# View logs
docker-compose logs -f app
```

Services include:
- **FastAPI App**: Main application on port 8000
- **PostgreSQL**: Database on port 5432
- **pgAdmin**: Database admin interface on port 5050

## 📖 API Usage Examples

### Authentication

```bash
# Register a new user
curl -X POST "http://localhost:8000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword",
    "full_name": "John Doe"
  }'

# Login
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=user@example.com&password=securepassword"

# Use access token for authenticated requests
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  "http://localhost:8000/users/me"
```

### Bot Management

```bash
# Create a bot
curl -X POST "http://localhost:8000/bots/" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Research Assistant", "description": "Helps with research queries", "is_public": false}'

# List user's bots
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:8000/bots/"

# Upload documents to a bot
curl -X POST "http://localhost:8000/documents/upload/1" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@research_paper.pdf"
```

### Chat

```bash
# Send a message to a bot
curl -X POST "http://localhost:8000/chat/" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What are the main findings from the uploaded research paper?",
    "bot_id": 1,
    "conversation_id": "optional-conversation-id"
  }'

# Get chat history
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:8000/chat/history/1"
```

## 🧪 Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_auth.py

# Run tests in verbose mode
pytest -v
```

## 🔧 Development

### Database Migrations

```bash
# Create new migration after model changes
alembic revision --autogenerate -m "add new feature"

# Apply migrations
alembic upgrade head

# Rollback last migration
alembic downgrade -1
```

### Code Quality

```bash
# Format code with black
black .

# Lint with flake8
flake8 .

# Type checking with mypy
mypy .

# Run all quality checks
make lint
```

### Frontend Development

```bash
cd web

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

## 🔒 Security Features

- **Password Security**: bcrypt hashing with salt rounds
- **JWT Tokens**: Short-lived access tokens (30min) with refresh mechanism (7 days)
- **Role-Based Access Control**: Hierarchical permissions system
- **Input Validation**: Comprehensive Pydantic schemas
- **CORS Protection**: Configurable cross-origin resource sharing
- **API Key Encryption**: Fernet symmetric encryption for stored API keys
- **Environment Variables**: No sensitive data in code

## 📊 Document Processing Pipeline

1. **📥 Ingest**: Extract text from PDFs, DOCX, TXT, MD files
2. **✂️ Chunk**: Split into semantically meaningful chunks (512 tokens)
3. **🧮 Embed**: Generate vector embeddings using OpenAI text-embedding-3-small
4. **💾 Store**: Save embeddings in FAISS vector database for fast retrieval
5. **🔍 Search**: Find most relevant chunks using cosine similarity
6. **🤖 Generate**: Use OpenAI GPT-4o-mini with retrieved context for responses

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow PEP 8 style guidelines
- Add tests for new features
- Update documentation
- Ensure all tests pass
- Use type hints for better code maintainability

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Troubleshooting

### Common Issues

**"Server won't start on Windows"**
- Use Docker deployment or WSL environment
- Check Python version compatibility (3.9+)

**"API key decryption errors"**
- Ensure `ENCRYPTION_KEY` is set in `.env`
- Key must be exactly 32 characters

**"No responses from chat"**
- Verify documents are uploaded and processed
- Check OpenAI API key validity
- Ensure bot has associated documents

**"Database connection errors"**
- For PostgreSQL: ensure database exists and credentials are correct
- For SQLite: check file permissions

### Getting Help

- Check the [API Documentation](http://localhost:8000/docs) after starting the server
- Review the test files for usage examples
- Open an issue on GitHub for bugs or feature requests

## 🙏 Acknowledgments

- [FastAPI](https://fastapi.tiangolo.com/) - Modern Python web framework
- [SQLAlchemy](https://www.sqlalchemy.org/) - Python SQL toolkit
- [FAISS](https://github.com/facebookresearch/faiss) - Vector similarity search
- [OpenAI](https://openai.com/) - AI models and embeddings
- [React](https://reactjs.org/) - Frontend framework